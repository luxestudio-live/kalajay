import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { SEED_ROLES } from '@/data/adminPermissions';
import { AdminRole } from '@/data/adminTypes';
import { readRbacStore, writeRbacStore, verifyStaffPermission } from '@/lib/serverRbac';

export async function GET() {
  try {
    const store = readRbacStore();
    const customRoles = store.customRoles || {};
    const usersMap = store.users || {};

    // 1. Authoritatively fetch any custom roles stored in Cloud Firestore (/admin_roles)
    try {
      const fsSnap = await getDocs(collection(db, 'admin_roles'));
      fsSnap.forEach(d => {
        const data = d.data() as AdminRole;
        if (data && (data.id || d.id)) {
          customRoles[data.id || d.id] = data;
        }
      });
    } catch (fsErr) {
      // Graceful fallback to local durable store if Firestore read fails
    }

    // Calculate user count per role dynamically
    const roleUserCounts: Record<string, number> = {};
    Object.values(usersMap).forEach((u: any) => {
      if (u.roleId && u.status === 'active') {
        roleUserCounts[u.roleId] = (roleUserCounts[u.roleId] || 0) + 1;
      }
    });

    // Merge system roles and custom roles
    const roleMap = new Map<string, AdminRole>();

    SEED_ROLES.forEach(r => {
      roleMap.set(r.id, {
        ...r,
        userCount: roleUserCounts[r.id] ?? r.userCount ?? 0,
      });
    });

    Object.values(customRoles).forEach((r: any) => {
      roleMap.set(r.id, {
        ...r,
        userCount: roleUserCounts[r.id] ?? 0,
      });
    });

    const allRoles = Array.from(roleMap.values());
    return NextResponse.json({ success: true, roles: allRoles });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to list roles.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role } = body;

    // 1. Authorize: Check effective permissions on 'settings.roles' -> 'manage_roles'
    const authCheck = await verifyStaffPermission(request, body, 'settings.roles', 'manage_roles');
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error,
          code: authCheck.code,
        },
        { status: authCheck.status }
      );
    }

    if (!role || !role.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Role name and permissions are required.' },
        { status: 400 }
      );
    }

    // 2. System Role Protection
    if (role.id === 'role-super-admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Immutable Role: System role "role-super-admin" cannot be edited or modified.',
        },
        { status: 403 }
      );
    }

    const store = readRbacStore();
    store.customRoles = store.customRoles || {};

    const nowIso = new Date().toISOString();
    const isEditing = Boolean(role.id && store.customRoles[role.id]);
    const roleId = isEditing
      ? role.id
      : role.id || `role-custom-${Date.now()}`;

    const savedRole: AdminRole = {
      id: roleId,
      name: role.name.trim(),
      description: role.description?.trim() || 'Custom operational role.',
      isSystem: false,
      userCount: store.customRoles[roleId]?.userCount || 0,
      permissions: role.permissions || {},
      created: store.customRoles[roleId]?.created || nowIso,
      updated: nowIso,
    };

    store.customRoles[roleId] = savedRole;
    writeRbacStore(store);

    // Sync to Cloud Firestore (/admin_roles)
    try {
      await setDoc(doc(db, 'admin_roles', roleId), savedRole, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore role sync warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      role: savedRole,
      message: `Role "${savedRole.name}" saved successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error saving role.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    // 1. Authorize: Check effective permissions on 'settings.roles' -> 'manage_roles'
    const authCheck = await verifyStaffPermission(request, null, 'settings.roles', 'manage_roles');
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error,
          code: authCheck.code,
        },
        { status: authCheck.status }
      );
    }

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'roleId parameter is required.' },
        { status: 400 }
      );
    }

    // 2. Guard against system roles
    const isSystemRole = SEED_ROLES.some(r => r.id === roleId);
    if (isSystemRole || roleId === 'role-super-admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'System Role Protection: Predefined system template roles cannot be deleted.',
        },
        { status: 403 }
      );
    }

    // 3. Guard against active staff assigned to this role
    const store = readRbacStore();
    const usersMap = store.users || {};
    const assignedStaff = Object.values(usersMap).filter(
      (u: any) => u.roleId === roleId && u.status === 'active'
    );

    if (assignedStaff.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role. There are ${assignedStaff.length} active staff member(s) assigned to this role. Please reassign them first.`,
        },
        { status: 409 }
      );
    }

    // 4. Remove from store
    if (store.customRoles && store.customRoles[roleId]) {
      delete store.customRoles[roleId];
      writeRbacStore(store);
    }

    // Sync to Cloud Firestore
    try {
      await deleteDoc(doc(db, 'admin_roles', roleId));
    } catch (fsErr) {
      console.warn('Firestore role deletion warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Role "${roleId}" has been safely retired.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error deleting role.' },
      { status: 500 }
    );
  }
}

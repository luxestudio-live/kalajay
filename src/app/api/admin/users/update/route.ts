import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface UpdateStaffBody {
  requestingStaffId?: string;
  targetStaffId: string;
  updates: {
    name?: string;
    phone?: string;
    department?: string;
    roleId?: string;
    roleName?: string;
    status?: 'active' | 'deactivated';
    requiresPasswordReset?: boolean;
  };
}

function getRbacStorePath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, 'kalajay_staff_rbac_store.json');
}

function readRbacStore(): Record<string, any> {
  try {
    const fPath = getRbacStorePath();
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeRbacStore(data: Record<string, any>) {
  try {
    const fPath = getRbacStorePath();
    fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function POST(request: Request) {
  try {
    const body: UpdateStaffBody = await request.json();
    const { requestingStaffId, targetStaffId, updates } = body;

    // 1. Authorize Super Admin
    const isSuperAdmin = requestingStaffId === 'KJ-ADM-001';
    if (!isSuperAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: Only Super Administrators can update staff records.',
        },
        { status: 403 }
      );
    }

    if (!targetStaffId) {
      return NextResponse.json(
        { success: false, error: 'targetStaffId is required.' },
        { status: 400 }
      );
    }

    const cleanTargetId = targetStaffId.toUpperCase();

    // 2. Super Admin Safety Lock (Requirement: Prevent Superadmin Lockout)
    if (cleanTargetId === 'KJ-ADM-001') {
      if (updates.status === 'deactivated') {
        return NextResponse.json(
          {
            success: false,
            error: 'Super Admin Safety Lock: Root Super Administrator (KJ-ADM-001) cannot be deactivated.',
          },
          { status: 400 }
        );
      }
      if (updates.roleId && updates.roleId !== 'role-super-admin') {
        return NextResponse.json(
          {
            success: false,
            error: 'Super Admin Safety Lock: Root Super Administrator role is immutable.',
          },
          { status: 400 }
        );
      }
    }

    // 3. Locate Target User
    const store = readRbacStore();
    const staffIdIndex = store.staffIdIndex || {};
    const usersMap = store.users || {};

    const indexedEntry = staffIdIndex[cleanTargetId];
    if (!indexedEntry) {
      return NextResponse.json(
        { success: false, error: `Staff user "${cleanTargetId}" not found.` },
        { status: 404 }
      );
    }

    const targetUid = indexedEntry.uid;
    const existingUser = usersMap[targetUid] || indexedEntry;

    // 4. Apply Updates
    const nowIso = new Date().toISOString();
    const updatedUser = {
      ...existingUser,
      ...updates,
      staffId: cleanTargetId,
      id: cleanTargetId,
      uid: targetUid,
      updatedAt: nowIso,
    };

    // Update in store
    usersMap[targetUid] = updatedUser;
    staffIdIndex[cleanTargetId] = {
      ...staffIdIndex[cleanTargetId],
      name: updatedUser.name,
      department: updatedUser.department,
      roleId: updatedUser.roleId,
      roleName: updatedUser.roleName,
      status: updatedUser.status,
      requiresPasswordReset: updatedUser.requiresPasswordReset,
    };

    store.users = usersMap;
    store.staffIdIndex = staffIdIndex;
    writeRbacStore(store);

    // 5. Sync to Cloud Firestore
    try {
      await setDoc(doc(db, 'admin_users', targetUid), updatedUser, { merge: true });
      await setDoc(
        doc(db, 'users', targetUid),
        {
          name: updatedUser.name,
          phone: updatedUser.phone,
          department: updatedUser.department,
          staffRole: updatedUser.roleId,
          requiresPasswordReset: updatedUser.requiresPasswordReset,
          updatedAt: nowIso,
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore update sync warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: `Staff user ${cleanTargetId} successfully updated.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error updating staff account.' },
      { status: 500 }
    );
  }
}

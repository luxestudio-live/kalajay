import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import {
  readRbacStore,
  writeRbacStore,
  verifyStaffPermission,
  validateUsername,
  normalizeUsername,
  getStaffUser,
  BASELINE_STAFF_MAP,
} from '@/lib/serverRbac';

interface UpdateStaffBody {
  requestingStaffId?: string;
  requestingUsername?: string;
  targetStaffId?: string;
  targetUsername?: string;
  targetUid?: string;
  updates: {
    username?: string;
    name?: string;
    phone?: string;
    department?: string;
    roleId?: string;
    roleName?: string;
    status?: 'active' | 'deactivated';
    requiresPasswordReset?: boolean;
  };
}

export async function POST(request: Request) {
  try {
    const body: UpdateStaffBody = await request.json();
    const { targetStaffId, targetUsername, targetUid: explicitUid, updates } = body;

    // 1. Authorize: Check effective permissions on 'settings.users' -> 'manage_users'
    const authCheck = await verifyStaffPermission(request, body, 'settings.users', 'manage_users');
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

    const targetIdentifier = (targetUsername || targetStaffId || explicitUid || '').trim();
    if (!targetIdentifier) {
      return NextResponse.json(
        { success: false, error: 'targetUsername or targetStaffId is required.' },
        { status: 400 }
      );
    }

    // 2. Locate Target User
    const existingTarget = await getStaffUser(targetIdentifier);
    if (!existingTarget) {
      return NextResponse.json(
        { success: false, error: `Staff user "${targetIdentifier}" not found.` },
        { status: 404 }
      );
    }

    const targetStaffIdClean = existingTarget.staffId || existingTarget.id;
    const targetUid = existingTarget.uid || existingTarget.id;
    const oldUsername = normalizeUsername(existingTarget.username || '');

    // 3. Super Admin Safety Lock (Prevent Superadmin Lockout)
    const isTargetRootSuperAdmin =
      targetStaffIdClean === 'KJ-ADM-001' ||
      oldUsername === 'soumya' ||
      targetUid === 'mJ6lPWSeACcLSCSKqonwcksD87I2';

    if (isTargetRootSuperAdmin) {
      if (updates.status === 'deactivated') {
        return NextResponse.json(
          {
            success: false,
            error: 'Super Admin Safety Lock: Root Super Administrator (soumya / KJ-ADM-001) cannot be deactivated.',
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

    // Privilege Escalation Guard: Only Super Admin can assign role-super-admin
    if (updates.roleId === 'role-super-admin') {
      const isRequesterSuperAdmin =
        authCheck.staffUser?.roleId === 'role-super-admin' ||
        authCheck.staffUser?.username === 'soumya' ||
        authCheck.staffUser?.uid === 'mJ6lPWSeACcLSCSKqonwcksD87I2';
      if (!isRequesterSuperAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Privilege Escalation Blocked: Only the Super Administrator can assign the Super Admin role.',
            code: 'PERMISSION_DENIED',
          },
          { status: 403 }
        );
      }
    }

    // 4. Handle Username Change (if provided)
    const store = readRbacStore();
    const staffIdIndex = store.staffIdIndex || {};
    const usernameIndex = store.usernameIndex || {};
    const usersMap = store.users || {};

    let newUsernameClean = oldUsername;

    if (updates.username) {
      const usernameVal = validateUsername(updates.username);
      if (!usernameVal.valid) {
        return NextResponse.json(
          { success: false, error: usernameVal.error, code: 'INVALID_USERNAME' },
          { status: 400 }
        );
      }

      newUsernameClean = usernameVal.normalized;

      if (newUsernameClean !== oldUsername) {
        // Check uniqueness in local store
        if (
          (BASELINE_STAFF_MAP[newUsernameClean] && BASELINE_STAFF_MAP[newUsernameClean].uid !== targetUid) ||
          (usernameIndex[newUsernameClean] && usernameIndex[newUsernameClean].uid !== targetUid)
        ) {
          return NextResponse.json(
            {
              success: false,
              error: `Username "@${newUsernameClean}" is already registered.`,
              code: 'USERNAME_ALREADY_EXISTS',
            },
            { status: 409 }
          );
        }

        // Check uniqueness in Firestore
        try {
          const snap = await getDoc(doc(db, 'admin_usernames', newUsernameClean));
          if (snap.exists() && snap.data().uid !== targetUid) {
            return NextResponse.json(
              {
                success: false,
                error: `Username "@${newUsernameClean}" is already registered in cloud directory.`,
                code: 'USERNAME_ALREADY_EXISTS',
              },
              { status: 409 }
            );
          }
        } catch {}

        // Invalidate old mapping and reserve new mapping
        if (oldUsername && usernameIndex[oldUsername]) {
          delete usernameIndex[oldUsername];
        }

        usernameIndex[newUsernameClean] = {
          uid: targetUid,
          username: newUsernameClean,
          staffId: targetStaffIdClean,
          email: existingTarget.email,
        };

        // Sync Firestore username index: delete old, write new
        try {
          if (oldUsername) {
            await deleteDoc(doc(db, 'admin_usernames', oldUsername));
          }
          await setDoc(
            doc(db, 'admin_usernames', newUsernameClean),
            {
              uid: targetUid,
              username: newUsernameClean,
              staffId: targetStaffIdClean,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (fsErr) {
          console.warn('Firestore username re-index warning:', fsErr);
        }
      }
    }

    // 5. Apply Updates to User Record
    const nowIso = new Date().toISOString();
    const existingRecord = usersMap[targetUid] || existingTarget;

    const updatedUser = {
      ...existingRecord,
      ...updates,
      username: newUsernameClean,
      staffId: targetStaffIdClean,
      id: targetStaffIdClean,
      uid: targetUid,
      updatedAt: nowIso,
    };

    usersMap[targetUid] = updatedUser;

    if (staffIdIndex[targetStaffIdClean]) {
      staffIdIndex[targetStaffIdClean] = {
        ...staffIdIndex[targetStaffIdClean],
        username: newUsernameClean,
        name: updatedUser.name,
        department: updatedUser.department,
        roleId: updatedUser.roleId,
        roleName: updatedUser.roleName,
        status: updatedUser.status,
        requiresPasswordReset: updatedUser.requiresPasswordReset,
      };
    }

    store.users = usersMap;
    store.staffIdIndex = staffIdIndex;
    store.usernameIndex = usernameIndex;
    writeRbacStore(store);

    // 6. Sync to Cloud Firestore (/admin_users and /users)
    try {
      await setDoc(doc(db, 'admin_users', targetUid), updatedUser, { merge: true });
      await setDoc(
        doc(db, 'users', targetUid),
        {
          username: newUsernameClean,
          name: updatedUser.name,
          phone: updatedUser.phone,
          department: updatedUser.department,
          staffRole: updatedUser.roleId,
          status: updatedUser.status,
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
      message: `Staff user @${newUsernameClean} (${targetStaffIdClean}) successfully updated.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error updating staff account.' },
      { status: 500 }
    );
  }
}

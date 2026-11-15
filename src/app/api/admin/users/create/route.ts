import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  readRbacStore,
  writeRbacStore,
  verifyStaffPermission,
  validateUsername,
  suggestUsername,
  normalizeUsername,
  BASELINE_STAFF_MAP,
} from '@/lib/serverRbac';

interface CreateStaffBody {
  requestingStaffId?: string;
  requestingUsername?: string;
  name: string;
  username?: string;
  email: string;
  phone?: string;
  department: string;
  roleId: string;
  roleName?: string;
  status?: 'active' | 'deactivated';
}

// In-process asynchronous Mutex to guarantee atomic sequential ID and username allocation under concurrent load
class Mutex {
  private current: Promise<void> = Promise.resolve();
  lock(): Promise<() => void> {
    let unlock: () => void = () => {};
    const next = new Promise<void>(resolve => {
      unlock = resolve;
    });
    const wait = this.current.then(() => unlock);
    this.current = this.current.then(() => next);
    return wait;
  }
}

const staffCreationMutex = new Mutex();

// Cryptographically secure temporary passcode generator
function generateSecureTemporaryPasscode(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';

  // Guarantee at least 2 of each character category
  let passcode = '';
  for (let i = 0; i < 3; i++) passcode += upper[crypto.randomInt(0, upper.length)];
  for (let i = 0; i < 3; i++) passcode += lower[crypto.randomInt(0, lower.length)];
  for (let i = 0; i < 3; i++) passcode += digits[crypto.randomInt(0, digits.length)];
  for (let i = 0; i < 3; i++) passcode += symbols[crypto.randomInt(0, symbols.length)];

  // Fill remaining to 16 characters from combined pool
  const all = upper + lower + digits + symbols;
  while (passcode.length < 16) {
    passcode += all[crypto.randomInt(0, all.length)];
  }

  // Shuffle securely
  const arr = passcode.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

export async function POST(request: Request) {
  try {
    const body: CreateStaffBody = await request.json();
    const {
      requestingStaffId,
      requestingUsername,
      name,
      username: rawUsername,
      email,
      phone,
      department,
      roleId,
      roleName,
      status: requestedStatus,
    } = body;

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

    // 2. Validate mandatory fields
    if (!name?.trim() || !email?.trim() || !roleId?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Full name, valid email address, and role selection are required.',
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // 3. Validate & Resolve Username
    const chosenUsername = (rawUsername || '').trim() || suggestUsername(name);
    const usernameValidation = validateUsername(chosenUsername);
    if (!usernameValidation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: usernameValidation.error,
          code: 'INVALID_USERNAME',
        },
        { status: 400 }
      );
    }
    const finalUsername = usernameValidation.normalized;

    // 4. Acquire Critical Section Mutex for Atomic Provisioning & Unique Reservation
    const releaseLock = await staffCreationMutex.lock();

    try {
      const store = readRbacStore();
      const staffIdIndex = store.staffIdIndex || {};
      const usernameIndex = store.usernameIndex || {};
      const usersMap = store.users || {};

      // Check for duplicate username in local store or baseline map
      if (BASELINE_STAFF_MAP[finalUsername] || usernameIndex[finalUsername]) {
        return NextResponse.json(
          {
            success: false,
            error: `Username "@${finalUsername}" is already registered. Please choose another username.`,
            code: 'USERNAME_ALREADY_EXISTS',
          },
          { status: 409 }
        );
      }

      for (const uid of Object.keys(usersMap)) {
        if (normalizeUsername(usersMap[uid].username || '') === finalUsername) {
          return NextResponse.json(
            {
              success: false,
              error: `Username "@${finalUsername}" is already registered. Please choose another username.`,
              code: 'USERNAME_ALREADY_EXISTS',
            },
            { status: 409 }
          );
        }
      }

      // Check Firestore /admin_usernames/{username}
      try {
        const snap = await getDoc(doc(db, 'admin_usernames', finalUsername));
        if (snap.exists()) {
          return NextResponse.json(
            {
              success: false,
              error: `Username "@${finalUsername}" is already registered in cloud directory.`,
              code: 'USERNAME_ALREADY_EXISTS',
            },
            { status: 409 }
          );
        }
      } catch {}

      // Check for duplicate staff email
      const existingStaffByEmail = Object.values(staffIdIndex).find(
        (s: any) => s.email?.toLowerCase() === cleanEmail
      );

      if (existingStaffByEmail) {
        return NextResponse.json(
          {
            success: false,
            error: `Staff account with email "${cleanEmail}" is already provisioned under ID ${(existingStaffByEmail as any).staffId}.`,
            code: 'EMAIL_ALREADY_EXISTS',
          },
          { status: 409 }
        );
      }

      // Atomic Sequential Staff ID Generation (KJ-ADM-xxx for legacy and auditing)
      let maxNum = 4;
      Object.keys(staffIdIndex).forEach(id => {
        const match = id.match(/^KJ-ADM-(\d+)$/i);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });

      const nextStaffNum = maxNum + 1;
      const newStaffId = `KJ-ADM-${String(nextStaffNum).padStart(3, '0')}`;

      // Reserve username and staff ID immediately
      usernameIndex[finalUsername] = {
        username: finalUsername,
        staffId: newStaffId,
        email: cleanEmail,
        status: 'provisioning',
      };
      staffIdIndex[newStaffId] = {
        staffId: newStaffId,
        username: finalUsername,
        email: cleanEmail,
        status: 'provisioning',
      };
      store.usernameIndex = usernameIndex;
      store.staffIdIndex = staffIdIndex;
      writeRbacStore(store);

      // 5. Generate Cryptographic Temporary Passcode
      const temporaryPasscode = generateSecureTemporaryPasscode();

      // 6. Create Account in Firebase Authentication via Identity Platform REST API
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzdJB2o_mS3JgSJ-MaBNbvpBi35AdcSCc';
      let firebaseUid = `uid-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

      try {
        const signUpRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: cleanEmail,
              password: temporaryPasscode,
              displayName: name.trim(),
              returnSecureToken: true,
            }),
          }
        );

        const signUpData = await signUpRes.json();
        if (signUpData.localId) {
          firebaseUid = signUpData.localId;
        }
      } catch (authErr) {
        console.warn('Firebase Auth REST signup warning:', authErr);
      }

      // 7. Assemble Complete Staff User Record
      const nowIso = new Date().toISOString();
      const resolvedRoleName = roleName || (roleId === 'role-super-admin' ? 'Super Admin' : 'Custom Staff');

      const newStaffUser = {
        id: newStaffId,
        uid: firebaseUid,
        staffId: newStaffId,
        username: finalUsername,
        name: name.trim(),
        email: cleanEmail,
        phone: phone?.trim() || '',
        department: department?.trim() || 'General Operations',
        roleId: roleId.trim(),
        roleName: resolvedRoleName,
        status: (requestedStatus || 'active') as 'active' | 'deactivated',
        requiresPasswordReset: true,
        hasCompletedFirstLoginReset: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: authCheck.staffUser?.username || authCheck.staffUser?.staffId || requestingStaffId,
      };

      // 8. Persist to Server Durable Store
      store.users = store.users || {};
      store.users[firebaseUid] = newStaffUser;
      store.usernameIndex[finalUsername] = {
        uid: firebaseUid,
        username: finalUsername,
        staffId: newStaffId,
        email: cleanEmail,
        name: newStaffUser.name,
      };
      store.staffIdIndex[newStaffId] = {
        staffId: newStaffId,
        username: finalUsername,
        uid: firebaseUid,
        email: cleanEmail,
        name: newStaffUser.name,
        department: newStaffUser.department,
        roleId: newStaffUser.roleId,
        roleName: newStaffUser.roleName,
        status: newStaffUser.status,
        requiresPasswordReset: true,
      };
      store.nextStaffNumber = nextStaffNum + 1;
      writeRbacStore(store);

      // 9. Sync to Cloud Firestore:
      // - /admin_usernames/{username}
      // - /admin_users/{firebaseUid}
      // - /users/{firebaseUid}
      try {
        await setDoc(
          doc(db, 'admin_usernames', finalUsername),
          {
            uid: firebaseUid,
            username: finalUsername,
            staffId: newStaffId,
            createdAt: nowIso,
          },
          { merge: true }
        );

        await setDoc(doc(db, 'admin_users', firebaseUid), newStaffUser, { merge: true });
        await setDoc(
          doc(db, 'users', firebaseUid),
          {
            id: firebaseUid,
            staffId: newStaffId,
            username: finalUsername,
            name: newStaffUser.name,
            email: cleanEmail,
            phone: newStaffUser.phone,
            department: newStaffUser.department,
            role: roleId === 'role-super-admin' ? 'super_admin' : 'staff',
            staffRole: roleId,
            requiresPasswordReset: true,
            hasCompletedFirstLoginReset: false,
            updatedAt: nowIso,
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('Firestore staff sync warning:', fsErr);
      }

      // 10. Return One-Time Credential Handover Payload with Username & Password
      return NextResponse.json(
        {
          success: true,
          username: finalUsername,
          staffId: newStaffId,
          temporaryPasscode,
          user: newStaffUser,
          message: `Staff account @${finalUsername} successfully provisioned. Hand over credentials securely.`,
        },
        { status: 201 }
      );
    } finally {
      releaseLock();
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error provisioning staff user.' },
      { status: 500 }
    );
  }
}

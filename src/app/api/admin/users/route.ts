import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import {
  readRbacStore,
  writeRbacStore,
  verifyStaffPermission,
  validateUsername,
  suggestUsername,
  normalizeUsername,
  getStaffUser,
  BASELINE_STAFF_MAP,
} from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

export const dynamic = 'force-dynamic';

// Rate limiting maps
const checkRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 30; // 30 checks per minute

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = checkRateLimitMap.get(key);

  if (!entry) {
    checkRateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    checkRateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS_PER_WINDOW;
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

// Cross-process file-based lock with retry to ensure mutual exclusion across independent Node.js server processes
async function acquireCrossProcessLock(timeoutMs = 8000): Promise<() => void> {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch {}
  }
  const lockFile = path.join(cacheDir, 'staff_creation.lock');
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const fd = fs.openSync(lockFile, 'wx');
      fs.writeSync(fd, `${process.pid}_${Date.now()}`);
      return () => {
        try {
          fs.closeSync(fd);
          if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
        } catch {}
      };
    } catch (err: any) {
      if (err.code === 'EEXIST') {
        try {
          const stat = fs.statSync(lockFile);
          if (Date.now() - stat.mtimeMs > 10000) {
            fs.unlinkSync(lockFile);
          }
        } catch {}
        await new Promise(r => setTimeout(r, 40));
      } else {
        break;
      }
    }
  }
  return () => {};
}

// Cryptographically secure temporary passcode generator
function generateSecureTemporaryPasscode(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*';

  let passcode = '';
  for (let i = 0; i < 3; i++) passcode += upper[crypto.randomInt(0, upper.length)];
  for (let i = 0; i < 3; i++) passcode += lower[crypto.randomInt(0, lower.length)];
  for (let i = 0; i < 3; i++) passcode += digits[crypto.randomInt(0, digits.length)];
  for (let i = 0; i < 3; i++) passcode += symbols[crypto.randomInt(0, symbols.length)];

  const all = upper + lower + digits + symbols;
  while (passcode.length < 16) {
    passcode += all[crypto.randomInt(0, all.length)];
  }

  const arr = passcode.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

const BASELINE_STAFF = [
  {
    id: 'KJ-ADM-001',
    staffId: 'KJ-ADM-001',
    username: 'soumya',
    uid: 'mJ6lPWSeACcLSCSKqonwcksD87I2',
    name: 'Soumya (Founder)',
    email: 'soumya@kalajay.in',
    phone: '+91 98201 00001',
    department: 'Founders Office & Creative Direction',
    roleId: 'role-super-admin',
    roleName: 'Founder & Head of Maison',
    status: 'active',
    createdAt: '2026-10-01T00:00:00Z',
  },
  {
    id: 'KJ-ADM-002',
    staffId: 'KJ-ADM-002',
    username: 'ritu.verma',
    uid: '5SWIY26CaXgfDnN2anZOnNBuxV72',
    name: 'Ritu Verma',
    email: 'ritu.verma@kalajay.in',
    phone: '+91 98201 00002',
    department: 'Digital Commerce',
    roleId: 'role-store-manager',
    roleName: 'Store Operations Manager',
    status: 'active',
    createdAt: '2026-10-15T00:00:00Z',
  },
  {
    id: 'KJ-ADM-003',
    staffId: 'KJ-ADM-003',
    username: 'sunita.craft',
    uid: '5iQ0TA1Mx6NXaTfErP9wxt4dVIz1',
    name: 'Sunita Kumari',
    email: 'sunita.craft@kalajay.in',
    phone: '+91 98201 00003',
    department: 'Bihar Craft House Hub',
    roleId: 'role-production-manager',
    roleName: 'Bihar Atelier & Production Head',
    status: 'active',
    createdAt: '2026-10-20T00:00:00Z',
  },
  {
    id: 'KJ-ADM-004',
    staffId: 'KJ-ADM-004',
    username: 'aarav.mehta',
    uid: 'sRqJ2GtrfSMHLJq0D1bEZZyMAWZ2',
    name: 'Aarav Mehta',
    email: 'aarav.m@kalajay.in',
    phone: '+91 98201 00004',
    department: 'Mumbai Atelier & Logistics',
    roleId: 'role-fulfilment-agent',
    roleName: 'Fulfilment & Dispatch Agent',
    status: 'active',
    createdAt: '2026-10-20T00:00:00Z',
  },
];

// ==========================================
// GET HANDLER: Check Username OR List Users
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ------------------------------------------
    // SUB-ACTION: Check Username Availability
    // ------------------------------------------
    if (action === 'check-username' || searchParams.has('username')) {
      const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
      const rawUsername = searchParams.get('username') || '';
      const requestingUsername =
        searchParams.get('requestingUsername') ||
        searchParams.get('requestingStaffId') ||
        request.headers.get('x-staff-username') ||
        request.headers.get('x-staff-id');

      // Rate limit check
      const requesterKey = requestingUsername || ip;
      if (!checkRateLimit(`check_${requesterKey}`)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many username availability checks. Rate limit exceeded (30 checks/min).',
            code: 'RATE_LIMITED',
          },
          { status: 429 }
        );
      }

      // RBAC Authorization check
      const authCheck = await verifyStaffPermission(
        request,
        { requestingUsername },
        'settings.users',
        'manage_users'
      );
      if (!authCheck.authorized) {
        return NextResponse.json(
          {
            success: false,
            error: authCheck.error || 'Access Denied: Requires staff-management permissions.',
            code: authCheck.code || 'PERMISSION_DENIED',
          },
          { status: authCheck.status || 403 }
        );
      }

      // Username Format Validation
      const validation = validateUsername(rawUsername);
      if (!validation.valid) {
        return NextResponse.json(
          {
            success: false,
            valid: false,
            available: false,
            username: validation.normalized,
            error: validation.error,
          },
          { status: 200 }
        );
      }

      const normalized = validation.normalized;

      // Check Baseline Map
      if (BASELINE_STAFF_MAP[normalized]) {
        return NextResponse.json(
          {
            success: false,
            valid: true,
            available: false,
            username: normalized,
            error: `Username "@${normalized}" is already taken.`,
          },
          { status: 200 }
        );
      }

      // Check Server Durable Store
      const store = readRbacStore();
      const usernameIndex = store.usernameIndex || {};
      if (usernameIndex[normalized]) {
        return NextResponse.json(
          {
            success: false,
            valid: true,
            available: false,
            username: normalized,
            error: `Username "@${normalized}" is already taken.`,
          },
          { status: 200 }
        );
      }

      const usersMap = store.users || {};
      for (const uid of Object.keys(usersMap)) {
        const u = usersMap[uid];
        if (normalizeUsername(u.username || '') === normalized) {
          return NextResponse.json(
            {
              success: false,
              valid: true,
              available: false,
              username: normalized,
              error: `Username "@${normalized}" is already taken.`,
            },
            { status: 200 }
          );
        }
      }

      // Check Cloud Firestore /admin_usernames/{username}
      try {
        const snap = await getDoc(doc(db, 'admin_usernames', normalized));
        if (snap.exists()) {
          return NextResponse.json(
            {
              success: false,
              valid: true,
              available: false,
              username: normalized,
              error: `Username "@${normalized}" is already taken.`,
            },
            { status: 200 }
          );
        }
      } catch {}

      return NextResponse.json({
        success: true,
        valid: true,
        available: true,
        username: normalized,
        message: `Username "@${normalized}" is available.`,
      });
    }

    // ------------------------------------------
    // DEFAULT SUB-ACTION: List Staff Users
    // ------------------------------------------
    const store = readRbacStore();
    const storedUsers = store.users ? Object.values(store.users) : [];

    const userMap = new Map<string, any>();
    BASELINE_STAFF.forEach(u => userMap.set(u.staffId, u));
    storedUsers.forEach((u: any) => {
      const key = u.staffId || u.id;
      userMap.set(key, {
        ...u,
        username: u.username || suggestUsername(u.name),
      });
    });

    try {
      const fsUsersSnap = await getDocs(collection(db, 'admin_users'));
      fsUsersSnap.forEach(d => {
        const data = d.data();
        const key = data.staffId || data.id || d.id;
        if (key) {
          userMap.set(key, {
            ...data,
            id: key,
            username: data.username || suggestUsername(data.name || ''),
          });
        }
      });
    } catch (fsErr) {}

    const allUsers = Array.from(userMap.values()).sort((a, b) =>
      (a.staffId || a.id).localeCompare(b.staffId || b.id)
    );

    const authCheck = await verifyStaffPermission(request, null, 'settings.users', 'view');
    const isAuthorized = authCheck.authorized;

    const sanitizedUsers = allUsers.map(u => {
      if (isAuthorized) {
        return u;
      }
      return {
        id: u.staffId || u.id,
        staffId: u.staffId || u.id,
        username: u.username || suggestUsername(u.name),
        name: u.name,
        department: u.department,
        roleId: u.roleId,
        roleName: u.roleName,
        status: u.status,
      };
    });

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      count: sanitizedUsers.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process staff users request.' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST HANDLER: Create Staff User OR Update Staff User
// ==========================================
export async function POST(request: Request) {
  try {
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;

    // ------------------------------------------
    // SUB-ACTION: Update Staff User / Toggle Status
    // ------------------------------------------
    if (action === 'update' || action === 'toggle_status' || body.updates) {
      let updates = body.updates || {};
      if (action === 'toggle_status') {
        const nextActive = body.active !== undefined ? Boolean(body.active) : false;
        updates = {
          ...updates,
          active: nextActive,
          status: nextActive ? 'active' : 'deactivated',
        };
      }

      const targetStaffId = body.targetStaffId || body.targetUid || body.uid;
      const targetUsername = body.targetUsername || body.username;
      const explicitUid = body.targetUid || body.uid;

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

      // Super Admin Safety Lock
      const isTargetRootSuperAdmin =
        targetStaffIdClean === 'KJ-ADM-001' ||
        oldUsername === 'soumya' ||
        targetUid === 'mJ6lPWSeACcLSCSKqonwcksD87I2';

      if (isTargetRootSuperAdmin) {
        if (updates?.status === 'deactivated') {
          return NextResponse.json(
            {
              success: false,
              error: 'Super Admin Safety Lock: Root Super Administrator (soumya / KJ-ADM-001) cannot be deactivated.',
            },
            { status: 400 }
          );
        }
        if (updates?.roleId && updates.roleId !== 'role-super-admin') {
          return NextResponse.json(
            {
              success: false,
              error: 'Super Admin Safety Lock: Root Super Administrator role is immutable.',
            },
            { status: 400 }
          );
        }
      }

      // Privilege Escalation Guard
      if (updates?.roleId === 'role-super-admin') {
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

      // Handle Username Change
      const store = readRbacStore();
      const staffIdIndex = store.staffIdIndex || {};
      const usernameIndex = store.usernameIndex || {};
      const usersMap = store.users || {};

      let newUsernameClean = oldUsername;

      if (updates?.username) {
        const usernameVal = validateUsername(updates.username);
        if (!usernameVal.valid) {
          return NextResponse.json(
            { success: false, error: usernameVal.error, code: 'INVALID_USERNAME' },
            { status: 400 }
          );
        }

        newUsernameClean = usernameVal.normalized;

        if (newUsernameClean !== oldUsername) {
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

          if (oldUsername && usernameIndex[oldUsername]) {
            delete usernameIndex[oldUsername];
          }

          usernameIndex[newUsernameClean] = {
            uid: targetUid,
            username: newUsernameClean,
            staffId: targetStaffIdClean,
            email: existingTarget.email,
          };

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

      // Apply Updates
      const nowIso = new Date().toISOString();
      const existingRecord = usersMap[targetUid] || existingTarget;

      const nextActive =
        updates?.active !== undefined
          ? Boolean(updates.active)
          : updates?.status
          ? updates.status === 'active'
          : existingRecord.active !== undefined
          ? existingRecord.active
          : existingRecord.status !== 'deactivated';

      const nextStatus =
        updates?.status ||
        (updates?.active !== undefined ? (updates.active ? 'active' : 'deactivated') : existingRecord.status || 'active');

      const updatedUser = {
        ...existingRecord,
        ...(updates || {}),
        active: nextActive,
        status: nextStatus,
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
          active: updatedUser.active,
          requiresPasswordReset: updatedUser.requiresPasswordReset,
        };
      }

      store.users = usersMap;
      store.staffIdIndex = staffIdIndex;
      store.usernameIndex = usernameIndex;
      writeRbacStore(store);

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('admin_users').doc(targetUid).set(updatedUser, { merge: true });
          await adminDb.collection('users').doc(targetUid).set(
            {
              username: newUsernameClean,
              name: updatedUser.name,
              phone: updatedUser.phone,
              department: updatedUser.department,
              staffRole: updatedUser.roleId,
              status: updatedUser.status,
              active: updatedUser.active,
              requiresPasswordReset: updatedUser.requiresPasswordReset,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else {
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
              active: updatedUser.active,
              requiresPasswordReset: updatedUser.requiresPasswordReset,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      } catch (fsErr) {
        console.warn('Firestore update sync warning:', fsErr);
      }

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: `Staff user @${newUsernameClean} (${targetStaffIdClean}) successfully updated.`,
      });
    }

    // ------------------------------------------
    // DEFAULT SUB-ACTION: Create Staff User
    // ------------------------------------------
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

    if (roleId === 'role-super-admin') {
      const isRequesterSuperAdmin =
        authCheck.staffUser?.roleId === 'role-super-admin' ||
        authCheck.staffUser?.username === 'soumya' ||
        authCheck.staffUser?.uid === 'mJ6lPWSeACcLSCSKqonwcksD87I2';
      if (!isRequesterSuperAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Privilege Escalation Blocked: Only the Super Administrator can provision a staff account with the Super Admin role.',
            code: 'PERMISSION_DENIED',
          },
          { status: 403 }
        );
      }
    }

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

    const releaseLock = await staffCreationMutex.lock();
    const releaseProcessLock = await acquireCrossProcessLock();

    try {
      const store = readRbacStore();
      const staffIdIndex = store.staffIdIndex || {};
      const usernameIndex = store.usernameIndex || {};
      const usersMap = store.users || {};

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

      const temporaryPasscode = generateSecureTemporaryPasscode();
      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
      let firebaseUid = '';

      if (!apiKey) {
        throw new Error('Server configuration error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined.');
      }

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
        if (!signUpRes.ok || !signUpData.localId) {
          const errMsg = signUpData.error?.message || 'Failed to provision Firebase Authentication identity.';
          delete usernameIndex[finalUsername];
          delete staffIdIndex[newStaffId];
          store.usernameIndex = usernameIndex;
          store.staffIdIndex = staffIdIndex;
          writeRbacStore(store);

          return NextResponse.json(
            {
              success: false,
              error: errMsg.includes('EMAIL_EXISTS')
                ? `An account with email "${cleanEmail}" already exists in Firebase Authentication.`
                : errMsg,
              code: 'AUTH_ACCOUNT_CREATION_FAILED',
            },
            { status: 400 }
          );
        }
        firebaseUid = signUpData.localId;
      } catch (authErr: any) {
        delete usernameIndex[finalUsername];
        delete staffIdIndex[newStaffId];
        store.usernameIndex = usernameIndex;
        store.staffIdIndex = staffIdIndex;
        writeRbacStore(store);
        return NextResponse.json(
          {
            success: false,
            error: authErr?.message || 'Firebase Authentication service unreachable.',
            code: 'AUTH_SERVICE_UNAVAILABLE',
          },
          { status: 503 }
        );
      }

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
        active: (requestedStatus || 'active') === 'active',
        requiresPasswordReset: true,
        hasCompletedFirstLoginReset: false,
        createdAt: nowIso,
        updatedAt: nowIso,
        createdBy: authCheck.staffUser?.username || authCheck.staffUser?.staffId || requestingStaffId,
      };

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
        active: newStaffUser.active,
        requiresPasswordReset: true,
      };
      store.nextStaffNumber = nextStaffNum + 1;
      writeRbacStore(store);

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('admin_usernames').doc(finalUsername).set(
            {
              uid: firebaseUid,
              username: finalUsername,
              staffId: newStaffId,
              createdAt: nowIso,
            },
            { merge: true }
          );

          await adminDb.collection('admin_users').doc(firebaseUid).set(newStaffUser, { merge: true });
          await adminDb.collection('users').doc(firebaseUid).set(
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
              status: newStaffUser.status,
              active: newStaffUser.active,
              requiresPasswordReset: true,
              hasCompletedFirstLoginReset: false,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        } else {
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
              status: newStaffUser.status,
              active: newStaffUser.active,
              requiresPasswordReset: true,
              hasCompletedFirstLoginReset: false,
              updatedAt: nowIso,
            },
            { merge: true }
          );
        }
      } catch (fsErr) {
        console.warn('Firestore staff sync warning:', fsErr);
      }

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
      releaseProcessLock();
      releaseLock();
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing staff user request.' },
      { status: 500 }
    );
  }
}

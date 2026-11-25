import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { SEED_ROLES } from '@/data/adminPermissions';
import type { AdminRole, AdminUser, PermissionAction } from '@/data/adminTypes';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

// Internal service secret is deprecated and removed to enforce strict cryptographic token verification
// for all administrative requests. No M2M secret bypass is permitted.
export const INTERNAL_SERVICE_SECRET = '';

export const RESERVED_USERNAMES = new Set([
  'admin',
  'root',
  'system',
  'support',
  'superuser',
  'superadmin',
  'kalajay',
  'help',
  'api',
  'guest',
  'owner',
  'master',
  'staff',
  'security',
]);

/**
 * Normalizes username:
 * - Trims whitespace
 * - Strips optional leading '@'
 * - Converts to lowercase
 */
export function normalizeUsername(raw: string): string {
  let cleaned = (raw || '').trim().toLowerCase();
  if (cleaned.startsWith('@')) {
    cleaned = cleaned.substring(1).trim();
  }
  return cleaned;
}

/**
 * Validates username according to Kalajay specification:
 * - Length: 3-30 characters
 * - Allowed chars: lowercase letters, numbers, underscores, periods (^[a-z0-9._]+$)
 * - No spaces
 * - No leading or trailing periods
 * - No consecutive periods (..)
 * - Reserved names check
 */
export function validateUsername(raw: string): { valid: boolean; error?: string; normalized: string } {
  const normalized = normalizeUsername(raw);

  if (!normalized) {
    return { valid: false, error: 'Username is required.', normalized };
  }

  if (normalized.length < 3 || normalized.length > 30) {
    return { valid: false, error: 'Username must be between 3 and 30 characters.', normalized };
  }

  if (/\s/.test(normalized)) {
    return { valid: false, error: 'Username cannot contain spaces.', normalized };
  }

  if (!/^[a-z0-9._]+$/.test(normalized)) {
    return {
      valid: false,
      error: 'Username may only contain letters, numbers, underscores, and periods.',
      normalized,
    };
  }

  if (normalized.startsWith('.') || normalized.endsWith('.')) {
    return {
      valid: false,
      error: 'Username cannot start or end with a period.',
      normalized,
    };
  }

  if (normalized.includes('..')) {
    return {
      valid: false,
      error: 'Username cannot contain consecutive periods.',
      normalized,
    };
  }

  if (RESERVED_USERNAMES.has(normalized)) {
    return {
      valid: false,
      error: `Username "${normalized}" is reserved for system administration.`,
      normalized,
    };
  }

  return { valid: true, normalized };
}

/**
 * Generates an optional username suggestion from an employee's display name
 */
export function suggestUsername(name: string): string {
  let base = (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s._-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.+|\.+$/g, '');

  if (!base || base.length < 3) {
    base = (base + '.staff').replace(/^\.+/, '');
  }

  if (base.length > 30) {
    base = base.substring(0, 30).replace(/\.+$/, '');
  }

  if (RESERVED_USERNAMES.has(base)) {
    base = `${base}.user`;
  }

  return base;
}

function getRbacStorePath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, 'kalajay_staff_rbac_store.json');
}

export function readRbacStore(): Record<string, any> {
  try {
    const fPath = getRbacStorePath();
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

export function writeRbacStore(data: Record<string, any>) {
  try {
    const fPath = getRbacStorePath();
    fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export const BASELINE_STAFF_MAP: Record<string, AdminUser> = {
  'soumya': {
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
    requiresPasswordReset: false,
  },
  'ritu.verma': {
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
    requiresPasswordReset: false,
  },
  'sunita.craft': {
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
    requiresPasswordReset: false,
  },
  'aarav.mehta': {
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
    requiresPasswordReset: false,
  },
  'KJ-ADM-001': {
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
    requiresPasswordReset: false,
  },
  'KJ-ADM-002': {
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
    requiresPasswordReset: false,
  },
  'KJ-ADM-003': {
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
    requiresPasswordReset: false,
  },
  'KJ-ADM-004': {
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
    requiresPasswordReset: false,
  },
  // UID mapping for cryptographic token resolution
  'mJ6lPWSeACcLSCSKqonwcksD87I2': {
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
    requiresPasswordReset: false,
  },
  '5SWIY26CaXgfDnN2anZOnNBuxV72': {
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
    requiresPasswordReset: false,
  },
  '5iQ0TA1Mx6NXaTfErP9wxt4dVIz1': {
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
    requiresPasswordReset: false,
  },
  'sRqJ2GtrfSMHLJq0D1bEZZyMAWZ2': {
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
    requiresPasswordReset: false,
  },
  // Email mapping
  'soumya@kalajay.in': {
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
    requiresPasswordReset: false,
  },
  'ritu.verma@kalajay.in': {
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
    requiresPasswordReset: false,
  },
  'sunita.craft@kalajay.in': {
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
    requiresPasswordReset: false,
  },
  'aarav.m@kalajay.in': {
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
    requiresPasswordReset: false,
  },
};

export async function getStaffUserByEmail(email: string): Promise<AdminUser | null> {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail) return null;
  if (BASELINE_STAFF_MAP[cleanEmail]) {
    return BASELINE_STAFF_MAP[cleanEmail];
  }
  const store = readRbacStore();
  const usersMap = store.users || {};
  for (const uid of Object.keys(usersMap)) {
    const u = usersMap[uid];
    if (u.email && u.email.toLowerCase() === cleanEmail) {
      return {
        ...u,
        id: u.staffId || u.id,
        staffId: u.staffId || u.id,
        username: u.username || suggestUsername(u.name),
      };
    }
  }
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const qSnap = await adminDb.collection('admin_users').where('email', '==', cleanEmail).limit(1).get();
      if (!qSnap.empty) {
        const snapDoc = qSnap.docs[0];
        const data = snapDoc.data();
        return {
          id: data.staffId || data.id || snapDoc.id,
          staffId: data.staffId || data.id || snapDoc.id,
          username: data.username || suggestUsername(data.name || ''),
          uid: data.uid || snapDoc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    } else {
      const qSnap = await getDocs(query(collection(db, 'admin_users'), where('email', '==', cleanEmail)));
      if (!qSnap.empty) {
        const data = qSnap.docs[0].data();
        return {
          id: data.staffId || data.id || qSnap.docs[0].id,
          staffId: data.staffId || data.id || qSnap.docs[0].id,
          username: data.username || suggestUsername(data.name || ''),
          uid: data.uid || qSnap.docs[0].id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    }
  } catch {}
  return null;
}

export async function getStaffUser(identifier: string): Promise<AdminUser | null> {
  const raw = (identifier || '').trim();
  if (!raw) return null;

  // Direct check in baseline staff map (covers usernames, staff IDs, UIDs, and emails)
  if (BASELINE_STAFF_MAP[raw]) {
    return BASELINE_STAFF_MAP[raw];
  }

  const normalizedUser = normalizeUsername(raw);
  const upperStaffId = raw.toUpperCase();

  if (BASELINE_STAFF_MAP[normalizedUser]) {
    return BASELINE_STAFF_MAP[normalizedUser];
  }
  if (BASELINE_STAFF_MAP[upperStaffId]) {
    return BASELINE_STAFF_MAP[upperStaffId];
  }

  const store = readRbacStore();
  const usernameIndex = store.usernameIndex || {};
  const staffIndex = store.staffIdIndex || {};
  const usersMap = store.users || {};

  // 1. Direct lookup by UID in store
  if (usersMap[raw]) {
    const u = usersMap[raw];
    return {
      ...u,
      id: u.staffId || u.id,
      staffId: u.staffId || u.id,
      username: u.username || normalizedUser,
    };
  }

  // 2. Lookup by username index
  const fromUsernameIndex = usernameIndex[normalizedUser];
  if (fromUsernameIndex) {
    const user = usersMap[fromUsernameIndex.uid] || fromUsernameIndex;
    return {
      ...user,
      id: user.staffId || user.id,
      staffId: user.staffId || user.id,
      username: normalizedUser,
    };
  }

  // 3. Lookup by staff ID index
  const indexed = staffIndex[upperStaffId];
  if (indexed) {
    const user = usersMap[indexed.uid] || indexed;
    return {
      ...user,
      id: upperStaffId,
      staffId: upperStaffId,
      username: user.username || indexed.username || suggestUsername(user.name),
    };
  }

  // 4. Scan usersMap
  for (const uid of Object.keys(usersMap)) {
    const u = usersMap[uid];
    if (
      normalizeUsername(u.username || '') === normalizedUser ||
      (u.staffId && u.staffId.toUpperCase() === upperStaffId) ||
      uid === raw ||
      (u.email && u.email.toLowerCase() === raw.toLowerCase())
    ) {
      return {
        ...u,
        id: u.staffId || u.id,
        staffId: u.staffId || u.id,
        username: u.username || normalizedUser,
      };
    }
  }

  // 5. Cloud Firestore direct doc lookup by UID (/admin_users/{uid})
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const directDoc = await adminDb.collection('admin_users').doc(raw).get();
      if (directDoc.exists) {
        const data = directDoc.data()!;
        return {
          id: data.staffId || data.id || raw,
          staffId: data.staffId || data.id || raw,
          username: data.username || normalizedUser,
          uid: raw,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    } else {
      const directDoc = await getDoc(doc(db, 'admin_users', raw));
      if (directDoc.exists()) {
        const data = directDoc.data();
        return {
          id: data.staffId || data.id || raw,
          staffId: data.staffId || data.id || raw,
          username: data.username || normalizedUser,
          uid: raw,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    }
  } catch {}

  // 6. Cloud Firestore lookup by username (/admin_usernames/{username})
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const usernameSnap = await adminDb.collection('admin_usernames').doc(normalizedUser).get();
      if (usernameSnap.exists) {
        const uData = usernameSnap.data()!;
        if (uData.uid) {
          const userDoc = await adminDb.collection('admin_users').doc(uData.uid).get();
          if (userDoc.exists) {
            const data = userDoc.data()!;
            return {
              id: data.staffId || data.id || upperStaffId,
              staffId: data.staffId || data.id || upperStaffId,
              username: normalizedUser,
              uid: uData.uid,
              name: data.name,
              email: data.email,
              phone: data.phone,
              department: data.department,
              roleId: data.roleId,
              roleName: data.roleName,
              status: data.status || 'active',
              active: data.active !== undefined ? data.active : data.status === 'active',
              requiresPasswordReset: data.requiresPasswordReset,
              createdAt: data.createdAt,
            };
          }
        }
      }
    } else {
      const usernameSnap = await getDoc(doc(db, 'admin_usernames', normalizedUser));
      if (usernameSnap.exists()) {
        const uData = usernameSnap.data();
        if (uData.uid) {
          const userSnap = await getDoc(doc(db, 'admin_users', uData.uid));
          if (userSnap.exists()) {
            const fullData = userSnap.data();
            return {
              id: fullData.staffId || fullData.id || upperStaffId,
              staffId: fullData.staffId || fullData.id || upperStaffId,
              username: normalizedUser,
              uid: uData.uid,
              name: fullData.name,
              email: fullData.email,
              phone: fullData.phone,
              department: fullData.department,
              roleId: fullData.roleId,
              roleName: fullData.roleName,
              status: fullData.status || 'active',
              active: fullData.active !== undefined ? fullData.active : fullData.status === 'active',
              requiresPasswordReset: fullData.requiresPasswordReset,
              createdAt: fullData.createdAt,
            };
          }
        }
      }
    }
  } catch {}

  // 7. Cloud Firestore lookup by staffId
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const qSnap = await adminDb.collection('admin_users').where('staffId', '==', upperStaffId).limit(1).get();
      if (!qSnap.empty) {
        const snapDoc = qSnap.docs[0];
        const data = snapDoc.data();
        return {
          id: upperStaffId,
          staffId: upperStaffId,
          username: data.username || normalizedUser,
          uid: data.uid || snapDoc.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    } else {
      const qSnap = await getDocs(query(collection(db, 'admin_users'), where('staffId', '==', upperStaffId)));
      if (!qSnap.empty) {
        const data = qSnap.docs[0].data();
        return {
          id: upperStaffId,
          staffId: upperStaffId,
          username: data.username || normalizedUser,
          uid: data.uid || qSnap.docs[0].id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          department: data.department,
          roleId: data.roleId,
          roleName: data.roleName,
          status: data.status || 'active',
          active: data.active !== undefined ? data.active : data.status === 'active',
          requiresPasswordReset: data.requiresPasswordReset,
          createdAt: data.createdAt,
        };
      }
    }
  } catch {}

  return null;
}

export async function getRoleAsync(roleId: string): Promise<AdminRole | null> {
  // 1. Check system roles
  const sysRole = SEED_ROLES.find(r => r.id === roleId);
  if (sysRole) return sysRole;

  // 2. Authoritative Cloud Firestore lookup (/admin_roles/{roleId})
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const roleSnap = await adminDb.collection('admin_roles').doc(roleId).get();
      if (roleSnap.exists) {
        const data = roleSnap.data() as AdminRole;
        const store = readRbacStore();
        store.customRoles = store.customRoles || {};
        store.customRoles[roleId] = data;
        writeRbacStore(store);
        return data;
      }
    } else {
      const roleSnap = await getDoc(doc(db, 'admin_roles', roleId));
      if (roleSnap.exists()) {
        const data = roleSnap.data() as AdminRole;
        const store = readRbacStore();
        store.customRoles = store.customRoles || {};
        store.customRoles[roleId] = data;
        writeRbacStore(store);
        return data;
      }
    }
  } catch {}

  // 3. Fallback to local store
  const store = readRbacStore();
  const customRoles = store.customRoles || {};
  if (customRoles[roleId]) {
    return customRoles[roleId];
  }

  return null;
}

export function getRole(roleId: string): AdminRole | null {
  const store = readRbacStore();
  const customRoles = store.customRoles || {};

  if (customRoles[roleId]) {
    return customRoles[roleId];
  }

  const sysRole = SEED_ROLES.find(r => r.id === roleId);
  if (sysRole) return sysRole;

  return null;
}

export interface VerificationResult {
  authorized: boolean;
  staffUser?: AdminUser;
  role?: AdminRole;
  status: number;
  error?: string;
  code?: string;
}

export const tokenVerificationCache = new Map<string, { uid: string; email: string; emailVerified: boolean; expiresAt: number }>();

export async function verifyFirebaseIdToken(
  token: string
): Promise<{ valid: boolean; uid?: string; email?: string; emailVerified?: boolean; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Missing token' };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Malformed token structure (must be a valid 3-part JWT).' };
  }

  const now = Date.now();
  const cached = tokenVerificationCache.get(token);
  if (cached && cached.expiresAt > now) {
    return { valid: true, uid: cached.uid, email: cached.email, emailVerified: cached.emailVerified };
  }

  const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
  const apiKey = rawApiKey.replace(/^["']|["']$/g, '');
  const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
  const lookupEndpoint = authEmulatorHost
    ? `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey || 'emulator-api-key'}`
    : `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;

  try {
    const res = await fetch(lookupEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
    });

    const data = await res.json();
    if (!res.ok || !data.users || data.users.length === 0) {
      return { valid: false, error: data?.error?.message || 'Invalid or expired ID token' };
    }

    const user = data.users[0];
    const uid = user.localId;
    const email = user.email;
    const emailVerified = Boolean(user.emailVerified);

    tokenVerificationCache.set(token, {
      uid,
      email,
      emailVerified,
      expiresAt: now + 5 * 60 * 1000,
    });

    return { valid: true, uid, email, emailVerified };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Token verification network error' };
  }
}

/**
 * Server-Side RBAC Verification Engine:
 * Strictly verifies identity, account status, password-reset requirements,
 * and operation-specific permissions.
 * Cryptographically verifies Firebase ID tokens or internal service secrets.
 * NEVER trusts client-supplied headers or body fields as proof of identity.
 */
export async function verifyStaffPermission(
  request: Request,
  body: any,
  requiredPageId: string,
  requiredAction: PermissionAction
): Promise<VerificationResult> {
  const authHeader = request.headers.get('authorization') || '';
  let bearerToken = '';
  if (authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.slice(7).trim();
  }

  if (!bearerToken) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication Required: Valid cryptographic Authorization Bearer token is required.',
      code: 'UNAUTHENTICATED',
    };
  }

  // External Bearer token: Cryptographically verify with Google Identity Platform
  const verifyRes = await verifyFirebaseIdToken(bearerToken);
  if (!verifyRes.valid) {
    return {
      authorized: false,
      status: 401,
      error: `Authentication Rejected: ${verifyRes.error || 'Invalid or expired authentication token.'}`,
      code: 'INVALID_TOKEN',
    };
  }

  // Derive staff identity EXCLUSIVELY from verified token UID / email
  // Client-supplied headers/body are completely ignored for identity resolution
  let staffUser: AdminUser | null = await getStaffUser(verifyRes.uid!);
  if (!staffUser && verifyRes.email) {
    staffUser = await getStaffUserByEmail(verifyRes.email);
  }

  if (!staffUser) {
    // Authenticated account (e.g. customer) is NOT in the authorized staff registry
    return {
      authorized: false,
      status: 403,
      error: 'Access Denied: Authenticated account is not an authorized atelier staff member.',
      code: 'NOT_STAFF_MEMBER',
    };
  }

  if (!staffUser) {
    return {
      authorized: false,
      status: 403,
      error: 'Access Denied: Staff identity could not be verified in authorized atelier registry.',
      code: 'STAFF_NOT_FOUND',
    };
  }

  // Deactivated & Suspended Account Guard (Strict immediate enforcement)
  if (
    staffUser.status === 'deactivated' ||
    staffUser.status === 'suspended' ||
    staffUser.active === false ||
    (staffUser as any).status === 'inactive'
  ) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: This staff account is ${staffUser.status || 'deactivated'}. Privileged operational requests are blocked.`,
      code: staffUser.status === 'suspended' ? 'ACCOUNT_SUSPENDED' : 'ACCOUNT_DEACTIVATED',
    };
  }

  // Super Administrator Unrestricted Privilege (Root authority)
  const isSuperAdmin =
    staffUser.username === 'soumya' ||
    staffUser.id === 'KJ-ADM-001' ||
    staffUser.staffId === 'KJ-ADM-001' ||
    staffUser.uid === 'mJ6lPWSeACcLSCSKqonwcksD87I2' ||
    staffUser.roleId === 'role-super-admin';
  if (isSuperAdmin) {
    return {
      authorized: true,
      status: 200,
      staffUser,
      role: SEED_ROLES[0],
    };
  }

  // Mandatory First-Login Password Reset Guard
  if (staffUser.requiresPasswordReset === true) {
    return {
      authorized: false,
      status: 403,
      error: 'Access Denied: Mandatory first-login passcode reset is pending. You must change your temporary passcode before executing operational API requests.',
      code: 'PASSWORD_RESET_REQUIRED',
    };
  }

  // Resolve Dynamic / Custom Role Authoritatively from Firestore
  const role = (await getRoleAsync(staffUser.roleId)) || getRole(staffUser.roleId);
  if (!role) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: Assigned role "${staffUser.roleId}" is not defined in active RBAC policies.`,
      code: 'ROLE_NOT_FOUND',
    };
  }

  // Check Granular Operation Permission on Specified Module/Page
  const pageActions = role.permissions?.[requiredPageId] || [];
  const hasPermission = pageActions.includes(requiredAction);

  if (!hasPermission) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: Your assigned role "${role.name}" lacks the required "${requiredAction}" permission for "${requiredPageId}".`,
      code: 'PERMISSION_DENIED',
    };
  }

  return {
    authorized: true,
    status: 200,
    staffUser,
    role,
  };
}

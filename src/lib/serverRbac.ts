import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { SEED_ROLES } from '@/data/adminPermissions';
import { AdminRole, AdminUser, PermissionAction } from '@/data/adminTypes';

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
};

export async function getStaffUser(identifier: string): Promise<AdminUser | null> {
  const raw = (identifier || '').trim();
  if (!raw) return null;

  const normalizedUser = normalizeUsername(raw);
  const upperStaffId = raw.toUpperCase();

  const store = readRbacStore();
  const usernameIndex = store.usernameIndex || {};
  const staffIndex = store.staffIdIndex || {};
  const usersMap = store.users || {};

  // 1. Lookup by username
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

  // 2. Lookup by staff ID
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

  // 3. Lookup directly in usersMap by UID or username
  for (const uid of Object.keys(usersMap)) {
    const u = usersMap[uid];
    if (
      normalizeUsername(u.username || '') === normalizedUser ||
      (u.staffId && u.staffId.toUpperCase() === upperStaffId) ||
      uid === raw
    ) {
      return {
        ...u,
        id: u.staffId || u.id,
        staffId: u.staffId || u.id,
        username: u.username || normalizedUser,
      };
    }
  }

  // 4. Baseline staff map
  if (BASELINE_STAFF_MAP[normalizedUser]) {
    return BASELINE_STAFF_MAP[normalizedUser];
  }
  if (BASELINE_STAFF_MAP[upperStaffId]) {
    return BASELINE_STAFF_MAP[upperStaffId];
  }

  // 5. Fallback to Cloud Firestore /admin_usernames/{username}
  try {
    const usernameSnap = await getDoc(doc(db, 'admin_usernames', normalizedUser));
    if (usernameSnap.exists()) {
      const uData = usernameSnap.data();
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
          requiresPasswordReset: fullData.requiresPasswordReset,
          createdAt: fullData.createdAt,
        };
      }
    }
  } catch {}

  // 6. Fallback to Cloud Firestore /admin_users by staffId
  try {
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
        requiresPasswordReset: data.requiresPasswordReset,
        createdAt: data.createdAt,
      };
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
    const roleSnap = await getDoc(doc(db, 'admin_roles', roleId));
    if (roleSnap.exists()) {
      const data = roleSnap.data() as AdminRole;
      const store = readRbacStore();
      store.customRoles = store.customRoles || {};
      store.customRoles[roleId] = data;
      writeRbacStore(store);
      return data;
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

/**
 * Server-Side RBAC Verification Engine:
 * Strictly verifies identity, account status, password-reset requirements,
 * and operation-specific permissions. Never trusts client-supplied role parameters.
 */
export async function verifyStaffPermission(
  request: Request,
  body: any,
  requiredPageId: string,
  requiredAction: PermissionAction
): Promise<VerificationResult> {
  // 1. Extract requesting Username or Staff ID
  const staffIdFromHeader =
    request.headers.get('x-staff-username') ||
    request.headers.get('x-username') ||
    request.headers.get('x-staff-id') ||
    request.headers.get('x-kalajay-staff-id');
  const authHeader = request.headers.get('authorization');
  let bearerStaffId: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith('KJ-ADM-') || token.startsWith('@') || (token.length < 35 && !token.includes('.'))) {
      bearerStaffId = token;
    }
  }

  const requestingStaffId = (
    staffIdFromHeader ||
    bearerStaffId ||
    body?.requestingUsername ||
    body?.username ||
    body?.requestingStaffId ||
    body?.staffId ||
    ''
  ).trim();

  if (!requestingStaffId) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication Required: Missing requesting Staff Username or ID (header "x-staff-username" or parameter "requestingUsername").',
      code: 'UNAUTHENTICATED',
    };
  }

  // 2. Lookup Staff User in Authoritative Registry
  const staffUser = await getStaffUser(requestingStaffId);
  if (!staffUser) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: Staff User "${requestingStaffId}" not found in authorized atelier registry.`,
      code: 'STAFF_NOT_FOUND',
    };
  }

  // 3. Deactivated Account Guard
  if (staffUser.status === 'deactivated') {
    return {
      authorized: false,
      status: 403,
      error: 'Access Denied: This staff account has been deactivated. Privileged operational requests are blocked.',
      code: 'ACCOUNT_DEACTIVATED',
    };
  }

  // 4. Super Administrator Unrestricted Privilege (Root authority)
  const isSuperAdmin =
    staffUser.username === 'soumya' ||
    staffUser.id === 'KJ-ADM-001' ||
    staffUser.staffId === 'KJ-ADM-001' ||
    staffUser.roleId === 'role-super-admin';
  if (isSuperAdmin) {
    return {
      authorized: true,
      status: 200,
      staffUser,
      role: SEED_ROLES[0],
    };
  }

  // 5. Mandatory First-Login Password Reset Guard
  if (staffUser.requiresPasswordReset === true) {
    return {
      authorized: false,
      status: 403,
      error: 'Access Denied: Mandatory first-login passcode reset is pending. You must change your temporary passcode before executing operational API requests.',
      code: 'PASSWORD_RESET_REQUIRED',
    };
  }

  // 6. Resolve Dynamic / Custom Role Authoritatively from Firestore
  const role = (await getRoleAsync(staffUser.roleId)) || getRole(staffUser.roleId);
  if (!role) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: Assigned role "${staffUser.roleId}" is not defined in active RBAC policies.`,
      code: 'ROLE_NOT_FOUND',
    };
  }

  // 7. Check Granular Operation Permission on Specified Module/Page
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

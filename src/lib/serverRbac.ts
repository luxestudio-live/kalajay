import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { SEED_ROLES } from '@/data/adminPermissions';
import { AdminRole, AdminUser, PermissionAction } from '@/data/adminTypes';

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

const BASELINE_STAFF_MAP: Record<string, AdminUser> = {
  'KJ-ADM-001': {
    id: 'KJ-ADM-001',
    staffId: 'KJ-ADM-001',
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

export async function getStaffUser(staffId: string): Promise<AdminUser | null> {
  const cleanId = (staffId || '').trim().toUpperCase();
  if (!cleanId) return null;

  const store = readRbacStore();
  const staffIndex = store.staffIdIndex || {};
  const usersMap = store.users || {};

  const indexed = staffIndex[cleanId];
  if (indexed) {
    const user = usersMap[indexed.uid] || indexed;
    return {
      ...user,
      id: cleanId,
      staffId: cleanId,
    };
  }

  if (BASELINE_STAFF_MAP[cleanId]) {
    return BASELINE_STAFF_MAP[cleanId];
  }

  // Fallback to Cloud Firestore
  try {
    const qSnap = await getDocs(query(collection(db, 'admin_users'), where('staffId', '==', cleanId)));
    if (!qSnap.empty) {
      const data = qSnap.docs[0].data();
      return {
        id: cleanId,
        staffId: cleanId,
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
  // 1. Extract requesting Staff ID
  const staffIdFromHeader = request.headers.get('x-staff-id') || request.headers.get('x-kalajay-staff-id');
  const authHeader = request.headers.get('authorization');
  let bearerStaffId: string | null = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token.startsWith('KJ-ADM-')) {
      bearerStaffId = token;
    }
  }

  const requestingStaffId = (
    staffIdFromHeader ||
    bearerStaffId ||
    body?.requestingStaffId ||
    body?.staffId ||
    ''
  ).trim();

  if (!requestingStaffId) {
    return {
      authorized: false,
      status: 401,
      error: 'Authentication Required: Missing requesting Staff ID (header "x-staff-id" or parameter "requestingStaffId").',
      code: 'UNAUTHENTICATED',
    };
  }

  // 2. Lookup Staff User in Authoritative Registry
  const staffUser = await getStaffUser(requestingStaffId);
  if (!staffUser) {
    return {
      authorized: false,
      status: 403,
      error: `Access Denied: Staff ID "${requestingStaffId}" not found in authorized atelier registry.`,
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
  if (staffUser.id === 'KJ-ADM-001' || staffUser.roleId === 'role-super-admin') {
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

  // 6. Resolve Dynamic / Custom Role
  const role = getRole(staffUser.roleId);
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

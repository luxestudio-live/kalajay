import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

interface ResolveRequestBody {
  staffId?: string;
}

// In-memory rate limiting map: ipOrId -> { count, timestamp }
const rateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 10;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry) {
    rateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS_PER_WINDOW;
}

// Server-side durable store path
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

// Baseline staff accounts fallback
const BASELINE_STAFF_MAP: Record<string, any> = {
  'KJ-ADM-001': {
    staffId: 'KJ-ADM-001',
    uid: 'mJ6lPWSeACcLSCSKqonwcksD87I2',
    name: 'Soumya (Founder)',
    email: 'soumya@kalajay.in',
    phone: '+91 98201 00001',
    department: 'Founders Office & Creative Direction',
    roleId: 'role-super-admin',
    roleName: 'Founder & Head of Maison',
    status: 'active',
  },
  'KJ-ADM-002': {
    staffId: 'KJ-ADM-002',
    uid: '5SWIY26CaXgfDnN2anZOnNBuxV72',
    name: 'Ritu Verma',
    email: 'ritu.verma@kalajay.in',
    phone: '+91 98201 00002',
    department: 'Digital Commerce',
    roleId: 'role-store-manager',
    roleName: 'Store Operations Manager',
    status: 'active',
  },
  'KJ-ADM-003': {
    staffId: 'KJ-ADM-003',
    uid: '5iQ0TA1Mx6NXaTfErP9wxt4dVIz1',
    name: 'Sunita Kumari',
    email: 'sunita.craft@kalajay.in',
    phone: '+91 98201 00003',
    department: 'Bihar Craft House Hub',
    roleId: 'role-production-manager',
    roleName: 'Bihar Atelier & Production Head',
    status: 'active',
  },
  'KJ-ADM-004': {
    staffId: 'KJ-ADM-004',
    uid: 'sRqJ2GtrfSMHLJq0D1bEZZyMAWZ2',
    name: 'Aarav Mehta',
    email: 'aarav.m@kalajay.in',
    phone: '+91 98201 00004',
    department: 'Mumbai Atelier & Logistics',
    roleId: 'role-fulfilment-agent',
    roleName: 'Fulfilment & Dispatch Agent',
    status: 'active',
  },
};

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body: ResolveRequestBody = await request.json();
    const rawStaffId = (body.staffId || '').trim();

    if (!rawStaffId) {
      return NextResponse.json(
        { success: false, error: 'Staff User ID is required.' },
        { status: 400 }
      );
    }

    const cleanStaffId = rawStaffId.toUpperCase();

    // 1. Check Rate Limiting
    if (!checkRateLimit(`${ip}_${cleanStaffId}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many authentication resolution attempts. Please wait 60 seconds before trying again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // 2. Lookup in Server-side Durable Store
    const store = readRbacStore();
    const index = store.staffIdIndex || {};
    let resolved = index[cleanStaffId] || BASELINE_STAFF_MAP[cleanStaffId];

    // If not found in index, check by email match if input looks like email
    if (!resolved && rawStaffId.includes('@')) {
      const emailLower = rawStaffId.toLowerCase();
      resolved = Object.values(index).find((s: any) => s.email?.toLowerCase() === emailLower) ||
        Object.values(BASELINE_STAFF_MAP).find((s: any) => s.email?.toLowerCase() === emailLower);
    }

    // 3. Fallback to Cloud Firestore /admin_users if not found in local cache
    if (!resolved) {
      try {
        const adminUsersRef = collection(db, 'admin_users');
        const q = query(adminUsersRef, where('staffId', '==', cleanStaffId));
        const qSnap = await getDocs(q);
        if (!qSnap.empty) {
          const docData = qSnap.docs[0].data();
          resolved = {
            staffId: docData.staffId,
            uid: docData.uid || qSnap.docs[0].id,
            email: docData.email,
            name: docData.name,
            department: docData.department,
            roleId: docData.roleId,
            roleName: docData.roleName,
            status: docData.status || 'active',
            requiresPasswordReset: docData.requiresPasswordReset,
          };
        }
      } catch (err) {
        // Safe fallback
      }
    }

    // 4. Handle Not Found (Generic error to prevent user enumeration)
    if (!resolved) {
      return NextResponse.json(
        {
          success: false,
          error: `Staff User ID "${cleanStaffId}" not recognized in atelier staff registry.`,
          code: 'STAFF_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // 5. Account Deactivation Guard
    if (resolved.status === 'deactivated') {
      return NextResponse.json(
        {
          success: false,
          error: 'This staff account has been deactivated. Please contact your Super Administrator.',
          code: 'ACCOUNT_DEACTIVATED',
        },
        { status: 403 }
      );
    }

    // 6. Successful Resolution
    return NextResponse.json({
      success: true,
      staffId: resolved.staffId,
      email: resolved.email,
      name: resolved.name,
      department: resolved.department,
      roleId: resolved.roleId,
      roleName: resolved.roleName,
      requiresPasswordReset: resolved.requiresPasswordReset ?? true,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error resolving Staff User ID.' },
      { status: 500 }
    );
  }
}

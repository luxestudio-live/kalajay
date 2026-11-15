import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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

const BASELINE_STAFF = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export async function GET() {
  try {
    const store = readRbacStore();
    const storedUsers = store.users ? Object.values(store.users) : [];

    // Merge baseline and stored users (keyed by staffId)
    const userMap = new Map<string, any>();
    BASELINE_STAFF.forEach(u => userMap.set(u.staffId, u));
    storedUsers.forEach((u: any) => userMap.set(u.staffId || u.id, u));

    const allUsers = Array.from(userMap.values()).sort((a, b) =>
      a.staffId.localeCompare(b.staffId)
    );

    return NextResponse.json({
      success: true,
      users: allUsers,
      count: allUsers.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to list staff users.' },
      { status: 500 }
    );
  }
}

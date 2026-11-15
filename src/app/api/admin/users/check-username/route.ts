import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  validateUsername,
  normalizeUsername,
  readRbacStore,
  BASELINE_STAFF_MAP,
  verifyStaffPermission,
} from '@/lib/serverRbac';

// In-memory rate limiting map: ipOrUsername -> { count, firstAttempt }
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

export async function GET(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username') || '';
    const requestingUsername =
      searchParams.get('requestingUsername') ||
      searchParams.get('requestingStaffId') ||
      request.headers.get('x-staff-username') ||
      request.headers.get('x-staff-id');

    // 1. Rate Limiting Defense (30 requests per minute)
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

    // 2. Strict RBAC Authorization Check:
    // Only authorized staff-management users (e.g. Super Admin or role with 'settings.users' -> 'manage_users') can check availability.
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

    // 3. Username Format Validation
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

    // 4. Check Baseline Map
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

    // 5. Check Server Durable Store
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

    // 6. Check Cloud Firestore /admin_usernames/{username}
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

    // Username is valid and available!
    return NextResponse.json({
      success: true,
      valid: true,
      available: true,
      username: normalized,
      message: `Username "@${normalized}" is available.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error checking username.' },
      { status: 500 }
    );
  }
}

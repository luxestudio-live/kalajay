import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  validateUsername,
  normalizeUsername,
  readRbacStore,
  BASELINE_STAFF_MAP,
} from '@/lib/serverRbac';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawUsername = searchParams.get('username') || '';

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

    // 1. Check Baseline Map
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

    // 2. Check Server Durable Store
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

    // 3. Check Cloud Firestore /admin_usernames/{username}
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

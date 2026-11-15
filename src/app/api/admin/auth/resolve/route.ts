import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { normalizeUsername, getStaffUser } from '@/lib/serverRbac';

interface ResolveRequestBody {
  username?: string;
  staffId?: string;
  password?: string;
}

// In-memory rate limiting map: ipOrUsername -> { count, firstAttempt }
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

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body: ResolveRequestBody = await request.json();
    const rawInput = (body.username || body.staffId || '').trim();
    const password = body.password;

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: 'Username is required.' },
        { status: 400 }
      );
    }

    const normalizedUsername = normalizeUsername(rawInput);

    // 1. Rate Limiting Defense (IP + Normalized Username)
    if (!checkRateLimit(`${ip}_${normalizedUsername}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // 2. Authoritative Server-side Lookup
    const resolved = await getStaffUser(normalizedUsername);

    // Uniform Authentication Failure Response:
    // Prevents account existence and deactivation status enumeration.
    // Invalid username, incorrect passcode, missing credentials, and deactivated accounts
    // return identical HTTP 401 Unauthorized status and identical error payload.
    const genericAuthFailure = () =>
      NextResponse.json(
        {
          success: false,
          error: 'Authentication rejected: Invalid username or security credentials.',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );

    // 3. User Enumeration Defense: Invalid username
    if (!resolved) {
      return genericAuthFailure();
    }

    // 4. User Enumeration Defense: Deactivated account (do not disclose account state)
    if (resolved.status === 'deactivated') {
      return genericAuthFailure();
    }

    // 5. Password is required for authentication
    if (!password) {
      return genericAuthFailure();
    }

    // 6. Identity Platform Server-Side Verification
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzdJB2o_mS3JgSJ-MaBNbvpBi35AdcSCc';
    try {
      const authRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: resolved.email,
            password,
            returnSecureToken: true,
          }),
        }
      );

      const authData = await authRes.json();
      if (!authRes.ok || !authData.idToken) {
        return genericAuthFailure();
      }

      // Successfully verified password!
      return NextResponse.json({
        success: true,
        username: resolved.username || normalizedUsername,
        staffId: resolved.staffId || resolved.id,
        email: resolved.email,
        name: resolved.name,
        department: resolved.department,
        roleId: resolved.roleId,
        roleName: resolved.roleName,
        requiresPasswordReset: resolved.requiresPasswordReset ?? true,
        idToken: authData.idToken,
        refreshToken: authData.refreshToken,
        localId: authData.localId,
      });
    } catch (apiErr: any) {
      console.warn('Identity Platform verification warning:', apiErr?.message);
      return genericAuthFailure();
    }
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error resolving username.' },
      { status: 500 }
    );
  }
}

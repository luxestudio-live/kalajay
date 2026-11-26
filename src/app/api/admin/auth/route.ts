import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { normalizeUsername, getStaffUser } from '@/lib/serverRbac';

export const dynamic = 'force-dynamic';

// In-memory rate limiting maps
const resolveRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const forgotRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_RESOLVE_ATTEMPTS = 10;
const MAX_FORGOT_ATTEMPTS = 5;

function checkRateLimit(map: Map<string, { count: number; firstAttempt: number }>, key: string, maxAttempts: number): boolean {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry) {
    map.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    map.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= maxAttempts;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;

    // ------------------------------------------
    // SUB-ACTION: Forgot Password
    // ------------------------------------------
    if (action === 'forgot-password') {
      const rawInput = (body.username || body.staffId || '').trim();

      if (!rawInput) {
        return NextResponse.json(
          { success: false, error: 'Staff Username is required.' },
          { status: 400 }
        );
      }

      const normalizedUsername = normalizeUsername(rawInput);

      if (!checkRateLimit(forgotRateLimitMap, `${ip}_${normalizedUsername}`, MAX_FORGOT_ATTEMPTS)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Too many recovery requests. Please wait 60 seconds before trying again.',
            code: 'RATE_LIMITED',
          },
          { status: 429 }
        );
      }

      const resolved = await getStaffUser(normalizedUsername);

      if (resolved && resolved.status !== 'deactivated' && resolved.email) {
        try {
          const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
          const apiKey = rawApiKey.replace(/^["']|["']$/g, '');
          if (apiKey) {
            const authEmulatorHost = process.env.NODE_ENV !== 'production' ? process.env.FIREBASE_AUTH_EMULATOR_HOST : undefined;
            const resetUrl = authEmulatorHost
              ? `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`
              : `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

            await fetch(
              resetUrl,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  requestType: 'PASSWORD_RESET',
                  email: resolved.email,
                }),
              }
            );
          }
        } catch (err: any) {
          console.warn('Password recovery email dispatch warning:', err?.message);
        }
      }

      return NextResponse.json({
        success: true,
        message: 'If the provided username corresponds to an active atelier staff account, a password recovery link has been dispatched to the registered email address.',
      });
    }

    // ------------------------------------------
    // DEFAULT SUB-ACTION: Resolve / Sign-In Staff
    // ------------------------------------------
    const rawInput = (body.username || body.staffId || '').trim();
    const password = body.password;

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: 'Username is required.' },
        { status: 400 }
      );
    }

    const normalizedUsername = normalizeUsername(rawInput);

    if (!checkRateLimit(resolveRateLimitMap, `${ip}_${normalizedUsername}`, MAX_RESOLVE_ATTEMPTS)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many authentication attempts. Please wait 60 seconds before trying again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    const resolved = await getStaffUser(normalizedUsername);

    const genericAuthFailure = () =>
      NextResponse.json(
        {
          success: false,
          error: 'Authentication rejected: Invalid username or security credentials.',
          code: 'INVALID_CREDENTIALS',
        },
        { status: 401 }
      );

    if (!resolved || resolved.status === 'deactivated' || !password) {
      return genericAuthFailure();
    }

    const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
    const apiKey = rawApiKey.replace(/^["']|["']$/g, '');
    if (!apiKey) {
      console.error('Server configuration error: NEXT_PUBLIC_FIREBASE_API_KEY is not defined.');
      return NextResponse.json(
        { success: false, error: 'Authentication service temporarily misconfigured.' },
        { status: 500 }
      );
    }

    try {
      const authEmulatorHost = process.env.NODE_ENV !== 'production' ? process.env.FIREBASE_AUTH_EMULATOR_HOST : undefined;
      const signInUrl = authEmulatorHost
        ? `http://${authEmulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`
        : `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

      const authRes = await fetch(
        signInUrl,
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
        console.warn('AUTH FAILURE DEBUG:', { signInUrl, email: resolved.email, authStatus: authRes.status, authData });
        return genericAuthFailure();
      }

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
      { success: false, error: err?.message || 'Server error processing authentication request.' },
      { status: 500 }
    );
  }
}

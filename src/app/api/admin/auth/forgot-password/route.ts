import { NextResponse } from 'next/server';
import { normalizeUsername, getStaffUser } from '@/lib/serverRbac';

// In-memory rate limiting map for forgot-password: ipOrUsername -> { count, firstAttempt }
const forgotRateLimitMap = new Map<string, { count: number; firstAttempt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS_PER_WINDOW = 5;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = forgotRateLimitMap.get(key);

  if (!entry) {
    forgotRateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  if (now - entry.firstAttempt > RATE_LIMIT_WINDOW_MS) {
    forgotRateLimitMap.set(key, { count: 1, firstAttempt: now });
    return true;
  }

  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS_PER_WINDOW;
}

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const body = await request.json().catch(() => ({}));
    const rawInput = (body.username || body.staffId || '').trim();

    if (!rawInput) {
      return NextResponse.json(
        { success: false, error: 'Staff Username is required.' },
        { status: 400 }
      );
    }

    const normalizedUsername = normalizeUsername(rawInput);

    // Rate Limiting
    if (!checkRateLimit(`${ip}_${normalizedUsername}`)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Too many recovery requests. Please wait 60 seconds before trying again.',
          code: 'RATE_LIMITED',
        },
        { status: 429 }
      );
    }

    // Resolve staff user
    const resolved = await getStaffUser(normalizedUsername);

    // If active staff user found, trigger Firebase Auth password reset email via Identity Platform
    if (resolved && resolved.status !== 'deactivated' && resolved.email) {
      try {
        const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzdJB2o_mS3JgSJ-MaBNbvpBi35AdcSCc';
        await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              requestType: 'PASSWORD_RESET',
              email: resolved.email,
            }),
          }
        );
      } catch (err: any) {
        console.warn('Password recovery email dispatch warning:', err?.message);
      }
    }

    // Enumeration Defense: ALWAYS return identical generic confirmation response
    return NextResponse.json({
      success: true,
      message: 'If the provided username corresponds to an active atelier staff account, a password recovery link has been dispatched to the registered email address.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Server error processing password recovery.' },
      { status: 500 }
    );
  }
}

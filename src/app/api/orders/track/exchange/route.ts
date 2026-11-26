import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { createTrackingSessionToken } from '@/lib/trackingSession';

export const dynamic = 'force-dynamic';

// Rate limiting in-memory store for exchange attempts (per IP)
const exchangeRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function hashIp(rawIp: string): string {
  const salt = process.env.RATELIMIT_SALT || 'kalajay_dpdp_salt_2026';
  return crypto.createHash('sha256').update(rawIp + salt).digest('hex').substring(0, 32);
}

function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = crypto.createHash('sha256').update(a).digest();
  const bufB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

async function checkRateLimit(ip: string, adminDb: any): Promise<boolean> {
  const now = Date.now();
  const ipKey = hashIp(ip);

  // L1 In-memory fast path
  const record = exchangeRateLimitStore.get(ipKey);
  if (record && record.resetAt > now && record.count >= 10) {
    return false;
  }

  // L2 Distributed Firestore transaction check (durable across serverless instances)
  if (adminDb) {
    try {
      const ref = adminDb.collection('tracking_ratelimits').doc(`exch_${ipKey}`);
      const allowed = await adminDb.runTransaction(async (t: any) => {
        const snap = await t.get(ref);
        if (!snap.exists) {
          t.set(ref, { count: 1, resetAt: now + 60 * 1000 });
          return true;
        }
        const data = snap.data() || {};
        if (data.resetAt < now) {
          t.set(ref, { count: 1, resetAt: now + 60 * 1000 });
          return true;
        }
        if (data.count >= 10) {
          return false;
        }
        t.update(ref, { count: (data.count || 0) + 1 });
        return true;
      });

      if (!allowed) {
        exchangeRateLimitStore.set(ipKey, { count: 10, resetAt: now + 60 * 1000 });
        return false;
      }
    } catch {}
  }

  // Fallback to L1 in-memory tracking
  if (!record || record.resetAt < now) {
    exchangeRateLimitStore.set(ipKey, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  record.count += 1;
  return record.count <= 10;
}

/**
 * POST /api/orders/track/exchange
 * Safely exchanges a one-time URL fragment tracking token for an HttpOnly tracking session cookie (Phase 4.2).
 */
export async function POST(request: Request) {
  try {
    const adminDb = getAdminFirestore();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const isAllowed = await checkRateLimit(ip, adminDb);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'Too many tracking exchange attempts. Please try again in one minute.' },
        { status: 429, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    const body = await request.json().catch(() => ({}));
    const orderId = (body.orderId || '').trim();
    const token = (body.token || '').trim();

    if (!orderId || !token) {
      return NextResponse.json(
        { success: false, error: 'Both orderId and tracking token are required for exchange.' },
        { status: 400, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    const orderDoc = await adminDb.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    const orderData = orderDoc.data() || {};
    const suppliedHash = crypto.createHash('sha256').update(token).digest('hex');

    let isValidToken = false;

    // Check SHA-256 hash stored in Firestore (Phase 4.1) using timingSafeEqual
    if (orderData.guestAccessTokenHash && timingSafeEqualString(orderData.guestAccessTokenHash, suppliedHash)) {
      isValidToken = true;
    }

    // Backwards compatibility with legacy plaintext tokens using timingSafeEqual
    if (!isValidToken && orderData.guestAccessToken && timingSafeEqualString(orderData.guestAccessToken, token)) {
      isValidToken = true;
    }

    // Backwards compatibility with legacy HMAC tokens using timingSafeEqual
    if (!isValidToken && orderData.customerEmail) {
      const trackingSecret = process.env.ORDER_TRACKING_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV !== 'production' ? 'kalajay_guest_order_tracking_salt_2026' : '');
      if (trackingSecret) {
        const legacyHmac = crypto
          .createHmac('sha256', trackingSecret)
          .update(`${orderId}:${orderData.customerEmail.toLowerCase().trim()}`)
          .digest('hex')
          .substring(0, 24);
        if (timingSafeEqualString(token, legacyHmac)) {
          isValidToken = true;
        }
      }
    }

    if (!isValidToken) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired tracking token.' },
        { status: 403, headers: { 'Cache-Control': 'no-store, private' } }
      );
    }

    // Generate signed tracking session token
    const sessionToken = createTrackingSessionToken(orderId);

    const response = NextResponse.json(
      {
        success: true,
        orderId,
        message: 'Tracking session established securely.',
        trackingSessionToken: sessionToken,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, private',
        },
      }
    );

    // Set scoped HttpOnly cookie for tracking API paths (Phase 4.2)
    response.cookies.set('kj_track_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/orders',
      maxAge: 7200, // 2 hours
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to exchange tracking token.' },
      { status: 500, headers: { 'Cache-Control': 'no-store, private' } }
    );
  }
}

import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { createTrackingSessionToken } from '@/lib/trackingSession';

export const dynamic = 'force-dynamic';

// Rate limiting in-memory store for exchange attempts (per IP)
const exchangeRateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // Bound memory store against memory growth
  if (exchangeRateLimitStore.size > 1000) {
    exchangeRateLimitStore.forEach((val, key) => {
      if (val.resetAt < now) exchangeRateLimitStore.delete(key);
    });
  }
  const record = exchangeRateLimitStore.get(ip);
  if (!record || record.resetAt < now) {
    exchangeRateLimitStore.set(ip, { count: 1, resetAt: now + 60 * 1000 });
    return true;
  }
  if (record.count >= 10) {
    return false;
  }
  record.count += 1;
  return true;
}

/**
 * POST /api/orders/track/exchange
 * Safely exchanges a one-time URL fragment tracking token for an HttpOnly tracking session cookie (Phase 4.2).
 */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    if (!checkRateLimit(ip)) {
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

    const adminDb = getAdminFirestore();
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

    // Check SHA-256 hash stored in Firestore (Phase 4.1)
    if (orderData.guestAccessTokenHash && orderData.guestAccessTokenHash === suppliedHash) {
      isValidToken = true;
    }

    // Backwards compatibility with legacy plaintext tokens
    if (!isValidToken && orderData.guestAccessToken && orderData.guestAccessToken === token) {
      isValidToken = true;
    }

    // Backwards compatibility with legacy HMAC tokens
    if (!isValidToken && orderData.customerEmail) {
      const trackingSecret = process.env.ORDER_TRACKING_SECRET || process.env.NEXTAUTH_SECRET || 'kalajay_guest_order_tracking_salt_2026';
      const legacyHmac = crypto
        .createHmac('sha256', trackingSecret)
        .update(`${orderId}:${orderData.customerEmail.toLowerCase().trim()}`)
        .digest('hex')
        .substring(0, 24);
      if (token === legacyHmac) {
        isValidToken = true;
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

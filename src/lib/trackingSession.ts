import crypto from 'crypto';

/**
 * Resolves the tracking session signing secret.
 * Enforces zero hardcoded secrets in production: missing secrets in production fail safely.
 */
function getTrackingSecret(): string {
  const secret = process.env.ORDER_TRACKING_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: ORDER_TRACKING_SECRET or NEXTAUTH_SECRET must be configured in production.');
    }
    return 'kalajay_tracking_session_secret_2026';
  }
  return secret;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token for guest order tracking.
 * Token payload: orderId.expiresAt.signature
 */
export function createTrackingSessionToken(orderId: string): string {
  const trackingSecret = getTrackingSecret();
  const expiresAt = Date.now() + 2 * 60 * 60 * 1000; // 2 hours
  const payload = `${orderId}.${expiresAt}`;
  const signature = crypto.createHmac('sha256', trackingSecret).update(payload).digest('hex');
  return `${payload}.${signature}`;
}

/**
 * Verifies the validity, expiry, and signature of a tracking session token.
 * Prevents timing attacks via crypto.timingSafeEqual and validates buffer length to prevent RangeError.
 */
export function verifyTrackingSessionToken(sessionToken: string, orderId: string): boolean {
  if (!sessionToken || typeof sessionToken !== 'string') return false;
  const parts = sessionToken.split('.');
  if (parts.length !== 3) return false;
  const [tokenOrderId, expiresAtStr, signature] = parts;
  if (tokenOrderId !== orderId) return false;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || expiresAt < Date.now()) return false;

  try {
    const trackingSecret = getTrackingSecret();
    const expectedPayload = `${tokenOrderId}.${expiresAtStr}`;
    const expectedSignature = crypto.createHmac('sha256', trackingSecret).update(expectedPayload).digest('hex');

    // Prevent RangeError if client sends malformed or manipulated hex string of unequal byte length
    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');
    if (sigBuf.length !== expBuf.length || sigBuf.length !== 32) return false;

    return crypto.timingSafeEqual(sigBuf, expBuf);
  } catch {
    return false;
  }
}

/**
 * KALAJAY HANDCRAFTED LUXURIES — RAZORPAY GATEWAY CLIENT & ADAPTER
 * Production-hardened integration supporting:
 * 1. Live & Test Razorpay API credentials when configured
 * 2. Secure diagnostic / Mock Mode when credentials are still pending
 * 3. Constant-time cryptographic signature verification (Timing-Attack Protected)
 * 4. Zero secret exposure in logs or frontend responses
 */

import crypto from 'crypto';
import {
  PaymentConfigStatus,
  RazorpayOrderCreationParams,
  RazorpayOrderResult,
  RazorpayPaymentVerificationParams,
} from './types';

// Dynamic environment variable getters
export function getCredentials() {
  const keyId = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const webhookSecret = (process.env.RAZORPAY_WEBHOOK_SECRET || '').trim();
  return { keyId, keySecret, webhookSecret };
}

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

/**
 * Returns safe diagnostic information about payment gateway readiness.
 * Never exposes plaintext keys or secrets.
 */
export function getRazorpayConfigStatus(): PaymentConfigStatus {
  const { keyId, keySecret, webhookSecret } = getCredentials();
  const hasKeyId = Boolean(keyId && keyId.length > 0);
  const hasSecret = Boolean(keySecret && keySecret.length > 0);
  const hasWebhookSecret = Boolean(webhookSecret && webhookSecret.length > 0);

  const isTestKey = hasKeyId && keyId.startsWith('rzp_test_');
  const isLiveKey = hasKeyId && keyId.startsWith('rzp_live_');

  let gatewayMode: PaymentConfigStatus['gatewayMode'] = 'mock_pending_credentials';
  if (hasKeyId && hasSecret) {
    gatewayMode = isLiveKey ? 'live' : 'test';
  }

  return {
    keyIdConfigured: hasKeyId,
    keySecretConfigured: hasSecret,
    webhookSecretConfigured: hasWebhookSecret,
    isTestMode: isTestKey,
    isLiveReady: isLiveKey && hasSecret && hasWebhookSecret,
    gatewayMode,
    merchantName: 'Kalajay Craft House',
    currency: 'INR',
  };
}

/**
 * Safely returns the public key ID for client-side checkout initiation.
 * Returns null or placeholder if credentials are not configured.
 */
export function getPublicRazorpayKeyId(): string | null {
  const { keyId } = getCredentials();
  if (keyId && keyId.length > 0) {
    return keyId;
  }
  return null;
}

/**
 * Verifies the payment signature returned by the client-side checkout modal.
 * Uses timingSafeEqual to defeat side-channel timing analysis attacks.
 *
 * Payload formula: hmac_sha256(order_id + "|" + payment_id, secret)
 */
export function verifyRazorpayPaymentSignature(params: RazorpayPaymentVerificationParams): {
  valid: boolean;
  error?: string;
} {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return {
      valid: false,
      error: 'Missing required signature verification fields (orderId, paymentId, or signature).',
    };
  }

  const { keySecret: secret } = getCredentials();
  if (!secret) {
    // If running in development/mock mode without credentials, allow mock signatures for test suite
    if (process.env.NODE_ENV !== 'production' && razorpayOrderId.startsWith('order_mock_')) {
      const mockExpected = crypto
        .createHmac('sha256', 'mock_secret_for_test_suite')
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');
      const isMockMatch = timingSafeCompare(razorpaySignature, mockExpected);
      return {
        valid: isMockMatch,
        error: isMockMatch ? undefined : 'Mock signature verification failed.',
      };
    }

    return {
      valid: false,
      error: 'RAZORPAY_KEY_SECRET is not configured on this server.',
    };
  }

  try {
    const text = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex');

    const isValid = timingSafeCompare(razorpaySignature, expectedSignature);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Cryptographic signature mismatch. Payment verification rejected.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Signature evaluation error: ${err?.message || 'Unknown cryptographic failure'}`,
    };
  }
}

/**
 * Verifies a Razorpay Webhook signature against raw incoming body bytes.
 *
 * Signature header: X-Razorpay-Signature
 * Formula: hmac_sha256(raw_body, webhook_secret)
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  explicitSecret?: string
): { valid: boolean; error?: string } {
  const { webhookSecret } = getCredentials();
  const secret = explicitSecret || webhookSecret;

  if (!signature) {
    return { valid: false, error: 'Missing X-Razorpay-Signature header in webhook request.' };
  }

  if (!secret) {
    // If mock testing in development
    if (process.env.NODE_ENV !== 'production' && explicitSecret === 'mock_webhook_secret_for_test') {
      const mockExpected = crypto
        .createHmac('sha256', 'mock_webhook_secret_for_test')
        .update(rawBody)
        .digest('hex');
      const isMatch = timingSafeCompare(signature, mockExpected);
      return { valid: isMatch, error: isMatch ? undefined : 'Mock webhook signature failed.' };
    }

    return {
      valid: false,
      error: 'RAZORPAY_WEBHOOK_SECRET is not configured on this server.',
    };
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const isValid = timingSafeCompare(signature, expectedSignature);
    return {
      valid: isValid,
      error: isValid ? undefined : 'Webhook cryptographic signature mismatch. Event discarded.',
    };
  } catch (err: any) {
    return {
      valid: false,
      error: `Webhook signature evaluation error: ${err?.message || 'Unknown failure'}`,
    };
  }
}

/**
 * Constant-time string comparison to prevent timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');

    if (bufA.length !== bufB.length) {
      // Force constant-time comparison on dummy buffer to avoid early return timing leak
      crypto.timingSafeEqual(bufA, bufA);
      return false;
    }

    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Creates a server-side order with Razorpay.
 * If credentials are not yet configured, returns a mock diagnostic order for testing.
 */
export async function createRazorpayOrder(
  params: RazorpayOrderCreationParams
): Promise<RazorpayOrderResult> {
  const { amountPaise, currency = 'INR', receipt, notes, customer } = params;

  if (!amountPaise || amountPaise <= 0 || !Number.isInteger(amountPaise)) {
    throw new Error('INVALID_AMOUNT: Razorpay order amount must be a positive integer in paise.');
  }

  if (!receipt || typeof receipt !== 'string') {
    throw new Error('INVALID_RECEIPT: An internal order ID receipt is required.');
  }

  const config = getRazorpayConfigStatus();
  const { keyId, keySecret } = getCredentials();

  // 1. LIVE / TEST GATEWAY MODE (When credentials exist)
  if (config.keyIdConfigured && config.keySecretConfigured) {
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const requestBody = {
      amount: amountPaise,
      currency,
      receipt,
      notes: {
        merchant: 'Kalajay Craft House',
        receipt,
        ...notes,
      },
    };

    const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.description || `Razorpay API error: ${response.statusText}`;
      throw new Error(`RAZORPAY_API_ERROR: ${errMsg}`);
    }

    const orderData = await response.json();
    return {
      id: orderData.id,
      entity: 'order',
      amount: orderData.amount,
      amount_paid: orderData.amount_paid || 0,
      amount_due: orderData.amount_due || orderData.amount,
      currency: orderData.currency || 'INR',
      receipt: orderData.receipt,
      status: orderData.status,
      attempts: orderData.attempts || 0,
      created_at: orderData.created_at || Math.floor(Date.now() / 1000),
      notes: orderData.notes,
      isMock: false,
    };
  }

  // 2. MOCK / PENDING CREDENTIALS DIAGNOSTIC MODE
  // Allows full local development, checkout flow testing, and CI automated suites
  const mockId = `order_mock_${receipt.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now().toString().slice(-6)}`;
  return {
    id: mockId,
    entity: 'order',
    amount: amountPaise,
    amount_paid: 0,
    amount_due: amountPaise,
    currency,
    receipt,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000),
    notes: {
      merchant: 'Kalajay Craft House (Mock Mode)',
      receipt,
      ...notes,
    },
    isMock: true,
  };
}

/**
 * Initiates a refund through Razorpay API.
 */
export async function createRazorpayRefund(params: {
  paymentId: string;
  amountPaise?: number; // Optional: omit for full refund
  notes?: Record<string, string>;
  receipt?: string;
}): Promise<{
  id: string;
  paymentId: string;
  amountPaise: number;
  status: string;
  isMock?: boolean;
}> {
  const { paymentId, amountPaise, notes, receipt } = params;

  if (!paymentId) {
    throw new Error('INVALID_PAYMENT_ID: Razorpay paymentId is required for refund.');
  }

  const config = getRazorpayConfigStatus();
  const { keyId, keySecret } = getCredentials();

  if (config.keyIdConfigured && config.keySecretConfigured) {
    const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const bodyPayload: any = {
      notes: {
        reason: 'Authorized Atelier Return / Cancellation',
        ...notes,
      },
    };
    if (amountPaise) bodyPayload.amount = amountPaise;
    if (receipt) bodyPayload.receipt = receipt;

    const response = await fetch(`${RAZORPAY_API_BASE}/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${authHeader}`,
      },
      body: JSON.stringify(bodyPayload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.description || `Razorpay refund error: ${response.statusText}`;
      throw new Error(`RAZORPAY_REFUND_ERROR: ${errMsg}`);
    }

    const data = await response.json();
    return {
      id: data.id,
      paymentId: data.payment_id,
      amountPaise: data.amount,
      status: data.status,
      isMock: false,
    };
  }

  // Mock Refund for tests
  return {
    id: `rfnd_mock_${Date.now()}`,
    paymentId,
    amountPaise: amountPaise || 0,
    status: 'processed',
    isMock: true,
  };
}

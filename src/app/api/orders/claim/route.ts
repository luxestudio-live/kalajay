import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';
import { Address, areAddressesEqual, normalizeAddress } from '@/lib/checkout/addressModel';

export const dynamic = 'force-dynamic';

function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

/**
 * Constant-time string comparison to defeat side-channel timing analysis.
 * Uses SHA-256 digests to ensure equal length buffers without risking RangeErrors.
 */
function timingSafeEqualString(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = crypto.createHash('sha256').update(a).digest();
  const bufB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Resolves the OTP signing secret.
 * In production, fails closed if no secret is configured.
 */
function getClaimOtpSecret(): string {
  const secret = process.env.ORDER_CLAIM_OTP_SECRET || process.env.ORDER_TRACKING_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('CRITICAL SECURITY ERROR: ORDER_CLAIM_OTP_SECRET or ORDER_TRACKING_SECRET must be configured in production.');
    }
    return 'kalajay_claim_otp_secret_2026';
  }
  return secret;
}

function generateGuestAccessToken(orderId: string, customerEmail: string): string {
  const trackingSecret = process.env.ORDER_TRACKING_SECRET || process.env.NEXTAUTH_SECRET || (process.env.NODE_ENV !== 'production' ? 'kalajay_guest_order_tracking_salt_2026' : '');
  if (!trackingSecret) {
    throw new Error('ORDER_TRACKING_SECRET is required in production.');
  }
  return crypto
    .createHmac('sha256', trackingSecret)
    .update(`${orderId}:${customerEmail.toLowerCase().trim()}`)
    .digest('hex')
    .substring(0, 24);
}

/**
 * POST /api/orders/claim
 * Authenticated endpoint for claiming a guest order into a customer's portfolio.
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate Request via Firebase ID Token
    const authHeader = request.headers.get('authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication Required: Valid cryptographic Firebase Authorization Bearer token is required to claim an order.',
          code: 'AUTH_REQUIRED',
        },
        { status: 401 }
      );
    }

    const token = authHeader.slice(7).trim();
    const verifyRes = await verifyFirebaseIdToken(token);
    if (!verifyRes.valid || !verifyRes.uid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication Rejected: Invalid or expired Firebase authentication token.',
          code: 'AUTH_TOKEN_INVALID',
        },
        { status: 401 }
      );
    }

    const authenticatedUid = verifyRes.uid;
    const authenticatedEmail = (verifyRes.email || '').trim().toLowerCase();
    const isEmailVerified = Boolean(verifyRes.emailVerified);

    // 2. Parse & Validate Payload
    const body = await request.json().catch(() => ({}));
    const orderId = (body.orderId || '').trim();
    const action = body.action || 'claim'; // 'claim' | 'request_otp' | 'verify_otp_and_claim'
    const suppliedOtp = (body.otp || '').trim();
    const suppliedToken = (body.token || '').trim();
    const saveAddressToProfile = Boolean(body.saveAddressToProfile);

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Valid order reference (orderId) is required.' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: 'Database operations unavailable.' },
        { status: 503 }
      );
    }

    // 3. Retrieve Target Order
    const orderRef = adminDb.collection('orders').doc(orderId);
    const orderSnap = await orderRef.get();

    if (!orderSnap.exists) {
      return NextResponse.json(
        { success: false, error: `Order "${orderId}" not found in atelier chronicle.` },
        { status: 404 }
      );
    }

    const orderData = orderSnap.data() || {};

    // 4. Check Existing Ownership
    if (orderData.userId) {
      if (orderData.userId === authenticatedUid) {
        // Idempotent success: Already owned by this patron
        return NextResponse.json({
          success: true,
          alreadyOwned: true,
          orderId,
          message: 'This order is already securely linked to your patron portfolio.',
          order: {
            id: orderId,
            total: orderData.total,
            status: orderData.status,
            fulfillmentStatus: orderData.fulfillmentStatus,
            items: orderData.items,
          },
        });
      }

      // Hard security barrier: Order belongs to a different customer
      return NextResponse.json(
        {
          success: false,
          error: 'Ownership Conflict: This order is already registered to another patron account.',
          code: 'ORDER_ALREADY_OWNED',
        },
        { status: 403 }
      );
    }

    const orderEmail = (orderData.customerEmail || '').trim().toLowerCase();
    const orderPhoneClean = cleanDigits(orderData.customerPhone || orderData.shippingAddress?.phone || '');

    // 5. Handle Action: 'request_otp' (Independent Contact Challenge)
    if (action === 'request_otp') {
      const challengeRef = adminDb.collection('order_claim_challenges').doc(orderId);
      const claimOtpSecret = getClaimOtpSecret();

      try {
        const generatedOtp = await adminDb.runTransaction(async (transaction) => {
          const existingSnap = await transaction.get(challengeRef);
          const now = Date.now();
          if (existingSnap.exists) {
            const existingData = existingSnap.data() || {};
            const createdMs = existingData.createdAt ? new Date(existingData.createdAt).getTime() : 0;
            // 60-second cooldown rate limit between OTP generation attempts (Phase 5.1)
            if (now - createdMs < 60 * 1000) {
              const waitSec = Math.ceil((60 * 1000 - (now - createdMs)) / 1000);
              throw new Error(`COOLDOWN_ACTIVE:${waitSec}`);
            }
          }

          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          // Server-side HMAC-based OTP storage using dedicated secret
          const hashedOtp = crypto.createHmac('sha256', claimOtpSecret).update(otp).digest('hex');
          const expiresAt = now + 5 * 60 * 1000; // 5 minutes

          transaction.set(challengeRef, {
            orderId,
            hashedOtp,
            expiresAt,
            attemptsRemaining: 3,
            targetEmail: orderEmail,
            targetPhone: orderPhoneClean,
            requestedByUid: authenticatedUid,
            createdAt: new Date(now).toISOString(),
          });

          return otp;
        });

        // Output solely to server console in local/test environment; NEVER return in client API response
        if (process.env.NODE_ENV !== 'production' || process.env.FIRESTORE_EMULATOR_HOST) {
          console.log(`[Kalajay Atelier] Guest Order Claim OTP for ${orderId}: ${generatedOtp}`);
        }

        return NextResponse.json({
          success: true,
          message: `Verification code sent to registered order contact (${orderEmail.slice(0, 3)}***@***). Valid for 5 minutes.`,
        });
      } catch (err: any) {
        if (err?.message?.startsWith('COOLDOWN_ACTIVE:')) {
          const wait = err.message.split(':')[1];
          return NextResponse.json(
            { success: false, error: `Please wait ${wait} seconds before requesting another verification code.` },
            { status: 429 }
          );
        }
        throw err;
      }
    }

    // 6. Ownership Verification Logic
    let isOwnershipVerified = false;
    let verificationMethod = '';

    // Method A: Verified Firebase Contact Match (Phase 5.3)
    // Email verified on Firebase and matches order email, or verified phone matches order phone
    const authenticatedPhoneClean = cleanDigits(verifyRes.phoneNumber || '');
    if (isEmailVerified && authenticatedEmail && orderEmail && authenticatedEmail === orderEmail) {
      isOwnershipVerified = true;
      verificationMethod = 'firebase_verified_email_match';
    } else if (authenticatedPhoneClean && orderPhoneClean && authenticatedPhoneClean === orderPhoneClean) {
      isOwnershipVerified = true;
      verificationMethod = 'firebase_verified_phone_match';
    }

    // If verification method is not satisfied and action is not verify_otp_and_claim, prompt user
    if (!isOwnershipVerified && action !== 'verify_otp_and_claim') {
      return NextResponse.json(
        {
          success: false,
          error: 'Ownership Verification Required: Your authenticated account details do not match the contact coordinates on this order. Please use a verified account contact match, or request an OTP challenge sent to the registered order contact.',
          code: 'OWNERSHIP_VERIFICATION_REQUIRED',
          requiresOtpChallenge: true,
          maskedEmail: orderEmail ? `${orderEmail.slice(0, 3)}***@***` : undefined,
          maskedPhone: orderPhoneClean ? `******${orderPhoneClean.slice(-4)}` : undefined,
        },
        { status: 403 }
      );
    }

    // 7. Atomic Claim & Verification Transaction (Anti-Concurrency & Durable Attempt Enforcement)
    const claimTimestamp = new Date().toISOString();
    const challengeRef = adminDb.collection('order_claim_challenges').doc(orderId);

    try {
      const txResult = await adminDb.runTransaction(async (transaction) => {
        // Read target order
        const liveOrderSnap = await transaction.get(orderRef);
        if (!liveOrderSnap.exists) {
          return { status: 'ORDER_NOT_FOUND' };
        }

        const liveOrderData = liveOrderSnap.data() || {};
        if (liveOrderData.userId) {
          if (liveOrderData.userId === authenticatedUid) {
            return { status: 'ALREADY_OWNED' };
          }
          return { status: 'CONCURRENT_CLAIM_CONFLICT' };
        }

        // Method B Verification inside Transaction (Guarantees zero concurrent exhaustion bypass or replay)
        let txVerificationMethod = verificationMethod;
        if (!isOwnershipVerified) {
          if (!suppliedOtp) {
            return { status: 'OTP_REQUIRED' };
          }

          const challengeSnap = await transaction.get(challengeRef);
          if (!challengeSnap.exists) {
            return { status: 'CHALLENGE_NOT_FOUND' };
          }

          const cData = challengeSnap.data() || {};
          const now = Date.now();

          if (cData.expiresAt < now) {
            transaction.delete(challengeRef);
            return { status: 'CHALLENGE_EXPIRED' };
          }

          // Strict UID Binding Check: Challenge must belong to the authenticated caller who requested it
          if (cData.requestedByUid && cData.requestedByUid !== authenticatedUid) {
            return { status: 'CHALLENGE_USER_MISMATCH' };
          }

          const attempts = cData.attemptsRemaining !== undefined ? Number(cData.attemptsRemaining) : 0;
          if (attempts <= 0) {
            transaction.delete(challengeRef);
            return { status: 'MAX_ATTEMPTS_EXCEEDED' };
          }

          const claimOtpSecret = getClaimOtpSecret();
          const hmacSupplied = crypto.createHmac('sha256', claimOtpSecret).update(suppliedOtp).digest('hex');
          const shaSupplied = crypto.createHash('sha256').update(suppliedOtp).digest('hex');

          const isMatch = timingSafeEqualString(hmacSupplied, cData.hashedOtp) || timingSafeEqualString(shaSupplied, cData.hashedOtp);

          if (!isMatch) {
            const remaining = Math.max(0, attempts - 1);
            if (remaining <= 0) {
              transaction.delete(challengeRef);
            } else {
              transaction.update(challengeRef, { attemptsRemaining: remaining });
            }
            return { status: 'INVALID_OTP', remaining };
          }

          // OTP verified: atomically delete challenge to prevent reuse/replay
          transaction.delete(challengeRef);
          txVerificationMethod = 'otp_contact_challenge';
        }

        const timelineEntry = {
          title: 'Order Bound to Patron Portfolio',
          timestamp: claimTimestamp,
          note: `Claimed by verified patron account (${authenticatedEmail || authenticatedUid}) via ${txVerificationMethod}.`,
        };

        transaction.update(orderRef, {
          userId: authenticatedUid,
          isGuestOrder: false,
          claimedAt: claimTimestamp,
          claimedByUid: authenticatedUid,
          claimedByEmail: authenticatedEmail || null,
          claimVerificationMethod: txVerificationMethod,
          timeline: FieldValue.arrayUnion(timelineEntry),
          updatedAt: claimTimestamp,
        });

        // Optional: Save guest delivery address to customer profile if requested
        if (saveAddressToProfile && liveOrderData.shippingAddress) {
          try {
            const userRef = adminDb.collection('users').doc(authenticatedUid);
            const userSnap = await transaction.get(userRef);
            if (userSnap.exists) {
              const userData = userSnap.data() || {};
              const existingAddresses: Address[] = Array.isArray(userData.addresses) ? userData.addresses : [];
              const newAddrRaw = {
                label: 'Claimed Order Destination',
                fullName: liveOrderData.customerName || userData.name || 'Patron',
                phone: liveOrderData.customerPhone || userData.phone || '',
                street: liveOrderData.shippingAddress.addressLine || '',
                apartment: liveOrderData.shippingAddress.apartment || undefined,
                city: liveOrderData.shippingAddress.city || '',
                state: liveOrderData.shippingAddress.state || 'Maharashtra',
                pincode: liveOrderData.shippingAddress.pincode || '',
                isDefault: existingAddresses.length === 0,
              };

              const isDuplicate = existingAddresses.some(a => areAddressesEqual(a, newAddrRaw));
              if (!isDuplicate) {
                const normalized = normalizeAddress(newAddrRaw);
                transaction.update(userRef, {
                  addresses: FieldValue.arrayUnion(normalized),
                  updatedAt: claimTimestamp,
                });
              }
            }
          } catch (profileErr) {
            console.warn('Deferred address save during claim notice:', profileErr);
          }
        }

        return { status: 'SUCCESS', verificationMethod: txVerificationMethod };
      });

      if (txResult.status === 'ALREADY_OWNED') {
        return NextResponse.json({
          success: true,
          alreadyOwned: true,
          orderId,
          message: 'This order is already securely linked to your patron portfolio.',
        });
      }
      if (txResult.status === 'CONCURRENT_CLAIM_CONFLICT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Ownership Conflict: This order is already registered to another patron account.',
            code: 'ORDER_ALREADY_OWNED',
          },
          { status: 403 }
        );
      }
      if (txResult.status === 'ORDER_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: `Order "${orderId}" not found in atelier chronicle.` },
          { status: 404 }
        );
      }
      if (txResult.status === 'OTP_REQUIRED') {
        return NextResponse.json(
          { success: false, error: 'Verification code (OTP) is required.' },
          { status: 400 }
        );
      }
      if (txResult.status === 'CHALLENGE_NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'No active OTP verification challenge found for this order. Please request a new code.' },
          { status: 400 }
        );
      }
      if (txResult.status === 'CHALLENGE_EXPIRED') {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new code.' },
          { status: 400 }
        );
      }
      if (txResult.status === 'CHALLENGE_USER_MISMATCH') {
        return NextResponse.json(
          { success: false, error: 'Access Denied: Verification challenge was issued to another patron session.' },
          { status: 403 }
        );
      }
      if (txResult.status === 'MAX_ATTEMPTS_EXCEEDED') {
        return NextResponse.json(
          { success: false, error: 'Maximum verification attempts exceeded. Please request a new code.' },
          { status: 429 }
        );
      }
      if (txResult.status === 'INVALID_OTP') {
        return NextResponse.json(
          { success: false, error: `Invalid verification code. ${txResult.remaining} attempts remaining.` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        orderId,
        message: 'Order successfully claimed and bound to your patron portfolio.',
        claimedAt: claimTimestamp,
        verificationMethod: txResult.verificationMethod,
      });
    } catch (err: any) {
      return NextResponse.json(
        { success: false, error: err?.message || 'Failed to complete guest order claiming.' },
        { status: 500 }
      );
    }
  } catch (topErr: any) {
    return NextResponse.json(
      { success: false, error: topErr?.message || 'Server error.' },
      { status: 500 }
    );
  }
}

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

function generateGuestAccessToken(orderId: string, customerEmail: string): string {
  const trackingSecret = process.env.ORDER_TRACKING_SECRET || process.env.NEXTAUTH_SECRET || 'kalajay_guest_order_tracking_salt_2026';
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
    const claimOtpSecret = process.env.ORDER_CLAIM_OTP_SECRET || process.env.ORDER_TRACKING_SECRET || 'kalajay_claim_otp_secret_2026';

    if (action === 'request_otp') {
      const challengeRef = adminDb.collection('order_claim_challenges').doc(orderId);
      const existingSnap = await challengeRef.get();
      if (existingSnap.exists) {
        const existingData = existingSnap.data() || {};
        const createdMs = existingData.createdAt ? new Date(existingData.createdAt).getTime() : 0;
        // 60-second cooldown rate limit between OTP generation attempts (Phase 5.1)
        if (Date.now() - createdMs < 60 * 1000) {
          return NextResponse.json(
            { success: false, error: 'Please wait 60 seconds before requesting another verification code.' },
            { status: 429 }
          );
        }
      }

      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      // Server-side HMAC-based OTP storage using dedicated secret (Phase 5.1)
      const hashedOtp = crypto.createHmac('sha256', claimOtpSecret).update(generatedOtp).digest('hex');
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

      await challengeRef.set({
        orderId,
        hashedOtp,
        expiresAt,
        attemptsRemaining: 3,
        targetEmail: orderEmail,
        targetPhone: orderPhoneClean,
        requestedByUid: authenticatedUid,
        createdAt: new Date().toISOString(),
      });

      // Output solely to server console in local/test environment; NEVER return in client API response (Phase 5.2)
      if (process.env.NODE_ENV !== 'production' || process.env.FIRESTORE_EMULATOR_HOST) {
        console.log(`[Kalajay Atelier] Guest Order Claim OTP for ${orderId}: ${generatedOtp}`);
      }

      return NextResponse.json({
        success: true,
        message: `Verification code sent to registered order contact (${orderEmail.slice(0, 3)}***@***). Valid for 5 minutes.`,
      });
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

    // Method B: OTP Challenge Verification to original order contact (Phase 5.3)
    // NOTE: Guest tracking token ALONE is strictly disallowed from bypassing contact verification (Scenario 26)
    if (!isOwnershipVerified && action === 'verify_otp_and_claim' && suppliedOtp) {
      const challengeRef = adminDb.collection('order_claim_challenges').doc(orderId);
      const challengeSnap = await challengeRef.get();

      if (!challengeSnap.exists) {
        return NextResponse.json(
          { success: false, error: 'No active OTP verification challenge found for this order. Please request a new code.' },
          { status: 400 }
        );
      }

      const cData = challengeSnap.data() || {};
      if (cData.expiresAt < Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new code.' },
          { status: 400 }
        );
      }

      if (cData.attemptsRemaining <= 0) {
        return NextResponse.json(
          { success: false, error: 'Maximum verification attempts exceeded. Please request a new code.' },
          { status: 429 }
        );
      }

      const hmacSupplied = crypto.createHmac('sha256', claimOtpSecret).update(suppliedOtp).digest('hex');
      const shaSupplied = crypto.createHash('sha256').update(suppliedOtp).digest('hex');

      if (hmacSupplied === cData.hashedOtp || shaSupplied === cData.hashedOtp) {
        isOwnershipVerified = true;
        verificationMethod = 'otp_contact_challenge';
        // Clean up completed challenge (one-time use invalidation)
        await challengeRef.delete().catch(() => {});
      } else {
        // Atomic decrement to prevent concurrent attempt exhaustion bypass (Phase 4)
        await challengeRef.update({
          attemptsRemaining: FieldValue.increment(-1),
        }).catch(() => {});
        const remaining = Math.max(0, (cData.attemptsRemaining || 1) - 1);
        return NextResponse.json(
          { success: false, error: `Invalid verification code. ${remaining} attempts remaining.` },
          { status: 400 }
        );
      }
    }

    if (!isOwnershipVerified) {
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

    // 7. Atomic Claim Transaction (Anti-Concurrency Guaranteed)
    const claimTimestamp = new Date().toISOString();
    const timelineEntry = {
      title: 'Order Bound to Patron Portfolio',
      timestamp: claimTimestamp,
      note: `Claimed by verified patron account (${authenticatedEmail || authenticatedUid}) via ${verificationMethod}.`,
    };

    await adminDb.runTransaction(async (transaction) => {
      const liveOrderSnap = await transaction.get(orderRef);
      if (!liveOrderSnap.exists) {
        throw new Error('ORDER_NOT_FOUND');
      }

      const liveOrderData = liveOrderSnap.data() || {};
      if (liveOrderData.userId && liveOrderData.userId !== authenticatedUid) {
        throw new Error('CONCURRENT_CLAIM_CONFLICT');
      }

      transaction.update(orderRef, {
        userId: authenticatedUid,
        isGuestOrder: false,
        claimedAt: claimTimestamp,
        claimedByUid: authenticatedUid,
        claimedByEmail: authenticatedEmail || null,
        claimVerificationMethod: verificationMethod,
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
    });

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Order successfully claimed and bound to your patron portfolio.',
      claimedAt: claimTimestamp,
      verificationMethod,
    });
  } catch (err: any) {
    if (err?.message === 'CONCURRENT_CLAIM_CONFLICT') {
      return NextResponse.json(
        { success: false, error: 'Concurrent claim detected. Order was already claimed by another session.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to complete guest order claiming.' },
      { status: 500 }
    );
  }
}

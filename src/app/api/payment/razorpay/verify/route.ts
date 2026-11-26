import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { verifyRazorpayPaymentSignature } from '@/lib/payment/razorpayClient';
import { assertValidPaymentTransition } from '@/lib/payment/stateMachine';
import { confirmStockReservation } from '@/lib/inventory/reservation';
import { dispatchOrderLifecycleNotification } from '@/lib/orderEmailDispatcher';
import { PaymentState } from '@/lib/payment/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    // 1. Mandatory Input Validation
    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required payment verification parameters (orderId, razorpayOrderId, razorpayPaymentId, or razorpaySignature).',
          code: 'MISSING_VERIFICATION_PARAMS',
        },
        { status: 400 }
      );
    }

    // 2. Cryptographic Timing-Safe Signature Verification
    const sigCheck = verifyRazorpayPaymentSignature({
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!sigCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: sigCheck.error || 'Payment signature verification failed. Verification rejected.',
          code: 'INVALID_PAYMENT_SIGNATURE',
        },
        { status: 400 }
      );
    }

    // 3. Authoritative Order Lookup & State Machine Guard
    const adminDb = getAdminFirestore();
    let orderRecord: any = null;

    if (adminDb) {
      const orderDoc = await adminDb.collection('orders').doc(orderId).get();
      if (orderDoc.exists) {
        orderRecord = orderDoc.data();
      }
    }

    if (!orderRecord) {
      return NextResponse.json(
        { success: false, error: `Order "${orderId}" could not be retrieved from atelier records.` },
        { status: 404 }
      );
    }

    // Verify stored Razorpay Order ID matches
    if (orderRecord.razorpayOrderId && orderRecord.razorpayOrderId !== razorpayOrderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gateway order ID mismatch against internal order record.',
          code: 'ORDER_ID_MISMATCH',
        },
        { status: 400 }
      );
    }

    const currentPaymentStatus: PaymentState = (orderRecord.paymentStatus as PaymentState) || 'pending';

    // Prevent double capture or illegal transition
    assertValidPaymentTransition(currentPaymentStatus, 'captured', {
      orderId,
      paymentId: razorpayPaymentId,
      source: 'verify_endpoint',
    });

    const nowIso = new Date().toISOString();

    // 4. Confirm Stock Reservation permanently into Committed Sale
    const stockResult = await confirmStockReservation(orderId);

    if (stockResult.stockExhausted) {
      // Critical Late Payment Scenario: Payment captured after 15m lease expiry and stock sold out to another customer
      if (adminDb) {
        await adminDb.collection('orders').doc(orderId).update({
          paymentStatus: 'reconciliation_required',
          'paymentDetails.currentStatus': 'reconciliation_required',
          'paymentDetails.razorpayPaymentId': razorpayPaymentId,
          'paymentDetails.razorpaySignature': razorpaySignature,
          'paymentDetails.reconciliationReason': 'LATE_PAYMENT_STOCK_EXHAUSTED',
          updatedAt: nowIso,
          timeline: FieldValue.arrayUnion({
            title: 'Payment Received Post-Expiry (Stock Exhausted)',
            timestamp: nowIso,
            note: `Gateway payment ${razorpayPaymentId} captured after reservation expired. Physical stock was exhausted. Order routed for priority refund / concierge resolution.`,
          }),
        });
      }
      return NextResponse.json(
        {
          success: false,
          error:
            'Payment received but item sold out after checkout session expired. Our atelier concierge will issue an immediate refund or custom heirloom arrangement.',
          code: 'RECONCILIATION_REQUIRED',
          orderId,
          paymentId: razorpayPaymentId,
        },
        { status: 409 }
      );
    }

    // 5. Update Order to 'paid' and 'captured' in Firestore
    const updatedTimelineEntry = {
      title: 'Payment Authoritatively Captured & Verified',
      timestamp: nowIso,
      note: `Verified via Razorpay (Payment ID: ${razorpayPaymentId}, Order ID: ${razorpayOrderId}). Cryptographic signature validated.${
        stockResult.isLatePaymentRecovery ? ' (Recovered from post-expiry available inventory)' : ''
      }`,
    };

    if (adminDb) {
      await adminDb.collection('orders').doc(orderId).update({
        paymentStatus: 'paid',
        'paymentDetails.currentStatus': 'captured',
        'paymentDetails.razorpayPaymentId': razorpayPaymentId,
        'paymentDetails.razorpaySignature': razorpaySignature,
        'paymentDetails.verifiedAt': nowIso,
        timeline: FieldValue.arrayUnion(updatedTimelineEntry),
        updatedAt: nowIso,
      });

      // Record in audit log
      await adminDb.collection('audit_logs').add({
        id: `aud-pay-${Date.now()}`,
        action: 'PAYMENT_VERIFIED_CAPTURED',
        orderId,
        gatewayPaymentId: razorpayPaymentId,
        gatewayOrderId: razorpayOrderId,
        amount: orderRecord.total,
        timestamp: nowIso,
        verifiedBy: 'Razorpay Client Verification Engine',
      });
    }

    // 6. Dispatch Patron Notification (Order Confirmed & Payment Success)
    try {
      dispatchOrderLifecycleNotification({
        order: {
          ...orderRecord,
          paymentStatus: 'paid',
          razorpayPaymentId,
        },
        event: 'payment_success',
      }).catch((e) => console.warn('Payment success email dispatch error:', e));
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Payment verified and authoritatively captured.',
      orderId,
      paymentId: razorpayPaymentId,
      status: 'paid',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Internal payment verification failure.',
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { verifyRazorpayWebhookSignature } from '@/lib/payment/razorpayClient';
import { confirmStockReservation, releaseStockReservation } from '@/lib/inventory/reservation';
import { assertValidPaymentTransition, isPaymentCaptured } from '@/lib/payment/stateMachine';
import { dispatchOrderLifecycleNotification } from '@/lib/orderEmailDispatcher';
import { PaymentState, RazorpayWebhookPayload } from '@/lib/payment/types';

export const dynamic = 'force-dynamic';

/**
 * Razorpay Webhook Handler
 * Features:
 * - Raw body buffer HMAC SHA-256 signature verification
 * - Persistent event deduplication via /payment_webhook_events/{event_id}
 * - Atomic order state machine transitions
 * - Handles payment.captured, payment.failed, order.paid, and refund.processed
 */
export async function POST(request: Request) {
  try {
    const signature = request.headers.get('x-razorpay-signature') || '';

    // 1. Read Raw Body ArrayBuffer (Required for exact signature verification)
    const arrayBuffer = await request.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // 2. Cryptographic Signature Check
    const sigCheck = verifyRazorpayWebhookSignature(rawBuffer, signature);
    if (!sigCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: sigCheck.error || 'Webhook cryptographic signature verification failed.',
        },
        { status: 400 }
      );
    }

    // 3. Parse Webhook Event JSON
    let event: RazorpayWebhookPayload;
    try {
      event = JSON.parse(rawBuffer.toString('utf8'));
    } catch {
      return NextResponse.json(
        { success: false, error: 'Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const eventId = (event as any).id || `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const eventType = event.event;
    const adminDb = getAdminFirestore();

    // 4. Durable Event Deduplication (Idempotency)
    if (adminDb) {
      const eventRef = adminDb.collection('payment_webhook_events').doc(eventId);
      const eventSnap = await eventRef.get();
      if (eventSnap.exists) {
        // Event was already processed — acknowledge gracefully
        return NextResponse.json({
          success: true,
          deduplicated: true,
          message: `Webhook event ${eventId} already processed.`,
        });
      }
    }

    const nowIso = new Date().toISOString();

    // 5. Process Event Types
    if (eventType === 'payment.captured') {
      const payment = event.payload.payment?.entity;
      if (payment) {
        const razorpayOrderId = payment.order_id;
        const razorpayPaymentId = payment.id;
        const receipt = payment.notes?.internalOrderId || payment.description;

        if (adminDb && razorpayOrderId) {
          // Find order by razorpayOrderId or internal receipt ID
          let orderRef: any = null;
          let orderData: any = null;

          if (receipt) {
            const byId = await adminDb.collection('orders').doc(receipt).get();
            if (byId.exists) {
              orderRef = byId.ref;
              orderData = byId.data();
            }
          }

          if (!orderRef) {
            const querySnap = await adminDb
              .collection('orders')
              .where('razorpayOrderId', '==', razorpayOrderId)
              .limit(1)
              .get();
            if (!querySnap.empty) {
              orderRef = querySnap.docs[0].ref;
              orderData = querySnap.docs[0].data();
            }
          }

          if (orderRef && orderData) {
            const currentStatus: PaymentState = orderData.paymentStatus || 'pending';

            // Validate currency: Store requires INR
            const currency = (payment.currency || 'INR').toUpperCase();
            if (currency !== 'INR') {
              await orderRef.update({
                paymentStatus: 'reconciliation_required',
                'paymentDetails.currentStatus': 'reconciliation_required',
                'paymentDetails.razorpayPaymentId': razorpayPaymentId,
                'paymentDetails.reconciliationReason': `CURRENCY_MISMATCH_${currency}`,
                updatedAt: nowIso,
                timeline: FieldValue.arrayUnion({
                  title: 'Webhook Discrepancy: Currency Mismatch',
                  timestamp: nowIso,
                  note: `Razorpay webhook reported payment in ${currency}, but store currency is INR. Routed for reconciliation.`,
                }),
              });
              return NextResponse.json(
                { success: false, error: `Invalid currency: Expected INR, received ${currency}.` },
                { status: 400 }
              );
            }

            // Validate amount in paise: Captured amount must meet or exceed order total
            const expectedAmountPaise = Math.round(Number(orderData.total) * 100);
            const capturedAmountPaise = Number(payment.amount) || 0;

            if (capturedAmountPaise < expectedAmountPaise) {
              await orderRef.update({
                paymentStatus: 'reconciliation_required',
                'paymentDetails.currentStatus': 'reconciliation_required',
                'paymentDetails.razorpayPaymentId': razorpayPaymentId,
                'paymentDetails.reconciliationReason': 'AMOUNT_MISMATCH_UNDERPAID',
                'paymentDetails.amountCapturedPaise': capturedAmountPaise,
                'paymentDetails.expectedAmountPaise': expectedAmountPaise,
                updatedAt: nowIso,
                timeline: FieldValue.arrayUnion({
                  title: 'Webhook Discrepancy: Underpaid Order',
                  timestamp: nowIso,
                  note: `Razorpay webhook reported captured amount of ₹${(capturedAmountPaise / 100).toFixed(2)}, but order total is ₹${Number(orderData.total).toFixed(2)}. Routed for reconciliation.`,
                }),
              });
              return NextResponse.json(
                {
                  success: false,
                  error: `Underpaid: Captured amount (${capturedAmountPaise} paise) is less than order total (${expectedAmountPaise} paise).`,
                },
                { status: 400 }
              );
            }

            if (!isPaymentCaptured(currentStatus)) {
              assertValidPaymentTransition(currentStatus, 'captured', {
                orderId: orderRef.id,
                paymentId: razorpayPaymentId,
                source: 'webhook_captured',
              });

              // Confirm stock reservation
              const stockResult = await confirmStockReservation(orderRef.id);

              if (stockResult.stockExhausted) {
                // Critical Late Payment Scenario: Payment captured after 15m lease expiry and stock sold out to another customer
                await orderRef.update({
                  paymentStatus: 'reconciliation_required',
                  'paymentDetails.currentStatus': 'reconciliation_required',
                  'paymentDetails.razorpayPaymentId': razorpayPaymentId,
                  'paymentDetails.reconciliationReason': 'LATE_PAYMENT_STOCK_EXHAUSTED',
                  updatedAt: nowIso,
                  timeline: FieldValue.arrayUnion({
                    title: 'Webhook: Payment Captured Post-Expiry (Stock Exhausted)',
                    timestamp: nowIso,
                    note: `Razorpay webhook confirmed payment capture (${razorpayPaymentId}), but physical stock was exhausted after reservation lease expired. Routed for priority concierge refund.`,
                  }),
                });
              } else {
                await orderRef.update({
                  paymentStatus: 'paid',
                  'paymentDetails.currentStatus': 'captured',
                  'paymentDetails.razorpayPaymentId': razorpayPaymentId,
                  'paymentDetails.amountCapturedPaise': payment.amount,
                  'paymentDetails.verifiedAt': nowIso,
                  updatedAt: nowIso,
                  timeline: FieldValue.arrayUnion({
                    title: 'Payment Captured via Gateway Webhook',
                    timestamp: nowIso,
                    note: `Razorpay webhook confirmed payment capture (Payment ID: ${razorpayPaymentId}, Event ID: ${eventId}).${
                      stockResult.isLatePaymentRecovery ? ' (Recovered from post-expiry available inventory)' : ''
                    }`,
                  }),
                });

                // Dispatch payment success notification
                try {
                  dispatchOrderLifecycleNotification({
                    order: { ...orderData, id: orderRef.id, paymentStatus: 'paid', razorpayPaymentId },
                    event: 'payment_success',
                  }).catch(() => {});
                } catch {}
              }
            }
          }
        }
      }
    } else if (eventType === 'payment.failed') {
      const payment = event.payload.payment?.entity;
      if (payment && adminDb) {
        const razorpayOrderId = payment.order_id;
        const receipt = payment.notes?.internalOrderId || payment.description;

        let docRef: any = null;
        let currentData: any = null;

        if (receipt) {
          const byId = await adminDb.collection('orders').doc(receipt).get();
          if (byId.exists) {
            docRef = byId.ref;
            currentData = byId.data();
          }
        }

        if (!docRef && razorpayOrderId) {
          const querySnap = await adminDb
            .collection('orders')
            .where('razorpayOrderId', '==', razorpayOrderId)
            .limit(1)
            .get();

          if (!querySnap.empty) {
            docRef = querySnap.docs[0].ref;
            currentData = querySnap.docs[0].data();
          }
        }

        if (docRef && currentData) {
          const currentStatus: PaymentState = currentData.paymentStatus || 'pending';

          // Never overwrite an already captured payment with a late failed event
          if (!isPaymentCaptured(currentStatus)) {
            await docRef.update({
              paymentStatus: 'failed',
              'paymentDetails.currentStatus': 'failed',
              updatedAt: nowIso,
              timeline: FieldValue.arrayUnion({
                title: 'Payment Attempt Failed',
                timestamp: nowIso,
                note: `Gateway indicated transaction failure: ${payment.error_description || 'Card/UPI bank declined'}.`,
              }),
            });
          }
        }
      }
    } else if (eventType === 'refund.processed') {
      const refund = event.payload.refund?.entity;
      if (refund && adminDb) {
        const razorpayPaymentId = refund.payment_id;
        const receipt = (refund as any).notes?.internalOrderId || (refund as any).description;

        let docRef: any = null;
        if (receipt) {
          const byId = await adminDb.collection('orders').doc(receipt).get();
          if (byId.exists) {
            docRef = byId.ref;
          }
        }

        if (!docRef && razorpayPaymentId) {
          const querySnap = await adminDb
            .collection('orders')
            .where('paymentDetails.razorpayPaymentId', '==', razorpayPaymentId)
            .limit(1)
            .get();

          if (!querySnap.empty) {
            docRef = querySnap.docs[0].ref;
          }
        }

        if (docRef) {
          await docRef.update({
            paymentStatus: 'refunded',
            'paymentDetails.currentStatus': 'refunded',
            'paymentDetails.amountRefundedPaise': refund.amount,
            updatedAt: nowIso,
            timeline: FieldValue.arrayUnion({
              title: 'Gateway Refund Settled',
              timestamp: nowIso,
              note: `Razorpay confirmed refund settlement of ₹${Math.round(refund.amount / 100)} (Refund ID: ${refund.id}).`,
            }),
          });
        }
      }
    }

    // 6. Record Deduplication Log Entry
    if (adminDb) {
      const paymentEntity = event.payload.payment?.entity;
      const refundEntity = event.payload.refund?.entity;

      await adminDb.collection('payment_webhook_events').doc(eventId).set({
        id: eventId,
        eventType,
        receivedAt: nowIso,
        status: 'processed',
        payloadSummary: {
          paymentId: paymentEntity?.id || refundEntity?.payment_id || null,
          orderId: paymentEntity?.order_id || null,
          amount: paymentEntity?.amount !== undefined ? paymentEntity.amount : (refundEntity?.amount !== undefined ? refundEntity.amount : null),
        },
      });
    }

    return NextResponse.json({
      success: true,
      processed: true,
      eventId,
      eventType,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Webhook processing failure.',
      },
      { status: 500 }
    );
  }
}

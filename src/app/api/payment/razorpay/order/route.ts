import { NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { createRazorpayOrder, getPublicRazorpayKeyId, getRazorpayConfigStatus } from '@/lib/payment/razorpayClient';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';
import { reserveStockForOrder } from '@/lib/inventory/reservation';
import { PaymentAttempt } from '@/lib/payment/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { orderId } = body;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid internal orderId is required to initiate Razorpay payment.' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    let orderData: any = null;

    if (adminDb) {
      const orderDoc = await adminDb.collection('orders').doc(orderId).get();
      if (orderDoc.exists) {
        orderData = orderDoc.data();
      }
    }

    if (!orderData) {
      return NextResponse.json(
        { success: false, error: `Order "${orderId}" not found in atelier records.` },
        { status: 404 }
      );
    }

    // Security Check: Order Status validation
    if (orderData.paymentStatus === 'paid' || orderData.paymentStatus === 'captured') {
      return NextResponse.json(
        { success: false, error: 'Order is already paid and confirmed in atelier.' },
        { status: 400 }
      );
    }

    if (orderData.paymentStatus === 'refunded' || orderData.paymentStatus === 'cancelled') {
      return NextResponse.json(
        { success: false, error: `Order is ${orderData.paymentStatus} and cannot accept new payments.` },
        { status: 400 }
      );
    }

    // Customer Authentication / Ownership Verification
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const verifyRes = await verifyFirebaseIdToken(token);
      if (verifyRes.valid && verifyRes.uid) {
        if (orderData.userId && orderData.userId !== verifyRes.uid) {
          return NextResponse.json(
            { success: false, error: 'Unauthorized: Cannot initiate payment for another patron order.' },
            { status: 403 }
          );
        }
      }
    }

    // Calculate exact authoritative amount in paise (1 INR = 100 paise)
    const amountPaise = Math.round(Number(orderData.total) * 100);
    if (isNaN(amountPaise) || amountPaise <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid order total calculated for payment.' },
        { status: 400 }
      );
    }

    // Ensure inventory reservation is active (15-minute lease)
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      try {
        await reserveStockForOrder({
          orderId,
          items: orderData.items.map((i: any) => ({
            sku: i.sku || i.productId,
            quantity: i.quantity || 1,
          })),
          leaseMinutes: 15,
        });
      } catch (stockErr: any) {
        return NextResponse.json(
          {
            success: false,
            error: stockErr?.message || 'Inventory reservation failed. Stock may be insufficient.',
            code: 'INVENTORY_RESERVATION_FAILED',
          },
          { status: 409 }
        );
      }
    }

    // Create server-side Razorpay Order
    const razorpayOrder = await createRazorpayOrder({
      amountPaise,
      currency: 'INR',
      receipt: orderId,
      notes: {
        customerEmail: orderData.customerEmail || '',
        customerPhone: orderData.customerPhone || '',
        internalOrderId: orderId,
      },
      customer: {
        name: orderData.customerName,
        email: orderData.customerEmail,
        contact: orderData.customerPhone,
      },
    });

    const paymentAttempt: PaymentAttempt = {
      id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      gateway: 'razorpay',
      gatewayOrderId: razorpayOrder.id,
      amount: orderData.total,
      amountPaise,
      currency: 'INR',
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update order with Razorpay Order ID & Payment Attempt
    if (adminDb) {
      try {
        await adminDb.collection('orders').doc(orderId).update({
          razorpayOrderId: razorpayOrder.id,
          'paymentDetails.razorpayOrderId': razorpayOrder.id,
          'paymentDetails.currentStatus': 'pending',
          'paymentDetails.attempts': FieldValue.arrayUnion(paymentAttempt),
          updatedAt: new Date().toISOString(),
        });
      } catch {}
    }

    const publicConfig = getRazorpayConfigStatus();

    return NextResponse.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: orderData.total,
      amountPaise,
      currency: 'INR',
      keyId: getPublicRazorpayKeyId(),
      isMock: razorpayOrder.isMock ?? false,
      gatewayMode: publicConfig.gatewayMode,
      order: {
        id: orderId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        customerPhone: orderData.customerPhone,
        total: orderData.total,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to initialize payment gateway order.' },
      { status: 500 }
    );
  }
}

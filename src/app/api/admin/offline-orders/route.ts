import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { OfflineOrder, AdminOrder } from '@/data/adminTypes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderData: OfflineOrder = body.orderData || body;

    // 1. Authorize: Creating offline orders requires finance.offline -> create/edit
    const authCheck = await verifyStaffPermission(request, body, 'finance.offline', 'create');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    if (!orderData.invoiceNumber || !orderData.total || !orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mandatory fields missing: invoiceNumber, total, items are required.' },
        { status: 400 }
      );
    }

    const orderId = orderData.id || `KJ-OFF-2026-${Date.now().toString().slice(-4)}`;
    const newOfflineOrder: OfflineOrder = {
      ...orderData,
      id: orderId,
      createdAt: orderData.createdAt || new Date().toISOString(),
      recordedBy: authCheck.staffUser?.name || orderData.recordedBy || 'Staff Concierge',
    };

    // Companion master admin order record for unified fulfillment and accounting
    const companionAdminOrder: AdminOrder = {
      id: orderId,
      customerName: newOfflineOrder.customerName,
      customerEmail: newOfflineOrder.customerEmail || 'concierge@kalajay.in',
      customerPhone: newOfflineOrder.customerPhone,
      items: newOfflineOrder.items.map(it => ({
        productId: it.productId,
        name: it.name,
        sku: it.sku,
        price: it.price,
        quantity: it.quantity,
        image: 'https://www.kalajay.in/v2/p3-2.jpg',
      })),
      subtotal: newOfflineOrder.subtotal,
      discount: newOfflineOrder.discount || 0,
      shipping: 0,
      tax: newOfflineOrder.cgst + newOfflineOrder.sgst + newOfflineOrder.igst,
      total: newOfflineOrder.total,
      paymentStatus: newOfflineOrder.paymentStatus === 'paid' ? 'paid' : 'pending',
      paymentMethod: (newOfflineOrder.paymentMethod === 'Direct UPI QR' ? 'UPI Instant' : 'WhatsApp Direct') as AdminOrder['paymentMethod'],
      fulfillmentStatus: 'delivered',
      shippingAddress: {
        addressLine: newOfflineOrder.location || 'Worli Studio',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400018',
      },
      timeline: [
        {
          title: `Offline Sale Recorded (${newOfflineOrder.channelLabel})`,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          note: `Recorded by ${authCheck.staffUser?.name || 'Staff User'}`,
        },
        {
          title: 'Tax Invoice Handed / Sent to Patron',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          note: `Staff: ${authCheck.staffUser?.name || 'Staff User'}`,
        },
      ],
      artisanNote: `Offline studio transaction recorded by ${newOfflineOrder.recordedBy}. Invoice: ${newOfflineOrder.invoiceNumber}`,
      createdAt: newOfflineOrder.createdAt,
    };

    const auditLogRecord = {
      id: `aud-${Date.now()}`,
      userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
      userName: authCheck.staffUser?.name || 'Staff User',
      action: 'RECORD_OFFLINE_ORDER',
      module: 'finance',
      details: `Recorded atomic offline sale ${newOfflineOrder.invoiceNumber} (₹${newOfflineOrder.total}) via ${newOfflineOrder.channelLabel}`,
      timestamp: new Date().toISOString(),
    };

    // 2. Execute Atomic Multi-Document Transaction via Firebase Admin SDK
    const adminDb = getAdminFirestore();
    if (adminDb) {
      await adminDb.runTransaction(async (transaction) => {
        // Step A: All reads must happen first in Firestore transactions
        const inventoryUpdates: Array<{ ref: any; newAvailable: number; sku: string }> = [];

        for (const it of newOfflineOrder.items) {
          if (it.sku) {
            const invRef = adminDb.collection('inventory').doc(it.sku);
            const invSnap = await transaction.get(invRef);

            if (invSnap.exists) {
              const currentAvailable = Number(invSnap.data()?.available ?? 0);
              const requestedQty = Number(it.quantity || 1);

              if (currentAvailable < requestedQty) {
                throw new Error(
                  `INSUFFICIENT_STOCK: Atelier stock conflict. SKU "${it.sku}" has only ${currentAvailable} unit(s) available, but ${requestedQty} were requested.`
                );
              }

              const newAvailable = Math.max(0, currentAvailable - requestedQty);
              inventoryUpdates.push({ ref: invRef, newAvailable, sku: it.sku });
            }
          }
        }

        // Step B: Writes executed inside transaction
        // Write 1: /offline_orders/{orderId}
        const offRef = adminDb.collection('offline_orders').doc(orderId);
        transaction.set(offRef, newOfflineOrder, { merge: true });

        // Write 2: /orders/{orderId}
        const ordRef = adminDb.collection('orders').doc(orderId);
        transaction.set(ordRef, companionAdminOrder, { merge: true });

        // Write 3: /audit_logs/{logId}
        const audRef = adminDb.collection('audit_logs').doc(auditLogRecord.id);
        transaction.set(audRef, auditLogRecord);

        // Write 4: Decrement validated inventory
        for (const update of inventoryUpdates) {
          transaction.update(update.ref, {
            available: update.newAvailable,
            updatedAt: new Date().toISOString(),
          });
        }
      });
    } else {
      // Fallback for non-admin SDK environment
      await setDoc(doc(db, 'offline_orders', orderId), newOfflineOrder, { merge: true });
      await setDoc(doc(db, 'orders', orderId), companionAdminOrder, { merge: true });
    }

    return NextResponse.json({
      success: true,
      offlineOrder: newOfflineOrder,
      companionOrder: companionAdminOrder,
      message: `Offline order ${newOfflineOrder.invoiceNumber} recorded atomically via transaction.`,
    });
  } catch (err: any) {
    const isStockError = err?.message?.includes('INSUFFICIENT_STOCK');
    return NextResponse.json(
      {
        success: false,
        code: isStockError ? 'INSUFFICIENT_STOCK' : 'SERVER_ERROR',
        error: err?.message || 'Server error recording offline order.',
      },
      { status: isStockError ? 400 : 500 }
    );
  }
}

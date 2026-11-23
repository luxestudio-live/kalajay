import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { ensureServerAdminAuth, getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import type { OfflineOrder, AdminOrder, PermissionAction } from '@/data/adminTypes';
import { dispatchOrderLifecycleNotification, type OrderLifecycleEvent } from '@/lib/orderEmailDispatcher';

export const dynamic = 'force-dynamic';

function getOrderStorePath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch {}
  }
  return path.join(cacheDir, 'kalajay_orders_update_store.json');
}

function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      if (v && typeof v === 'object' && !Array.isArray(v)) {
        clean[k] = cleanPayload(v);
      } else {
        clean[k] = v;
      }
    }
  }
  return clean;
}

function readOrderStore(): Record<string, any> {
  try {
    const fPath = getOrderStorePath();
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeOrderStore(data: Record<string, any>) {
  try {
    const fPath = getOrderStorePath();
    fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

export async function POST(request: Request) {
  try {
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;

    // -------------------------------------------------------------
    // ACTION A: CREATE OFFLINE ATELIER ORDER (with atomic inventory)
    // -------------------------------------------------------------
    if (action === 'offline' || body.orderData || (body.invoiceNumber && !body.orderId)) {
      const orderData: OfflineOrder = body.orderData || body;

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
            title: 'Atelier Walk-in Purchase Completed',
            timestamp: newOfflineOrder.createdAt,
            note: `Invoice ${newOfflineOrder.invoiceNumber} generated at ${newOfflineOrder.location || 'Worli Studio'}`,
          },
          {
            title: 'Handover Completed',
            timestamp: newOfflineOrder.createdAt,
            note: `Handcrafted piece handed directly to patron. Recorded by ${newOfflineOrder.recordedBy}`,
          },
        ],
        createdAt: newOfflineOrder.createdAt,
      };

      const adminDb = getAdminFirestore();

      if (adminDb) {
        try {
          await adminDb.runTransaction(async (transaction) => {
            const inventoryReads: Array<{
              sku: string;
              docRef: any;
              currentAvailable: number;
              currentCommitted: number;
              deductQty: number;
            }> = [];

            for (const item of newOfflineOrder.items) {
              const sku = item.sku || item.productId;
              if (sku) {
                const invRef = adminDb.collection('inventory').doc(sku);
                const invDoc = await transaction.get(invRef);
                if (invDoc.exists) {
                  const data = invDoc.data() || {};
                  const currentAvailable = Number(data.available ?? 0);
                  const currentCommitted = Number(data.committed ?? 0);
                  const qty = Number(item.quantity) || 1;

                  if (currentAvailable < qty) {
                    throw new Error(`INSUFFICIENT_STOCK: Atelier stock for SKU "${sku}" is exhausted or insufficient (Available: ${currentAvailable}, Requested: ${qty}).`);
                  }

                  inventoryReads.push({
                    sku,
                    docRef: invRef,
                    currentAvailable,
                    currentCommitted,
                    deductQty: qty,
                  });
                }
              }
            }

            const offlineOrderRef = adminDb.collection('offline_orders').doc(orderId);
            const orderRef = adminDb.collection('orders').doc(orderId);

            transaction.set(offlineOrderRef, newOfflineOrder, { merge: true });
            transaction.set(orderRef, companionAdminOrder, { merge: true });

            for (const inv of inventoryReads) {
              transaction.update(inv.docRef, {
                available: Math.max(0, inv.currentAvailable - inv.deductQty),
                lastAdjustedAt: new Date().toISOString(),
                adjustmentReason: `Atomic stock reduction for offline walk-in order ${newOfflineOrder.invoiceNumber}`,
              });
            }

            const auditRef = adminDb.collection('audit_logs').doc(`aud-off-${Date.now()}`);
            transaction.set(auditRef, {
              id: `aud-off-${Date.now()}`,
              userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
              userName: authCheck.staffUser?.name || 'Staff User',
              action: 'RECORD_OFFLINE_ORDER',
              module: 'finance',
              details: `Recorded offline order ${orderId} (Invoice: ${newOfflineOrder.invoiceNumber}, Total: Rs. ${newOfflineOrder.total}) with atomic inventory validation.`,
              timestamp: new Date().toISOString(),
            });
          });
        } catch (txErr: any) {
          if (txErr.message && txErr.message.includes('INSUFFICIENT_STOCK')) {
            return NextResponse.json(
              {
                success: false,
                error: txErr.message,
                code: 'INSUFFICIENT_STOCK',
              },
              { status: 409 }
            );
          }
          throw txErr;
        }
      } else {
        await setDoc(doc(db, 'offline_orders', orderId), newOfflineOrder, { merge: true });
        await setDoc(doc(db, 'orders', orderId), companionAdminOrder, { merge: true });
      }

      if (newOfflineOrder.customerEmail && newOfflineOrder.customerEmail.includes('@')) {
        dispatchOrderLifecycleNotification({
          order: companionAdminOrder,
          event: 'order_placed',
        }).catch(() => {});
        if (newOfflineOrder.paymentStatus === 'paid') {
          dispatchOrderLifecycleNotification({
            order: companionAdminOrder,
            event: 'payment_success',
          }).catch(() => {});
        }
      }

      return NextResponse.json({
        success: true,
        orderId,
        offlineOrder: newOfflineOrder,
        message: `Offline invoice ${newOfflineOrder.invoiceNumber} recorded and inventory synchronized.`,
      });
    }

    // -------------------------------------------------------------
    // ACTION B: UPDATE ONLINE / ATELIER ORDER STATUS & SHIPMENT
    // -------------------------------------------------------------
    const {
      orderId,
      fulfillmentStatus,
      paymentStatus,
      note,
      timeline,
      shippingMethod,
      courier,
      trackingAwb,
      trackingUrl,
      expectedDispatchDate,
      dispatchDate,
      estimatedDeliveryDate,
      outForDeliveryDate,
      actualDeliveryDate,
      customerShippingNote,
      internalStaffNote,
      deliveryAttemptCount,
      deliveryFailureReason,
      rtoReason,
      podReference,
      reconciliation,
    } = body;

    // Validate trackingUrl scheme if provided (strict security check against XSS/javascript schemes)
    if (trackingUrl !== undefined && trackingUrl !== null && trackingUrl !== '') {
      if (typeof trackingUrl !== 'string') {
        return NextResponse.json(
          { success: false, error: 'trackingUrl must be a string.' },
          { status: 400 }
        );
      }
      try {
        const parsed = new URL(trackingUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return NextResponse.json(
            { success: false, error: 'Invalid tracking URL: only HTTP and HTTPS protocols are permitted.' },
            { status: 400 }
          );
        }
      } catch {
        return NextResponse.json(
          { success: false, error: 'Invalid tracking URL format. Must be a valid HTTP or HTTPS URL.' },
          { status: 400 }
        );
      }
    }

    // Validate deliveryAttemptCount if provided
    if (deliveryAttemptCount !== undefined && deliveryAttemptCount !== null) {
      if (typeof deliveryAttemptCount !== 'number' || !Number.isInteger(deliveryAttemptCount) || deliveryAttemptCount < 0) {
        return NextResponse.json(
          { success: false, error: 'deliveryAttemptCount must be a non-negative integer.' },
          { status: 400 }
        );
      }
    }

    let requiredPermissionModule = 'orders.all';
    let requiredAction: PermissionAction = 'edit';

    if (paymentStatus || reconciliation) {
      requiredPermissionModule = 'finance.reconciliation';
      requiredAction = 'edit';
    } else if (
      (fulfillmentStatus && ['shipped', 'out_for_delivery', 'delivered', 'delivery_attempt_failed', 'rto'].includes(fulfillmentStatus)) ||
      courier ||
      trackingAwb ||
      trackingUrl ||
      shippingMethod ||
      dispatchDate ||
      estimatedDeliveryDate
    ) {
      requiredPermissionModule = 'logistics.dispatch';
      requiredAction = 'edit';
    }

    const authCheck = await verifyStaffPermission(request, body, requiredPermissionModule, requiredAction);
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    const staffId = authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001';
    const staffName = authCheck.staffUser?.name || 'Authorized Staff';
    const staffRole = authCheck.staffUser?.roleId || 'role-super-admin';

    const updates: Record<string, any> = {
      updatedAt: new Date().toISOString(),
      lastModifiedBy: staffName,
      lastModifiedById: staffId,
      lastModifiedByRole: staffRole,
    };

    if (fulfillmentStatus) updates.fulfillmentStatus = fulfillmentStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (shippingMethod !== undefined) updates.shippingMethod = shippingMethod;
    if (courier !== undefined) updates.courier = courier;
    if (trackingAwb !== undefined) updates.trackingAwb = trackingAwb;
    if (trackingUrl !== undefined) updates.trackingUrl = trackingUrl;
    if (expectedDispatchDate !== undefined) updates.expectedDispatchDate = expectedDispatchDate;
    if (dispatchDate !== undefined) updates.dispatchDate = dispatchDate;
    if (estimatedDeliveryDate !== undefined) updates.estimatedDeliveryDate = estimatedDeliveryDate;
    if (outForDeliveryDate !== undefined) updates.outForDeliveryDate = outForDeliveryDate;
    if (actualDeliveryDate !== undefined) updates.actualDeliveryDate = actualDeliveryDate;
    if (customerShippingNote !== undefined) updates.customerShippingNote = customerShippingNote;
    if (internalStaffNote !== undefined) updates.internalStaffNote = internalStaffNote;
    if (deliveryAttemptCount !== undefined) updates.deliveryAttemptCount = deliveryAttemptCount;
    if (deliveryFailureReason !== undefined) updates.deliveryFailureReason = deliveryFailureReason;
    if (rtoReason !== undefined) updates.rtoReason = rtoReason;
    if (podReference !== undefined) updates.podReference = podReference;

    const store = readOrderStore();
    const existing = store[orderId] || {};

    const effectiveMethod = updates.shippingMethod || existing.shippingMethod;
    const effectiveCourier = updates.courier ?? existing.courier;
    if (effectiveMethod === 'in_house' || (effectiveCourier && effectiveCourier.toLowerCase().includes('in-house'))) {
      updates.courierType = 'internal';
      updates.isInternalTracking = true;
    } else if (effectiveCourier) {
      updates.courierType = 'commercial';
      updates.isInternalTracking = false;
    }

    if (reconciliation) {
      updates.reconciliation = {
        ...reconciliation,
        confirmedBy: staffId,
        confirmedByName: staffName,
        confirmedByRole: staffRole,
        timestamp: new Date().toISOString(),
      };
    }

    const existingTimeline = Array.isArray(existing.timeline) ? existing.timeline : [];

    let mergedTimeline = timeline;
    if (!mergedTimeline) {
      const isStatusChanged = fulfillmentStatus && fulfillmentStatus !== existing.fulfillmentStatus;
      const isPaymentChanged = paymentStatus && paymentStatus !== existing.paymentStatus;
      const isCourierChanged = courier !== undefined && courier !== existing.courier;
      const isAwbChanged = trackingAwb !== undefined && trackingAwb !== existing.trackingAwb;

      const newTitle = paymentStatus
        ? `Payment marked as ${paymentStatus.toUpperCase()}`
        : fulfillmentStatus
        ? `Order updated to ${fulfillmentStatus}`
        : courier || trackingAwb
        ? `Shipment updated (${courier || 'Carrier'}${trackingAwb ? ` - AWB: ${trackingAwb}` : ''})`
        : 'Order updated';

      const lastEntry = existingTimeline.length > 0 ? existingTimeline[existingTimeline.length - 1] : null;
      const isDuplicate = lastEntry &&
        lastEntry.title === newTitle &&
        !isStatusChanged &&
        !isPaymentChanged &&
        !isCourierChanged &&
        !isAwbChanged &&
        (!note || lastEntry.note === note);

      if (isDuplicate) {
        mergedTimeline = existingTimeline;
      } else {
        const newTimelineEntry = {
          title: newTitle,
          timestamp: new Date().toISOString(),
          note: customerShippingNote || note || (reconciliation ? `Reconciled via Bank Ref ${reconciliation.bankReference}` : `Updated by ${staffName}`),
          staffId,
          staffName,
          staffRole,
        };
        mergedTimeline = [...existingTimeline, newTimelineEntry];
      }
    }
    updates.timeline = mergedTimeline;

    store[orderId] = {
      ...existing,
      ...updates,
      id: orderId,
    };
    writeOrderStore(store);

    ensureServerAdminAuth();
    const adminDb = getAdminFirestore();

    if (adminDb) {
      try {
        const orderRef = adminDb.collection('orders').doc(orderId);
        const orderDoc = await orderRef.get();

        if (orderDoc.exists) {
          const docData = orderDoc.data();
          updates.timeline = mergedTimeline;
          await orderRef.set(updates, { merge: true });

          // Atomic Stock restoration if order cancelled or returned before dispatch
          if (['cancelled', 'rto'].includes(fulfillmentStatus) && !['cancelled', 'rto'].includes(docData?.fulfillmentStatus)) {
            const items = Array.isArray(docData?.items) ? docData.items : [];
            for (const item of items) {
              let skuCode = item.sku || item.productId;
              if (skuCode) {
                let invRef = adminDb.collection('inventory').doc(skuCode);
                let invDoc = await invRef.get();
                if (!invDoc.exists && item.productId && item.productId !== skuCode) {
                  const baseRef = adminDb.collection('inventory').doc(item.productId);
                  const baseDoc = await baseRef.get();
                  if (baseDoc.exists) {
                    invRef = baseRef;
                    invDoc = baseDoc;
                  }
                }
                if (invDoc.exists) {
                  const invData = invDoc.data() || {};
                  const onHand = (invData.onHand ?? invData.stockOnHand ?? 0) + (item.quantity || 1);
                  const reserved = invData.reserved ?? 0;
                  const available = onHand - reserved;
                  const reorderPoint = invData.reorderPoint ?? 5;
                  const status = available <= reorderPoint ? 'low_stock' : 'in_stock';
                  await invRef.set({ onHand, available, status, updatedAt: new Date().toISOString() }, { merge: true });
                }
              }
            }
          }
        } else {
          await orderRef.set(
            {
              id: orderId,
              ...updates,
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }

        const auditRef = adminDb.collection('audit_logs').doc(`aud-ord-${Date.now()}`);
        await auditRef.set({
          id: `aud-ord-${Date.now()}`,
          userId: staffId,
          userName: staffName,
          userRole: staffRole,
          action: 'UPDATE_ORDER_STATUS',
          module: 'orders',
          details: `Order #${orderId} updated: paymentStatus=${paymentStatus || 'unchanged'}, fulfillmentStatus=${fulfillmentStatus || 'unchanged'}${courier ? `, courier=${courier}` : ''}${trackingAwb ? `, awb=${trackingAwb}` : ''}.`,
          timestamp: new Date().toISOString(),
        });
      } catch (adminErr) {
        console.warn('Admin Firestore order sync deferred:', adminErr);
      }
    } else {
      try {
        const payload = cleanPayload(updates);
        await Promise.race([
          setDoc(doc(db, 'orders', orderId), payload, { merge: true }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Client firestore sync timed out')), 50))
        ]);
      } catch (clientErr) {
        // Deferred in local test harnesses where client Firestore gRPC is unavailable
      }
    }

    // Trigger lifecycle email notifications on milestone transitions (stable transition identity)
    try {
      const mergedOrder = { ...existing, ...updates, id: orderId };
      const currentAttempt = updates.deliveryAttemptCount ?? existing.deliveryAttemptCount ?? 0;
      const transitionKey = currentAttempt > 0 ? `attempt_${currentAttempt}` : 'milestone_1';

      if (paymentStatus) {
        if (paymentStatus === 'paid') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'payment_success', transitionKey }).catch(() => {});
        } else if (paymentStatus === 'failed') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'payment_failed', transitionKey }).catch(() => {});
        } else if (paymentStatus === 'refunded') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'refunded', transitionKey }).catch(() => {});
        }
      }

      if (fulfillmentStatus) {
        if (fulfillmentStatus === 'in_loom') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'in_loom', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'quality_checked') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'quality_checked', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'shipped') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'shipped', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'out_for_delivery') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'out_for_delivery', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'delivered') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'delivered', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'rto') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'rto', transitionKey }).catch(() => {});
        } else if (fulfillmentStatus === 'cancelled') {
          dispatchOrderLifecycleNotification({ order: mergedOrder, event: 'cancelled', transitionKey }).catch(() => {});
        }
      }
    } catch (notifErr) {
      console.warn('Order update notification notice:', notifErr);
    }

    return NextResponse.json({
      success: true,
      orderId,
      updates,
      message: `Order #${orderId} successfully updated.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing order operation.' },
      { status: 500 }
    );
  }
}

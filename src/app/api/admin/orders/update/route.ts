import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { ensureServerAdminAuth } from '@/lib/serverFirebaseAdmin';
import { PermissionAction } from '@/data/adminTypes';

interface UpdateOrderPayload {
  orderId: string;
  fulfillmentStatus?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  note?: string;
  timeline?: any[];
  trackingAwb?: string;
  courier?: string;
  staffId?: string;
  requestingStaffId?: string;
  staffRole?: string;
  staffName?: string;
  currentPaymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  reconciliation?: {
    confirmedBy: string;
    confirmedByName: string;
    confirmedByRole: string;
    bankReference: string;
    justification: string;
    source: string;
    timestamp: string;
  };
}

// Server-side durable order cache path
function getOrderStorePath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  return path.join(cacheDir, 'kalajay_orders_update_store.json');
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
    const body: UpdateOrderPayload = await request.json();
    const {
      orderId,
      fulfillmentStatus,
      paymentStatus,
      note,
      trackingAwb,
      courier,
      currentPaymentStatus,
      reconciliation,
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing mandatory orderId.' }, { status: 400 });
    }

    // 1. Authorize based on operation-specific RBAC permission:
    // - Payment confirmation requires 'orders.all' -> 'approve'
    // - Refund authorization requires 'orders.all' -> 'refund'
    // - Fulfillment & dispatch updates require 'orders.all' -> 'edit'
    let requiredAction: PermissionAction = 'edit';
    if (paymentStatus === 'paid') {
      requiredAction = 'approve';
    } else if (paymentStatus === 'refunded') {
      requiredAction = 'refund';
    }

    const authCheck = await verifyStaffPermission(request, body, 'orders.all', requiredAction);
    if (!authCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authCheck.error,
          code: authCheck.code,
        },
        { status: authCheck.status }
      );
    }

    const orderStore = readOrderStore();
    const cachedOrder = orderStore[orderId] || {};

    // 2. Payment Verification Access Control & Audit
    if (paymentStatus === 'paid') {
      if (!reconciliation?.bankReference?.trim() || !reconciliation?.justification?.trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'Reconciliation Error: Bank Reference (UTR) and operational justification are mandatory for manual payment verification.',
          },
          { status: 400 }
        );
      }
    }

    // 3. Fulfillment Safeguard: Never fulfill unpaid orders
    const effectivePayment = paymentStatus || currentPaymentStatus || cachedOrder.paymentStatus || 'pending';
    if (effectivePayment !== 'paid' && fulfillmentStatus && fulfillmentStatus !== 'unfulfilled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Fulfillment Safeguard: Unpaid orders cannot enter production, packaging, or dispatch stages. Confirm payment first.',
        },
        { status: 400 }
      );
    }

    // 4. Persist Order Updates into Durable Store & Firestore
    const updatedOrderRecord = {
      ...cachedOrder,
      id: orderId,
      paymentStatus: paymentStatus || cachedOrder.paymentStatus || 'pending',
      fulfillmentStatus: fulfillmentStatus || cachedOrder.fulfillmentStatus || 'unfulfilled',
      trackingAwb: trackingAwb || cachedOrder.trackingAwb,
      courier: courier || cachedOrder.courier,
      reconciliation: reconciliation || cachedOrder.reconciliation,
      updatedAt: new Date().toISOString(),
      updatedBy: authCheck.staffUser?.staffId || authCheck.staffUser?.id,
    };

    if (note) {
      updatedOrderRecord.timeline = [
        ...(cachedOrder.timeline || []),
        {
          title: note,
          timestamp: new Date().toISOString(),
          by: authCheck.staffUser?.name || 'Staff User',
          staffId: authCheck.staffUser?.staffId || authCheck.staffUser?.id,
        },
      ];
    }

    orderStore[orderId] = updatedOrderRecord;
    writeOrderStore(orderStore);

    // Sync to Cloud Firestore (/orders/{orderId})
    try {
      await ensureServerAdminAuth();
      const orderRef = doc(db, 'orders', orderId);
      const fsSnap = await getDoc(orderRef);
      if (fsSnap.exists()) {
        await setDoc(orderRef, updatedOrderRecord, { merge: true });
      } else {
        await setDoc(orderRef, updatedOrderRecord, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore order sync warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      order: updatedOrderRecord,
      message: `Order ${orderId} successfully updated.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error updating order.' },
      { status: 500 }
    );
  }
}

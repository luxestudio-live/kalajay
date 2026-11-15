import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface UpdateOrderPayload {
  orderId: string;
  fulfillmentStatus?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  note?: string;
  timeline?: any[];
  trackingAwb?: string;
  courier?: string;
  staffId?: string;
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
      staffId,
      staffRole,
      currentPaymentStatus,
      reconciliation,
    } = body;

    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Missing mandatory orderId.' }, { status: 400 });
    }

    const orderStore = readOrderStore();
    const cachedOrder = orderStore[orderId] || {};

    // 1. Payment Verification Access Control (Requirement 5)
    if (paymentStatus === 'paid') {
      const isAuthorizedRole =
        staffRole === 'super_admin' ||
        staffRole === 'store_manager' ||
        staffId === 'KJ-ADM-001' ||
        staffId === 'KJ-ADM-002';

      if (!isAuthorizedRole) {
        return NextResponse.json(
          {
            success: false,
            error: 'Access Denied: Only Super Administrators and Store Managers are authorized to verify and reconcile payments.',
          },
          { status: 403 }
        );
      }

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

    // 2. Fulfillment Safeguard: Never fulfill unpaid orders (Requirement 5 & 7)
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

    // 3. Persist Order Updates into Durable Store & Firestore
    const updatedOrderRecord = {
      ...cachedOrder,
      id: orderId,
      paymentStatus: paymentStatus || cachedOrder.paymentStatus || 'pending',
      fulfillmentStatus: fulfillmentStatus || cachedOrder.fulfillmentStatus || 'unfulfilled',
      trackingAwb: trackingAwb || cachedOrder.trackingAwb,
      courier: courier || cachedOrder.courier,
      reconciliation: reconciliation || cachedOrder.reconciliation,
      updatedAt: new Date().toISOString(),
    };
    orderStore[orderId] = updatedOrderRecord;
    writeOrderStore(orderStore);

    if (db && db.type) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await setDoc(
          orderRef,
          {
            ...(fulfillmentStatus ? { fulfillmentStatus } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(trackingAwb ? { trackingAwb } : {}),
            ...(courier ? { courier } : {}),
            ...(reconciliation ? { paymentReconciliation: reconciliation } : {}),
            updatedAt: new Date().toISOString(),
            updatedAtServer: serverTimestamp(),
          },
          { merge: true }
        );

        if (paymentStatus === 'paid' && reconciliation) {
          const logId = `AUDIT-PAY-${Date.now()}`;
          await setDoc(doc(db, 'audit_logs', logId), {
            id: logId,
            action: 'ORDER_PAYMENT_MANUAL_RECONCILIATION',
            category: 'orders',
            orderId,
            confirmedBy: reconciliation.confirmedBy,
            confirmedByName: reconciliation.confirmedByName,
            confirmedByRole: reconciliation.confirmedByRole,
            bankReference: reconciliation.bankReference,
            justification: reconciliation.justification,
            source: reconciliation.source,
            timestamp: new Date().toISOString(),
          }).catch(() => {});
        }
      } catch (firestoreErr) {
        console.warn('Firestore live write deferred pending rules console deployment:', firestoreErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      fulfillmentStatus: updatedOrderRecord.fulfillmentStatus,
      paymentStatus: updatedOrderRecord.paymentStatus,
      trackingAwb: updatedOrderRecord.trackingAwb,
      courier: updatedOrderRecord.courier,
    });
  } catch (err: any) {
    console.error('Admin order update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

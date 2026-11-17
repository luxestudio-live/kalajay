import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sku, id } = body;
    const targetSku = sku || id;

    if (!targetSku) {
      return NextResponse.json(
        { success: false, error: 'Mandatory field missing: sku is required.' },
        { status: 400 }
      );
    }

    // 1. Authorize: Deleting inventory SKUs requires inventory.all -> delete
    const authCheck = await verifyStaffPermission(request, body, 'inventory.all', 'delete');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    const adminDb = getAdminFirestore();

    // 2. Active Order Commitment Guard:
    // Prevent deletion of inventory that is committed to active unfulfilled or in-loom orders
    if (adminDb) {
      const activeOrdersSnap = await adminDb
        .collection('orders')
        .where('fulfillmentStatus', 'in', ['unfulfilled', 'in_loom', 'quality_checked'])
        .get();

      for (const orderDoc of activeOrdersSnap.docs) {
        const orderData = orderDoc.data();
        const items = orderData.items || [];
        const hasCommittedItem = items.some(
          (it: any) => it.sku === targetSku || it.productId === targetSku
        );
        if (hasCommittedItem) {
          return NextResponse.json(
            {
              success: false,
              code: 'SKU_COMMITTED_TO_ACTIVE_ORDERS',
              error: `Operational Guardrail: Cannot delete or archive SKU "${targetSku}". It is currently committed to active pending order #${orderDoc.id} (${orderData.customerName || 'Patron'}). Fulfill or cancel the order first.`,
            },
            { status: 400 }
          );
        }
      }

      // Safe to delete / archive:
      const invRef = adminDb.collection('inventory').doc(targetSku);
      await invRef.delete();

      // Log audit trail
      const auditLogRecord = {
        id: `aud-${Date.now()}`,
        userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
        userName: authCheck.staffUser?.name || 'Staff User',
        action: 'DELETE_INVENTORY_SKU',
        module: 'inventory',
        details: `Deleted inventory SKU ${targetSku} after verifying 0 committed units in active order queues.`,
        timestamp: new Date().toISOString(),
      };
      await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
    } else {
      await deleteDoc(doc(db, 'inventory', targetSku));
    }

    return NextResponse.json({
      success: true,
      sku: targetSku,
      message: `Inventory SKU ${targetSku} successfully removed.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error deleting inventory SKU.' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { WorkOrder } from '@/data/adminTypes';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { workOrder, customRequestId, stage, qcPassed } = body;

    // 1. Authorize: Work order creation/updates require production.work_orders -> edit/create
    const authCheck = await verifyStaffPermission(request, body, 'production.work_orders', 'edit');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    const adminDb = getAdminFirestore();

    // SCENARIO A: Atomic Bespoke Order Scheduling (Updates custom enquiry AND creates work order)
    if (customRequestId && workOrder) {
      const woId = workOrder.id || `WO-BESPOKE-${Date.now().toString().slice(-6)}`;
      const newWorkOrder: WorkOrder = {
        ...workOrder,
        id: woId,
        stage: workOrder.stage || 'loom_queued',
        qcPassed: workOrder.qcPassed || false,
      };

      const auditRecord = {
        id: `aud-${Date.now()}`,
        userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
        userName: authCheck.staffUser?.name || 'Staff User',
        action: 'SCHEDULE_BESPOKE_LOOM_RUN',
        module: 'production',
        details: `Scheduled bespoke loom run ${woId} for Custom Request #${customRequestId} (${newWorkOrder.artisanName}, ${newWorkOrder.loomId})`,
        timestamp: new Date().toISOString(),
      };

      if (adminDb) {
        const batch = adminDb.batch();

        // 1. Set /work_orders/{woId}
        const woRef = adminDb.collection('work_orders').doc(woId);
        batch.set(woRef, newWorkOrder, { merge: true });

        // 2. Atomically update /custom_enquiries/{customRequestId}
        const enqRef = adminDb.collection('custom_enquiries').doc(customRequestId);
        batch.set(enqRef, {
          status: 'loom_scheduled',
          workOrderId: woId,
          scheduledAt: new Date().toISOString(),
          scheduledBy: authCheck.staffUser?.name || 'Staff User',
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        // 3. Set /audit_logs
        const audRef = adminDb.collection('audit_logs').doc(auditRecord.id);
        batch.set(audRef, auditRecord);

        await batch.commit();
      } else {
        await setDoc(doc(db, 'work_orders', woId), newWorkOrder, { merge: true });
        await setDoc(doc(db, 'custom_enquiries', customRequestId), {
          status: 'loom_scheduled',
          workOrderId: woId,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return NextResponse.json({
        success: true,
        workOrder: newWorkOrder,
        customRequestId,
        message: `Bespoke loom run ${woId} scheduled atomically.`,
      });
    }

    // SCENARIO B: Stage Transition or General Work Order Creation
    if (workOrder) {
      const woId = workOrder.id || `WO-${Date.now().toString().slice(-6)}`;
      const updatedWo: WorkOrder = {
        ...workOrder,
        id: woId,
        stage: stage || workOrder.stage || 'loom_queued',
        qcPassed: qcPassed !== undefined ? qcPassed : workOrder.qcPassed,
        actualDate: (stage || workOrder.stage) === 'wax_sealed' ? new Date().toISOString().split('T')[0] : workOrder.actualDate,
      };

      const auditRecord = {
        id: `aud-${Date.now()}`,
        userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
        userName: authCheck.staffUser?.name || 'Staff User',
        action: stage ? 'PRODUCTION_STAGE_TRANSITION' : 'CREATE_WORK_ORDER',
        module: 'production',
        details: stage
          ? `Work order ${woId} transitioned to ${stage} (QC Passed: ${updatedWo.qcPassed})`
          : `Issued new work order ${woId} for ${updatedWo.productName}`,
        timestamp: new Date().toISOString(),
      };

      if (adminDb) {
        const batch = adminDb.batch();
        batch.set(adminDb.collection('work_orders').doc(woId), updatedWo, { merge: true });
        batch.set(adminDb.collection('audit_logs').doc(auditRecord.id), auditRecord);
        await batch.commit();
      } else {
        await setDoc(doc(db, 'work_orders', woId), updatedWo, { merge: true });
      }

      return NextResponse.json({
        success: true,
        workOrder: updatedWo,
        message: `Work order ${woId} successfully updated.`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid payload: workOrder data required.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing work order.' },
      { status: 500 }
    );
  }
}

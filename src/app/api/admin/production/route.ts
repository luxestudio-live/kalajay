import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { WorkOrder } from '@/data/adminTypes';

export const dynamic = 'force-dynamic';

// ==========================================
// GET HANDLER: Fetch Production Stages
// ==========================================
export async function GET() {
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb.collection('cms').doc('production_stages').get();
      if (snap.exists && snap.data()?.stages) {
        return NextResponse.json({ success: true, stages: snap.data()?.stages });
      }
    } else {
      const snap = await getDoc(doc(db, 'cms', 'production_stages'));
      if (snap.exists() && snap.data()?.stages) {
        return NextResponse.json({ success: true, stages: snap.data()?.stages });
      }
    }

    return NextResponse.json({ success: true, stages: null });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error fetching production stages.' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST HANDLER: Work Orders OR Stages
// ==========================================
export async function POST(request: Request) {
  try {
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;

    // ------------------------------------------
    // ACTION A: Update Production Stages
    // ------------------------------------------
    if (action === 'stages' || (Array.isArray(body.stages) && !body.workOrder)) {
      const { stages } = body;

      const authCheck = await verifyStaffPermission(request, body, 'production.work_orders', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      if (!Array.isArray(stages) || stages.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Invalid payload: stages must be a non-empty array.' },
          { status: 400 }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('cms').doc('production_stages').set(
          {
            stages,
            updatedAt: new Date().toISOString(),
            updatedBy: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          },
          { merge: true }
        );
      } else {
        await setDoc(
          doc(db, 'cms', 'production_stages'),
          {
            stages,
            updatedAt: new Date().toISOString(),
            updatedBy: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          },
          { merge: true }
        );
      }

      return NextResponse.json({
        success: true,
        stages,
        message: 'Production stages updated successfully.',
      });
    }

    // ------------------------------------------
    // ACTION B: Work Orders (Create / Advance / Update)
    // ------------------------------------------
    const { workOrder, customRequestId, stage, qcPassed, workOrderId } = body;

    const authCheck = await verifyStaffPermission(request, body, 'production.work_orders', 'edit');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    const adminDb = getAdminFirestore();

    // Scenario 1: Atomic Bespoke Order Scheduling
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
        const woRef = adminDb.collection('work_orders').doc(woId);
        batch.set(woRef, newWorkOrder, { merge: true });

        const customReqUpdates = {
          status: 'production_scheduled',
          workOrderId: woId,
          artisanAssigned: newWorkOrder.artisanName,
          targetCompletion: (newWorkOrder as any).targetCompletion || newWorkOrder.targetDate,
          updatedAt: new Date().toISOString(),
        };

        // Canonical collection: custom_enquiries (matching firestore.rules & storefront)
        const reqRef = adminDb.collection('custom_enquiries').doc(String(customRequestId));
        batch.set(reqRef, customReqUpdates, { merge: true });

        // Compatibility mirror write to custom_requests
        const legacyRef = adminDb.collection('custom_requests').doc(String(customRequestId));
        batch.set(legacyRef, customReqUpdates, { merge: true });

        const auditRef = adminDb.collection('audit_logs').doc(auditRecord.id);
        batch.set(auditRef, auditRecord);

        await batch.commit();
      } else {
        const customReqUpdates = {
          status: 'production_scheduled',
          workOrderId: woId,
          artisanAssigned: newWorkOrder.artisanName,
          targetCompletion: (newWorkOrder as any).targetCompletion || newWorkOrder.targetDate,
          updatedAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'work_orders', woId), newWorkOrder, { merge: true });
        await setDoc(doc(db, 'custom_enquiries', String(customRequestId)), customReqUpdates, { merge: true });
        try {
          await setDoc(doc(db, 'custom_requests', String(customRequestId)), customReqUpdates, { merge: true });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        workOrderId: woId,
        message: `Bespoke work order ${woId} scheduled successfully.`,
      });
    }

    // Scenario 2: Advancing Work Order Stage / QC
    const targetWoId = workOrderId || workOrder?.id;
    if (targetWoId && (stage || qcPassed !== undefined)) {
      const updates: any = { updatedAt: new Date().toISOString() };
      if (stage) updates.stage = stage;
      if (qcPassed !== undefined) updates.qcPassed = qcPassed;

      if (adminDb) {
        await adminDb.collection('work_orders').doc(targetWoId).set(updates, { merge: true });
      } else {
        await setDoc(doc(db, 'work_orders', targetWoId), updates, { merge: true });
      }

      return NextResponse.json({
        success: true,
        workOrderId: targetWoId,
        updates,
        message: `Work order ${targetWoId} updated.`,
      });
    }

    // Scenario 3: Standard Work Order creation
    if (workOrder) {
      const woId = workOrder.id || `WO-${Date.now().toString().slice(-6)}`;
      const savedWo = { ...workOrder, id: woId };

      if (adminDb) {
        await adminDb.collection('work_orders').doc(woId).set(savedWo, { merge: true });
      } else {
        await setDoc(doc(db, 'work_orders', woId), savedWo, { merge: true });
      }

      return NextResponse.json({
        success: true,
        workOrderId: woId,
        message: `Work order ${woId} created.`,
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid production payload.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing production request.' },
      { status: 500 }
    );
  }
}

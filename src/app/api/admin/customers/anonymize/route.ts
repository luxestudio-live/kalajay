import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patronId } = body;

    if (!patronId) {
      return NextResponse.json(
        { success: false, error: 'Mandatory field missing: patronId is required.' },
        { status: 400 }
      );
    }

    // 1. Authorize: DPDP customer erasure requires customers.all -> delete
    const authCheck = await verifyStaffPermission(request, body, 'customers.all', 'delete');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    const adminDb = getAdminFirestore();

    // 2. Active Shipment Guard:
    // Ensure customer has no active in-transit orders before fulfilling right to erasure
    if (adminDb) {
      const activeOrdersSnap = await adminDb
        .collection('orders')
        .where('userId', '==', patronId)
        .where('fulfillmentStatus', 'in', ['in_loom', 'quality_checked', 'shipped'])
        .get();

      if (!activeOrdersSnap.empty) {
        return NextResponse.json(
          {
            success: false,
            code: 'IN_TRANSIT_ORDERS_EXIST',
            error: `DPDP Guardrail: Cannot anonymize patron ${patronId} while order #${activeOrdersSnap.docs[0].id} is in transit or loom production. Delivery must complete before personal data can be purged.`,
          },
          { status: 400 }
        );
      }

      // 3. Execute DPDP Data Erasure in Firestore /users/{patronId}
      const userRef = adminDb.collection('users').doc(patronId);
      const userSnap = await userRef.get();
      if (userSnap.exists) {
        await userRef.update({
          name: `Anonymized Patron (DPDP Ref #${patronId})`,
          email: 'redacted@privacy.kalajay.in',
          phone: '+91 XXXXX XXXXX',
          addresses: [],
          deviceTokens: [],
          marketingConsent: false,
          dpdpErasureStatus: 'COMPLETED',
          dpdpErasureDate: new Date().toISOString(),
          dpdpErasureAuthorizedBy: authCheck.staffUser?.staffId || authCheck.staffUser?.id,
          updatedAt: new Date().toISOString(),
        });
      }

      // 4. Log Statutory Compliance Audit Trail (/audit_logs/{id})
      const auditLogRecord = {
        id: `aud-dpdp-${Date.now()}`,
        userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
        userName: authCheck.staffUser?.name || 'Staff User',
        action: 'DPDP_RIGHT_TO_BE_FORGOTTEN_EXECUTED',
        module: 'customers',
        details: `Personal identifiers for patron ${patronId} purged under Digital Personal Data Protection Act 2023. Statutory tax transaction records retained per Sec 36 CGST Act 2017.`,
        timestamp: new Date().toISOString(),
      };
      await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
    } else {
      const userRef = doc(db, 'users', patronId);
      await updateDoc(userRef, {
        name: `Anonymized Patron (DPDP Ref #${patronId})`,
        email: 'redacted@privacy.kalajay.in',
        phone: '+91 XXXXX XXXXX',
        addresses: [],
        dpdpErasureStatus: 'COMPLETED',
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      patronId,
      message: `Personal identifiers for patron ${patronId} successfully anonymized per DPDP Act 2023.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing DPDP erasure request.' },
      { status: 500 }
    );
  }
}

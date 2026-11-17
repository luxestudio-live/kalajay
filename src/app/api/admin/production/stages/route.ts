import { NextResponse } from 'next/server';
import { verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { stages } = body;

    // Authorize: Custom stages require production.work_orders -> edit
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

    const payload = {
      stages,
      updatedAt: new Date().toISOString(),
      updatedBy: authCheck.staffUser?.name || 'Staff User',
    };

    const adminDb = getAdminFirestore();
    if (adminDb) {
      await adminDb.collection('cms').doc('production_stages').set(payload, { merge: true });
    } else {
      await setDoc(doc(db, 'cms', 'production_stages'), payload, { merge: true });
    }

    return NextResponse.json({
      success: true,
      stages,
      message: 'Production pipeline stages updated and shared across atelier team.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error updating production stages.' },
      { status: 500 }
    );
  }
}

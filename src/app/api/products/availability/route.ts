import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get('sku')?.trim();
    const skusParam = searchParams.get('skus')?.trim();

    const targetSkus: string[] = [];
    if (sku) targetSkus.push(sku);
    if (skusParam) {
      skusParam.split(',').forEach((s) => {
        const clean = s.trim();
        if (clean && !targetSkus.includes(clean)) targetSkus.push(clean);
      });
    }

    if (targetSkus.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Mandatory parameter missing: sku or skus is required.' },
        { status: 400 }
      );
    }

    const adminDb = getAdminFirestore();
    const availabilityMap: Record<
      string,
      { sku: string; inStock: boolean; available: number; status: string }
    > = {};

    if (adminDb) {
      for (const targetSku of targetSkus) {
        try {
          const invSnap = await adminDb.collection('inventory').doc(targetSku).get();
          if (invSnap.exists) {
            const data = invSnap.data()!;
            // Never expose raw material inventory to public consumers
            if (data.type === 'raw_material') continue;

            const available = Number(
              data.available !== undefined
                ? data.available
                : data.stockOnHand !== undefined
                ? data.stockOnHand
                : (data.onHand ?? 15)
            );

            availabilityMap[targetSku] = {
              sku: targetSku,
              inStock: available > 0,
              available: Math.max(0, available),
              status: data.status || (available > 0 ? 'in_stock' : 'out_of_stock'),
            };
          }
        } catch (e) {
          console.warn(`Error reading inventory for ${targetSku}:`, e);
        }
      }
    } else if (db && db.type) {
      for (const targetSku of targetSkus) {
        try {
          const invSnap = await getDoc(doc(db, 'inventory', targetSku));
          if (invSnap.exists()) {
            const data = invSnap.data();
            if (data.type === 'raw_material') continue;

            const available = Number(
              data.available !== undefined
                ? data.available
                : data.stockOnHand !== undefined
                ? data.stockOnHand
                : (data.onHand ?? 15)
            );

            availabilityMap[targetSku] = {
              sku: targetSku,
              inStock: available > 0,
              available: Math.max(0, available),
              status: data.status || (available > 0 ? 'in_stock' : 'out_of_stock'),
            };
          }
        } catch (e) {
          console.warn(`Fallback error reading inventory for ${targetSku}:`, e);
        }
      }
    }

    if (sku && !skusParam) {
      const single = availabilityMap[sku];
      if (!single) {
        return NextResponse.json(
          {
            success: true,
            sku,
            inStock: true, // Graceful catalogue fallback
            available: 15,
            status: 'in_stock',
            isFallback: true,
          },
          { status: 200 }
        );
      }
      return NextResponse.json({ success: true, ...single });
    }

    return NextResponse.json({
      success: true,
      items: availabilityMap,
    });
  } catch (error: any) {
    console.error('Error fetching inventory availability projection:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error resolving availability.' },
      { status: 500 }
    );
  }
}

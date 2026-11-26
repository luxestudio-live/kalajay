import { NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';
import {
  Address,
  validateAddress,
  normalizeAddress,
  areAddressesEqual,
} from '@/lib/checkout/addressModel';

export const dynamic = 'force-dynamic';

async function authenticatePatron(request: Request): Promise<{ uid?: string; email?: string; error?: string; status?: number }> {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return { error: 'Authentication Required: No valid session token presented.', status: 401 };
  }
  const token = authHeader.slice(7).trim();
  const verifyRes = await verifyFirebaseIdToken(token);
  if (!verifyRes.valid || !verifyRes.uid) {
    return { error: 'Authentication Rejected: Session token is invalid or expired.', status: 401 };
  }
  return { uid: verifyRes.uid, email: verifyRes.email };
}

/**
 * GET: Retrieve all saved addresses for the authenticated patron.
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticatePatron(request);
    if (!auth.uid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const adminDb = getAdminFirestore();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const userDoc = await adminDb.collection('users').doc(auth.uid).get();
    const data = userDoc.data() || {};
    const rawAddresses = Array.isArray(data.addresses) ? data.addresses : [];
    const addresses = rawAddresses.map((a: any) => normalizeAddress(a));

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to retrieve patron addresses.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Add, update, delete, or set default delivery destination.
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticatePatron(request);
    if (!auth.uid) {
      return NextResponse.json({ success: false, error: auth.error }, { status: auth.status || 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { action = 'add', address, addressId } = body;

    const adminDb = getAdminFirestore();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: 'Database service unavailable.' }, { status: 503 });
    }

    const userDocRef = adminDb.collection('users').doc(auth.uid);
    const userSnap = await userDocRef.get();
    const userData = userSnap.data() || {};
    let existingAddresses: Address[] = (Array.isArray(userData.addresses) ? userData.addresses : []).map((a: any) =>
      normalizeAddress(a)
    );

    // --- ACTION: ADD ADDRESS ---
    if (action === 'add') {
      const validation = validateAddress(address);
      if (!validation.valid) {
        return NextResponse.json(
          { success: false, error: validation.errors.join(' ') },
          { status: 400 }
        );
      }

      // Check for identical existing address to prevent duplicates
      const duplicateIndex = existingAddresses.findIndex(existing => areAddressesEqual(existing, address));
      if (duplicateIndex >= 0) {
        const existing = existingAddresses[duplicateIndex];
        // If caller requested it as default, update default status
        if (address.isDefault && !existing.isDefault) {
          existingAddresses = existingAddresses.map((a, i) => ({
            ...a,
            isDefault: i === duplicateIndex,
          }));
          await userDocRef.set({ id: auth.uid, addresses: existingAddresses, updatedAt: new Date().toISOString() }, { merge: true });
        }
        return NextResponse.json({
          success: true,
          message: 'Address already exists in your saved destinations.',
          address: existingAddresses[duplicateIndex],
          addresses: existingAddresses,
          isDuplicate: true,
        });
      }

      const shouldBeDefault = address.isDefault || existingAddresses.length === 0;
      const newAddress = normalizeAddress(
        {
          ...address,
          isDefault: shouldBeDefault,
        },
        address.id
      );

      let updatedAddresses: Address[];
      if (shouldBeDefault) {
        updatedAddresses = existingAddresses.map(a => ({ ...a, isDefault: false }));
        updatedAddresses.push(newAddress);
      } else {
        updatedAddresses = [...existingAddresses, newAddress];
      }

      await userDocRef.set({ id: auth.uid, addresses: updatedAddresses, updatedAt: new Date().toISOString() }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Delivery destination saved to profile.',
        address: newAddress,
        addresses: updatedAddresses,
      });
    }

    // --- ACTION: UPDATE ADDRESS ---
    if (action === 'update') {
      if (!address || !address.id) {
        return NextResponse.json({ success: false, error: 'Valid address ID is required for update.' }, { status: 400 });
      }

      const validation = validateAddress(address);
      if (!validation.valid) {
        return NextResponse.json({ success: false, error: validation.errors.join(' ') }, { status: 400 });
      }

      const targetIndex = existingAddresses.findIndex(a => a.id === address.id);
      if (targetIndex < 0) {
        return NextResponse.json({ success: false, error: 'Address not found in patron records.' }, { status: 404 });
      }

      const shouldBeDefault = Boolean(address.isDefault);
      let updatedAddresses = existingAddresses.map((a, i) => {
        if (i === targetIndex) {
          return normalizeAddress({ ...a, ...address, isDefault: shouldBeDefault }, a.id);
        }
        return shouldBeDefault ? { ...a, isDefault: false } : a;
      });

      await userDocRef.set({ id: auth.uid, addresses: updatedAddresses, updatedAt: new Date().toISOString() }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Address updated successfully.',
        addresses: updatedAddresses,
      });
    }

    // --- ACTION: DELETE ADDRESS ---
    if (action === 'delete') {
      const targetId = addressId || address?.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'Address ID is required for deletion.' }, { status: 400 });
      }

      const targetIndex = existingAddresses.findIndex(a => a.id === targetId);
      if (targetIndex < 0) {
        return NextResponse.json({ success: false, error: 'Address not found in patron records.' }, { status: 404 });
      }

      const wasDefault = existingAddresses[targetIndex].isDefault;
      let updatedAddresses = existingAddresses.filter(a => a.id !== targetId);

      // If we deleted the default and addresses still remain, make the first one default
      if (wasDefault && updatedAddresses.length > 0) {
        updatedAddresses[0].isDefault = true;
      }

      await userDocRef.set({ id: auth.uid, addresses: updatedAddresses, updatedAt: new Date().toISOString() }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Address removed from your profile.',
        addresses: updatedAddresses,
      });
    }

    // --- ACTION: SET DEFAULT ---
    if (action === 'setDefault') {
      const targetId = addressId || address?.id;
      if (!targetId) {
        return NextResponse.json({ success: false, error: 'Address ID is required to set default.' }, { status: 400 });
      }

      const exists = existingAddresses.some(a => a.id === targetId);
      if (!exists) {
        return NextResponse.json({ success: false, error: 'Address not found in patron records.' }, { status: 404 });
      }

      const updatedAddresses = existingAddresses.map(a => ({
        ...a,
        isDefault: a.id === targetId,
      }));

      await userDocRef.set({ id: auth.uid, addresses: updatedAddresses, updatedAt: new Date().toISOString() }, { merge: true });

      return NextResponse.json({
        success: true,
        message: 'Default shipping destination updated.',
        addresses: updatedAddresses,
      });
    }

    return NextResponse.json({ success: false, error: `Unrecognised action "${action}".` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to process address operation.' },
      { status: 500 }
    );
  }
}

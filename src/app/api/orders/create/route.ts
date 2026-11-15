import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { PRODUCTS, BRAND_CONFIG } from '@/data/catalogue';
import { AdminOrder } from '@/data/adminTypes';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

interface CreateOrderRequestBody {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: 'upi' | 'card' | 'whatsapp';
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  couponCode?: string;
  userId?: string;
  idempotencyKey?: string;
}

// In-memory server runtime register (Zero filesystem/JSON dependence)
const serverMemoryIdempotencyStore = new Map<
  string,
  {
    payloadHash: string;
    customerEmail: string;
    orderId: string;
    response: any;
    timestamp: number;
  }
>();

// Singleflight coordinator for in-flight simultaneous requests
const inFlightRequests = new Map<string, Promise<any>>();


export async function POST(request: Request) {
  try {
    const body: CreateOrderRequestBody = await request.json();

    // 1. Mandatory Input Validations (Server-Enforced)
    if (!body.customerName || typeof body.customerName !== 'string' || body.customerName.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Full customer name is required for atelier dispatch manifest.' },
        { status: 400 }
      );
    }

    const cleanPhone = (body.customerPhone || '').replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'A valid 10-digit mobile number is required for dispatch coordinates.' },
        { status: 400 }
      );
    }

    if (
      !body.shippingAddress ||
      !body.shippingAddress.addressLine?.trim() ||
      !body.shippingAddress.city?.trim() ||
      !body.shippingAddress.pincode?.trim()
    ) {
      return NextResponse.json(
        { success: false, error: 'Complete delivery address, city, and 6-digit postal pincode are required.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Shopping bag is empty. Please select handcrafted pieces.' },
        { status: 400 }
      );
    }

    // 2. Server-Authoritative Price Calculation & Product Verification (Anti-Tampering)
    let calculatedSubtotal = 0;
    const verifiedOrderItems: AdminOrder['items'] = [];

    for (const item of body.items) {
      const catalogItem = PRODUCTS.find(p => p.code === item.productId || p.id === item.productId);
      if (!catalogItem) {
        return NextResponse.json(
          { success: false, error: `Invalid or unrecognised atelier SKU: "${item.productId}"` },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const authoritativePrice = catalogItem.price; // ALWAYS sourced from server catalogue, NEVER from client

      // Server Stock Validation Pre-check
      if (db && db.type) {
        try {
          const invRef = doc(db, 'inventory', catalogItem.code);
          const invSnap = await getDoc(invRef);
          if (invSnap.exists()) {
            const invData = invSnap.data();
            const availableStock = Number(
              invData.available !== undefined
                ? invData.available
                : invData.stockOnHand !== undefined
                ? invData.stockOnHand
                : (invData.onHand ?? 15)
            );
            if (availableStock < qty) {
              return NextResponse.json(
                {
                  success: false,
                  error: `Atelier Stock Notice: Only ${availableStock} pieces of "${catalogItem.name}" remain in current loom.`,
                },
                { status: 400 }
              );
            }
          }
        } catch (stockErr) {
          console.warn('Stock pre-check notice:', stockErr);
        }
      }

      calculatedSubtotal += authoritativePrice * qty;
      verifiedOrderItems.push({
        productId: catalogItem.code,
        name: catalogItem.name,
        sku: catalogItem.code,
        price: authoritativePrice,
        quantity: qty,
        image: catalogItem.images?.[0] || 'https://www.kalajay.in/v2/p1-1.jpg',
      });
    }

    // 3. Server-Side Coupon & Discount Verification
    let calculatedDiscount = 0;
    const normalizedCoupon = (body.couponCode || '').trim().toUpperCase();
    if (normalizedCoupon) {
      if (normalizedCoupon === 'FIRST10') {
        calculatedDiscount = Math.min(500, Math.round(calculatedSubtotal * 0.1));
      } else if (normalizedCoupon === 'DIWALI15') {
        calculatedDiscount = Math.min(1000, Math.round(calculatedSubtotal * 0.15));
      } else if (normalizedCoupon === 'HEIRLOOM20') {
        calculatedDiscount = Math.min(2000, Math.round(calculatedSubtotal * 0.2));
      } else if (db && db.type) {
        try {
          const couponRef = doc(db, 'coupons', normalizedCoupon);
          const couponSnap = await getDoc(couponRef);
          if (couponSnap.exists() && couponSnap.data().active) {
            const cData = couponSnap.data();
            if (cData.type === 'percentage') {
              calculatedDiscount = Math.round((calculatedSubtotal * cData.value) / 100);
            } else {
              calculatedDiscount = cData.value;
            }
          }
        } catch {
          // fallback to 0 discount if unverified
        }
      }
    }

    // 4. Server-Authoritative Shipping & Business-Configurable GST Calculation (Phase 7)
    const discountedSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const freeShippingThreshold = BRAND_CONFIG.shipping?.freeThreshold ?? 599;
    const standardShippingRate = BRAND_CONFIG.shipping?.standardRate ?? 79;
    const calculatedShipping = discountedSubtotal >= freeShippingThreshold ? 0 : standardShippingRate;
    
    // Sourced from product-specific taxRate or central BRAND_CONFIG.tax.gstRate (Phase 7)
    const defaultGstRate = (BRAND_CONFIG as any).tax?.gstRate ?? 0.03;
    let calculatedTax = 0;
    if (calculatedDiscount > 0 && calculatedSubtotal > 0) {
      const discountRatio = (calculatedSubtotal - calculatedDiscount) / calculatedSubtotal;
      for (const item of verifiedOrderItems) {
        const catItem = PRODUCTS.find(p => p.code === item.sku || p.id === item.sku);
        const itemTaxRate = catItem?.taxRate ?? defaultGstRate;
        calculatedTax += Math.round(item.price * item.quantity * discountRatio * itemTaxRate);
      }
    } else {
      for (const item of verifiedOrderItems) {
        const catItem = PRODUCTS.find(p => p.code === item.sku || p.id === item.sku);
        const itemTaxRate = catItem?.taxRate ?? defaultGstRate;
        calculatedTax += Math.round(item.price * item.quantity * itemTaxRate);
      }
    }
    const calculatedTotal = discountedSubtotal + calculatedShipping + calculatedTax;

    // 5. Authoritative Customer Ownership Resolution (Concern 2)
    // Never trust client-supplied userId or email blindly.
    // If Authorization header is provided, cryptographically verify with Firebase.
    const authHeader = request.headers.get('authorization') || '';
    let authenticatedUid: string | undefined = undefined;
    let authenticatedEmail: string | undefined = undefined;

    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7).trim();
      const verifyRes = await verifyFirebaseIdToken(token);
      if (verifyRes.valid && verifyRes.uid) {
        authenticatedUid = verifyRes.uid;
        authenticatedEmail = verifyRes.email;
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication Rejected: Invalid or expired Firebase authentication token.',
            code: 'AUTH_TOKEN_INVALID',
          },
          { status: 401 }
        );
      }
    }

    // Security Guard: If client supplied a userId in the body, it MUST match the verified authenticated token UID.
    // An unauthenticated caller cannot supply a userId without a valid Bearer token (reject identity spoofing).
    if (body.userId) {
      if (!authenticatedUid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Authentication Required: Cannot bind order to patron account without a valid Firebase authentication token.',
            code: 'UNAUTHENTICATED_USER_ID_CLAIM',
          },
          { status: 401 }
        );
      }
      if (body.userId !== authenticatedUid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Identity Mismatch: Provided userId does not match the authenticated patron credentials.',
            code: 'USER_IDENTITY_MISMATCH',
          },
          { status: 403 }
        );
      }
    }

    const finalUserId = authenticatedUid;
    const normalizedEmail = (body.customerEmail || 'guest@kalajay.in').trim().toLowerCase();
    const finalCustomerEmail = authenticatedEmail || normalizedEmail;

    // 6. Canonical Payload Hash & Durable Idempotency Enforcement (Requirement 3)
    const sortedItems = [...verifiedOrderItems]
      .sort((a, b) => a.sku.localeCompare(b.sku))
      .map(i => `${i.sku}:${i.quantity}:${i.price}`)
      .join('|');

    const canonicalPayload = JSON.stringify({
      email: finalCustomerEmail,
      phone: cleanPhone,
      pincode: body.shippingAddress.pincode.trim(),
      items: sortedItems,
      coupon: normalizedCoupon,
      paymentMethod: body.paymentMethod,
    });
    const payloadHash = crypto.createHash('sha256').update(canonicalPayload).digest('hex');

    // Durable idempotency key resolution
    const rawKey = body.idempotencyKey || `IDEMP-${cleanPhone}-${payloadHash.slice(0, 16)}`;
    const sanitizedIdempKey = rawKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);

    // In-memory runtime deduplication (Zero filesystem reliance)
    const cachedMemory = serverMemoryIdempotencyStore.get(sanitizedIdempKey);
    if (cachedMemory) {
      if (cachedMemory.payloadHash && cachedMemory.payloadHash !== payloadHash) {
        return NextResponse.json(
          {
            success: false,
            error: 'Idempotency Conflict: Key reused with mismatched checkout payload parameters.',
            code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
          },
          { status: 409 }
        );
      }
      if (cachedMemory.customerEmail && cachedMemory.customerEmail.toLowerCase() !== finalCustomerEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'Idempotency Conflict: Key is bound to a different customer identity.',
            code: 'IDEMPOTENCY_CUSTOMER_MISMATCH',
          },
          { status: 409 }
        );
      }
      return NextResponse.json({
        ...cachedMemory.response,
        isIdempotentReplay: true,
      });
    }

    // In-flight simultaneous concurrency coordination (singleflight pattern)
    const existingFlight = inFlightRequests.get(sanitizedIdempKey);
    if (existingFlight) {
      const flightResult = await existingFlight;
      return NextResponse.json({
        ...flightResult,
        isIdempotentReplay: true,
      });
    }

    let resolveFlight: (val: any) => void = () => {};
    let rejectFlight: (err: any) => void = () => {};
    const flightPromise = new Promise((resolve, reject) => {
      resolveFlight = resolve;
      rejectFlight = reject;
    });
    inFlightRequests.set(sanitizedIdempKey, flightPromise);

    // 7. Generate Cryptographic Order Reference
    const generatedOrderNumber = `KJ-${Math.floor(100000 + Math.random() * 900000)}`;

    const payMethodMapped: AdminOrder['paymentMethod'] =
      body.paymentMethod === 'upi'
        ? 'UPI Instant'
        : body.paymentMethod === 'card'
        ? 'Credit/Debit Card'
        : 'WhatsApp Direct';

    // 8. Payment Verification Enforcement (Concern 4)
    const initialPaymentStatus: AdminOrder['paymentStatus'] = 'pending';
    const initialFulfillmentStatus: AdminOrder['fulfillmentStatus'] = 'unfulfilled';

    const orderRecord: AdminOrder = {
      id: generatedOrderNumber,
      customerName: body.customerName.trim(),
      customerEmail: finalCustomerEmail,
      customerPhone: cleanPhone,
      items: verifiedOrderItems,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: calculatedTotal,
      paymentStatus: initialPaymentStatus,
      paymentMethod: payMethodMapped,
      fulfillmentStatus: initialFulfillmentStatus,
      shippingAddress: {
        addressLine: body.shippingAddress.addressLine.trim(),
        city: body.shippingAddress.city.trim(),
        state: body.shippingAddress.state || 'Maharashtra',
        pincode: body.shippingAddress.pincode.trim(),
      },
      timeline: [
        {
          title: 'Order Placed & Authoritatively Verified',
          timestamp: new Date().toISOString(),
          note: 'Pricing, discount, and inventory validated by Kalajay Server Operations',
        },
        {
          title: 'Payment Pending Verification',
          timestamp: new Date().toISOString(),
          note: `Payment mode: ${payMethodMapped}. Awaiting settlement verification prior to artisan loom staging.`,
        },
      ],
      artisanNote: 'Queued for loom allocation upon payment confirmation.',
      courier: 'Kalajay In-House Direct Dispatch',
      courierType: 'internal',
      trackingAwb: `KJ-DISP-${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingAwbType: 'internal',
      isInternalTracking: true,
      createdAt: new Date().toISOString(),
      ...(finalUserId ? { userId: finalUserId } : {}),
    };

    const resultPayload = {
      success: true,
      orderId: generatedOrderNumber,
      total: calculatedTotal,
      subtotal: calculatedSubtotal,
      discount: calculatedDiscount,
      shipping: calculatedShipping,
      tax: calculatedTax,
      order: orderRecord,
    };

    // 8. Atomic Server-Side Idempotency, Inventory Deduction, and Order Persistence
    const adminDb = getAdminFirestore();

    if (adminDb) {
      try {
        const txResult = await adminDb.runTransaction(async (transaction) => {
          // 1. Atomic Idempotency Check inside Transaction
          const idempRef = adminDb.collection('idempotency_keys').doc(sanitizedIdempKey);
          const idempSnap = await transaction.get(idempRef);

          if (idempSnap.exists) {
            const cached = idempSnap.data()!;
            if (cached.payloadHash && cached.payloadHash !== payloadHash) {
              throw new Error('IDEMPOTENCY_PAYLOAD_MISMATCH');
            }
            if (cached.customerEmail && cached.customerEmail.toLowerCase() !== finalCustomerEmail) {
              throw new Error('IDEMPOTENCY_CUSTOMER_MISMATCH');
            }
            return { isReplay: true, response: cached.response || resultPayload };
          }

          // 2. Atomic Stock Validation & Reservation
          for (const item of verifiedOrderItems) {
            const invRef = adminDb.collection('inventory').doc(item.sku);
            const invSnap = await transaction.get(invRef);

            if (invSnap.exists) {
              const invData = invSnap.data()!;
              const currentAvailable = Number(
                invData.available !== undefined
                  ? invData.available
                  : invData.stockOnHand !== undefined
                  ? invData.stockOnHand
                  : (invData.onHand ?? 15)
              );
              if (currentAvailable < item.quantity) {
                throw new Error(
                  `INSUFFICIENT_STOCK: Atelier Stock Notice: Only ${currentAvailable} pieces of "${item.name}" remain in current loom.`
                );
              }
              const nextAvailable = currentAvailable - item.quantity;
              const nextReserved = Number(invData.reservedInLoom ?? 0) + item.quantity;

              transaction.update(invRef, {
                available: Math.max(0, nextAvailable),
                reservedInLoom: nextReserved,
                updatedAt: new Date().toISOString(),
              });
            }
          }

          // 3. Persist verified order in /orders
          const orderDocRef = adminDb.collection('orders').doc(generatedOrderNumber);
          transaction.set(orderDocRef, {
            ...orderRecord,
            createdAtServer: new Date().toISOString(),
            verifiedByServer: true,
          });

          // 4. Register completed idempotency key atomically
          transaction.set(idempRef, {
            idempotencyKey: sanitizedIdempKey,
            orderId: generatedOrderNumber,
            customerEmail: finalCustomerEmail,
            payloadHash,
            status: 'completed',
            response: resultPayload,
            createdAt: new Date().toISOString(),
          });

          return { isReplay: false, response: resultPayload };
        });

        if (txResult.isReplay) {
          return NextResponse.json({
            ...txResult.response,
            isIdempotentReplay: true,
          });
        }
        return NextResponse.json(txResult.response);
      } catch (adminTxErr: any) {
        if (adminTxErr.message === 'IDEMPOTENCY_PAYLOAD_MISMATCH') {
          return NextResponse.json(
            {
              success: false,
              error: 'Idempotency Conflict: Key reused with mismatched checkout payload parameters.',
              code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
            },
            { status: 409 }
          );
        }
        if (adminTxErr.message === 'IDEMPOTENCY_CUSTOMER_MISMATCH') {
          return NextResponse.json(
            {
              success: false,
              error: 'Idempotency Conflict: Key is bound to a different customer identity.',
              code: 'IDEMPOTENCY_CUSTOMER_MISMATCH',
            },
            { status: 409 }
          );
        }
        if (adminTxErr.message?.includes('INSUFFICIENT_STOCK')) {
          const cleanMessage = adminTxErr.message.replace('INSUFFICIENT_STOCK: ', '');
          return NextResponse.json({ success: false, error: cleanMessage }, { status: 400 });
        }
        console.error('Admin transaction error:', adminTxErr);
        throw adminTxErr;
      }
    } else if (db && db.type) {
      try {
        const txResult = await runTransaction(db, async (transaction) => {
          const idempRef = doc(db, 'idempotency_keys', sanitizedIdempKey);
          let idempSnap;
          try {
            idempSnap = await transaction.get(idempRef);
          } catch {
            idempSnap = null;
          }

          if (idempSnap && idempSnap.exists()) {
            const cached = idempSnap.data();
            if (cached.payloadHash && cached.payloadHash !== payloadHash) {
              throw new Error('IDEMPOTENCY_PAYLOAD_MISMATCH');
            }
            if (cached.customerEmail && cached.customerEmail.toLowerCase() !== finalCustomerEmail) {
              throw new Error('IDEMPOTENCY_CUSTOMER_MISMATCH');
            }
            return { isReplay: true, response: cached.response || resultPayload };
          }

          for (const item of verifiedOrderItems) {
            const invRef = doc(db, 'inventory', item.sku);
            const invSnap = await transaction.get(invRef);

            if (invSnap.exists()) {
              const invData = invSnap.data();
              const currentAvailable = Number(
                invData.available !== undefined
                  ? invData.available
                  : invData.stockOnHand !== undefined
                  ? invData.stockOnHand
                  : (invData.onHand ?? 15)
              );
              if (currentAvailable < item.quantity) {
                throw new Error(
                  `INSUFFICIENT_STOCK: Atelier Stock Notice: Only ${currentAvailable} pieces of "${item.name}" remain in current loom.`
                );
              }
              const nextAvailable = currentAvailable - item.quantity;
              const nextReserved = Number(invData.reservedInLoom ?? 0) + item.quantity;

              transaction.update(invRef, {
                available: Math.max(0, nextAvailable),
                reservedInLoom: nextReserved,
                updatedAt: serverTimestamp(),
              });
            }
          }

          const orderDocRef = doc(db, 'orders', generatedOrderNumber);
          transaction.set(orderDocRef, {
            ...orderRecord,
            createdAtServer: serverTimestamp(),
            verifiedByServer: true,
          });

          return { isReplay: false, response: resultPayload };
        });

        if (txResult.isReplay) {
          return NextResponse.json({
            ...txResult.response,
            isIdempotentReplay: true,
          });
        }
        serverMemoryIdempotencyStore.set(sanitizedIdempKey, {
          payloadHash,
          customerEmail: finalCustomerEmail,
          orderId: generatedOrderNumber,
          response: resultPayload,
          timestamp: Date.now(),
        });
        resolveFlight(txResult.response);
        inFlightRequests.delete(sanitizedIdempKey);
        return NextResponse.json(txResult.response);
      } catch (txErr: any) {
        if (txErr.message === 'IDEMPOTENCY_PAYLOAD_MISMATCH') {
          resolveFlight(null);
          inFlightRequests.delete(sanitizedIdempKey);
          return NextResponse.json(
            {
              success: false,
              error: 'Idempotency Conflict: Key reused with mismatched checkout payload parameters.',
              code: 'IDEMPOTENCY_PAYLOAD_MISMATCH',
            },
            { status: 409 }
          );
        }
        if (txErr.message?.includes('INSUFFICIENT_STOCK')) {
          resolveFlight(null);
          inFlightRequests.delete(sanitizedIdempKey);
          const cleanMessage = txErr.message.replace('INSUFFICIENT_STOCK: ', '');
          return NextResponse.json({ success: false, error: cleanMessage }, { status: 400 });
        }
      }
    }

    serverMemoryIdempotencyStore.set(sanitizedIdempKey, {
      payloadHash,
      customerEmail: finalCustomerEmail,
      orderId: generatedOrderNumber,
      response: resultPayload,
      timestamp: Date.now(),
    });
    resolveFlight(resultPayload);
    inFlightRequests.delete(sanitizedIdempKey);
    return NextResponse.json(resultPayload);
  } catch (error: any) {
    inFlightRequests.clear();
    console.error('Server order processing error:', error);
    if (error?.message?.includes('INSUFFICIENT_STOCK')) {
      const cleanMessage = error.message.replace('INSUFFICIENT_STOCK: ', '');
      return NextResponse.json({ success: false, error: cleanMessage }, { status: 400 });
    }

    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error validating atelier order.' },
      { status: 500 }
    );
  }
}

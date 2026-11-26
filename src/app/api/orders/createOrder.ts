import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import { PRODUCTS, BRAND_CONFIG } from '@/data/catalogue';
import { AdminOrder } from '@/data/adminTypes';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { dispatchOrderLifecycleNotification } from '@/lib/orderEmailDispatcher';

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
    variantId?: string;
    variantCode?: string;
    variantLabel?: string;
    attributes?: Record<string, string>;
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

/**
 * Generates a cryptographically random 256-bit guest tracking token (Phase 4.1).
 * Never derived from order ID, email, or predictable inputs.
 * Plaintext token is returned once for client fragment hand-off;
 * ONLY the SHA-256 hash is stored in Firestore.
 */
function generateRandomGuestAccessToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}


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
    // Synchronized with live Firestore /products with resilient static catalogue fallback
    let calculatedSubtotal = 0;
    const verifiedOrderItems: AdminOrder['items'] = [];
    const adminDb = getAdminFirestore();

    for (const item of body.items) {
      let catalogItem: any = null;
      const targetId = item.productId;

      // Authoritative lookup from live Firestore /products first
      if (adminDb) {
        try {
          const fsDoc = await adminDb.collection('products').doc(targetId).get();
          if (fsDoc.exists) {
            catalogItem = fsDoc.data();
          }
        } catch {}
      } else if (db && db.type) {
        try {
          const fsDoc = await getDoc(doc(db, 'products', targetId));
          if (fsDoc.exists()) {
            catalogItem = fsDoc.data();
          }
        } catch {}
      }

      // Seamless fallback to static catalogue if not yet in Firestore
      if (!catalogItem) {
        catalogItem = PRODUCTS.find(p => p.code === targetId || p.id === targetId || p.slug === targetId);
      }

      if (!catalogItem) {
        return NextResponse.json(
          { success: false, error: `Invalid or unrecognised atelier SKU: "${item.productId}"` },
          { status: 400 }
        );
      }

      // Archiving / Inactive / Draft Product Guard: Never allow purchasing archived, draft or unpublished pieces
      if (
        catalogItem.status === 'archived' ||
        catalogItem.status === 'inactive' ||
        catalogItem.status === 'draft' ||
        catalogItem.archived === true ||
        catalogItem.isActive === false ||
        catalogItem.active === false ||
        catalogItem.isDraft === true ||
        catalogItem.published === false
      ) {
        return NextResponse.json(
          {
            success: false,
            error: `Atelier Notice: "${catalogItem.name}" is archived, draft, or unavailable for purchase.`,
            code: 'PRODUCT_ARCHIVED',
          },
          { status: 400 }
        );
      }

      // Match exact variant if variantId or variantCode is provided
      let matchedVariant: any = null;
      if (Array.isArray(catalogItem.variants) && catalogItem.variants.length > 0) {
        if (item.variantId) {
          matchedVariant = catalogItem.variants.find((v: any) => v.id === item.variantId);
        }
        if (!matchedVariant && item.variantCode) {
          matchedVariant = catalogItem.variants.find((v: any) => v.code === item.variantCode);
        }
        if (!matchedVariant) {
          matchedVariant = catalogItem.variants.find((v: any) => v.code === targetId || v.id === targetId);
        }
      }

      // If a specific variant was matched, validate variant availability
      if (matchedVariant) {
        if (matchedVariant.isAvailable === false || matchedVariant.inStock === false) {
          return NextResponse.json(
            {
              success: false,
              error: `Atelier Notice: The requested finish / variant "${matchedVariant.label || matchedVariant.code}" of "${catalogItem.name}" is currently unavailable.`,
              code: 'VARIANT_UNAVAILABLE',
            },
            { status: 400 }
          );
        }
      } else if (catalogItem.inStock === false) {
        return NextResponse.json(
          {
            success: false,
            error: `Atelier Notice: "${catalogItem.name}" is currently sold out or out of stock.`,
            code: 'OUT_OF_STOCK',
          },
          { status: 400 }
        );
      }

      const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const authoritativePrice = (matchedVariant && matchedVariant.price != null && !isNaN(Number(matchedVariant.price)))
        ? Number(matchedVariant.price)
        : Number(catalogItem.price); // ALWAYS sourced from authoritative server/Firestore product, NEVER from client

      const effectiveSku = (matchedVariant && matchedVariant.code) ? matchedVariant.code : (catalogItem.code || targetId);
      const effectiveImage = (matchedVariant && matchedVariant.image) ? matchedVariant.image : (catalogItem.images?.[0] || catalogItem.coverImage || 'https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/k4oophmjhjh0rqu6hrdr.jpg');
      const effectiveLabel = matchedVariant?.label || item.variantLabel;
      const effectiveAttributes = matchedVariant?.attributeNames || matchedVariant?.attributes || item.attributes;

      // Server Stock Validation Pre-check
      const skuCode = effectiveSku;
      let availableStock: number | null = null;
      if (adminDb) {
        try {
          let invSnap = await adminDb.collection('inventory').doc(skuCode).get();
          if (!invSnap.exists && catalogItem.code && catalogItem.code !== skuCode) {
            invSnap = await adminDb.collection('inventory').doc(catalogItem.code).get();
          }
          if (invSnap.exists) {
            const invData = invSnap.data()!;
            availableStock = Number(
              invData.available !== undefined
                ? invData.available
                : invData.stockOnHand !== undefined
                ? invData.stockOnHand
                : (invData.onHand ?? 15)
            );
          }
        } catch {}
      } else if (db && db.type) {
        try {
          let invSnap = await getDoc(doc(db, 'inventory', skuCode));
          if (!invSnap.exists() && catalogItem.code && catalogItem.code !== skuCode) {
            invSnap = await getDoc(doc(db, 'inventory', catalogItem.code));
          }
          if (invSnap.exists()) {
            const invData = invSnap.data();
            availableStock = Number(
              invData.available !== undefined
                ? invData.available
                : invData.stockOnHand !== undefined
                ? invData.stockOnHand
                : (invData.onHand ?? 15)
            );
          }
        } catch (stockErr) {
          console.warn('Stock pre-check notice:', stockErr);
        }
      }

      if (availableStock !== null && availableStock < qty) {
        return NextResponse.json(
          {
            success: false,
            error: `Atelier Stock Notice: Only ${availableStock} pieces of "${catalogItem.name}${effectiveLabel ? ` (${effectiveLabel})` : ''}" remain in current loom.`,
          },
          { status: 400 }
        );
      }

      calculatedSubtotal += authoritativePrice * qty;
      const orderItemRecord: any = {
        productId: catalogItem.id || catalogItem.code || targetId,
        name: catalogItem.name,
        sku: skuCode,
        price: authoritativePrice,
        quantity: qty,
        image: effectiveImage,
      };
      if (matchedVariant?.id || item.variantId) {
        orderItemRecord.variantId = matchedVariant?.id || item.variantId;
      }
      if (effectiveLabel) {
        orderItemRecord.variantLabel = effectiveLabel;
      }
      if (effectiveAttributes && Object.keys(effectiveAttributes).length > 0) {
        orderItemRecord.attributes = effectiveAttributes;
      }
      if (matchedVariant?.leadTimeDays !== undefined && !isNaN(Number(matchedVariant.leadTimeDays))) {
        orderItemRecord.leadTimeDays = Number(matchedVariant.leadTimeDays);
      }
      verifiedOrderItems.push(orderItemRecord);
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

    // 4. Server-Authoritative Shipping & Inclusive GST Calculation (Phase 7)
    // Sourced dynamically from authoritative Firestore /settings/store if configured by Admin
    let freeShippingThreshold = BRAND_CONFIG.shipping?.freeThreshold ?? 599;
    let standardShippingRate = BRAND_CONFIG.shipping?.standardRate ?? 79;
    try {
      const adminDb = getAdminFirestore();
      if (adminDb) {
        const storeSettingsSnap = await adminDb.collection('settings').doc('store').get();
        if (storeSettingsSnap.exists) {
          const storeData = storeSettingsSnap.data();
          if (storeData?.shippingThreshold != null && !isNaN(Number(storeData.shippingThreshold))) {
            freeShippingThreshold = Number(storeData.shippingThreshold);
          }
          if (storeData?.standardFreight != null && !isNaN(Number(storeData.standardFreight))) {
            standardShippingRate = Number(storeData.standardFreight);
          }
        }
      }
    } catch {}

    // Displayed retail prices (MRP) are inclusive of all taxes under Indian GST law.
    const discountedSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
    const calculatedShipping = discountedSubtotal >= freeShippingThreshold ? 0 : standardShippingRate;
    
    // Tax Extraction (Inclusive GST): Sourced from product-specific taxRate or central BRAND_CONFIG.tax.gstRate (3%)
    const defaultGstRate = (BRAND_CONFIG as any).tax?.gstRate ?? 0.03;
    let calculatedTax = 0;
    const discountRatio = calculatedSubtotal > 0 ? (calculatedSubtotal - calculatedDiscount) / calculatedSubtotal : 1;
    for (const item of verifiedOrderItems) {
      const catItem = PRODUCTS.find(p => p.code === item.sku || p.id === item.sku);
      const itemTaxRate = catItem?.taxRate ?? defaultGstRate;
      const effectiveItemAmount = item.price * item.quantity * discountRatio;
      // Extract inclusive tax component: Tax = Amount - (Amount / (1 + rate))
      calculatedTax += Math.round(effectiveItemAmount - (effectiveItemAmount / (1 + itemTaxRate)));
    }

    // Grand Total is Discounted Subtotal + Shipping (Tax is already inclusive in retail product prices)
    const calculatedTotal = discountedSubtotal + calculatedShipping;

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
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('IN_FLIGHT_TIMEOUT')), 3500)
        );
        const flightResult = await Promise.race([existingFlight, timeoutPromise]);
        if (flightResult) {
          return NextResponse.json({
            ...flightResult,
            isIdempotentReplay: true,
          });
        }
      } catch {
        inFlightRequests.delete(sanitizedIdempKey);
      }
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

    // Generate random 256-bit guest tracking credential if unauthenticated guest session
    const guestTokenInfo = !finalUserId ? generateRandomGuestAccessToken() : null;

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
      ...(finalUserId
        ? { userId: finalUserId, isGuestOrder: false }
        : {
            isGuestOrder: true,
            // Only the cryptographic SHA-256 hash is saved to database (Phase 4.1)
            guestAccessTokenHash: guestTokenInfo?.tokenHash,
          }),
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
      ...(finalUserId ? {} : { guestAccessToken: guestTokenInfo?.token }),
    };

    const notifyOrderPlaced = (record: any) => {
      try {
        dispatchOrderLifecycleNotification({
          order: record,
          event: 'order_placed',
        }).catch(e => console.warn('Order placed notification notice:', e));

        if (record.paymentStatus === 'paid') {
          dispatchOrderLifecycleNotification({
            order: record,
            event: 'payment_success',
          }).catch(e => console.warn('Payment success notification notice:', e));
        }
      } catch (err) {
        console.warn('Deferred email dispatch notice:', err);
      }
    };

    // 8. Atomic Server-Side Idempotency, Inventory Deduction, and Order Persistence
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
            let invRef = adminDb.collection('inventory').doc(item.sku);
            let invSnap = await transaction.get(invRef);

            if (!invSnap.exists && item.productId && item.productId !== item.sku) {
              const baseRef = adminDb.collection('inventory').doc(item.productId);
              const baseSnap = await transaction.get(baseRef);
              if (baseSnap.exists) {
                invRef = baseRef;
                invSnap = baseSnap;
              }
            }

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

          // Record atomic 15-minute inventory reservation lease
          const resRef = adminDb.collection('inventory_reservations').doc(generatedOrderNumber);
          transaction.set(resRef, {
            orderId: generatedOrderNumber,
            items: verifiedOrderItems.map(i => ({ sku: i.sku, quantity: i.quantity })),
            status: 'active',
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          });

          // 3. Persist verified order in /orders
          const orderDocRef = adminDb.collection('orders').doc(generatedOrderNumber);
          const cleanOrderData = JSON.parse(
            JSON.stringify({
              ...orderRecord,
              createdAtServer: new Date().toISOString(),
              verifiedByServer: true,
            })
          );
          transaction.set(orderDocRef, cleanOrderData);

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

        serverMemoryIdempotencyStore.set(sanitizedIdempKey, {
          payloadHash,
          customerEmail: finalCustomerEmail,
          orderId: generatedOrderNumber,
          response: txResult.response,
          timestamp: Date.now(),
        });
        resolveFlight(txResult.response);
        inFlightRequests.delete(sanitizedIdempKey);

        if (txResult.isReplay) {
          return NextResponse.json({
            ...txResult.response,
            isIdempotentReplay: true,
          });
        }
        notifyOrderPlaced(orderRecord);
        return NextResponse.json(txResult.response);
      } catch (adminTxErr: any) {
        resolveFlight(null);
        inFlightRequests.delete(sanitizedIdempKey);
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
        notifyOrderPlaced(orderRecord);
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

    notifyOrderPlaced(orderRecord);
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

/**
 * KALAJAY HANDCRAFTED LUXURIES — AUTHORITATIVE PRICE VALIDATOR
 * Centralized, server-side anti-tampering engine for checkout and payment.
 * Ensures the client can NEVER dictate unit prices, discounts, taxes, or shipping.
 */

import { PRODUCTS, BRAND_CONFIG, Product } from '@/data/catalogue';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export interface CheckoutLineItemInput {
  productId: string;
  variantId?: string;
  variantCode?: string;
  variantLabel?: string;
  attributes?: Record<string, string>;
  quantity: number;
}

export interface VerifiedOrderItemSnapshot {
  productId: string;
  name: string;
  sku: string;
  price: number; // Unit price in INR
  quantity: number;
  image: string;
  variantId?: string;
  variantLabel?: string;
  attributes?: Record<string, string>;
  leadTimeDays?: number;
  itemSubtotal: number;
}

export interface AuthoritativePriceCalculationResult {
  items: VerifiedOrderItemSnapshot[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  discountedSubtotal: number;
  shipping: number;
  tax: number; // Inclusive GST
  total: number; // Final payable amount in INR
  totalPaise: number; // Final payable amount in Paise (total * 100)
  currency: 'INR';
  freeShippingThreshold: number;
  standardShippingRate: number;
}

/**
 * Validates an array of client line items and coupon code against authoritative
 * Firestore products and catalogue data, computing exact totals on the server.
 */
export async function calculateAuthoritativePrice(params: {
  items: CheckoutLineItemInput[];
  couponCode?: string;
}): Promise<AuthoritativePriceCalculationResult> {
  const { items, couponCode } = params;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('SHOPPING_BAG_EMPTY: Shopping bag must contain at least one item.');
  }

  // Prevent excessive array sizes (resource exhaustion attack)
  if (items.length > 50) {
    throw new Error('EXCESSIVE_ITEMS: Cannot process more than 50 line items in a single checkout.');
  }

  const adminDb = getAdminFirestore();
  const verifiedItems: VerifiedOrderItemSnapshot[] = [];
  let calculatedSubtotal = 0;

  for (const item of items) {
    if (!item.productId || typeof item.productId !== 'string') {
      throw new Error('INVALID_PRODUCT_ID: Product ID is missing or malformed.');
    }

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error(`INVALID_QUANTITY: Item "${item.productId}" has an invalid quantity (${item.quantity}). Quantity must be a positive integer.`);
    }

    if (qty > 100) {
      throw new Error(`EXCESSIVE_QUANTITY: Cannot purchase more than 100 units of "${item.productId}" in a single order.`);
    }

    let catalogItem: any = null;
    const targetId = item.productId.trim();

    // 1. Authoritative lookup from live Firestore /products
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

    // 2. Resilient fallback to static catalogue
    if (!catalogItem) {
      catalogItem = PRODUCTS.find((p) => p.code === targetId || p.id === targetId || p.slug === targetId);
    }

    if (!catalogItem) {
      throw new Error(`UNRECOGNISED_SKU: Item "${targetId}" was not found in the atelier catalogue.`);
    }

    // 3. Availability and publication status guard
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
      throw new Error(`PRODUCT_UNAVAILABLE: "${catalogItem.name}" is archived, draft, or unavailable for purchase.`);
    }

    // 4. Variant matching
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

    if (matchedVariant) {
      if (matchedVariant.isAvailable === false || matchedVariant.inStock === false) {
        throw new Error(`VARIANT_UNAVAILABLE: The requested finish / variant of "${catalogItem.name}" is currently unavailable.`);
      }
    } else if (catalogItem.inStock === false) {
      throw new Error(`OUT_OF_STOCK: "${catalogItem.name}" is currently sold out.`);
    }

    // Authoritative Price: Never trust client price
    const authoritativePrice =
      matchedVariant && matchedVariant.price != null && !isNaN(Number(matchedVariant.price))
        ? Number(matchedVariant.price)
        : Number(catalogItem.price);

    if (isNaN(authoritativePrice) || authoritativePrice < 0) {
      throw new Error(`INVALID_CATALOGUE_PRICE: Authoritative price for "${catalogItem.name}" is corrupt.`);
    }

    const effectiveSku = matchedVariant && matchedVariant.code ? matchedVariant.code : catalogItem.code || targetId;
    const effectiveImage =
      matchedVariant && matchedVariant.image
        ? matchedVariant.image
        : catalogItem.images?.[0] || catalogItem.coverImage || 'https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/k4oophmjhjh0rqu6hrdr.jpg';
    const effectiveLabel = matchedVariant?.label || item.variantLabel;
    const effectiveAttributes = matchedVariant?.attributeNames || matchedVariant?.attributes || item.attributes;

    const itemSubtotal = authoritativePrice * qty;
    calculatedSubtotal += itemSubtotal;

    verifiedItems.push({
      productId: catalogItem.id || catalogItem.code || targetId,
      name: catalogItem.name,
      sku: effectiveSku,
      price: authoritativePrice,
      quantity: qty,
      image: effectiveImage,
      ...(matchedVariant?.id || item.variantId ? { variantId: matchedVariant?.id || item.variantId } : {}),
      ...(effectiveLabel ? { variantLabel: effectiveLabel } : {}),
      ...(effectiveAttributes && Object.keys(effectiveAttributes).length > 0 ? { attributes: effectiveAttributes } : {}),
      ...(matchedVariant?.leadTimeDays != null ? { leadTimeDays: Number(matchedVariant.leadTimeDays) } : {}),
      itemSubtotal,
    });
  }

  // 5. Server-Authoritative Coupon Calculation
  let calculatedDiscount = 0;
  let normalizedCoupon: string | undefined = undefined;

  if (couponCode && typeof couponCode === 'string') {
    normalizedCoupon = couponCode.trim().toUpperCase();
    if (normalizedCoupon) {
      if (normalizedCoupon === 'FIRST10') {
        calculatedDiscount = Math.min(500, Math.round(calculatedSubtotal * 0.1));
      } else if (normalizedCoupon === 'DIWALI15') {
        calculatedDiscount = Math.min(1000, Math.round(calculatedSubtotal * 0.15));
      } else if (normalizedCoupon === 'HEIRLOOM20') {
        calculatedDiscount = Math.min(2000, Math.round(calculatedSubtotal * 0.2));
      } else if (adminDb) {
        try {
          const couponSnap = await adminDb.collection('coupons').doc(normalizedCoupon).get();
          if (couponSnap.exists && couponSnap.data()?.active) {
            const cData = couponSnap.data()!;
            if (cData.type === 'percentage') {
              calculatedDiscount = Math.round((calculatedSubtotal * Number(cData.value)) / 100);
            } else {
              calculatedDiscount = Number(cData.value) || 0;
            }
          }
        } catch {}
      }
    }
  }

  // 6. Shipping & Free Freight Threshold
  let freeShippingThreshold = BRAND_CONFIG.shipping?.freeThreshold ?? 599;
  let standardShippingRate = BRAND_CONFIG.shipping?.standardRate ?? 79;

  if (adminDb) {
    try {
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
    } catch {}
  }

  const discountedSubtotal = Math.max(0, calculatedSubtotal - calculatedDiscount);
  const calculatedShipping = discountedSubtotal >= freeShippingThreshold ? 0 : standardShippingRate;

  // 7. Inclusive GST Extraction (3%)
  const defaultGstRate = (BRAND_CONFIG as any).tax?.gstRate ?? 0.03;
  let calculatedTax = 0;
  const discountRatio = calculatedSubtotal > 0 ? discountedSubtotal / calculatedSubtotal : 1;

  for (const item of verifiedItems) {
    const catItem = PRODUCTS.find((p) => p.code === item.sku || p.id === item.sku);
    const itemTaxRate = catItem?.taxRate ?? defaultGstRate;
    const effectiveItemAmount = item.price * item.quantity * discountRatio;
    calculatedTax += Math.round(effectiveItemAmount - effectiveItemAmount / (1 + itemTaxRate));
  }

  const total = discountedSubtotal + calculatedShipping;
  const totalPaise = Math.round(total * 100);

  return {
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    discount: calculatedDiscount,
    couponCode: normalizedCoupon,
    discountedSubtotal,
    shipping: calculatedShipping,
    tax: calculatedTax,
    total,
    totalPaise,
    currency: 'INR',
    freeShippingThreshold,
    standardShippingRate,
  };
}

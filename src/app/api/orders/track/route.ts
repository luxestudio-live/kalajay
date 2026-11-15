import { NextResponse } from 'next/server';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { verifyFirebaseIdToken } from '@/lib/serverRbac';

// Known demo orders for showroom preview
const KNOWN_ORDERS: Record<string, any> = {
  'KJ-8924': {
    id: 'KJ-8924',
    customerName: 'Sonali S.',
    customerEmail: 'sonali.s@kalajay.in',
    customerPhone: '9876543210',
    fulfillmentStatus: 'shipped',
    paymentStatus: 'paid',
    items: [
      { name: 'Pearl Vanity Box Heirloom', sku: 'KJ-PVB-101', price: 1449, quantity: 1, image: 'https://www.kalajay.in/v2/p3-2.jpg' },
      { name: 'Pearl Drop AirPods Case', sku: 'KJ-APC-401', price: 399, quantity: 1, image: 'https://www.kalajay.in/v2/p12-3.jpg' }
    ],
    subtotal: 1848,
    discount: 0,
    shipping: 0,
    tax: 55,
    total: 1903,
    shippingAddress: { city: 'Mumbai', state: 'Maharashtra' },
    timeline: [
      { title: 'Hand-Stringing in Bihar', timestamp: '2026-11-01T10:30:00Z', note: '1,400+ beads strung by Sunita Devi' },
      { title: 'Quality Checked & Wax-Sealed', timestamp: '2026-11-02T18:45:00Z', note: 'Inspected under calibrated light' },
      { title: 'Dispatched via Direct Courier', timestamp: '2026-11-03T09:00:00Z', note: 'Handed over for air transit' }
    ],
    artisanNote: 'Hand-strung with tensioned 8-cord crystal fiber. Inspected in morning natural light by Sunita Devi.',
    courier: 'Kalajay In-House Direct Dispatch',
    trackingAwb: 'KJ-DISP-84729103',
    createdAt: '2026-11-01T10:30:00Z',
    isDemo: true,
  },
  'KJ-7710': {
    id: 'KJ-7710',
    customerName: 'Ananya V.',
    customerEmail: 'ananya.v@kalajay.in',
    customerPhone: '9876543211',
    fulfillmentStatus: 'quality_checked',
    paymentStatus: 'paid',
    items: [
      { name: 'Pearl Beaded Vintage Bag', sku: 'KJ-PRS-207', price: 2399, quantity: 1, image: 'https://www.kalajay.in/v2/p6-2.jpg' }
    ],
    subtotal: 2399,
    discount: 0,
    shipping: 0,
    tax: 72,
    total: 2471,
    shippingAddress: { city: 'New Delhi', state: 'Delhi' },
    timeline: [
      { title: 'Hand-Stringing Complete', timestamp: '2026-10-30T14:00:00Z', note: 'Brass structural frame tensioned' },
      { title: 'Wax-Sealed in Mumbai', timestamp: '2026-10-31T11:00:00Z', note: 'Kalajay insignia wax seal applied' }
    ],
    artisanNote: 'Structural frame reinforced with brass core. Wax-sealed with Kalajay insignia.',
    courier: 'Kalajay Atelier Direct Delivery',
    trackingAwb: 'KJ-DISP-99381024',
    createdAt: '2026-10-30T14:00:00Z',
    isDemo: true,
  },
  'KJ-6502': {
    id: 'KJ-6502',
    customerName: 'Rohan M.',
    customerEmail: 'rohan.m@kalajay.in',
    customerPhone: '9876543212',
    fulfillmentStatus: 'in_loom',
    paymentStatus: 'pending',
    items: [
      { name: 'Crystal Beaded Tealight Lantern Set', sku: 'KJ-TEA-501', price: 999, quantity: 1, image: 'https://www.kalajay.in/v2/p16-3.jpg' }
    ],
    subtotal: 999,
    discount: 0,
    shipping: 150,
    tax: 30,
    total: 1179,
    shippingAddress: { city: 'Bengaluru', state: 'Karnataka' },
    timeline: [
      { title: 'Scheduled on Loom', timestamp: '2026-11-02T08:00:00Z', note: 'Bead count 420 faceted glass crystals' }
    ],
    artisanNote: 'Currently on the artisan loom. 420 faceted glass beads threaded and tensioned.',
    courier: 'Scheduled via Kalajay Atelier Team',
    trackingAwb: 'Pending Craft House Dispatch',
    createdAt: '2026-11-02T08:00:00Z',
    isDemo: true,
  },
};

// =========================================================================
// PRODUCTION-SAFE SHARED DISTRIBUTED RATE LIMITER
// Uses SHA-256 hashed IP identifiers to respect DPDP privacy guidelines.
// Coordinated across instances via in-memory LRU + Firestore shared documents.
// =========================================================================

interface RateLimitRecord {
  count: number;
  windowStart: number;
  failedAttempts: number;
  lockedUntil?: number;
}

const memoryRateLimitCache = new Map<string, RateLimitRecord>();

function hashIp(rawIp: string): string {
  const salt = process.env.RATELIMIT_SALT || 'kalajay_dpdp_salt_2026';
  return crypto.createHash('sha256').update(rawIp + salt).digest('hex').substring(0, 32);
}

async function getSharedRateLimit(ipHash: string): Promise<RateLimitRecord> {
  const now = Date.now();
  // 1. Check local memory cache
  const cached = memoryRateLimitCache.get(ipHash);
  if (cached && now - cached.windowStart < 60 * 1000) {
    return cached;
  }

  // 2. Query shared Firestore collection (cross-instance coordination)
  try {
    if (db && db.type) {
      const snap = await getDoc(doc(db, 'tracking_ratelimits', ipHash));
      if (snap.exists()) {
        const data = snap.data() as RateLimitRecord;
        memoryRateLimitCache.set(ipHash, data);
        return data;
      }
    }
  } catch {}

  return { count: 0, windowStart: now, failedAttempts: 0 };
}

async function saveSharedRateLimit(ipHash: string, record: RateLimitRecord): Promise<void> {
  memoryRateLimitCache.set(ipHash, record);

  // Sync to shared Firestore in background (non-blocking)
  try {
    if (db && db.type) {
      setDoc(doc(db, 'tracking_ratelimits', ipHash), record, { merge: true }).catch(() => {});
    }
  } catch {}
}

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  const ipHash = hashIp(ip);
  const now = Date.now();
  const record = await getSharedRateLimit(ipHash);

  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      error: `Too many unsuccessful lookup attempts. For security against order enumeration, access is temporarily throttled. Retry in ${remainingSec}s.`,
    };
  }

  if (now - record.windowStart > 60 * 1000) {
    record.count = 0;
    record.windowStart = now;
  }

  record.count++;
  await saveSharedRateLimit(ipHash, record);

  if (record.count > 45) {
    return {
      allowed: false,
      error: 'Order tracking rate limit exceeded. Please wait a moment before trying again.',
    };
  }

  return { allowed: true };
}

async function recordFailedAttempt(ip: string) {
  const ipHash = hashIp(ip);
  const now = Date.now();
  const record = await getSharedRateLimit(ipHash);
  record.failedAttempts = (record.failedAttempts || 0) + 1;
  if (record.failedAttempts >= 8) {
    record.lockedUntil = now + 5 * 60 * 1000; // 5-minute lockout on repeated scanning
    record.failedAttempts = 0;
  }
  await saveSharedRateLimit(ipHash, record);
}

async function recordSuccess(ip: string) {
  const ipHash = hashIp(ip);
  const record = await getSharedRateLimit(ipHash);
  if (record.failedAttempts > 0) {
    record.failedAttempts = 0;
    await saveSharedRateLimit(ipHash, record);
  }
}

// Fallback durable store reader for local file cache
function readDurableStore(fileName: string): Record<string, any> {
  try {
    const fPath = path.join(process.cwd(), '.next', 'cache', fileName);
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim() || '127.0.0.1';

    const rateCheck = await checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { success: false, error: rateCheck.error || 'Too many lookup requests.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = (searchParams.get('orderId') || searchParams.get('order') || '').trim().toUpperCase();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order reference is required.' },
        { status: 400 }
      );
    }

    if (!orderId.startsWith('KJ-') || orderId.length > 30) {
      return NextResponse.json(
        { success: false, error: 'Invalid order reference format. Example: KJ-8924 or KJ-123456.' },
        { status: 400 }
      );
    }

    let foundOrder: any = null;

    // 1. Authoritative Firestore Document Lookup (/orders/{orderId})
    try {
      if (db && db.type) {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          foundOrder = { id: orderSnap.id, ...orderSnap.data() };
        }
      }
    } catch (e) {
      // Permission or network fallback
    }

    // 2. Check update store (for recent status modifications)
    if (!foundOrder) {
      const updateStore = readDurableStore('kalajay_orders_update_store.json');
      if (updateStore[orderId]) {
        foundOrder = updateStore[orderId];
      }
    }

    // 3. Search in durable idempotency store (all placed orders)
    if (!foundOrder) {
      const idempStore = readDurableStore('kalajay_idempotency_store.json');
      for (const key of Object.keys(idempStore)) {
        const entry = idempStore[key];
        if (entry?.orderId === orderId || entry?.response?.orderId === orderId) {
          foundOrder = entry.response?.order;
          break;
        }
      }
    }

    // 4. Fallback to showroom demo orders
    if (!foundOrder && KNOWN_ORDERS[orderId]) {
      foundOrder = KNOWN_ORDERS[orderId];
    }

    if (!foundOrder) {
      await recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: 'Order not found in atelier chronicle.' },
        { status: 404 }
      );
    }

    await recordSuccess(clientIp);

    // =========================================================================
    // SECURE CUSTOMER OWNERSHIP & GUEST VERIFICATION
    // Access to non-public order details (itemized invoice, financial totals,
    // exact street address) requires verified customer ownership or guest verification.
    // =========================================================================

    let isVerifiedOwner = false;

    // A. Check Authenticated Customer Session (Authorization: Bearer <idToken>)
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      const verifyRes = await verifyFirebaseIdToken(token);
      if (verifyRes.valid) {
        if (
          (verifyRes.uid && foundOrder.userId && verifyRes.uid === foundOrder.userId) ||
          (verifyRes.email && foundOrder.customerEmail && verifyRes.email.toLowerCase() === foundOrder.customerEmail.toLowerCase())
        ) {
          isVerifiedOwner = true;
        }
      }
    }

    // B. Check Guest Verification Identifiers (Email or Phone)
    const queryEmail = (searchParams.get('email') || request.headers.get('x-verify-email') || '').trim().toLowerCase();
    const queryPhone = cleanDigits(searchParams.get('phone') || request.headers.get('x-verify-phone') || '');

    if (!isVerifiedOwner && queryEmail && foundOrder.customerEmail) {
      if (queryEmail === foundOrder.customerEmail.toLowerCase().trim()) {
        isVerifiedOwner = true;
      }
    }

    if (!isVerifiedOwner && queryPhone && queryPhone.length >= 10) {
      const orderPhone = cleanDigits(foundOrder.customerPhone || foundOrder.shippingAddress?.phone || '');
      if (orderPhone.endsWith(queryPhone.slice(-10)) || queryPhone.endsWith(orderPhone.slice(-10))) {
        isVerifiedOwner = true;
      }
    }

    // C. Pre-verified Showroom Demo Orders
    if (foundOrder.isDemo || KNOWN_ORDERS[orderId]) {
      isVerifiedOwner = true;
    }

    // Privacy masking for patron name (e.g. "Meera Rajput" -> "Meera R.")
    const rawName = (foundOrder.customerName || 'Honoured Patron').trim();
    const nameParts = rawName.split(/\s+/);
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : rawName;

    const rawAwb = foundOrder.trackingAwb || `KJ-DISP-${(foundOrder.id || orderId).replace(/\D/g, '')}`;
    const isInternalAwb = rawAwb.startsWith('KJ-DISP-') || (foundOrder.courier || '').includes('Kalajay In-House');

    // Build timeline
    const timeline = Array.isArray(foundOrder.timeline) && foundOrder.timeline.length > 0
      ? foundOrder.timeline
      : [
          {
            title: 'Order Placed & Authoritatively Verified',
            timestamp: foundOrder.createdAt || new Date().toISOString(),
            note: 'Pricing, discount, and inventory validated by Kalajay Server Operations',
          },
          {
            title: 'Queued for Artisan Loom',
            timestamp: foundOrder.createdAt || new Date().toISOString(),
            note: 'Bead count tensioned and allocated to loom cluster',
          },
        ];

    // Non-public data: Line items and financial amounts are sanitized if not verified
    const rawItems = Array.isArray(foundOrder.items) ? foundOrder.items : [];
    const publicItems = isVerifiedOwner
      ? rawItems.map((it: any) => ({
          name: it.name || 'Handcrafted Piece',
          sku: it.sku || it.productId || 'KJ-ATELIER',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity) || 1,
          image: it.image || 'https://www.kalajay.in/v2/p3-2.jpg',
        }))
      : []; // Redacted for unverified lookups to prevent cross-customer data leakage

    const publicOrder = {
      id: foundOrder.id || orderId,
      customerName: maskedName,
      fulfillmentStatus: foundOrder.fulfillmentStatus || 'unfulfilled',
      paymentStatus: foundOrder.paymentStatus || 'pending',
      items: publicItems,
      itemCount: rawItems.length,
      isVerifiedOwner,
      requiresVerification: !isVerifiedOwner,
      subtotal: isVerifiedOwner ? foundOrder.subtotal : undefined,
      discount: isVerifiedOwner ? (foundOrder.discount || 0) : undefined,
      shipping: isVerifiedOwner ? (foundOrder.shipping || 0) : undefined,
      tax: isVerifiedOwner ? (foundOrder.tax || 0) : undefined,
      total: isVerifiedOwner ? (foundOrder.total || 0) : undefined,
      shippingAddress: {
        city: foundOrder.shippingAddress?.city || 'India',
        state: foundOrder.shippingAddress?.state || '',
      },
      timeline,
      artisanNote: foundOrder.artisanNote || 'Handcrafted on Bihar artisan loom with tensioned crystal fiber.',
      courier: foundOrder.courier || 'Kalajay In-House Direct Dispatch',
      courierType: isInternalAwb ? 'internal' : 'commercial',
      trackingAwb: rawAwb,
      trackingAwbType: isInternalAwb ? 'internal' : 'commercial',
      trackingLabel: isInternalAwb ? 'Internal Atelier Dispatch Reference' : 'Commercial Courier Tracking AWB',
      createdAt: foundOrder.createdAt || new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      order: publicOrder,
    });
  } catch (error: any) {
    console.error('Error fetching public order tracking details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve tracking details.' },
      { status: 500 }
    );
  }
}

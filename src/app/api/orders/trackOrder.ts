import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { verifyFirebaseIdToken, INTERNAL_SERVICE_SECRET } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

// Immutable set of static showroom showcase references ONLY
const STATIC_SHOWROOM_IDS = new Set(['KJ-8924', 'KJ-7710', 'KJ-6502']);

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
    shippingAddress: { city: 'Mumbai', state: 'Maharashtra', pincode: '400050' },
    timeline: [
      { title: 'Hand-Stringing in Bihar', timestamp: '2026-11-01T10:30:00Z', note: '1,400+ beads strung by Sunita Devi' },
      { title: 'Quality Checked & Wax-Sealed', timestamp: '2026-11-02T18:45:00Z', note: 'Inspected under calibrated light' },
      { title: 'Dispatched via Direct Courier', timestamp: '2026-11-03T09:00:00Z', note: 'Handed over for air transit' }
    ],
    artisanNote: 'Hand-strung with tensioned 8-cord crystal fiber. Inspected in morning natural light by Sunita Devi.',
    courier: 'Kalajay In-House Direct Dispatch',
    trackingAwb: 'KJ-DISP-84729103',
    createdAt: '2026-11-01T10:30:00Z',
    isStaticShowroomDemo: true,
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
    shippingAddress: { city: 'New Delhi', state: 'Delhi', pincode: '110001' },
    timeline: [
      { title: 'Hand-Stringing Complete', timestamp: '2026-10-30T14:00:00Z', note: 'Brass structural frame tensioned' },
      { title: 'Wax-Sealed in Mumbai', timestamp: '2026-10-31T11:00:00Z', note: 'Kalajay insignia wax seal applied' }
    ],
    artisanNote: 'Structural frame reinforced with brass core. Wax-sealed with Kalajay insignia.',
    courier: 'Kalajay Atelier Direct Delivery',
    trackingAwb: 'KJ-DISP-99381024',
    createdAt: '2026-10-30T14:00:00Z',
    isStaticShowroomDemo: true,
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
    shippingAddress: { city: 'Bengaluru', state: 'Karnataka', pincode: '560001' },
    timeline: [
      { title: 'Scheduled on Loom', timestamp: '2026-11-02T08:00:00Z', note: 'Bead count 420 faceted glass crystals' }
    ],
    artisanNote: 'Currently on the artisan loom. 420 faceted glass beads threaded and tensioned.',
    courier: 'Scheduled via Kalajay Atelier Team',
    trackingAwb: 'Pending Craft House Dispatch',
    createdAt: '2026-11-02T08:00:00Z',
    isStaticShowroomDemo: true,
  },
};

// =========================================================================
// TRUSTED SERVER-SIDE RATE LIMITING
// /tracking_ratelimits is closed to all direct client access (allow read, write: if false;).
// State is managed by trusted server-side memory + server-only storage.
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

function getRatelimitFilePath(): string {
  const dir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return path.join(dir, 'kalajay_server_tracking_limits.json');
}

function readServerRateLimits(): Record<string, RateLimitRecord> {
  try {
    const fPath = getRatelimitFilePath();
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeServerRateLimits(data: Record<string, RateLimitRecord>) {
  try {
    const fPath = getRatelimitFilePath();
    fs.writeFileSync(fPath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

async function checkServerRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  const ipHash = hashIp(ip);
  const now = Date.now();

  let record = memoryRateLimitCache.get(ipHash);
  if (!record) {
    const persistent = readServerRateLimits();
    record = persistent[ipHash] || { count: 0, windowStart: now, failedAttempts: 0 };
    memoryRateLimitCache.set(ipHash, record);
  }

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
  memoryRateLimitCache.set(ipHash, record);

  const persistent = readServerRateLimits();
  persistent[ipHash] = record;
  writeServerRateLimits(persistent);

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
  let record = memoryRateLimitCache.get(ipHash) || { count: 1, windowStart: now, failedAttempts: 0 };
  record.failedAttempts = (record.failedAttempts || 0) + 1;
  if (record.failedAttempts >= 8) {
    record.lockedUntil = now + 5 * 60 * 1000;
    record.failedAttempts = 0;
  }
  memoryRateLimitCache.set(ipHash, record);

  const persistent = readServerRateLimits();
  persistent[ipHash] = record;
  writeServerRateLimits(persistent);
}

async function recordSuccess(ip: string) {
  const ipHash = hashIp(ip);
  const record = memoryRateLimitCache.get(ipHash);
  if (record && record.failedAttempts > 0) {
    record.failedAttempts = 0;
    memoryRateLimitCache.set(ipHash, record);
    const persistent = readServerRateLimits();
    persistent[ipHash] = record;
    writeServerRateLimits(persistent);
  }
}

function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

/**
 * Computes deterministic guest order access token
 */
function generateGuestAccessToken(orderId: string, customerEmail: string): string {
  return crypto
    .createHmac('sha256', INTERNAL_SERVICE_SECRET)
    .update(`${orderId}:${customerEmail.toLowerCase().trim()}`)
    .digest('hex')
    .substring(0, 24);
}

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim() || '127.0.0.1';

    const rateCheck = await checkServerRateLimit(clientIp);
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
    let isFromDatabase = false;

    // 1. Authoritative Server Admin Firestore Document Lookup (/orders/{orderId})
    try {
      const adminDb = getAdminFirestore();
      if (adminDb) {
        const orderSnap = await adminDb.collection('orders').doc(orderId).get();
        if (orderSnap.exists) {
          foundOrder = { id: orderSnap.id, ...orderSnap.data() };
          isFromDatabase = true;
        }
      } else if (db && db.type) {
        const orderSnap = await getDoc(doc(db, 'orders', orderId));
        if (orderSnap.exists()) {
          foundOrder = { id: orderSnap.id, ...orderSnap.data() };
          isFromDatabase = true;
        }
      }
    } catch {}

    // 2. Search in durable Firestore idempotency keys collection (/idempotency_keys)
    if (!foundOrder) {
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const idempSnap = await adminDb.collection('idempotency_keys')
            .where('orderId', '==', orderId)
            .limit(1)
            .get();
          if (!idempSnap.empty) {
            const entry = idempSnap.docs[0].data();
            foundOrder = entry.response?.order || entry.response;
            if (foundOrder) isFromDatabase = true;
          }
        }
      } catch {}
    }

    // 3. Optional local development cache fallback
    if (!foundOrder) {
      const updateStorePath = path.join(process.cwd(), '.next', 'cache', 'kalajay_orders_update_store.json');
      if (fs.existsSync(updateStorePath)) {
        try {
          const updateStore = JSON.parse(fs.readFileSync(updateStorePath, 'utf-8'));
          if (updateStore[orderId]) {
            foundOrder = updateStore[orderId];
            isFromDatabase = true;
          }
        } catch {}
      }
    }

    // 4. Fallback ONLY to static showroom demo records (if not in real database)
    if (!foundOrder && STATIC_SHOWROOM_IDS.has(orderId) && KNOWN_ORDERS[orderId]) {
      foundOrder = KNOWN_ORDERS[orderId];
      isFromDatabase = false;
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
    // STRENGTHENED CUSTOMER OWNERSHIP & GUEST VERIFICATION
    // Access to private order details (itemized invoice, financial amounts,
    // individual piece images) strictly requires verified ownership.
    //
    // Genuine customer orders from database are NEVER bypassed by demo flags.
    // Matching a bare email address alone is insufficient proof of ownership;
    // guest verification requires matching Order Access Token OR Email + Delivery Pincode / Phone.
    // =========================================================================

    let isVerifiedOwner = false;

    // A. Authenticated Customer Ownership via Firebase ID Token
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

    // B. Cryptographic Order Access Token / Key Verification (e.g. from checkout receipt link)
    const suppliedToken = (
      searchParams.get('token') ||
      searchParams.get('key') ||
      request.headers.get('x-order-token') ||
      ''
    ).trim();

    if (!isVerifiedOwner && suppliedToken && foundOrder.customerEmail) {
      const expectedToken = generateGuestAccessToken(orderId, foundOrder.customerEmail);
      if (
        suppliedToken === expectedToken ||
        (foundOrder.guestAccessToken && suppliedToken === foundOrder.guestAccessToken)
      ) {
        isVerifiedOwner = true;
      }
    }

    // C. Multi-Factor Guest Verification (Email + Delivery Pincode OR Email + Full Phone)
    // Prevents an attacker from unlocking private items with just a guessed email address
    const queryEmail = (searchParams.get('email') || request.headers.get('x-verify-email') || '').trim().toLowerCase();
    const queryPincode = (searchParams.get('pincode') || request.headers.get('x-verify-pincode') || '').trim();
    const queryPhone = cleanDigits(searchParams.get('phone') || request.headers.get('x-verify-phone') || '');

    if (!isVerifiedOwner && queryEmail && foundOrder.customerEmail) {
      const emailMatches = queryEmail === foundOrder.customerEmail.toLowerCase().trim();
      if (emailMatches) {
        // Multi-factor knowledge check: must match shipping pincode OR full phone number
        const orderPincode = (foundOrder.shippingAddress?.pincode || '').trim();
        const orderPhone = cleanDigits(foundOrder.customerPhone || foundOrder.shippingAddress?.phone || '');

        const pincodeMatches = queryPincode && orderPincode && queryPincode === orderPincode;
        const phoneMatches = queryPhone && queryPhone.length >= 10 && orderPhone.endsWith(queryPhone.slice(-10));

        if (pincodeMatches || phoneMatches) {
          isVerifiedOwner = true;
        }
      }
    }

    // D. Static Showroom Showcase Records (KJ-8924, KJ-7710, KJ-6502) ONLY
    // Genuine database records are NEVER exempted through demo logic
    if (!isFromDatabase && foundOrder.isStaticShowroomDemo && STATIC_SHOWROOM_IDS.has(orderId)) {
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
      : []; // Strictly redacted for unverified lookups to prevent cross-customer data leakage

    const publicOrder = {
      id: foundOrder.id || orderId,
      customerName: maskedName,
      fulfillmentStatus: foundOrder.fulfillmentStatus || 'unfulfilled',
      paymentStatus: foundOrder.paymentStatus || 'pending',
      items: publicItems,
      itemCount: rawItems.length,
      isVerifiedOwner,
      requiresVerification: !isVerifiedOwner,
      verificationPrompt: !isVerifiedOwner
        ? 'For patron privacy, itemized parcel contents and financial invoices require customer verification. Sign in or enter your order email and delivery pincode or phone to view complete contents.'
        : undefined,
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

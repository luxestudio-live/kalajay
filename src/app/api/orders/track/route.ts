import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Known demo orders for showroom preview
const KNOWN_ORDERS: Record<string, any> = {
  'KJ-8924': {
    id: 'KJ-8924',
    customerName: 'Sonali S.',
    fulfillmentStatus: 'shipped',
    paymentStatus: 'paid',
    items: [
      { name: 'Pearl Vanity Box Heirloom', sku: 'KJ-PVB-101', price: 1449, quantity: 1, image: 'https://www.kalajay.in/v2/p3-2.jpg' },
      { name: 'Pearl Drop AirPods Case', sku: 'KJ-APC-401', price: 399, quantity: 1, image: 'https://www.kalajay.in/v2/p12-3.jpg' }
    ],
    total: 1848,
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
  },
  'KJ-7710': {
    id: 'KJ-7710',
    customerName: 'Ananya V.',
    fulfillmentStatus: 'quality_checked',
    paymentStatus: 'paid',
    items: [
      { name: 'Pearl Beaded Vintage Bag', sku: 'KJ-PRS-207', price: 2399, quantity: 1, image: 'https://www.kalajay.in/v2/p6-2.jpg' }
    ],
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
  },
  'KJ-6502': {
    id: 'KJ-6502',
    customerName: 'Rohan M.',
    fulfillmentStatus: 'in_loom',
    paymentStatus: 'pending',
    items: [
      { name: 'Crystal Beaded Tealight Lantern Set', sku: 'KJ-TEA-501', price: 999, quantity: 1, image: 'https://www.kalajay.in/v2/p16-3.jpg' }
    ],
    total: 1029,
    shippingAddress: { city: 'Bengaluru', state: 'Karnataka' },
    timeline: [
      { title: 'Scheduled on Loom', timestamp: '2026-11-02T08:00:00Z', note: 'Bead count 420 faceted glass crystals' }
    ],
    artisanNote: 'Currently on the artisan loom. 420 faceted glass beads threaded and tensioned.',
    courier: 'Scheduled via Kalajay Atelier Team',
    trackingAwb: 'Pending Craft House Dispatch',
    createdAt: '2026-11-02T08:00:00Z',
  },
};

// In-memory rate limiting and anti-enumeration tarpit (Concern 1)
const ipLookupTracker = new Map<string, { count: number; windowStart: number; failedAttempts: number; lockedUntil?: number }>();

function checkRateLimit(ip: string): { allowed: boolean; error?: string } {
  const now = Date.now();
  const record = ipLookupTracker.get(ip) || { count: 0, windowStart: now, failedAttempts: 0 };

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
  if (record.count > 45) {
    ipLookupTracker.set(ip, record);
    return {
      allowed: false,
      error: 'Order tracking rate limit exceeded. Please wait a moment before trying again.',
    };
  }

  ipLookupTracker.set(ip, record);
  return { allowed: true };
}

function recordFailedAttempt(ip: string) {
  const now = Date.now();
  const record = ipLookupTracker.get(ip) || { count: 1, windowStart: now, failedAttempts: 0 };
  record.failedAttempts++;
  if (record.failedAttempts >= 8) {
    record.lockedUntil = now + 5 * 60 * 1000; // 5-minute lockout on repeated scanning
    record.failedAttempts = 0;
  }
  ipLookupTracker.set(ip, record);
}

function recordSuccess(ip: string) {
  const record = ipLookupTracker.get(ip);
  if (record && record.failedAttempts > 0) {
    record.failedAttempts = 0;
    ipLookupTracker.set(ip, record);
  }
}

function readDurableStore(fileName: string): Record<string, any> {
  try {
    const fPath = path.join(process.cwd(), '.next', 'cache', fileName);
    if (fs.existsSync(fPath)) {
      return JSON.parse(fs.readFileSync(fPath, 'utf-8'));
    }
  } catch {}
  return {};
}

export async function GET(request: Request) {
  try {
    const forwardedFor = request.headers.get('x-forwarded-for') || '';
    const clientIp = forwardedFor.split(',')[0].trim() || '127.0.0.1';

    const rateCheck = checkRateLimit(clientIp);
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

    // 1. Search in durable idempotency store (all placed orders)
    const idempStore = readDurableStore('kalajay_idempotency_store.json');
    for (const key of Object.keys(idempStore)) {
      const entry = idempStore[key];
      if (entry?.orderId === orderId || entry?.response?.orderId === orderId) {
        foundOrder = entry.response?.order;
        break;
      }
    }

    // 2. Check update store (for status changes)
    if (foundOrder) {
      const updateStore = readDurableStore('kalajay_orders_update_store.json');
      if (updateStore[orderId]) {
        foundOrder = { ...foundOrder, ...updateStore[orderId] };
      }
    }

    // 3. Fallback to showroom demo orders
    if (!foundOrder && KNOWN_ORDERS[orderId]) {
      foundOrder = KNOWN_ORDERS[orderId];
    }

    if (!foundOrder) {
      recordFailedAttempt(clientIp);
      return NextResponse.json(
        { success: false, error: 'Order not found in atelier chronicle.' },
        { status: 404 }
      );
    }

    recordSuccess(clientIp);

    // Privacy masking for patron name (e.g. "Meera Rajput" -> "Meera R.")
    const rawName = (foundOrder.customerName || 'Honoured Patron').trim();
    const nameParts = rawName.split(/\s+/);
    const maskedName = nameParts.length > 1
      ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
      : rawName;

    const rawAwb = foundOrder.trackingAwb || `KJ-DISP-${(foundOrder.id || orderId).replace(/\D/g, '')}`;
    const isInternalAwb = rawAwb.startsWith('KJ-DISP-') || (foundOrder.courier || '').includes('Kalajay In-House');

    const publicOrder = {
      id: foundOrder.id || orderId,
      customerName: maskedName,
      fulfillmentStatus: foundOrder.fulfillmentStatus || 'unfulfilled',
      paymentStatus: foundOrder.paymentStatus || 'pending',
      items: Array.isArray(foundOrder.items)
        ? foundOrder.items.map((it: any) => ({
            name: it.name || 'Handcrafted Piece',
            sku: it.sku || it.productId || 'KJ-ATELIER',
            price: Number(it.price) || 0,
            quantity: Number(it.quantity) || 1,
            image: it.image || 'https://www.kalajay.in/v2/p3-2.jpg',
          }))
        : [],
      subtotal: foundOrder.subtotal,
      discount: foundOrder.discount || 0,
      shipping: foundOrder.shipping || 0,
      tax: foundOrder.tax || 0,
      total: foundOrder.total || 0,
      shippingAddress: {
        city: foundOrder.shippingAddress?.city || 'India',
        state: foundOrder.shippingAddress?.state || '',
      },
      timeline: Array.isArray(foundOrder.timeline) && foundOrder.timeline.length > 0
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
          ],
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

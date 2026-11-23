/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Server-Authoritative Transactional Order Lifecycle Email Dispatcher
 *
 * Supported Order Lifecycle Milestones:
 * 1.  order_placed       -> "Kalajay Atelier: Order #[orderId] Received & Craft Logged"
 * 2.  payment_success    -> "Payment Confirmed: Your Kalajay Heirloom is Entering the Looms"
 * 3.  payment_failed     -> "Payment Notice: Order #[orderId] Incomplete"
 * 4.  in_loom            -> "Looms in Motion: Your Custom Kalajay Piece is Being Hand-Strung"
 * 5.  quality_checked    -> "Atelier Seal: Your Kalajay Creation has Passed Master Inspection"
 * 6.  shipped            -> "In Transit: Your Kalajay Order #[orderId] is En Route"
 * 7.  out_for_delivery   -> "Out for Delivery: Your Kalajay Heirloom is Arriving Today"
 * 8.  delivered          -> "Delivered: Welcome Your Kalajay Creation"
 * 9.  rto                -> "Delivery Notice / Return to Origin: Order #[orderId]"
 * 10. cancelled          -> "Cancellation Notice: Order #[orderId]"
 * 11. refunded           -> "Refund Completed: Order #[orderId]"
 *
 * Architecture:
 * - Durable Firestore Outbox (/notification_outbox/{id}) with local disk mirror
 * - Concurrency lease locking against worker race conditions
 * - Status differentiation: queued | claiming | provider_accepted | delivered | failed | sandbox_mocked | skipped
 * - Safe retries without order state corruption
 * - Decoupled non-blocking execution
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';
import {
  KALAJAY_SELLER_DETAILS,
  getStableInvoiceNumber,
  fetchOrderAuthoritatively,
} from '@/lib/invoiceGenerator';

export type OrderLifecycleEvent =
  | 'order_placed'
  | 'payment_success'
  | 'payment_failed'
  | 'in_loom'
  | 'quality_checked'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'rto'
  | 'cancelled'
  | 'refunded';

export type NotificationDeliveryStatus =
  | 'queued'
  | 'claiming'
  | 'provider_accepted'
  | 'delivered'
  | 'failed'
  | 'sandbox_mocked'
  | 'skipped';

export interface NotificationOutboxItem {
  id: string; // e.g. notif_${orderId}_${event}_${timestamp}
  orderId: string;
  event: OrderLifecycleEvent;
  to: string;
  customerName: string;
  subject: string;
  status: NotificationDeliveryStatus;
  mode: 'live' | 'sandbox';
  provider: 'resend' | 'sendgrid' | 'sandbox-logger';
  providerMessageId?: string;
  attempts: number;
  lastAttemptAt?: string;
  lastError?: string;
  claimedBy?: string;
  claimedAt?: number;
  createdAt: string;
  updatedAt: string;
  previewSnippet: string;
  isDeduplicated?: boolean;
}

// In-memory register for zero-latency lookups
const inMemoryOutbox = new Map<string, NotificationOutboxItem>();

function getOutboxDiskPath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch {}
  }
  return path.join(cacheDir, 'kalajay_notification_outbox.json');
}

export function readDiskOutbox(): Record<string, NotificationOutboxItem> {
  try {
    const p = getOutboxDiskPath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeDiskOutbox(data: Record<string, NotificationOutboxItem>) {
  try {
    const p = getOutboxDiskPath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

function cleanPayload<T extends Record<string, any>>(obj: T): Partial<T> {
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      clean[k] = v;
    }
  }
  return clean;
}

/**
 * Persists an outbox item to Firestore and disk mirror.
 */
async function saveOutboxItem(item: NotificationOutboxItem): Promise<void> {
  inMemoryOutbox.set(item.id, item);

  // 1. Local disk store
  const store = readDiskOutbox();
  store[item.id] = item;
  writeDiskOutbox(store);

  // 2. Authoritative Firestore /notification_outbox via Admin SDK
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const payload = cleanPayload(item);
      await adminDb.collection('notification_outbox').doc(item.id).set(payload, { merge: true });
      return;
    }
  } catch (err) {
    // Non-blocking log
  }
}

/**
 * Loads an outbox item by ID from memory, Firestore, or disk mirror.
 */
export async function getOutboxItem(id: string): Promise<NotificationOutboxItem | null> {
  if (inMemoryOutbox.has(id)) {
    return inMemoryOutbox.get(id)!;
  }

  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb.collection('notification_outbox').doc(id).get();
      if (snap.exists) {
        const data = snap.data() as NotificationOutboxItem;
        inMemoryOutbox.set(id, data);
        return data;
      }
    }
  } catch {}

  const disk = readDiskOutbox();
  if (disk[id]) {
    inMemoryOutbox.set(id, disk[id]);
    return disk[id];
  }

  return null;
}

/**
 * Computes deterministic guest order access token
 */
export function generateGuestAccessToken(orderId: string, customerEmail: string): string {
  const trackingSecret =
    process.env.ORDER_TRACKING_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'kalajay_guest_order_tracking_salt_2026';
  return crypto
    .createHmac('sha256', trackingSecret)
    .update(`${orderId}:${customerEmail.toLowerCase().trim()}`)
    .digest('hex')
    .substring(0, 24);
}

/**
 * Generates subject line and narrative copy for each order lifecycle event.
 */
export function getEventCopy(event: OrderLifecycleEvent, orderId: string, order?: any): {
  subject: string;
  badge: string;
  badgeColor: string;
  heading: string;
  narrative: string;
  actionText: string;
  actionUrlPath: string;
} {
  switch (event) {
    case 'order_placed':
      return {
        subject: `Kalajay Atelier: Order #${orderId} Received & Craft Logged`,
        badge: 'Order Logged · Pending Loom Allocation',
        badgeColor: '#9E5430',
        heading: 'Your Handcrafted Order Has Been Received',
        narrative:
          'Your bespoke creation has been entered into the Kalajay studio ledger. Our master artisans in our Bihar craft house are preparing tensioned cordage, glass seed beads, and freshwater pearls to begin hand-stringing.',
        actionText: 'View Live Order Provenance',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
    case 'payment_success':
      return {
        subject: `Payment Confirmed: Your Kalajay Heirloom is Entering the Looms`,
        badge: 'Payment Confirmed · Looms Active',
        badgeColor: '#0F766E',
        heading: 'Payment Confirmed & Secured',
        narrative:
          'We have authoritatively confirmed your transaction. The loom slot for your order has been secured, and dedicated artisan hands have begun threading your chosen colorway and silhouette.',
        actionText: 'Download Official Tax Invoice',
        actionUrlPath: `/api/orders/${orderId}/invoice?download=1`,
      };
    case 'payment_failed':
      return {
        subject: `Payment Notice: Order #${orderId} Incomplete`,
        badge: 'Payment Incomplete · Inventory Reserved',
        badgeColor: '#B91C1C',
        heading: 'Notice Regarding Your Recent Payment',
        narrative:
          'We encountered an issue finalizing the transaction with the payment provider. Your selected handcrafted pieces and loom slot are temporarily held for 2 hours while you complete authorization.',
        actionText: 'Retry Secure Payment',
        actionUrlPath: `/checkout?orderId=${orderId}`,
      };
    case 'in_loom':
      return {
        subject: `Looms in Motion: Your Custom Kalajay Piece is Being Hand-Strung`,
        badge: 'Looms in Motion · Artisan Weaving',
        badgeColor: '#B45309',
        heading: 'Your Heirloom is on the Artisan Loom',
        narrative:
          'Master artisans have begun stringing your creation, tensioning each bead individually with high-grade multi-filament cordage. Every row is measured under natural morning light to ensure flawless drape and silhouette.',
        actionText: 'Watch Loom Milestones',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
    case 'quality_checked':
      return {
        subject: `Atelier Seal: Your Kalajay Creation has Passed Master Inspection`,
        badge: 'Quality Checked · Atelier Wax Sealed',
        badgeColor: '#0F766E',
        heading: 'Master Inspection & Insignia Wax Seal Applied',
        narrative:
          'Your piece has completed weaving and has passed comprehensive structural and aesthetic inspection by our head of atelier. It has been wrapped in unbleached archival tissue and wax-sealed with the Kalajay insignia.',
        actionText: 'Inspect Quality Certificate',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
    case 'shipped': {
      const carrierDisplay = order?.courier || (order?.shippingMethod === 'in_house' ? 'Kalajay in-house logistics fleet' : 'our designated courier partner');
      return {
        subject: `In Transit: Your Kalajay Order #${orderId} is En Route`,
        badge: order?.courier ? `Dispatched · ${order.courier}` : 'Dispatched · Air Transit En Route',
        badgeColor: '#1D4ED8',
        heading: 'Your Heirloom Has Departed the Atelier',
        narrative:
          `Your package has been handed over for insured express transit via ${carrierDisplay}. It travels in reinforced temperature-neutral packaging to preserve the tension and luster of each handcrafted component.`,
        actionText: 'Track Consignment',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
    }
    case 'out_for_delivery': {
      const carrierDisplay = order?.courier || (order?.shippingMethod === 'in_house' ? 'our in-house delivery concierge' : 'our courier delivery partner');
      return {
        subject: `Out for Delivery: Your Kalajay Heirloom is Arriving Today`,
        badge: order?.courier ? `Out for Delivery · ${order.courier}` : 'Out for Delivery · Scheduled Handover',
        badgeColor: '#0284C7',
        heading: 'Scheduled Handover Today',
        narrative:
          `Your Kalajay handcrafted creation is out for delivery today with ${carrierDisplay}. Our representative will present the sealed parcel at your designated destination.`,
        actionText: 'Track Delivery Concierge',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
    }
    case 'delivered':
      return {
        subject: `Delivered: Welcome Your Kalajay Creation`,
        badge: 'Delivered · Provenance in Hand',
        badgeColor: '#15803D',
        heading: 'Delivered to Your Destination',
        narrative:
          'Your Kalajay handcrafted creation has been safely delivered. We hope this piece brings enduring joy, beauty, and thoughtful craftsmanship to your personal collection.',
        actionText: 'Review Your Handcrafted Piece',
        actionUrlPath: `/account?tab=orders`,
      };
    case 'rto':
      return {
        subject: `Delivery Notice / Return to Origin: Order #${orderId}`,
        badge: 'Return to Origin · Undelivered',
        badgeColor: '#E11D48',
        heading: 'Undelivered Parcel Notice',
        narrative:
          'Our delivery team was unable to complete handover at the designated destination. Your parcel has been securely rerouted back to our Worli Flagship Studio for inspection and rescheduling.',
        actionText: 'Contact Concierge',
        actionUrlPath: `/contact`,
      };
    case 'cancelled':
      return {
        subject: `Cancellation Notice: Order #${orderId}`,
        badge: 'Cancelled · Stock Released',
        badgeColor: '#6B7280',
        heading: 'Your Order Has Been Cancelled',
        narrative:
          'As requested or due to an atelier operational update, order #' +
          orderId +
          ' has been cancelled. Any dedicated stock has been restored to the studio ledger.',
        actionText: 'Visit Kalajay Studio',
        actionUrlPath: `/shop`,
      };
    case 'refunded':
      return {
        subject: `Refund Completed: Order #${orderId}`,
        badge: 'Refund Processed · Credit Note Issued',
        badgeColor: '#4338CA',
        heading: 'Refund Has Been Processed',
        narrative:
          'Your refund has been authoritatively initiated through our financial settlement provider. The credit should reflect in your original funding method within 3 to 5 business days according to standard banking clearing.',
        actionText: 'Download Credit Note Receipt',
        actionUrlPath: `/api/orders/${orderId}/invoice?download=1`,
      };
  }
}

/**
 * Builds responsive luxury HTML email template.
 */
export function buildOrderEmailHtml(params: {
  order: any;
  event: OrderLifecycleEvent;
  guestToken?: string;
  baseUrl?: string;
}): { subject: string; html: string } {
  const { order, event, guestToken } = params;
  const baseUrl = params.baseUrl || process.env.NEXT_PUBLIC_APP_URL || 'https://www.kalajay.in';
  const orderId = order.id || `KJ-${Date.now().toString().slice(-4)}`;
  const patronName = order.customerName || 'Honoured Patron';
  const invNumber = getStableInvoiceNumber(order);
  const copy = getEventCopy(event, orderId, order);

  const tokenParam = guestToken ? `&token=${encodeURIComponent(guestToken)}` : '';
  const actionFullUrl = `${baseUrl}${copy.actionUrlPath}${copy.actionUrlPath.includes('?') ? tokenParam : `?${tokenParam.replace('&', '')}`}`;
  const invoiceDownloadUrl = `${baseUrl}/api/orders/${orderId}/invoice?download=1${tokenParam}`;

  const shipping = order.shippingAddress || {};
  const shippingAddressStr = [
    shipping.addressLine || shipping.street,
    shipping.city,
    shipping.state ? `${shipping.state} - ${shipping.pincode || ''}` : shipping.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  const items: any[] = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal) || 0;
  const discount = Number(order.discount) || 0;
  const shippingFee = Number(order.shipping) || 0;
  const tax = Number(order.tax) || 0;
  const total = Number(order.total) || 0;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${copy.subject}</title>
  <style>
    body { background-color: #F7F5F0; color: #372921; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
    .wrapper { width: 100%; background-color: #F7F5F0; padding: 32px 16px; box-sizing: border-box; }
    .container { max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #EAE2D8; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(55, 41, 33, 0.05); }
    .top-gold-bar { height: 4px; background: linear-gradient(90deg, #9E5430 0%, #D4AF37 50%, #9E5430 100%); }
    .header { padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #F3EDE6; }
    .brand-name { font-family: Georgia, 'Times New Roman', serif; font-size: 26px; letter-spacing: 0.15em; color: #372921; margin: 0; font-weight: 700; }
    .brand-tagline { font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #9E5430; margin-top: 4px; font-weight: 600; }
    .body-content { padding: 32px; }
    .badge { display: inline-block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 5px 12px; border-radius: 20px; color: #FFFFFF; background-color: ${copy.badgeColor}; margin-bottom: 16px; }
    .heading { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #372921; margin: 0 0 12px 0; font-weight: 600; line-height: 1.35; }
    .salutation { font-size: 14px; color: #5C4D44; line-height: 1.6; margin-bottom: 16px; }
    .narrative-box { background-color: #FAF8F5; border-left: 3px solid #9E5430; padding: 14px 18px; border-radius: 0 8px 8px 0; font-size: 13.5px; color: #4A3E37; line-height: 1.6; margin-bottom: 24px; }
    .order-meta-card { background: #FFFFFF; border: 1px solid #EAE2D8; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
    .order-meta-row { display: flex; justify-content: space-between; font-size: 12.5px; color: #76695F; padding: 4px 0; }
    .order-meta-val { font-weight: 600; color: #372921; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .items-table th { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.1em; color: #76695F; padding: 10px 8px; border-bottom: 1px solid #EAE2D8; text-align: left; }
    .items-table td { padding: 12px 8px; border-bottom: 1px solid #F3EDE6; font-size: 13px; vertical-align: top; }
    .item-title { font-weight: 600; color: #372921; display: block; }
    .item-variant { display: block; font-size: 11px; color: #8C7C71; margin-top: 3px; }
    .financials-box { width: 100%; margin-bottom: 24px; }
    .fin-row { display: flex; justify-content: space-between; font-size: 13px; color: #76695F; padding: 4px 0; }
    .fin-row.total-row { border-top: 2px solid #9E5430; margin-top: 8px; padding-top: 10px; font-size: 15px; font-weight: 700; color: #372921; }
    .cta-wrapper { text-align: center; padding: 16px 0 24px 0; }
    .cta-button { display: inline-block; background-color: #9E5430; color: #FFFFFF !important; text-decoration: none; font-size: 13px; font-weight: 600; padding: 12px 28px; border-radius: 8px; letter-spacing: 0.03em; }
    .invoice-link { display: block; margin-top: 12px; font-size: 12px; color: #9E5430; text-decoration: underline; }
    .tracking-info-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 14px; margin-bottom: 24px; font-size: 12.5px; color: #166534; }
    .footer { background-color: #FAF8F5; border-top: 1px solid #EAE2D8; padding: 24px 32px; font-size: 11px; color: #8C7C71; line-height: 1.6; text-align: center; }
    .footer-brand { font-weight: 700; color: #372921; margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-gold-bar"></div>
      <div class="header">
        <h1 class="brand-name">KALAJAY</h1>
        <div class="brand-tagline">Handcrafted Luxuries · Worli Atelier</div>
      </div>
      <div class="body-content">
        <div class="badge">${copy.badge}</div>
        <h2 class="heading">${copy.heading}</h2>
        <div class="salutation">
          Dear ${patronName},<br><br>
          Thank you for entrusting Kalajay with your curated collection. Here is the latest status of your handcrafted order:
        </div>
        <div class="narrative-box">${copy.narrative}</div>

        ${(order.courier || order.trackingAwb || order.customerShippingNote || order.estimatedDeliveryDate) ? `
        <div class="tracking-info-box">
          <strong style="color: #166534; font-size: 13px;">Shipment &amp; Delivery Information:</strong><br>
          ${order.courier ? `<span style="display:inline-block; margin-top:4px;">Carrier / Fleet: <strong>${order.courier}</strong></span><br>` : ''}
          ${order.trackingAwb ? `<span style="display:inline-block; margin-top:2px;">Consignment / AWB: <code style="font-weight: bold; background: #DCFCE7; padding: 2px 6px; border-radius: 4px;">${order.trackingAwb}</code></span><br>` : ''}
          ${order.estimatedDeliveryDate ? `<span style="display:inline-block; margin-top:2px;">Estimated Delivery: <strong>${order.estimatedDeliveryDate}</strong></span><br>` : ''}
          ${(order.trackingUrl && (order.trackingUrl.startsWith('http://') || order.trackingUrl.startsWith('https://'))) ? `
            <div style="margin-top: 8px;">
              <a href="${order.trackingUrl}" target="_blank" rel="noopener noreferrer" style="color: #15803D; font-weight: 600; text-decoration: underline;">
                Track Consignment on Carrier Portal &rarr;
              </a>
            </div>
          ` : ''}
          ${order.customerShippingNote ? `
            <div style="margin-top: 6px; font-style: italic; color: #166534; font-size: 12px; border-top: 1px dashed #BBF7D0; padding-top: 4px;">
              Note: ${order.customerShippingNote}
            </div>
          ` : ''}
        </div>
        ` : ''}

        <div class="order-meta-card">
          <div class="order-meta-row">
            <span>Order Reference:</span>
            <span class="order-meta-val">#${orderId}</span>
          </div>
          <div class="order-meta-row">
            <span>Invoice Number:</span>
            <span class="order-meta-val">${invNumber}</span>
          </div>
          <div class="order-meta-row">
            <span>Payment Status:</span>
            <span class="order-meta-val" style="text-transform: uppercase;">${order.paymentStatus || 'pending'}</span>
          </div>
          ${shippingAddressStr ? `
          <div class="order-meta-row" style="margin-top: 6px; border-top: 1px dashed #EAE2D8; padding-top: 6px;">
            <span>Delivery Destination:</span>
            <span class="order-meta-val" style="text-align: right; max-width: 60%;">${shippingAddressStr}</span>
          </div>
          ` : ''}
        </div>

        ${items.length > 0 ? `
        <table class="items-table">
          <thead>
            <tr>
              <th>Item Specification</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(it => {
              const variantStr = it.attributes && Object.keys(it.attributes).length > 0
                ? Object.entries(it.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')
                : it.variantLabel || '';
              return `
              <tr>
                <td>
                  <span class="item-title">${it.name}</span>
                  ${variantStr ? `<span class="item-variant">${variantStr}</span>` : ''}
                </td>
                <td style="text-align: center;">${it.quantity || 1}</td>
                <td style="text-align: right; font-weight: 600;">Rs. ${Number(it.total || it.price * (it.quantity || 1)).toLocaleString('en-IN')}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ` : ''}

        <div class="financials-box">
          <div class="fin-row">
            <span>Items Subtotal:</span>
            <span>Rs. ${subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${discount > 0 ? `
          <div class="fin-row" style="color: #0F766E;">
            <span>Atelier Discount:</span>
            <span>- Rs. ${discount.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="fin-row">
            <span>Shipping:</span>
            <span>${shippingFee === 0 ? 'Complimentary' : `Rs. ${shippingFee.toLocaleString('en-IN')}`}</span>
          </div>
          ${tax > 0 ? `
          <div class="fin-row">
            <span>GST Included:</span>
            <span>Rs. ${tax.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="fin-row total-row">
            <span>Order Total:</span>
            <span style="color: #9E5430;">Rs. ${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div class="cta-wrapper">
          <a href="${actionFullUrl}" class="cta-button" target="_blank">${copy.actionText}</a>
          <a href="${invoiceDownloadUrl}" class="invoice-link" target="_blank">Download Official PDF Tax Invoice (${invNumber})</a>
        </div>
      </div>

      <div class="footer">
        <div class="footer-brand">${KALAJAY_SELLER_DETAILS.entityName}</div>
        <div>${KALAJAY_SELLER_DETAILS.address}</div>
        <div>GSTIN: ${KALAJAY_SELLER_DETAILS.gstin} | PAN: ${KALAJAY_SELLER_DETAILS.pan}</div>
        <div style="margin-top: 8px;">
          WhatsApp Concierge: ${KALAJAY_SELLER_DETAILS.contactPhone} &middot; Email: ${KALAJAY_SELLER_DETAILS.contactEmail}
        </div>
        <div style="margin-top: 10px; font-size: 10px; color: #A89C92;">
          Official transactional notification. Retained pursuant to Section 36 of the CGST Act, 2017.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject: copy.subject, html };
}

/**
 * Builds a durable transition ID for the notification outbox.
 * Distinguishes initial events from sequential repeated milestones.
 */
export function buildOutboxNotificationId(
  orderId: string,
  event: OrderLifecycleEvent,
  transitionKey?: string
): string {
  const cleanId = orderId.trim().toUpperCase();
  if (['order_placed', 'payment_success', 'payment_failed'].includes(event)) {
    return `notif_${cleanId}_${event}`;
  }
  const suffix = transitionKey ? `_${transitionKey}` : '';
  return `notif_${cleanId}_${event}${suffix}`;
}

/**
 * Authoritatively dispatches an order lifecycle notification through the Durable Outbox.
 * Non-blocking, concurrency-safe, with accurate provider state reflection.
 */
export async function dispatchOrderLifecycleNotification(params: {
  order: any;
  event: OrderLifecycleEvent;
  transitionKey?: string;
  forceResend?: boolean;
}): Promise<NotificationOutboxItem> {
  const { order, event, transitionKey, forceResend } = params;
  const orderId = order.id || `KJ-${Date.now().toString().slice(-4)}`;
  const to = (order.customerEmail || '').trim().toLowerCase();
  const customerName = order.customerName || 'Honoured Patron';
  const outboxId = buildOutboxNotificationId(orderId, event, transitionKey);

  // 1. Check existing outbox state
  const existing = await getOutboxItem(outboxId);
  if (existing && !forceResend) {
    // If already successfully accepted by provider, delivered, or sandbox-mocked, do NOT duplicate
    if (
      existing.status === 'provider_accepted' ||
      existing.status === 'delivered' ||
      existing.status === 'sandbox_mocked'
    ) {
      return {
        ...existing,
        isDeduplicated: true,
      };
    }

    // Concurrency lease check: if another worker claimed within 60s, yield
    if (existing.status === 'claiming' && existing.claimedAt && Date.now() - existing.claimedAt < 60000) {
      return {
        ...existing,
        isDeduplicated: true,
      };
    }
  }

  // 2. Validate recipient email
  if (!to || !to.includes('@')) {
    const skippedItem: NotificationOutboxItem = {
      id: outboxId,
      orderId,
      event,
      to: to || 'missing@kalajay.in',
      customerName,
      subject: `Order #${orderId} Notification Skipped (No Email)`,
      status: 'skipped',
      mode: 'sandbox',
      provider: 'sandbox-logger',
      attempts: 0,
      lastError: 'Missing or invalid customerEmail on order snapshot.',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewSnippet: 'Skipped dispatch due to missing recipient email.',
    };
    await saveOutboxItem(skippedItem);
    return skippedItem;
  }

  // 3. Concurrency Lock: Claim outbox slot
  const workerId = `worker_${process.pid}_${Math.random().toString(36).substring(2, 7)}`;
  const claimedItem: NotificationOutboxItem = {
    ...(existing || {
      id: outboxId,
      orderId,
      event,
      to,
      customerName,
      subject: '',
      attempts: 0,
      createdAt: new Date().toISOString(),
      previewSnippet: '',
      mode: 'sandbox',
      provider: 'sandbox-logger',
    }),
    status: 'claiming',
    claimedBy: workerId,
    claimedAt: Date.now(),
    updatedAt: new Date().toISOString(),
  };
  await saveOutboxItem(claimedItem);

  // 4. Compile HTML Template
  try {
    const guestToken = generateGuestAccessToken(orderId, to);
    const { subject, html } = buildOrderEmailHtml({ order, event, guestToken });
    const previewSnippet = `[${event.toUpperCase()}] ${subject} -> To: ${to}`;

    let deliveryStatus: NotificationDeliveryStatus = 'sandbox_mocked';
    let mode: NotificationOutboxItem['mode'] = 'sandbox';
    let providerName: NotificationOutboxItem['provider'] = 'sandbox-logger';
    let providerMessageId: string | undefined = undefined;
    let sendError: string | undefined = undefined;

    // 5. Live Provider Dispatch (Resend) if configured with valid API key and verified sender
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      try {
        mode = 'live';
        providerName = 'resend';
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: process.env.EMAIL_FROM || 'Kalajay Atelier <orders@kalajay.in>',
            to: [to],
            subject,
            html,
          }),
        });

        if (res.ok) {
          const resData = await res.json().catch(() => ({}));
          // Accurately reflect provider acceptance (NOT premature 'delivered')
          deliveryStatus = 'provider_accepted';
          providerMessageId = resData.id || `resend_${Date.now()}`;
        } else {
          deliveryStatus = 'failed';
          const errData = await res.json().catch(() => ({}));
          sendError = errData.message || `Provider returned HTTP ${res.status}`;
        }
      } catch (networkErr: any) {
        deliveryStatus = 'failed';
        sendError = networkErr?.message || 'Network transport exception';
      }
    } else {
      // Sandbox mode: explicitly marked as sandbox_mocked (NEVER sent or provider_accepted)
      deliveryStatus = 'sandbox_mocked';
      mode = 'sandbox';
      providerName = 'sandbox-logger';
    }

    const finalRecord: NotificationOutboxItem = {
      id: outboxId,
      orderId,
      event,
      to,
      customerName,
      subject,
      status: deliveryStatus,
      mode,
      provider: providerName,
      providerMessageId,
      attempts: (existing?.attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString(),
      lastError: sendError,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewSnippet,
    };

    await saveOutboxItem(finalRecord);
    return finalRecord;
  } catch (compileErr: any) {
    const failedRecord: NotificationOutboxItem = {
      id: outboxId,
      orderId,
      event,
      to,
      customerName,
      subject: `Error compiling ${event}`,
      status: 'failed',
      mode: 'sandbox',
      provider: 'sandbox-logger',
      attempts: (existing?.attempts || 0) + 1,
      lastAttemptAt: new Date().toISOString(),
      lastError: compileErr?.message || 'Template compilation error',
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      previewSnippet: 'Failure during notification compilation.',
    };
    await saveOutboxItem(failedRecord);
    return failedRecord;
  }
}

/**
 * Retries a failed notification outbox item safely without altering order status.
 */
export async function retryNotificationOutboxItem(
  outboxId: string,
  orderSnapshot: any
): Promise<NotificationOutboxItem | null> {
  const item = await getOutboxItem(outboxId);
  if (!item) return null;

  // If already accepted by provider, do not re-send
  if (item.status === 'provider_accepted' || item.status === 'delivered') {
    return item;
  }

  const parts = outboxId.split(`_${item.event}`);
  const transitionKey = parts[1] ? parts[1].replace(/^_/, '') : undefined;

  return dispatchOrderLifecycleNotification({
    order: orderSnapshot,
    event: item.event,
    transitionKey,
    forceResend: true,
  });
}

/**
 * Processes pending, un-dispatched, stale-claimed, or retryable notification outbox items.
 * Recovers queued or failed state after a server restart or network interruption.
 */
export async function processPendingNotificationOutbox(options?: {
  maxAttempts?: number;
  limit?: number;
}): Promise<{
  totalPending: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
}> {
  const maxAttempts = options?.maxAttempts || 3;
  const limit = options?.limit || 50;

  // 1. Gather candidate items from disk mirror and memory
  const diskStore = readDiskOutbox();

  // 2. Also query Admin Firestore if available
  try {
    const adminDb = getAdminFirestore();
    if (adminDb) {
      const snap = await adminDb
        .collection('notification_outbox')
        .where('status', 'in', ['queued', 'failed', 'claiming'])
        .limit(limit)
        .get();

      snap.forEach((docSnap) => {
        const item = docSnap.data() as NotificationOutboxItem;
        if (item && item.id) {
          diskStore[item.id] = item;
        }
      });
    }
  } catch {}

  // 3. Filter for truly recoverable items
  const now = Date.now();
  const candidates: NotificationOutboxItem[] = [];

  for (const item of Object.values(diskStore)) {
    if (!item || !item.id) continue;

    const isQueued = item.status === 'queued';
    const isRetryableFailure = item.status === 'failed' && (item.attempts || 0) < maxAttempts;
    const isStaleClaim =
      item.status === 'claiming' &&
      item.claimedAt &&
      now - item.claimedAt > 60000; // Worker crashed/restarted more than 60s ago

    if (isQueued || isRetryableFailure || isStaleClaim) {
      candidates.push(item);
    }
  }

  const results = {
    totalPending: candidates.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
  };

  // 4. Process each recoverable item safely without corrupting order state
  for (const item of candidates.slice(0, limit)) {
    results.processed++;
    try {
      const orderSnapshot = await fetchOrderAuthoritatively(item.orderId);
      if (!orderSnapshot) {
        item.status = 'failed';
        item.lastError = `Authoritative order #${item.orderId} not found during outbox replay.`;
        item.attempts = (item.attempts || 0) + 1;
        item.updatedAt = new Date().toISOString();
        await saveOutboxItem(item);
        results.failed++;
        continue;
      }

      const res = await retryNotificationOutboxItem(item.id, orderSnapshot);
      if (res?.status === 'provider_accepted' || res?.status === 'sandbox_mocked') {
        results.succeeded++;
      } else if (res?.status === 'skipped') {
        results.skipped++;
      } else {
        results.failed++;
      }
    } catch (err: any) {
      item.status = 'failed';
      item.lastError = err?.message || 'Outbox processor recovery exception';
      item.attempts = (item.attempts || 0) + 1;
      item.updatedAt = new Date().toISOString();
      await saveOutboxItem(item);
      results.failed++;
    }
  }

  return results;
}

/**
 * Timing-safe string comparison to protect against timing side-channel attacks.
 */
export function safeSecretCompare(supplied: string, expected: string): boolean {
  if (!supplied || !expected) return false;
  const bufSupplied = Buffer.from(supplied, 'utf-8');
  const bufExpected = Buffer.from(expected, 'utf-8');
  if (bufSupplied.length !== bufExpected.length) return false;
  return crypto.timingSafeEqual(bufSupplied, bufExpected);
}

/**
 * Strictly authenticates cron requests for automatic notification outbox sweeping.
 * Fails closed if CRON_SECRET is missing, empty, or whitespace.
 * Standalone headers such as x-vercel-cron: 1 are strictly rejected without a valid secret.
 */
export function verifyCronAuthorization(request: Request): { authorized: boolean; reason?: string } {
  const cronSecret = (process.env.CRON_SECRET || '').trim();

  // Fail closed if server has not configured a nonempty CRON_SECRET
  if (!cronSecret) {
    return {
      authorized: false,
      reason: 'CRON_SECRET is not configured on the server. Recovery endpoint is closed.',
    };
  }

  // Extract candidate secret from Authorization: Bearer <token> or x-cron-secret
  const authHeader = (request.headers.get('authorization') || '').trim();
  const bearerToken = authHeader.toLowerCase().startsWith('bearer ')
    ? authHeader.slice(7).trim()
    : '';
  const customSecret = (request.headers.get('x-cron-secret') || '').trim();

  const suppliedSecret = bearerToken || customSecret;

  if (!suppliedSecret) {
    return {
      authorized: false,
      reason: 'Missing required CRON_SECRET bearer token or x-cron-secret header.',
    };
  }

  if (!safeSecretCompare(suppliedSecret, cronSecret)) {
    return {
      authorized: false,
      reason: 'Invalid CRON_SECRET credential supplied.',
    };
  }

  return { authorized: true };
}

/**
 * Resets in-memory and disk outbox stores (used by test suites).
 */
export function clearNotificationOutbox(): void {
  inMemoryOutbox.clear();
  try {
    const p = getOutboxDiskPath();
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  } catch {}
}

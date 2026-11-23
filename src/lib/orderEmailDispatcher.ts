/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Server-Authoritative Transactional Order Lifecycle Email Dispatcher
 *
 * Supported Lifecycle Events:
 * 1. order_placed       -> "Kalajay Atelier: Order #[orderId] Received & Craft Logged"
 * 2. payment_success    -> "Payment Confirmed: Your Kalajay Heirloom is Entering the Looms"
 * 3. payment_failed     -> "Payment Notice: Order #[orderId] Incomplete"
 * 4. in_loom            -> "Looms in Motion: Your Custom Kalajay Piece is Being Hand-Strung"
 * 5. quality_checked    -> "Atelier Seal: Your Kalajay Creation has Passed Master Inspection"
 * 6. shipped            -> "In Transit: Your Kalajay Order #[orderId] is En Route"
 * 7. delivered          -> "Delivered: Welcome Your Kalajay Creation"
 * 8. cancelled          -> "Cancellation Notice: Order #[orderId]"
 * 9. refunded           -> "Refund Completed: Order #[orderId]"
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { KALAJAY_SELLER_DETAILS, getStableInvoiceNumber } from '@/lib/invoiceGenerator';

export type OrderLifecycleEvent =
  | 'order_placed'
  | 'payment_success'
  | 'payment_failed'
  | 'in_loom'
  | 'quality_checked'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface EmailDispatchRecord {
  id: string;
  orderId: string;
  event: OrderLifecycleEvent;
  to: string;
  subject: string;
  dispatchedAt: string;
  mode: 'live' | 'sandbox';
  provider?: string;
  status: 'sent' | 'sandbox_logged' | 'failed' | 'deduplicated';
  error?: string;
  previewSnippet: string;
}

// In-memory register for immediate de-duplication
const dispatchedCache = new Map<string, EmailDispatchRecord>();

function getEmailAuditStorePath(): string {
  const cacheDir = path.join(process.cwd(), '.next', 'cache');
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true });
    } catch {}
  }
  return path.join(cacheDir, 'kalajay_dispatched_emails.json');
}

export function readEmailAuditStore(): Record<string, EmailDispatchRecord> {
  try {
    const p = getEmailAuditStorePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeEmailAuditStore(data: Record<string, EmailDispatchRecord>) {
  try {
    const p = getEmailAuditStorePath();
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
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
export function getEventCopy(event: OrderLifecycleEvent, orderId: string): {
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
    case 'shipped':
      return {
        subject: `In Transit: Your Kalajay Order #${orderId} is En Route`,
        badge: 'Dispatched · Air Transit En Route',
        badgeColor: '#1D4ED8',
        heading: 'Your Heirloom Has Departed the Atelier',
        narrative:
          'Your package has been handed over for insured express transit. It travels in reinforced temperature-neutral packaging to preserve the tension and luster of each handcrafted component.',
        actionText: 'Track Courier Consignment',
        actionUrlPath: `/track?orderId=${orderId}`,
      };
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
 * Builds the responsive luxury HTML email template.
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
  const copy = getEventCopy(event, orderId);

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
    body {
      background-color: #F7F5F0;
      color: #372921;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F7F5F0;
      padding: 32px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border: 1px solid #EAE2D8;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(55, 41, 33, 0.05);
    }
    .top-gold-bar {
      height: 4px;
      background: linear-gradient(90deg, #9E5430 0%, #D4AF37 50%, #9E5430 100%);
    }
    .header {
      padding: 32px 32px 20px 32px;
      text-align: center;
      border-bottom: 1px solid #F3EDE6;
    }
    .brand-name {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 26px;
      letter-spacing: 0.15em;
      color: #372921;
      margin: 0;
      font-weight: 700;
    }
    .brand-tagline {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #9E5430;
      margin-top: 4px;
      font-weight: 600;
    }
    .body-content {
      padding: 32px;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 5px 12px;
      border-radius: 20px;
      color: #FFFFFF;
      background-color: ${copy.badgeColor};
      margin-bottom: 16px;
    }
    .heading {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 20px;
      color: #372921;
      margin: 0 0 12px 0;
      font-weight: 600;
      line-height: 1.35;
    }
    .salutation {
      font-size: 14px;
      color: #5C4D44;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .narrative-box {
      background-color: #FAF8F5;
      border-left: 3px solid #9E5430;
      padding: 14px 18px;
      border-radius: 0 8px 8px 0;
      font-size: 13.5px;
      color: #4A3E37;
      line-height: 1.6;
      margin-bottom: 24px;
    }
    .order-meta-card {
      background: #FFFFFF;
      border: 1px solid #EAE2D8;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
    }
    .order-meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 12.5px;
      color: #76695F;
      padding: 4px 0;
    }
    .order-meta-val {
      font-weight: 600;
      color: #372921;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    .items-table th {
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #76695F;
      padding: 10px 8px;
      border-bottom: 1px solid #EAE2D8;
      text-align: left;
    }
    .items-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #F3EDE6;
      font-size: 13px;
      vertical-align: top;
    }
    .item-title {
      font-weight: 600;
      color: #372921;
      display: block;
    }
    .item-variant {
      display: block;
      font-size: 11px;
      color: #8C7C71;
      margin-top: 3px;
    }
    .financials-box {
      width: 100%;
      margin-bottom: 24px;
    }
    .fin-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      color: #76695F;
      padding: 4px 0;
    }
    .fin-row.total-row {
      border-top: 2px solid #9E5430;
      margin-top: 8px;
      padding-top: 10px;
      font-size: 15px;
      font-weight: 700;
      color: #372921;
    }
    .cta-wrapper {
      text-align: center;
      padding: 16px 0 24px 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #9E5430;
      color: #FFFFFF !important;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      padding: 12px 28px;
      border-radius: 8px;
      letter-spacing: 0.03em;
    }
    .invoice-link {
      display: block;
      margin-top: 12px;
      font-size: 12px;
      color: #9E5430;
      text-decoration: underline;
    }
    .tracking-info-box {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 24px;
      font-size: 12.5px;
      color: #166534;
    }
    .footer {
      background-color: #FAF8F5;
      border-top: 1px solid #EAE2D8;
      padding: 24px 32px;
      font-size: 11px;
      color: #8C7C71;
      line-height: 1.6;
      text-align: center;
    }
    .footer-brand {
      font-weight: 700;
      color: #372921;
      margin-bottom: 4px;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="top-gold-bar"></div>

      <!-- Header -->
      <div class="header">
        <h1 class="brand-name">KALAJAY</h1>
        <div class="brand-tagline">Handcrafted Luxuries · Worli Atelier</div>
      </div>

      <!-- Body Content -->
      <div class="body-content">
        <div class="badge">${copy.badge}</div>
        <h2 class="heading">${copy.heading}</h2>

        <div class="salutation">
          Dear ${patronName},<br><br>
          Thank you for entrusting Kalajay with your curated collection. Here is the latest status of your handcrafted order:
        </div>

        <div class="narrative-box">
          ${copy.narrative}
        </div>

        ${order.trackingAwb ? `
        <div class="tracking-info-box">
          <strong>Courier Dispatch Details:</strong><br>
          Carrier: ${order.courier || 'Express Atelier Logistics'}<br>
          Air Waybill (AWB): <code style="font-weight: bold;">${order.trackingAwb}</code>
        </div>
        ` : ''}

        <!-- Order Summary Card -->
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

        <!-- Items Table -->
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
                <td style="text-align: right; font-weight: 600;">₹${Number(it.total || it.price * (it.quantity || 1)).toLocaleString('en-IN')}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ` : ''}

        <!-- Financial Summary -->
        <div class="financials-box">
          <div class="fin-row">
            <span>Items Subtotal:</span>
            <span>₹${subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${discount > 0 ? `
          <div class="fin-row" style="color: #0F766E;">
            <span>Atelier Discount:</span>
            <span>- ₹${discount.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="fin-row">
            <span>Shipping:</span>
            <span>${shippingFee === 0 ? 'Complimentary' : `₹${shippingFee.toLocaleString('en-IN')}`}</span>
          </div>
          ${tax > 0 ? `
          <div class="fin-row">
            <span>GST Included:</span>
            <span>₹${tax.toLocaleString('en-IN')}</span>
          </div>
          ` : ''}
          <div class="fin-row total-row">
            <span>Order Total:</span>
            <span style="color: #9E5430;">₹${total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="cta-wrapper">
          <a href="${actionFullUrl}" class="cta-button" target="_blank">${copy.actionText}</a>
          <a href="${invoiceDownloadUrl}" class="invoice-link" target="_blank">Download Official GST Tax Invoice (${invNumber})</a>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-brand">${KALAJAY_SELLER_DETAILS.entityName}</div>
        <div>${KALAJAY_SELLER_DETAILS.address}</div>
        <div>GSTIN: ${KALAJAY_SELLER_DETAILS.gstin} | PAN: ${KALAJAY_SELLER_DETAILS.pan}</div>
        <div style="margin-top: 8px;">
          WhatsApp Concierge: ${KALAJAY_SELLER_DETAILS.contactPhone} &middot; Email: ${KALAJAY_SELLER_DETAILS.contactEmail}
        </div>
        <div style="margin-top: 10px; font-size: 10px; color: #A89C92;">
          This is an official transactional message regarding your order. To protect your patron privacy, financial records are retained under Section 36 of the CGST Act, 2017.
        </div>
      </div>

    </div>
  </div>
</body>
</html>`;

  return {
    subject: copy.subject,
    html,
  };
}

/**
 * Authoritatively dispatches an order lifecycle notification with built-in de-duplication.
 * Safe & resilient: will NEVER throw or abort caller transaction on transport failure.
 */
export async function dispatchOrderLifecycleNotification(params: {
  order: any;
  event: OrderLifecycleEvent;
  forceResend?: boolean;
}): Promise<EmailDispatchRecord> {
  const { order, event, forceResend } = params;
  const orderId = order.id || `KJ-${Date.now().toString().slice(-4)}`;
  const to = (order.customerEmail || '').trim().toLowerCase();

  // Deduplication key
  const dedupeKey = `${orderId}:${event}`;

  // 1. Check in-memory and durable cache
  if (!forceResend) {
    if (dispatchedCache.has(dedupeKey)) {
      const cached = dispatchedCache.get(dedupeKey)!;
      return {
        ...cached,
        status: 'deduplicated',
      };
    }
    const diskStore = readEmailAuditStore();
    if (diskStore[dedupeKey]) {
      const recorded = diskStore[dedupeKey];
      dispatchedCache.set(dedupeKey, recorded);
      return {
        ...recorded,
        status: 'deduplicated',
      };
    }
  }

  // If no recipient email, log warning and exit safely
  if (!to || !to.includes('@')) {
    const skipRecord: EmailDispatchRecord = {
      id: `eml-skip-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      orderId,
      event,
      to: to || 'missing@kalajay.in',
      subject: `Order #${orderId} Notification Skipped (No Email)`,
      dispatchedAt: new Date().toISOString(),
      mode: 'sandbox',
      status: 'failed',
      error: 'Missing or invalid customerEmail on order snapshot.',
      previewSnippet: 'Skipped dispatch due to missing recipient email.',
    };
    return skipRecord;
  }

  try {
    const guestToken = generateGuestAccessToken(orderId, to);
    const { subject, html } = buildOrderEmailHtml({ order, event, guestToken });
    const previewSnippet = `[${event.toUpperCase()}] ${subject} -> To: ${to}`;

    let status: EmailDispatchRecord['status'] = 'sandbox_logged';
    let mode: EmailDispatchRecord['mode'] = 'sandbox';
    let provider: string | undefined = undefined;

    // 2. Provider Delivery Integration (Resend or SendGrid) if configured
    if (process.env.RESEND_API_KEY && process.env.NODE_ENV === 'production') {
      try {
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
          status = 'sent';
          mode = 'live';
          provider = 'resend';
        }
      } catch (provErr: any) {
        console.warn('Live email provider send failed, falling back to sandbox audit:', provErr?.message);
      }
    }

    const record: EmailDispatchRecord = {
      id: `eml-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      orderId,
      event,
      to,
      subject,
      dispatchedAt: new Date().toISOString(),
      mode,
      provider: provider || 'internal-sandbox',
      status,
      previewSnippet,
    };

    // Store in memory & durable audit
    dispatchedCache.set(dedupeKey, record);
    const store = readEmailAuditStore();
    store[dedupeKey] = record;
    writeEmailAuditStore(store);

    return record;
  } catch (err: any) {
    console.error(`Email dispatch error for order ${orderId} (${event}):`, err);
    return {
      id: `eml-err-${Date.now()}`,
      orderId,
      event,
      to,
      subject: `Error dispatching ${event}`,
      dispatchedAt: new Date().toISOString(),
      mode: 'sandbox',
      status: 'failed',
      error: err?.message || 'Unknown email template compilation error',
      previewSnippet: 'Failure during email dispatch.',
    };
  }
}

/**
 * Resets the in-memory and durable dispatch cache (for test suites).
 */
export function clearDispatchedEmails(): void {
  dispatchedCache.clear();
  try {
    const p = getEmailAuditStorePath();
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
    }
  } catch {}
}

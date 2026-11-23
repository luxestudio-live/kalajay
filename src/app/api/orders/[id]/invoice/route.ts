import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyFirebaseIdToken, verifyStaffPermission } from '@/lib/serverRbac';
import {
  fetchOrderAuthoritatively,
  prepareInvoiceData,
  renderInvoiceHtml,
} from '@/lib/invoiceGenerator';

export const dynamic = 'force-dynamic';

function cleanDigits(val: string): string {
  return (val || '').replace(/\D/g, '');
}

function generateGuestAccessToken(orderId: string, customerEmail: string): string {
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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const rawOrderId = params.id;
    const { searchParams } = new URL(request.url);
    const orderId = (rawOrderId || searchParams.get('orderId') || searchParams.get('order') || '').trim().toUpperCase();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Order reference is required.' },
        { status: 400 }
      );
    }

    // 1. Authoritative Order Lookup
    const order = await fetchOrderAuthoritatively(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${orderId} not found in atelier records.` },
        { status: 404 }
      );
    }

    // 2. Strict Authorization Verification
    let isAuthorized = false;
    let authRole = 'anonymous';

    // A. Staff / Administrator Verification
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();

      // Check staff permissions first
      const staffCheck = await verifyStaffPermission(request, {}, 'orders.invoices', 'view');
      if (staffCheck.authorized) {
        isAuthorized = true;
        authRole = 'staff';
      } else {
        const staffOrdersCheck = await verifyStaffPermission(request, {}, 'orders.orders', 'view');
        if (staffOrdersCheck.authorized) {
          isAuthorized = true;
          authRole = 'staff';
        } else {
          // Check if token belongs to the customer who placed the order
          const customerCheck = await verifyFirebaseIdToken(token);
          if (customerCheck.valid) {
            const uidMatch = customerCheck.uid && order.userId && customerCheck.uid === order.userId;
            const emailMatch =
              customerCheck.email &&
              customerCheck.emailVerified &&
              order.customerEmail &&
              customerCheck.email.toLowerCase() === order.customerEmail.toLowerCase();

            if (uidMatch || emailMatch) {
              isAuthorized = true;
              authRole = 'customer';
            }
          }
        }
      }
    }

    // B. Guest Cryptographic Token Verification
    const suppliedToken = (
      searchParams.get('token') ||
      searchParams.get('key') ||
      request.headers.get('x-order-token') ||
      ''
    ).trim();

    if (!isAuthorized && suppliedToken && order.customerEmail) {
      const expectedToken = generateGuestAccessToken(orderId, order.customerEmail);
      if (
        suppliedToken === expectedToken ||
        (order.guestAccessToken && suppliedToken === order.guestAccessToken)
      ) {
        isAuthorized = true;
        authRole = 'guest_token';
      }
    }

    // C. Guest Multi-Factor Verification (Email + Pincode OR Email + Full Phone)
    const queryEmail = (
      searchParams.get('email') ||
      request.headers.get('x-verify-email') ||
      ''
    ).trim().toLowerCase();
    const queryPincode = (
      searchParams.get('pincode') ||
      request.headers.get('x-verify-pincode') ||
      ''
    ).trim();
    const queryPhone = cleanDigits(
      searchParams.get('phone') ||
      request.headers.get('x-verify-phone') ||
      ''
    );

    if (!isAuthorized && queryEmail && order.customerEmail) {
      const emailMatches = queryEmail === order.customerEmail.toLowerCase().trim();
      if (emailMatches) {
        const orderPincode = (order.shippingAddress?.pincode || '').trim();
        const orderPhone = cleanDigits(order.customerPhone || order.shippingAddress?.phone || '');

        const pincodeMatches = queryPincode && orderPincode && queryPincode === orderPincode;
        const phoneMatches = queryPhone && queryPhone.length >= 10 && orderPhone.endsWith(queryPhone.slice(-10));

        if (pincodeMatches || phoneMatches) {
          isAuthorized = true;
          authRole = 'guest_mfa';
        }
      }
    }

    // D. Static Showroom Showcase Records (KJ-8924, KJ-7710, KJ-6502)
    if (!isAuthorized && order.isStaticShowroomDemo && ['KJ-8924', 'KJ-7710', 'KJ-6502'].includes(orderId)) {
      isAuthorized = true;
      authRole = 'showroom_demo';
    }

    // If still unauthorized, reject strictly with 403
    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Access Denied: You are not authorized to view or download this tax invoice. Please sign in with the ordering patron account or provide the secure order access token.',
          code: 'INVOICE_UNAUTHORIZED',
        },
        { status: 403 }
      );
    }

    // 3. Response Generation
    const format = (searchParams.get('format') || '').toLowerCase();
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';
    const autoPrint = searchParams.get('print') === '1' || searchParams.get('print') === 'true';

    // JSON format for ERP / API integrations
    if (format === 'json') {
      const invoiceData = prepareInvoiceData(order);
      return NextResponse.json({
        success: true,
        orderId,
        invoice: invoiceData,
      });
    }

    // High-Fidelity Printable / Downloadable HTML
    const invoiceHtml = renderInvoiceHtml(order, { autoPrint });
    const invData = prepareInvoiceData(order);
    const filename = `${invData.invoiceNumber}.html`;

    const headers: Record<string, string> = {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Invoice-Number': invData.invoiceNumber,
      'X-Invoice-Role': authRole,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    };

    if (isDownload) {
      headers['Content-Disposition'] = `attachment; filename="${filename}"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${filename}"`;
    }

    return new Response(invoiceHtml, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error('Invoice generation error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error rendering official invoice.' },
      { status: 500 }
    );
  }
}

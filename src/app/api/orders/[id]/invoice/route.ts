import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyFirebaseIdToken, verifyStaffPermission } from '@/lib/serverRbac';
import { verifyTrackingSessionToken } from '@/lib/trackingSession';
import {
  fetchOrderAuthoritatively,
  prepareInvoiceData,
  renderInvoiceHtml,
  generateInvoicePdf,
  verifyGuestInvoiceToken,
} from '@/lib/invoiceGenerator';

export const dynamic = 'force-dynamic';

function safeTimingEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
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

    // A. Extract Bearer Token (Header, URL Query parameter, or Cookie)
    const authHeader = request.headers.get('authorization') || '';
    let bearerToken = '';
    if (authHeader.startsWith('Bearer ')) {
      bearerToken = authHeader.substring(7).trim();
    }
    if (!bearerToken) {
      const qToken = searchParams.get('auth') || searchParams.get('token') || searchParams.get('idToken') || searchParams.get('staffToken') || '';
      if (qToken && qToken.split('.').length === 3) {
        bearerToken = qToken.trim();
      }
    }
    if (!bearerToken) {
      const cookieHeader = request.headers.get('cookie') || '';
      const match = cookieHeader.match(/(?:kj_staff_token|kalajay_staff_token|kalajay_admin_token)=([^;]+)/);
      if (match && match[1]) {
        bearerToken = decodeURIComponent(match[1].trim());
      }
    }

    // A1. Staff / Administrator Verification (Google Identity Platform RBAC)
    if (bearerToken) {
      const staffCheck = await verifyStaffPermission(request, {}, 'orders.invoices', 'view');
      if (staffCheck.authorized) {
        isAuthorized = true;
        authRole = 'staff';
      } else {
        const staffOrdersCheck = await verifyStaffPermission(request, {}, 'orders.all', 'view');
        if (staffOrdersCheck.authorized) {
          isAuthorized = true;
          authRole = 'staff';
        } else {
          // A2. Check if token belongs to the patron who placed the order
          const customerCheck = await verifyFirebaseIdToken(bearerToken);
          if (customerCheck.valid) {
            const uidMatch = Boolean(customerCheck.uid && order.userId && customerCheck.uid === order.userId);
            const emailMatch = Boolean(
              customerCheck.email &&
              order.customerEmail &&
              customerCheck.email.toLowerCase().trim() === order.customerEmail.toLowerCase().trim()
            );

            if (uidMatch || emailMatch) {
              isAuthorized = true;
              authRole = 'customer';
            }
          }
        }
      }
    }

    // B. Safe Tracking Session Cookie (kj_track_session from order tracking flow)
    if (!isAuthorized) {
      const cookieHeader = request.headers.get('cookie') || '';
      const matchSession = cookieHeader.match(/kj_track_session=([^;]+)/);
      const sessionToken = matchSession
        ? matchSession[1].trim()
        : (request.headers.get('x-tracking-session') || searchParams.get('sessionToken') || '').trim();

      if (sessionToken && verifyTrackingSessionToken(sessionToken, orderId)) {
        isAuthorized = true;
        authRole = 'tracking_session';
      }
    }

    // C. Expiring Cryptographic Guest Token / Direct Access Key Verification
    const suppliedToken = (
      searchParams.get('token') ||
      searchParams.get('key') ||
      searchParams.get('guestToken') ||
      request.headers.get('x-order-token') ||
      ''
    ).trim();

    if (!isAuthorized && suppliedToken) {
      // 1. Expiring / Legacy HMAC guest invoice token
      if (order.customerEmail) {
        const tokenRes = verifyGuestInvoiceToken(suppliedToken, orderId, order.customerEmail, order.createdAt);
        if (tokenRes.authorized) {
          isAuthorized = true;
          authRole = 'guest_token';
        }
      }

      // 2. Direct SHA-256 Guest Access Token validation
      if (!isAuthorized) {
        const suppliedHash = crypto.createHash('sha256').update(suppliedToken).digest('hex');
        if (order.guestAccessTokenHash && safeTimingEqual(order.guestAccessTokenHash, suppliedHash)) {
          isAuthorized = true;
          authRole = 'guest_token';
        } else if (order.guestAccessToken && safeTimingEqual(suppliedToken, order.guestAccessToken)) {
          isAuthorized = true;
          authRole = 'guest_token';
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
          error: 'Access Denied: You are not authorized to view or download this tax invoice. Please sign in with the ordering patron account or provide a valid, non-expired guest access token.',
          code: 'INVOICE_UNAUTHORIZED',
        },
        { status: 403 }
      );
    }

    // 3. Document Preparation & Format Resolution
    const format = (searchParams.get('format') || '').toLowerCase();
    const isDownload = searchParams.get('download') === '1' || searchParams.get('download') === 'true';
    const isPreview = searchParams.get('preview') === '1' || searchParams.get('preview') === 'true';
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

    // HTML format (for in-browser preview / modal print preview)
    if (format === 'html' || isPreview) {
      const invoiceHtml = renderInvoiceHtml(order, { autoPrint });
      const invData = prepareInvoiceData(order);
      return new Response(invoiceHtml, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Invoice-Number': invData.invoiceNumber,
          'X-Invoice-Role': authRole,
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      });
    }

    // Default & Download: Real Vector A4 PDF Generation via pdf-lib
    const pdfBytes = await generateInvoicePdf(order);
    const invData = prepareInvoiceData(order);
    const pdfFilename = `${invData.invoiceNumber}.pdf`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/pdf',
      'Content-Length': String(pdfBytes.byteLength),
      'X-Invoice-Number': invData.invoiceNumber,
      'X-Invoice-Role': authRole,
      'X-Invoice-FY': invData.fiscalYear,
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    };

    if (isDownload || !isPreview) {
      headers['Content-Disposition'] = `attachment; filename="${pdfFilename}"`;
    } else {
      headers['Content-Disposition'] = `inline; filename="${pdfFilename}"`;
    }

    return new Response(Buffer.from(pdfBytes), {
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

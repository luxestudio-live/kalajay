import { NextResponse } from 'next/server';
import { getRazorpayConfigStatus } from '@/lib/payment/razorpayClient';

export const dynamic = 'force-dynamic';

/**
 * Safe Payment Readiness Diagnostic Endpoint
 * Reports configuration status and gateway mode without exposing keys or secrets.
 */
export async function GET() {
  const status = getRazorpayConfigStatus();

  return NextResponse.json({
    success: true,
    status: {
      gateway: 'razorpay',
      mode: status.gatewayMode,
      keyIdConfigured: status.keyIdConfigured,
      keySecretConfigured: status.keySecretConfigured,
      webhookSecretConfigured: status.webhookSecretConfigured,
      isTestMode: status.isTestMode,
      isLiveReady: status.isLiveReady,
      currency: status.currency,
      merchantName: status.merchantName,
    },
    message: status.isLiveReady
      ? 'Razorpay Live Production Gateway is fully configured and ready.'
      : status.isTestMode && status.keySecretConfigured
      ? 'Razorpay Test Gateway is active. Ready for sandbox transactions.'
      : 'Razorpay credentials pending. Storefront operating in resilient checkout mode with UPI QR & WhatsApp Concierge.',
  });
}

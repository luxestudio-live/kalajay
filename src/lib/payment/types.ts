/**
 * KALAJAY HANDCRAFTED LUXURIES — PAYMENT DOMAIN TYPE DEFINITIONS
 * Production-ready payment models, Razorpay mappings, and state machine types.
 */

export type PaymentState =
  | 'created'                // Order registered, payment intent initiated
  | 'pending'                // Awaiting gateway authorization/settlement
  | 'authorized'             // Funds authorized by customer bank/UPI app
  | 'captured'               // Funds successfully captured and settled
  | 'failed'                 // Explicit payment rejection (insufficient funds, user cancelled)
  | 'cancelled'              // Order cancelled by user or timeout before payment
  | 'expired'                // Checkout / reservation window elapsed without payment
  | 'refund_pending'         // Refund initiated with financial processor
  | 'partially_refunded'     // Part of total order value refunded
  | 'refunded'               // Complete order value refunded
  | 'reconciliation_required';// Discrepancy detected (e.g. late webhook, duplicate payment)

export type PaymentGateway = 'razorpay' | 'upi_qr' | 'whatsapp' | 'manual_bank';

export interface PaymentAttempt {
  id: string; // e.g. att_1732560000000_abc
  gateway: PaymentGateway;
  gatewayOrderId?: string; // e.g. order_OPq123456789
  gatewayPaymentId?: string; // e.g. pay_OPq987654321
  amount: number; // in INR rupees
  amountPaise: number; // in INR paise (amount * 100)
  currency: 'INR';
  status: PaymentState;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  method?: string; // 'upi' | 'card' | 'netbanking' | 'wallet'
  vpa?: string; // masked UPI ID e.g. "a***@okaxis"
  bank?: string;
  wallet?: string;
  error?: {
    code?: string;
    description?: string;
    source?: string;
    step?: string;
    reason?: string;
  };
}

export interface InternalOrderPaymentDetails {
  primaryGateway: PaymentGateway;
  currentStatus: PaymentState;
  amountAuthorizedPaise: number;
  amountCapturedPaise: number;
  amountRefundedPaise: number;
  currency: 'INR';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  attempts: PaymentAttempt[];
  verifiedAt?: string;
  reconciliationNotes?: string[];
}

export interface RazorpayOrderCreationParams {
  amountPaise: number;
  currency?: 'INR';
  receipt: string; // Internal Order ID e.g. "KJ-123456"
  notes?: Record<string, string>;
  customer?: {
    name?: string;
    email?: string;
    contact?: string;
  };
}

export interface RazorpayOrderResult {
  id: string; // Razorpay Order ID e.g. "order_..."
  entity: 'order';
  amount: number; // in paise
  amount_paid: number;
  amount_due: number;
  currency: 'INR';
  receipt: string;
  status: 'created' | 'attempted' | 'paid';
  attempts: number;
  created_at: number;
  notes?: Record<string, string>;
  isMock?: boolean;
}

export interface RazorpayPaymentVerificationParams {
  orderId: string; // Internal Order ID or Razorpay Order ID
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface RazorpayWebhookPayload {
  entity: 'event';
  account_id: string;
  event: string; // e.g. "payment.captured", "payment.failed", "order.paid", "refund.processed"
  contains: string[];
  payload: {
    payment?: {
      entity: {
        id: string;
        entity: 'payment';
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        invoice_id?: string;
        method: string;
        amount_refunded: number;
        refund_status?: string | null;
        captured: boolean;
        description?: string;
        card_id?: string;
        bank?: string;
        wallet?: string;
        vpa?: string;
        email?: string;
        contact?: string;
        notes?: Record<string, string>;
        fee?: number;
        tax?: number;
        error_code?: string;
        error_description?: string;
        created_at: number;
      };
    };
    order?: {
      entity: {
        id: string;
        entity: 'order';
        amount: number;
        amount_paid: number;
        amount_due: number;
        currency: string;
        receipt: string;
        status: string;
        attempts: number;
        notes?: Record<string, string>;
        created_at: number;
      };
    };
    refund?: {
      entity: {
        id: string;
        entity: 'refund';
        amount: number;
        currency: string;
        payment_id: string;
        notes?: Record<string, string>;
        receipt?: string;
        status: string;
        created_at: number;
      };
    };
  };
  created_at: number;
}

export interface PaymentConfigStatus {
  keyIdConfigured: boolean;
  keySecretConfigured: boolean;
  webhookSecretConfigured: boolean;
  isTestMode: boolean;
  isLiveReady: boolean;
  gatewayMode: 'live' | 'test' | 'mock_pending_credentials';
  merchantName: string;
  currency: 'INR';
}

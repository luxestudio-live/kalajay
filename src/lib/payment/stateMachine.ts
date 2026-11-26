/**
 * KALAJAY HANDCRAFTED LUXURIES — PAYMENT STATE MACHINE
 * Enforces strict, non-reversible, and safe transitions for all financial flows.
 */

import { PaymentState } from './types';

// Map of permitted next states for any given current state
const ALLOWED_TRANSITIONS: Record<PaymentState, PaymentState[]> = {
  created: [
    'pending',
    'authorized',
    'captured',
    'failed',
    'cancelled',
    'expired',
  ],
  pending: [
    'authorized',
    'captured',
    'failed',
    'cancelled',
    'expired',
    'reconciliation_required',
  ],
  authorized: [
    'captured',
    'failed',
    'cancelled',
    'expired',
    'reconciliation_required',
  ],
  captured: [
    'refund_pending',
    'partially_refunded',
    'refunded',
    'reconciliation_required', // For disputed charges or chargebacks
  ],
  refund_pending: [
    'partially_refunded',
    'refunded',
    'reconciliation_required',
  ],
  partially_refunded: [
    'refund_pending',
    'refunded',
    'reconciliation_required',
  ],
  failed: [
    'pending', // Customer initiates a new retry attempt on same order
    'reconciliation_required', // Late webhook arrives showing capture after failure flag
  ],
  cancelled: [
    'reconciliation_required', // If funds were captured after order cancellation
  ],
  expired: [
    'reconciliation_required', // If customer paid on an expired checkout window
  ],
  refunded: [
    // Terminal state: No transitions allowed
  ],
  reconciliation_required: [
    'captured',
    'refunded',
    'cancelled',
    'failed',
  ],
};

/**
 * Checks whether a proposed state transition is logically permitted.
 */
export function isValidPaymentTransition(from: PaymentState, to: PaymentState): boolean {
  // Same-state transition is idempotent and always allowed
  if (from === to) return true;

  const validTargets = ALLOWED_TRANSITIONS[from];
  if (!validTargets) return false;

  return validTargets.includes(to);
}

/**
 * Validates and enforces a state transition, throwing a descriptive Error if illegal.
 */
export function assertValidPaymentTransition(
  from: PaymentState,
  to: PaymentState,
  context?: { orderId?: string; paymentId?: string; source?: string }
): void {
  if (from === to) return;

  if (!isValidPaymentTransition(from, to)) {
    const ctxMsg = context
      ? ` (Order: ${context.orderId ?? 'N/A'}, Payment: ${context.paymentId ?? 'N/A'}, Source: ${context.source ?? 'N/A'})`
      : '';
    throw new Error(
      `ILLEGAL_PAYMENT_STATE_TRANSITION: Cannot transition payment state from "${from}" to "${to}"${ctxMsg}. Guard prevented illegal state alteration.`
    );
  }
}

/**
 * Determines whether the payment state represents a finalized, immutable capture.
 */
export function isPaymentCaptured(state: PaymentState): boolean {
  return state === 'captured' || state === 'partially_refunded' || state === 'refunded';
}

/**
 * Determines whether an order with this payment state is considered active and awaiting settlement.
 */
export function isPaymentPending(state: PaymentState): boolean {
  return state === 'created' || state === 'pending' || state === 'authorized';
}

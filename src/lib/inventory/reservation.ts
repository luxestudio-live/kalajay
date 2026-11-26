/**
 * KALAJAY HANDCRAFTED LUXURIES — ATOMIC INVENTORY RESERVATION ENGINE
 * Prevents race conditions, double deduction, overselling, and orphaned stock holds.
 * Features:
 * - 15-minute lease time on checkout initiation
 * - Atomic decrement of available stock and increment of reservedInLoom
 * - Automatic transition to 'confirmed' upon validated payment capture
 * - Safe release of abandoned reservations back into available inventory
 */

import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

export interface StockReservationItem {
  sku: string;
  quantity: number;
}

export interface InventoryReservationRecord {
  orderId: string;
  items: StockReservationItem[];
  status: 'active' | 'confirmed' | 'released' | 'expired';
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  releasedAt?: string;
  releaseReason?: string;
}

const DEFAULT_LEASE_MINUTES = 15;

/**
 * Atomically reserves inventory for an order with a time-limited expiration lease.
 */
export async function reserveStockForOrder(params: {
  orderId: string;
  items: StockReservationItem[];
  leaseMinutes?: number;
}): Promise<{ success: boolean; reservation: InventoryReservationRecord }> {
  const { orderId, items, leaseMinutes = DEFAULT_LEASE_MINUTES } = params;

  if (!orderId || !items || items.length === 0) {
    throw new Error('INVALID_RESERVATION_PARAMS: orderId and items array are required.');
  }

  const adminDb = getAdminFirestore();
  if (!adminDb) {
    // In local development without Firebase credentials, allow graceful mock reservation
    const mockRecord: InventoryReservationRecord = {
      orderId,
      items,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + leaseMinutes * 60 * 1000).toISOString(),
    };
    return { success: true, reservation: mockRecord };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + leaseMinutes * 60 * 1000);

  return await adminDb.runTransaction(async (transaction) => {
    // 1. Check if an active reservation already exists for this order (Idempotency)
    const resDocRef = adminDb.collection('inventory_reservations').doc(orderId);
    const existingResSnap = await transaction.get(resDocRef);

    if (existingResSnap.exists) {
      const existingData = existingResSnap.data() as InventoryReservationRecord;
      if (existingData.status === 'active' || existingData.status === 'confirmed') {
        return { success: true, reservation: existingData };
      }
    }

    // 2. Validate and reserve stock for each SKU
    const updates: Array<{ ref: any; newAvailable: number; newReserved: number }> = [];

    for (const item of items) {
      const skuCode = item.sku;
      const invRef = adminDb.collection('inventory').doc(skuCode);
      const invSnap = await transaction.get(invRef);

      if (invSnap.exists) {
        const invData = invSnap.data()!;
        const currentAvailable = Number(
          invData.available !== undefined
            ? invData.available
            : invData.stockOnHand !== undefined
            ? invData.stockOnHand
            : (invData.onHand ?? 15)
        );

        if (currentAvailable < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK: Atelier stock shortage. Only ${currentAvailable} pieces available for SKU ${skuCode}.`
          );
        }

        const newAvailable = Math.max(0, currentAvailable - item.quantity);
        const newReserved = Number(invData.reservedInLoom ?? 0) + item.quantity;

        updates.push({
          ref: invRef,
          newAvailable,
          newReserved,
        });
      }
    }

    // Apply stock ledger updates
    for (const update of updates) {
      transaction.update(update.ref, {
        available: update.newAvailable,
        reservedInLoom: update.newReserved,
        updatedAt: now.toISOString(),
      });
    }

    // Record the reservation
    const reservationRecord: InventoryReservationRecord = {
      orderId,
      items,
      status: 'active',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    transaction.set(resDocRef, reservationRecord);

    return { success: true, reservation: reservationRecord };
  });
}

export interface ConfirmStockResult {
  success: boolean;
  isLatePaymentRecovery?: boolean;
  stockExhausted?: boolean;
  error?: string;
}

/**
 * Confirms a stock reservation upon validated payment capture.
 * Handles normal active leases and gracefully reconciles late payments after expiry.
 * If the lease expired and stock was sold out to another customer, rejects confirmation
 * and marks order for financial reconciliation rather than overselling physical loom capacity.
 */
export async function confirmStockReservation(orderId: string): Promise<ConfirmStockResult> {
  const adminDb = getAdminFirestore();
  if (!adminDb) return { success: true };

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const resDocRef = adminDb.collection('inventory_reservations').doc(orderId);
      const resSnap = await transaction.get(resDocRef);

      if (!resSnap.exists) {
        return { success: false, error: 'RESERVATION_NOT_FOUND' };
      }
      const resData = resSnap.data() as InventoryReservationRecord;

      if (resData.status === 'confirmed') {
        return { success: true }; // Idempotent already confirmed
      }

      const nowIso = new Date().toISOString();
      const isLatePayment = resData.status === 'released' || resData.status === 'expired';

      // 1. If lease expired/released, check if physical available stock is still present
      if (isLatePayment) {
        const lateUpdates: Array<{ ref: any; newAvailable: number; newCommitted: number }> = [];

        for (const item of resData.items) {
          const invRef = adminDb.collection('inventory').doc(item.sku);
          const invSnap = await transaction.get(invRef);
          if (invSnap.exists) {
            const invData = invSnap.data()!;
            const currentAvailable = Number(invData.available !== undefined ? invData.available : (invData.stockOnHand ?? 0));
            if (currentAvailable < item.quantity) {
              // PHYSICAL STOCK IS EXHAUSTED: Cannot fulfill without overselling
              return {
                success: false,
                isLatePaymentRecovery: true,
                stockExhausted: true,
                error: `STOCK_EXHAUSTED_LATE_PAYMENT: Only ${currentAvailable} available for SKU ${item.sku}.`,
              };
            }
            const currentCommitted = Number(invData.committedSale ?? 0);
            lateUpdates.push({
              ref: invRef,
              newAvailable: Math.max(0, currentAvailable - item.quantity),
              newCommitted: currentCommitted + item.quantity,
            });
          }
        }

        // Available stock is sufficient, claim it from 'available' (Writes after all reads)
        for (const u of lateUpdates) {
          transaction.update(u.ref, {
            available: u.newAvailable,
            committedSale: u.newCommitted,
            updatedAt: nowIso,
          });
        }

        transaction.update(resDocRef, {
          status: 'confirmed',
          confirmedAt: nowIso,
          latePaymentRecovered: true,
        });

        return { success: true, isLatePaymentRecovery: true };
      }

      // 2. Standard Active Reservation: Stock is currently held in 'reservedInLoom'
      const standardUpdates: Array<{ ref: any; newReserved: number; newCommitted: number }> = [];

      for (const item of resData.items) {
        const invRef = adminDb.collection('inventory').doc(item.sku);
        const invSnap = await transaction.get(invRef);
        if (invSnap.exists) {
          const invData = invSnap.data()!;
          const currentReserved = Number(invData.reservedInLoom ?? 0);
          const currentCommitted = Number(invData.committedSale ?? 0);

          standardUpdates.push({
            ref: invRef,
            newReserved: Math.max(0, currentReserved - item.quantity),
            newCommitted: currentCommitted + item.quantity,
          });
        }
      }

      // Writes after all reads
      for (const u of standardUpdates) {
        transaction.update(u.ref, {
          reservedInLoom: u.newReserved,
          committedSale: u.newCommitted,
          updatedAt: nowIso,
        });
      }

      transaction.update(resDocRef, {
        status: 'confirmed',
        confirmedAt: nowIso,
      });

      return { success: true };
    });
  } catch (err: any) {
    console.warn('Confirm stock reservation notice:', err);
    return { success: false, error: err?.message || 'Transaction error confirming reservation' };
  }
}

/**
 * Releases an active stock reservation back into available inventory.
 * Used when a payment fails, is cancelled, or the reservation window expires.
 */
export async function releaseStockReservation(
  orderId: string,
  reason: string = 'PAYMENT_FAILED_OR_CANCELLED'
): Promise<boolean> {
  const adminDb = getAdminFirestore();
  if (!adminDb) return true;

  try {
    return await adminDb.runTransaction(async (transaction) => {
      const resDocRef = adminDb.collection('inventory_reservations').doc(orderId);
      const resSnap = await transaction.get(resDocRef);

      if (!resSnap.exists) return false;
      const resData = resSnap.data() as InventoryReservationRecord;

      if (resData.status !== 'active') return false; // Already confirmed or released

      // Restore stock: increment available, decrement reservedInLoom (All reads first)
      const releaseUpdates: Array<{ ref: any; newAvailable: number; newReserved: number }> = [];

      for (const item of resData.items) {
        const invRef = adminDb.collection('inventory').doc(item.sku);
        const invSnap = await transaction.get(invRef);
        if (invSnap.exists) {
          const invData = invSnap.data()!;
          const currentAvailable = Number(invData.available ?? 0);
          const currentReserved = Number(invData.reservedInLoom ?? 0);

          releaseUpdates.push({
            ref: invRef,
            newAvailable: currentAvailable + item.quantity,
            newReserved: Math.max(0, currentReserved - item.quantity),
          });
        }
      }

      // All writes after all reads
      for (const u of releaseUpdates) {
        transaction.update(u.ref, {
          available: u.newAvailable,
          reservedInLoom: u.newReserved,
          updatedAt: new Date().toISOString(),
        });
      }

      transaction.update(resDocRef, {
        status: 'released',
        releasedAt: new Date().toISOString(),
        releaseReason: reason,
      });

      return true;
    });
  } catch (err) {
    console.warn('Release stock reservation notice:', err);
    return false;
  }
}

/**
 * Sweeps and releases all expired inventory reservations.
 */
export async function sweepExpiredReservations(): Promise<{ sweptCount: number }> {
  const adminDb = getAdminFirestore();
  if (!adminDb) return { sweptCount: 0 };

  try {
    const nowIso = new Date().toISOString();
    const expiredSnaps = await adminDb
      .collection('inventory_reservations')
      .where('status', '==', 'active')
      .where('expiresAt', '<', nowIso)
      .limit(50)
      .get();

    let sweptCount = 0;
    for (const doc of expiredSnaps.docs) {
      const orderId = doc.id;
      const released = await releaseStockReservation(orderId, 'LEASE_EXPIRED');
      if (released) sweptCount++;
    }

    return { sweptCount };
  } catch (err) {
    console.warn('Sweep expired reservations notice:', err);
    return { sweptCount: 0 };
  }
}

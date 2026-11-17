import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import { adminFetch } from './adminAuthClient';
import type { User, Order } from '@/context/AuthContext';
import type { Product, Collection } from '@/data/catalogue';
import type {
  AdminOrder,
  CustomOrderRequest,
  CorporateEnquiry,
  SupportTicket,
  FeaturedProductsConfig,
  BannerItem,
  InventoryItem,
  StockAdjustment,
  CouponItem,
  AuditLogItem,
} from '@/data/adminTypes';

/* ===============================================================
   1. PATRON PROFILES (/users/{uid})
   =============================================================== */

export async function getPatronProfile(uid: string): Promise<User | null> {
  try {
    if (!db || !db.type) return null;
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching patron profile from Firestore:', error);
    return null;
  }
}

export async function savePatronProfile(uid: string, profile: Partial<User>): Promise<void> {
  try {
    if (!db || !db.type) return;
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        ...profile,
        id: uid,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving patron profile in Firestore:', error);
  }
}

export async function updatePatronProfile(uid: string, data: Partial<User>): Promise<void> {
  try {
    if (!db || !db.type) return;
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating patron profile:', error);
  }
}

/* ===============================================================
   2. PRODUCTS & CATEGORIES (/products & /categories)
   =============================================================== */

export async function getFirestoreProducts(): Promise<Product[]> {
  try {
    if (!db || !db.type) return [];
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    if (snapshot.empty) return [];
    const list: Product[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as Product);
    });
    return list;
  } catch (error) {
    console.warn('Firestore products fetch error, fallback to static catalogue:', error);
    return [];
  }
}

export async function saveFirestoreProduct(product: Product): Promise<void> {
  try {
    if (!db || !db.type) return;
    const id = product.id || product.code;
    const productRef = doc(db, 'products', id);
    await setDoc(productRef, {
      ...product,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving product to Firestore:', error);
  }
}

export async function deleteFirestoreProduct(productId: string): Promise<void> {
  try {
    if (!db || !db.type) return;
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product from Firestore:', error);
  }
}

export async function getFirestoreCategories(): Promise<Collection[]> {
  try {
    if (!db || !db.type) return [];
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    const list: Collection[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as Collection);
    });
    return list;
  } catch (error) {
    console.warn('Firestore categories fetch error:', error);
    return [];
  }
}

export async function saveFirestoreCategory(category: Collection): Promise<void> {
  try {
    if (!db || !db.type) return;
    const id = category.slug;
    const catRef = doc(db, 'categories', id);
    await setDoc(catRef, {
      ...category,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving category to Firestore:', error);
  }
}

/* ===============================================================
   3. ORDERS & TRACKING (/orders)
   =============================================================== */

export async function getPatronOrders(uid: string): Promise<Order[]> {
  try {
    if (!db || !db.type) return [];
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
    });
    return orders;
  } catch (error) {
    console.error('Error querying patron orders from Firestore:', error);
    return [];
  }
}

export async function getAllFirestoreOrders(): Promise<AdminOrder[]> {
  try {
    if (!db || !db.type) return [];
    const ordersRef = collection(db, 'orders');
    const snapshot = await getDocs(ordersRef);
    if (snapshot.empty) return [];
    const orders: AdminOrder[] = [];
    snapshot.forEach((docSnap) => {
      orders.push({ id: docSnap.id, ...docSnap.data() } as AdminOrder);
    });
    return orders;
  } catch (error) {
    console.warn('Firestore orders fetch error:', error);
    return [];
  }
}

export async function getFirestoreOrderById(orderId: string): Promise<AdminOrder | null> {
  try {
    if (!db || !db.type) return null;
    const orderDocRef = doc(db, 'orders', orderId);
    const snap = await getDoc(orderDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AdminOrder;
    }
    return null;
  } catch (error) {
    console.error(`Error querying order ${orderId}:`, error);
    return null;
  }
}

export async function createFirestoreOrder(
  order: AdminOrder
): Promise<{ success: boolean; orderId: string; error?: string }> {
  try {
    if (!db || !db.type) {
      return { success: false, orderId: order.id, error: 'Database service is offline or uninitialized.' };
    }
    const orderDocRef = doc(db, 'orders', order.id);
    await setDoc(orderDocRef, {
      ...order,
      createdAtServer: serverTimestamp(),
    }, { merge: true });
    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Error writing order to Firestore:', error);
    return { success: false, orderId: order.id, error: error?.message || 'Database write rejected' };
  }
}

export async function updateFirestoreOrderStatus(
  orderId: string,
  updates: Partial<AdminOrder>
): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const res = await adminFetch('/api/admin/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          fulfillmentStatus: updates.fulfillmentStatus,
          paymentStatus: updates.paymentStatus,
          trackingAwb: updates.trackingAwb,
          courier: updates.courier,
          timeline: updates.timeline,
          reconciliation: (updates as any).paymentReconciliation,
        }),
      });
      if (res.ok) return;
    }

    if (!db || !db.type) return;
    const orderDocRef = doc(db, 'orders', orderId);
    await setDoc(
      orderDocRef,
      {
        ...updates,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error(`Error updating order ${orderId} in Firestore:`, error);
  }
}

export function subscribeToOrders(callback: (orders: AdminOrder[]) => void): Unsubscribe | null {
  try {
    if (!db || !db.type) return null;
    const ordersRef = collection(db, 'orders');
    return onSnapshot(ordersRef, (snapshot) => {
      const orders: AdminOrder[] = [];
      snapshot.forEach((snap) => {
        orders.push({ id: snap.id, ...snap.data() } as AdminOrder);
      });
      callback(orders);
    });
  } catch (error) {
    console.warn('Realtime orders subscription failed:', error);
    return null;
  }
}

/* ===============================================================
   4. BESPOKE CUSTOM ENQUIRIES (/custom_enquiries)
   =============================================================== */

export async function getFirestoreCustomEnquiries(): Promise<CustomOrderRequest[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'custom_enquiries');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: CustomOrderRequest[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as CustomOrderRequest);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching custom enquiries:', error);
    return [];
  }
}

export async function createFirestoreCustomEnquiry(data: Partial<CustomOrderRequest>): Promise<string | null> {
  try {
    if (!db || !db.type) return null;
    const ref = collection(db, 'custom_enquiries');
    const docRef = await addDoc(ref, {
      ...data,
      submittedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating custom enquiry:', error);
    return null;
  }
}

export async function updateFirestoreCustomEnquiry(
  id: string,
  updates: Partial<CustomOrderRequest>
): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'custom_enquiries', id);
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error updating custom enquiry:', error);
  }
}

export function subscribeToCustomEnquiries(
  callback: (requests: CustomOrderRequest[]) => void
): Unsubscribe | null {
  try {
    if (!db || !db.type) return null;
    const ref = collection(db, 'custom_enquiries');
    return onSnapshot(ref, (snapshot) => {
      const list: CustomOrderRequest[] = [];
      snapshot.forEach((snap) => {
        list.push({ id: snap.id, ...snap.data() } as CustomOrderRequest);
      });
      callback(list);
    });
  } catch (error) {
    console.warn('Realtime custom enquiries subscription failed:', error);
    return null;
  }
}

/* ===============================================================
   5. CORPORATE & BULK GIFTING (/corporate_enquiries)
   =============================================================== */

export async function getFirestoreCorporateEnquiries(): Promise<CorporateEnquiry[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'corporate_enquiries');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: CorporateEnquiry[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as CorporateEnquiry);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching corporate enquiries:', error);
    return [];
  }
}

export async function createFirestoreCorporateEnquiry(data: Partial<CorporateEnquiry>): Promise<string | null> {
  try {
    if (!db || !db.type) return null;
    const ref = collection(db, 'corporate_enquiries');
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: new Date().toISOString(),
      createdAtServer: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating corporate enquiry:', error);
    return null;
  }
}

export async function updateFirestoreCorporateEnquiry(
  id: string,
  updates: Partial<CorporateEnquiry>
): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'corporate_enquiries', id);
    await setDoc(ref, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error('Error updating corporate enquiry:', error);
  }
}

/* ===============================================================
   6. SUPPORT TICKETS & CONCIERGE (/support_tickets)
   =============================================================== */

export async function getFirestoreSupportTickets(): Promise<SupportTicket[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'support_tickets');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: SupportTicket[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as SupportTicket);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching support tickets:', error);
    return [];
  }
}

export async function createFirestoreSupportTicket(ticket: Partial<SupportTicket>): Promise<string | null> {
  try {
    if (!db || !db.type) return null;
    const id = ticket.id || `TICK-${Math.floor(1000 + Math.random() * 9000)}`;
    const docRef = doc(db, 'support_tickets', id);
    await setDoc(docRef, {
      ...ticket,
      id,
      createdAt: serverTimestamp(),
    }, { merge: true });
    return id;
  } catch (error) {
    console.error('Error creating support ticket:', error);
    return null;
  }
}

export async function addFirestoreSupportMessage(
  ticketId: string,
  message: { sender: 'customer' | 'concierge'; senderName: string; text: string; timestamp: string }
): Promise<void> {
  try {
    if (!db || !db.type) return;
    const docRef = doc(db, 'support_tickets', ticketId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as SupportTicket;
      const updatedMessages = [...(data.messages || []), message];
      await updateDoc(docRef, {
        messages: updatedMessages,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error appending support message:', error);
  }
}

export async function updateFirestoreTicketStatus(
  ticketId: string,
  status: SupportTicket['status']
): Promise<void> {
  try {
    if (!db || !db.type) return;
    const docRef = doc(db, 'support_tickets', ticketId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
  }
}

export function subscribeToSupportTickets(
  callback: (tickets: SupportTicket[]) => void
): Unsubscribe | null {
  try {
    if (!db || !db.type) return null;
    const ref = collection(db, 'support_tickets');
    return onSnapshot(ref, (snapshot) => {
      const list: SupportTicket[] = [];
      snapshot.forEach((snap) => {
        list.push({ id: snap.id, ...snap.data() } as SupportTicket);
      });
      callback(list);
    });
  } catch (error) {
    console.warn('Realtime support tickets subscription failed:', error);
    return null;
  }
}

/* ===============================================================
   7. CMS & CURATION (/cms/featured_products & /cms/banners)
   =============================================================== */

export async function getFirestoreFeaturedConfig(): Promise<FeaturedProductsConfig | null> {
  try {
    if (!db || !db.type) return null;
    const snap = await getDoc(doc(db, 'cms', 'featured_products'));
    if (snap.exists()) {
      return snap.data() as FeaturedProductsConfig;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching featured config from Firestore:', error);
    return null;
  }
}

export async function saveFirestoreFeaturedConfig(config: FeaturedProductsConfig): Promise<void> {
  try {
    if (!db || !db.type) return;
    await setDoc(doc(db, 'cms', 'featured_products'), {
      ...config,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving featured config to Firestore:', error);
  }
}

export async function getFirestoreBanners(): Promise<BannerItem[]> {
  try {
    if (!db || !db.type) return [];
    const snap = await getDoc(doc(db, 'cms', 'banners'));
    if (snap.exists() && snap.data()?.items) {
      return snap.data().items as BannerItem[];
    }
    return [];
  } catch (error) {
    console.warn('Error fetching banners from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreBanners(banners: BannerItem[]): Promise<void> {
  try {
    if (!db || !db.type) return;
    await setDoc(doc(db, 'cms', 'banners'), {
      items: banners,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving banners to Firestore:', error);
  }
}

/* ===============================================================
   8. INVENTORY ERP (/inventory)
   =============================================================== */

export async function getFirestoreInventory(): Promise<InventoryItem[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'inventory');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: InventoryItem[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as InventoryItem);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching inventory from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreInventoryItem(item: InventoryItem): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'inventory', item.sku);
    await setDoc(ref, {
      ...item,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving inventory item to Firestore:', error);
  }
}

export async function logFirestoreStockAdjustment(adjustment: StockAdjustment): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'stock_adjustments', adjustment.id);
    await setDoc(ref, {
      ...adjustment,
      createdAtServer: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging stock adjustment:', error);
  }
}

/* ===============================================================
   9. COUPONS & PROMOTIONS (/coupons)
   =============================================================== */

export async function getFirestoreCoupons(): Promise<CouponItem[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'coupons');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: CouponItem[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as CouponItem);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching coupons from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreCoupon(coupon: CouponItem): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'coupons', coupon.code);
    await setDoc(ref, {
      ...coupon,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving coupon to Firestore:', error);
  }
}

/* ===============================================================
   10. SECURITY AUDIT LOGS (/audit_logs)
   =============================================================== */

export async function logFirestoreAuditAction(log: AuditLogItem): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'audit_logs', log.id);
    await setDoc(ref, {
      ...log,
      timestampServer: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error recording audit log in Firestore:', error);
  }
}

export async function getFirestoreAuditLogs(limitCount = 50): Promise<AuditLogItem[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'audit_logs');
    const q = query(ref, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);
    const list: AuditLogItem[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as AuditLogItem);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching audit logs:', error);
    return [];
  }
}

/* ===============================================================
   11. NEWSLETTER SUBSCRIBERS (/subscribers)
   =============================================================== */

export interface NewsletterSubscriberDoc {
  id: string;
  email: string;
  name?: string;
  source: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

export async function saveFirestoreSubscriber(data: {
  email: string;
  name?: string;
  source?: string;
}): Promise<void> {
  try {
    if (!db || !db.type) return;
    const cleanEmail = data.email.trim().toLowerCase();
    const id = cleanEmail.replace(/[^a-z0-9]/g, '_');
    const ref = doc(db, 'subscribers', id);
    await setDoc(ref, {
      id,
      email: cleanEmail,
      name: data.name || '',
      source: data.source || 'Storefront Footer Gazette',
      subscribedAt: new Date().toISOString(),
      status: 'active',
      createdAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving newsletter subscriber:', error);
  }
}

export async function getFirestoreSubscribers(): Promise<NewsletterSubscriberDoc[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'subscribers');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: NewsletterSubscriberDoc[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as NewsletterSubscriberDoc);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching newsletter subscribers:', error);
    return [];
  }
}

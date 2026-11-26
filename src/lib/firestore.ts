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
  InventoryMovement,
  ExpenseRecord,
  VendorRecord,
  CategoryBudget,
  ArtisanProfile,
  CouponItem,
  AuditLogItem,
  WorkOrder,
  TaxSlab,
  OfflineOrder,
  HomepageSectionConfig,
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
      const d = snap.data();
      return {
        ...d,
        addresses: Array.isArray(d.addresses) ? d.addresses : [],
        orders: Array.isArray(d.orders) ? d.orders : [],
        preferences: d.preferences || { preferredPalette: 'Champagne Gold & Pearl' },
      } as User;
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

export async function updatePatronProfile(uid: string, data: Partial<User>): Promise<{ success: boolean; error?: string }> {
  try {
    if (!db || !db.type) return { success: false, error: 'Database not initialized.' };
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        id: uid,
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    return { success: true };
  } catch (error: any) {
    console.error('Error updating patron profile:', error);
    return { success: false, error: error?.message || 'Failed to update profile in database.' };
  }
}

/* ===============================================================
   2. PRODUCTS & CATEGORIES (/products & /categories)
   =============================================================== */

export async function getFirestoreProducts(includeDrafts = false): Promise<Product[]> {
  try {
    if (!db || !db.type) return [];
    const productsRef = collection(db, 'products');
    const q = includeDrafts
      ? productsRef
      : query(
          productsRef,
          where('status', 'in', ['published', 'active']),
          where('archived', '==', false),
          where('isActive', '==', true),
          where('active', '==', true),
          where('isDraft', '==', false),
          where('published', '==', true)
        );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    const list: Product[] = [];
    snapshot.forEach((snap) => {
      const d = snap.data();
      if (!includeDrafts) {
        if (
          d.archived === true ||
          d.isActive === false ||
          d.active === false ||
          d.isDraft === true ||
          d.published === false ||
          (d.status && !['published', 'active'].includes(d.status))
        ) {
          return;
        }
      }
      list.push({
        ...d,
        variants: Array.isArray(d.variants) ? d.variants : [],
        attributes: Array.isArray(d.attributes) ? d.attributes : [],
        images: Array.isArray(d.images) && d.images.length > 0 ? d.images : (d.coverImage ? [d.coverImage] : []),
      } as Product);
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
    const cleanData = JSON.parse(JSON.stringify(product));

    // Harmonize canonical publication flags to prevent conflicting states in Firestore.
    // Publication status is strictly independent from inventory/stock availability.
    const isExplicitlyPublished = (cleanData.status === 'published' || cleanData.published === true || (cleanData.isPublished === true && cleanData.status !== 'draft')) &&
      cleanData.archived !== true &&
      cleanData.isDraft !== true &&
      cleanData.status !== 'draft';

    if (isExplicitlyPublished) {
      cleanData.status = 'published';
      cleanData.isActive = true;
      cleanData.active = true;
      cleanData.archived = false;
      cleanData.isDraft = false;
      cleanData.published = true;
    } else if (cleanData.status === 'draft' || cleanData.isDraft === true || cleanData.isPublished === false) {
      cleanData.status = 'draft';
      cleanData.isActive = false;
      cleanData.active = false;
      cleanData.archived = false;
      cleanData.isDraft = true;
      cleanData.published = false;
    }

    // Preserve inStock as independent inventory availability boolean (defaults to true if unspecified)
    if (cleanData.inStock === undefined) {
      cleanData.inStock = true;
    }

    await setDoc(productRef, {
      ...cleanData,
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

export async function getFirestoreCategories(includeArchived = false): Promise<Collection[]> {
  try {
    if (!db || !db.type) return [];
    const colRef = collection(db, 'categories');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    const list: Collection[] = [];
    snapshot.forEach((snap) => {
      const d = snap.data();
      if (!includeArchived && d.status === 'archived') {
        return;
      }
      list.push({
        slug: d.slug || snap.id,
        name: d.name || snap.id,
        tagline: d.tagline || '',
        description: d.description || '',
        image: d.image || '/products/bag1.png',
        status: d.status || 'active',
        ...d,
      } as unknown as Collection);
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
    const cleanData = Object.fromEntries(
      Object.entries(category).filter(([_, v]) => v !== undefined)
    );
    await setDoc(catRef, {
      ...cleanData,
      status: (category as any).status || 'active',
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving category to Firestore:', error);
  }
}

export async function archiveFirestoreCategory(slug: string): Promise<void> {
  try {
    if (!db || !db.type) return;
    const catRef = doc(db, 'categories', slug);
    await updateDoc(catRef, {
      status: 'archived',
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error archiving category in Firestore:', error);
  }
}

export async function deleteFirestoreCategory(slug: string, permanent = false): Promise<void> {
  try {
    if (!db || !db.type) return;
    const catRef = doc(db, 'categories', slug);
    if (permanent) {
      await deleteDoc(catRef);
    } else {
      await updateDoc(catRef, {
        status: 'archived',
        archivedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error deleting/archiving category from Firestore:', error);
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
      const data = docSnap.data() || {};
      const mappedStatus: Order['status'] =
        data.fulfillmentStatus === 'delivered'
          ? 'Delivered'
          : data.fulfillmentStatus === 'shipped' || data.fulfillmentStatus === 'out_for_delivery'
          ? 'In Transit'
          : data.fulfillmentStatus === 'quality_checked'
          ? 'Wax-Sealed in Mumbai'
          : data.status || 'Hand-Stringing in Bihar';

      // Sanitize timeline steps for customer visibility (omit staff internal notes and staff IDs)
      const rawTimeline = Array.isArray(data.timeline) ? data.timeline : [];
      const sanitizedSteps = rawTimeline.map((step: any, idx: number) => {
        let note = step.note;
        if (note && (note.includes('Updated by') || note.includes('Reconciled via') || (data.internalStaffNote && note.includes(data.internalStaffNote)))) {
          note = undefined;
        }
        return {
          title: step.title || `Milestone ${idx + 1}`,
          date: step.timestamp ? step.timestamp.slice(0, 10) : 'Recent',
          completed: true,
          current: idx === rawTimeline.length - 1,
          location: 'Atelier Operations',
          description: note || '',
        };
      });

      orders.push({
        id: docSnap.id,
        date: data.createdAt ? data.createdAt.slice(0, 10) : 'Recent',
        totalAmount: data.total || data.totalAmount || 0,
        status: mappedStatus,
        fulfillmentStatus: data.fulfillmentStatus,
        estimatedDelivery: data.estimatedDeliveryDate || data.estimatedDelivery,
        dispatchDate: data.dispatchDate,
        actualDeliveryDate: data.actualDeliveryDate,
        paymentMethod: data.paymentMethod || 'UPI Instant',
        deliveryAddress: data.shippingAddress || data.deliveryAddress || {},
        items: data.items || [],
        trackingSteps: sanitizedSteps.length > 0 ? sanitizedSteps : (data.trackingSteps || []),
        artisanName: data.artisanName || 'Sunita Devi',
        artisanLocation: data.artisanLocation || 'Madhubani, Bihar',
        artisanNote: data.artisanNote || 'Handcrafted on Bihar artisan loom.',
        awbNumber: data.trackingAwb || data.awbNumber || '',
        courier: data.courier,
        trackingUrl: data.trackingUrl,
        customerShippingNote: data.customerShippingNote,
        deliveryAttemptCount: data.deliveryAttemptCount,
      } as Order);
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
      const res = await adminFetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          orderId,
          fulfillmentStatus: updates.fulfillmentStatus,
          paymentStatus: updates.paymentStatus,
          shippingMethod: updates.shippingMethod,
          trackingAwb: updates.trackingAwb,
          courier: updates.courier,
          trackingUrl: updates.trackingUrl,
          expectedDispatchDate: updates.expectedDispatchDate,
          dispatchDate: updates.dispatchDate,
          estimatedDeliveryDate: updates.estimatedDeliveryDate,
          outForDeliveryDate: updates.outForDeliveryDate,
          actualDeliveryDate: updates.actualDeliveryDate,
          customerShippingNote: updates.customerShippingNote,
          internalStaffNote: updates.internalStaffNote,
          deliveryAttemptCount: updates.deliveryAttemptCount,
          deliveryFailureReason: updates.deliveryFailureReason,
          rtoReason: updates.rtoReason,
          podReference: updates.podReference,
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
    if (config.status === 'draft') {
      // Drafts are isolated to featured_products_draft, completely hidden from public visitors
      await setDoc(doc(db, 'cms', 'featured_products_draft'), {
        ...config,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } else {
      // Published curation live deployment
      await setDoc(doc(db, 'cms', 'featured_products'), {
        ...config,
        status: 'published',
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }
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
      list.push({ id: snap.id, ...snap.data() } as InventoryItem);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching inventory from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreInventoryItem(item: InventoryItem): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'inventory_save', item }),
      });
      if (res.ok) return;
    }
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
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'stock_adjust', adjustment }),
      });
      if (res.ok) return;
    }
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

export async function getInventoryMovements(sku?: string): Promise<InventoryMovement[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'inventory_movements');
    const q = sku
      ? query(ref, where('sku', '==', sku), orderBy('timestamp', 'desc'), limit(100))
      : query(ref, orderBy('timestamp', 'desc'), limit(200));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    const list: InventoryMovement[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as InventoryMovement);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching inventory movements from Firestore:', error);
    return [];
  }
}

export async function logFirestoreInventoryMovement(movement: InventoryMovement): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'inventory_movement', movement }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'inventory_movements', movement.id);
    await setDoc(ref, {
      ...movement,
      createdAtServer: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging inventory movement to Firestore:', error);
  }
}

/* ===============================================================
   8B. EXPENSE BOOK & VENDORS (/expenses, /vendors, /budgets)
   =============================================================== */

export async function getFirestoreExpenses(): Promise<ExpenseRecord[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'expenses');
    const q = query(ref, orderBy('date', 'desc'), limit(300));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    const list: ExpenseRecord[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as ExpenseRecord);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching expenses from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreExpense(expense: ExpenseRecord): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'expense_save', expense }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'expenses', expense.id);
    await setDoc(ref, {
      ...expense,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving expense to Firestore:', error);
  }
}

export async function getFirestoreVendors(): Promise<VendorRecord[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'vendors');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: VendorRecord[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as VendorRecord);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching vendors from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreVendor(vendor: VendorRecord): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'vendor_save', vendor }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'vendors', vendor.id);
    await setDoc(ref, {
      ...vendor,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving vendor to Firestore:', error);
  }
}

export async function getFirestoreBudgets(): Promise<CategoryBudget[]> {
  try {
    if (!db || !db.type) return [];
    const ref = doc(db, 'settings', 'category_budgets');
    const snap = await getDoc(ref);
    if (!snap.exists()) return [];
    return (snap.data()?.items as CategoryBudget[]) || [];
  } catch (error) {
    console.warn('Error fetching category budgets:', error);
    return [];
  }
}

export async function saveFirestoreBudgets(budgets: CategoryBudget[]): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'settings', 'category_budgets');
    await setDoc(ref, {
      items: budgets,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving category budgets:', error);
  }
}

/* ===============================================================
   8C. ARTISAN COLLECTIVE DIRECTORY (/artisans)
   =============================================================== */

export async function getFirestoreArtisans(): Promise<ArtisanProfile[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'artisans');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: ArtisanProfile[] = [];
    snapshot.forEach((snap) => {
      list.push({ id: snap.id, ...snap.data() } as ArtisanProfile);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching artisans from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreArtisan(artisan: ArtisanProfile): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('kalajay_staff_token') || localStorage.getItem('kalajay_staff_token') || '';
      const res = await fetch('/api/admin/operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ action: 'artisan_save', artisan }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'artisans', artisan.id);
    await setDoc(ref, {
      ...artisan,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving artisan to Firestore:', error);
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

/* ===============================================================
   12. INVENTORY ITEM DELETION (/inventory)
   =============================================================== */

export async function deleteFirestoreInventoryItem(sku: string): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'inventory', sku);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Error deleting inventory item ${sku}:`, error);
  }
}

/* ===============================================================
   13. WORK ORDERS / PRODUCTION LOOMS (/work_orders)
   =============================================================== */

export async function getFirestoreWorkOrders(): Promise<WorkOrder[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'work_orders');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: WorkOrder[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as WorkOrder);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching work orders from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreWorkOrder(order: WorkOrder): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const res = await adminFetch('/api/admin/production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrder: order }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'work_orders', order.id);
    await setDoc(ref, {
      ...order,
      updatedAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving work order to Firestore:', error);
  }
}

export async function deleteFirestoreWorkOrder(id: string): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'work_orders', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Error deleting work order ${id}:`, error);
  }
}

/* ===============================================================
   14. TAX SLABS & HSN CODES (/tax_slabs)
   =============================================================== */

export async function getFirestoreTaxSlabs(): Promise<TaxSlab[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'tax_slabs');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: TaxSlab[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as TaxSlab);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching tax slabs from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreTaxSlab(slab: TaxSlab): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'tax_slabs', slab.id);
    await setDoc(ref, {
      ...slab,
      updatedAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving tax slab to Firestore:', error);
  }
}

export async function deleteFirestoreTaxSlab(id: string): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'tax_slabs', id);
    await deleteDoc(ref);
  } catch (error) {
    console.error(`Error deleting tax slab ${id}:`, error);
  }
}

/* ===============================================================
   15. OFFLINE ORDERS / STUDIO SALES (/offline_orders)
   =============================================================== */

export async function getFirestoreOfflineOrders(): Promise<OfflineOrder[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'offline_orders');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: OfflineOrder[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as OfflineOrder);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching offline orders from Firestore:', error);
    return [];
  }
}

export async function saveFirestoreOfflineOrder(order: OfflineOrder): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const res = await adminFetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'offline', orderData: order }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'offline_orders', order.id);
    await setDoc(ref, {
      ...order,
      createdAtServer: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving offline order to Firestore:', error);
  }
}

/* ===============================================================
   16. STORE SETTINGS & LOGISTICS (/settings/store)
   =============================================================== */

export interface StoreSettingsDoc {
  storeName: string;
  legalEntity: string;
  gstin: string;
  supportEmail: string;
  supportPhone: string;
  mumbaiAddress: string;
  biharHubAddress: string;
  shippingThreshold: number;
  standardFreight: number;
  dispatchHours: number;
  returnDays: number;
  updatedAt?: any;
}

export async function getFirestoreStoreSettings(): Promise<StoreSettingsDoc | null> {
  try {
    if (!db || !db.type) return null;
    const ref = doc(db, 'settings', 'store');
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as StoreSettingsDoc;
    }
    return null;
  } catch (error) {
    console.warn('Error fetching store settings from Firestore:', error);
    return null;
  }
}

export async function saveFirestoreStoreSettings(settings: Partial<StoreSettingsDoc>): Promise<void> {
  try {
    if (typeof window !== 'undefined') {
      const res = await adminFetch('/api/admin/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'store_settings_save', settings }),
      });
      if (res.ok) return;
    }
    if (!db || !db.type) return;
    const ref = doc(db, 'settings', 'store');
    await setDoc(ref, {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error saving store settings to Firestore:', error);
  }
}

/* ===============================================================
   17. CMS DOCUMENTS & PAGES (/cms/{docId})
   =============================================================== */

export async function getFirestoreCmsDoc<T = any>(docId: string): Promise<T | null> {
  try {
    if (!db || !db.type) return null;
    const ref = doc(db, 'cms', docId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data() as T;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching CMS doc ${docId} from Firestore:`, error);
    return null;
  }
}

export async function saveFirestoreCmsDoc(docId: string, data: Record<string, any>): Promise<void> {
  try {
    if (!db || !db.type) return;
    const ref = doc(db, 'cms', docId);
    await setDoc(ref, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error(`Error saving CMS doc ${docId} to Firestore:`, error);
  }
}

/* ===============================================================
   18. ALL REGISTERED PATRONS (/users)
   =============================================================== */

export async function getAllFirestoreUsers(): Promise<User[]> {
  try {
    if (!db || !db.type) return [];
    const ref = collection(db, 'users');
    const snapshot = await getDocs(ref);
    if (snapshot.empty) return [];
    const list: User[] = [];
    snapshot.forEach((snap) => {
      list.push(snap.data() as User);
    });
    return list;
  } catch (error) {
    console.warn('Error fetching all users from Firestore:', error);
    return [];
  }
}

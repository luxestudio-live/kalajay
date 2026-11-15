import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User, Address, Order } from '@/context/AuthContext';

/**
 * Fetch a patron's profile document from /users/{uid}
 */
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

/**
 * Save or overwrite a patron's profile in /users/{uid}
 */
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

/**
 * Update partial fields of a patron profile
 */
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

/**
 * Fetch all orders for a specific patron from /orders
 */
export async function getPatronOrders(uid: string): Promise<Order[]> {
  try {
    if (!db || !db.type) return [];
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, where('userId', '==', uid), orderBy('createdAt', 'desc'));
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

/**
 * Record a new handcrafted order in /orders
 */
export async function createPatronOrder(uid: string, orderData: Omit<Order, 'id'>): Promise<string | null> {
  try {
    if (!db || !db.type) return null;
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      userId: uid,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating order in Firestore:', error);
    return null;
  }
}

/**
 * Submit a bespoke studio enquiry to /custom_enquiries
 */
export async function submitCustomEnquiry(data: {
  name: string;
  contact: string;
  category?: string;
  palette?: string;
  notes: string;
  userId?: string;
}): Promise<string | null> {
  try {
    if (!db || !db.type) return null;
    const enquiriesRef = collection(db, 'custom_enquiries');
    const docRef = await addDoc(enquiriesRef, {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error submitting enquiry to Firestore:', error);
    return null;
  }
}

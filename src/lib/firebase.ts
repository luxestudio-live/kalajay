import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  type Auth,
  connectAuthEmulator,
  signInWithCustomToken,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getFirestore, type Firestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics, isSupported, type Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
};

// Initialize Firebase modular app singleton safely across SSR and Client
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
let db: Firestore;
let analytics: Analytics | null = null;

try {
  auth = getAuth(app);
} catch (e) {
  // Graceful fallback during static build
  auth = {} as Auth;
}

try {
  db = getFirestore(app);
} catch (e) {
  // Graceful fallback during static build
  db = {} as Firestore;
}

// Client-only Google Analytics & Emulator initialization
if (typeof window !== 'undefined') {
  // STRICT SECURITY GUARD: Never connect to loopback/local emulators from public domains or production builds.
  // Private Network Access (PNA) in Chrome triggers "wants to Access other apps and services on this device"
  // if a public site attempts to reach 127.0.0.1 or localhost.
  const isLocalHost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]';

  const isDevelopment = process.env.NODE_ENV !== 'production';

  const useAuthEmulator =
    isLocalHost &&
    isDevelopment &&
    process.env.NEXT_PUBLIC_USE_AUTH_EMULATOR === 'true';

  const useFirestoreEmulator =
    isLocalHost &&
    isDevelopment &&
    process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';

  // 1. Auth Emulator (operates independently)
  if (useAuthEmulator && !(window as any).__AUTH_EMULATOR_CONNECTED__) {
    try {
      if (auth && (auth as any).app) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
        (window as any).__AUTH_EMULATOR_CONNECTED__ = true;
      }
    } catch {}
  }

  // 2. Firestore Emulator (operates independently)
  if (useFirestoreEmulator && !(window as any).__FIRESTORE_EMULATOR_CONNECTED__) {
    try {
      if (db && (db as any).app) {
        connectFirestoreEmulator(db, '127.0.0.1', 8088);
        (window as any).__FIRESTORE_EMULATOR_CONNECTED__ = true;
      }
    } catch {}
  }

  (window as any).__FIREBASE_AUTH__ = auth;
  (window as any).__FIREBASE_DB__ = db;

  // Enforce robust browser & PWA session persistence using IndexedDB
  if (auth && (auth as any).app) {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
  }

  const savedToken = sessionStorage.getItem('kalajay_custom_token');
  if (savedToken && auth && (auth as any).app) {
    signInWithCustomToken(auth, savedToken).catch(() => {});
  }

  // Defer Google Analytics by 5 seconds so gtag.js never competes with initial mobile LCP/TBT
  const initAnalytics = () => {
    isSupported()
      .then((yes) => {
        if (yes) {
          analytics = getAnalytics(app);
        }
      })
      .catch(() => {});
  };

  setTimeout(initAnalytics, 5000);
}

export { app, auth, db, analytics };

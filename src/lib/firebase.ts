import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth, connectAuthEmulator, signInWithCustomToken } from 'firebase/auth';
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
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocal && !(window as any).__EMULATORS_CONNECTED__) {
    try {
      if (auth && (auth as any).app) {
        connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
      }
      if (db && (db as any).app) {
        connectFirestoreEmulator(db, '127.0.0.1', 8088);
      }
      (window as any).__EMULATORS_CONNECTED__ = true;
    } catch {}
  }

  (window as any).__FIREBASE_AUTH__ = auth;
  (window as any).__FIREBASE_DB__ = db;

  const savedToken = sessionStorage.getItem('kalajay_custom_token');
  if (savedToken && auth && (auth as any).app) {
    signInWithCustomToken(auth, savedToken).catch(() => {});
  }

  isSupported()
    .then((yes) => {
      if (yes) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      // Analytics not supported in this environment
    });
}

export { app, auth, db, analytics };

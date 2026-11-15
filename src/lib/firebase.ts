import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDzdJB2o_mS3JgSJ-MaBNbvpBi35AdcSCc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kalajay-667ff.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kalajay-667ff',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kalajay-667ff.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '671100616963',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:671100616963:web:cb1d78933fa3a8e166a936',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-ZNL4ZGS8F5',
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

// Client-only Google Analytics initialization
if (typeof window !== 'undefined') {
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

import { getApps, initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth as getAdminSdkAuth, Auth as AdminAuth } from 'firebase-admin/auth';

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;
let adminAuth: AdminAuth | null = null;

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'kalajay-667ff';

/**
 * Checks whether valid server-level credentials or environment triggers exist.
 * Avoids initializing unauthenticated Admin apps that fail on first ADC lookup.
 */
function hasAdminCredentials(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) ||
    (process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) ||
    process.env.FIRESTORE_EMULATOR_HOST ||
    process.env.K_SERVICE || // Google Cloud Run / Functions
    process.env.FIREBASE_CONFIG
  );
}

/**
 * Initializes and retrieves the trusted Firebase Admin SDK instance.
 * Completely decoupled from human user accounts and temporary credentials files.
 * Uses environment-scoped service account keys, Application Default Credentials (ADC),
 * or local Firestore Emulator host.
 *
 * Secrets and credentials are NEVER logged or exposed.
 */
function initAdminSDK(): { app: App | null; db: Firestore | null; auth: AdminAuth | null } {
  if (adminApp && adminFirestore && adminAuth) {
    return { app: adminApp, db: adminFirestore, auth: adminAuth };
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    adminFirestore = getFirestore(adminApp);
    adminAuth = getAdminSdkAuth(adminApp);
    return { app: adminApp, db: adminFirestore, auth: adminAuth };
  }

  if (!hasAdminCredentials()) {
    return { app: null, db: null, auth: null };
  }

  try {
    // 1. Direct Service Account JSON in environment
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (rawKey) {
      try {
        const parsed = typeof rawKey === 'string' ? JSON.parse(rawKey) : rawKey;
        adminApp = initializeApp({
          credential: cert(parsed),
          projectId: parsed.project_id || PROJECT_ID,
        });
        adminFirestore = getFirestore(adminApp);
        adminAuth = getAdminSdkAuth(adminApp);
        return { app: adminApp, db: adminFirestore, auth: adminAuth };
      } catch {
        // Suppress parsing error to prevent leaking partial configuration
      }
    }

    // 2. Individual Private Key & Client Email environment variables
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = (process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY || '').replace(
      /\\n/g,
      '\n'
    );
    if (clientEmail && privateKey) {
      adminApp = initializeApp({
        credential: cert({
          projectId: PROJECT_ID,
          clientEmail,
          privateKey,
        }),
        projectId: PROJECT_ID,
      });
      adminFirestore = getFirestore(adminApp);
      adminAuth = getAdminSdkAuth(adminApp);
      return { app: adminApp, db: adminFirestore, auth: adminAuth };
    }

    // 3. Firestore Emulator or Google Cloud ADC (Application Default Credentials)
    adminApp = initializeApp({ projectId: PROJECT_ID });
    adminFirestore = getFirestore(adminApp);
    adminAuth = getAdminSdkAuth(adminApp);
    return { app: adminApp, db: adminFirestore, auth: adminAuth };
  } catch {
    // Sanitize error; never print credential details
    return { app: null, db: null, auth: null };
  }
}

/**
 * Returns the trusted server-side Firestore instance powered by Firebase Admin SDK.
 * Bypasses Firestore client security rules and allows atomic transaction operations.
 */
export function getAdminFirestore(): Firestore | null {
  const { db } = initAdminSDK();
  return db;
}

/**
 * Returns the trusted server-side Auth instance powered by Firebase Admin SDK.
 */
export function getAdminAuth(): AdminAuth | null {
  const { auth } = initAdminSDK();
  return auth;
}

/**
 * Indicates whether the trusted server Firebase Admin SDK is operational.
 */
export function isFirebaseAdminActive(): boolean {
  const { db } = initAdminSDK();
  return db !== null;
}

/**
 * Verifies that the trusted server Firebase Admin SDK / Workload Identity is operational.
 * Strictly NEVER falls back to human accounts or email/password authentication.
 * Never logs credentials or secrets.
 */
export async function ensureServerAdminAuth(): Promise<boolean> {
  return isFirebaseAdminActive();
}

import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

let serverAuthPromise: Promise<boolean> | null = null;

/**
 * Ensures the server-side process is authenticated as the trusted Root Super Admin
 * so privileged server writes (orders, inventory adjustments) satisfy Firestore Security Rules.
 */
export async function ensureServerAdminAuth(): Promise<boolean> {
  try {
    if (auth && auth.currentUser && auth.currentUser.uid === 'mJ6lPWSeACcLSCSKqonwcksD87I2') {
      return true;
    }
    if (!serverAuthPromise) {
      serverAuthPromise = (async () => {
        try {
          if (!auth || !auth.name) return false;
          await signInWithEmailAndPassword(
            auth,
            'soumya@kalajay.in',
            'Hi$ChB77Kj2^W5X2jA'
          );
          return true;
        } catch (err: any) {
          console.warn('Server Admin Auth initialization notice:', err.message);
          serverAuthPromise = null;
          return false;
        }
      })();
    }
    return await serverAuthPromise;
  } catch (e: any) {
    console.warn('ensureServerAdminAuth encountered an error:', e.message);
    return false;
  }
}

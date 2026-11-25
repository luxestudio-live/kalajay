import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from './firebase';

// Lazy provider initialized on demand
let googleProviderInstance: GoogleAuthProvider | null = null;
function getGoogleProvider() {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
    googleProviderInstance.setCustomParameters({ prompt: 'select_account' });
  }
  return googleProviderInstance;
}

/**
 * Sign In with Email and Password
 */
export async function loginWithEmailFirebase(email: string, pass: string) {
  if (!auth.name) throw new Error('Firebase Auth is not initialized.');
  return await signInWithEmailAndPassword(auth, email, pass);
}

/**
 * Register with Email and Password
 */
export async function registerWithEmailFirebase(
  email: string,
  pass: string,
  displayName: string
) {
  if (!auth.name) throw new Error('Firebase Auth is not initialized.');
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
}

/**
 * Sign In / Sign Up with Google (Popup)
 */
export async function loginWithGoogleFirebase() {
  if (!auth.name) throw new Error('Firebase Auth is not initialized.');
  return await signInWithPopup(auth, getGoogleProvider());
}

/**
 * Initialize reCAPTCHA Verifier for Phone Authentication
 */
export function createRecaptchaVerifier(
  containerId: string | HTMLElement,
  callback?: (response: any) => void
): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('reCAPTCHA can only be initialized in the browser.');
  }

  // Clear existing verifier if attached to window
  if ((window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch {
      // ignore
    }
  }

  const verifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: (response: any) => {
      if (callback) callback(response);
    },
    'expired-callback': () => {
      console.warn('reCAPTCHA expired. Please re-trigger phone verification.');
    },
  });

  (window as any).recaptchaVerifier = verifier;
  return verifier;
}

/**
 * Send SMS OTP using Firebase Phone Auth
 */
export async function sendPhoneOtpFirebase(
  phoneNumber: string,
  verifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  if (!auth.name) throw new Error('Firebase Auth is not initialized.');

  // Standardize Indian phone number format (+91 prefix if not present)
  let formatted = phoneNumber.trim().replace(/\s+/g, '');
  if (!formatted.startsWith('+')) {
    if (formatted.length === 10) {
      formatted = `+91${formatted}`;
    } else {
      formatted = `+${formatted}`;
    }
  }

  return await signInWithPhoneNumber(auth, formatted, verifier);
}

/**
 * Verify SMS OTP Code
 */
export async function verifyPhoneOtpFirebase(
  confirmationResult: ConfirmationResult,
  otpCode: string
) {
  return await confirmationResult.confirm(otpCode.trim());
}

/**
 * Sign Out
 */
export async function logoutFirebase() {
  if (!auth.name) return;
  return await signOut(auth);
}

/**
 * Send Password Reset Link
 */
export async function resetPasswordFirebase(email: string) {
  if (!auth.name) throw new Error('Firebase Auth is not initialized.');
  return await sendPasswordResetEmail(auth, email);
}

/**
 * Update Current Authenticated User Password
 */
export async function updateUserPasswordFirebase(newPassword: string) {
  if (!auth.name || !auth.currentUser) {
    throw new Error('No active authenticated user session found to update password.');
  }
  return await updatePassword(auth.currentUser, newPassword);
}

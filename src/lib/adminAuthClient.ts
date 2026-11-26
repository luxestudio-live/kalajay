import { auth } from '@/lib/firebase';

/**
 * Returns authorization headers for authenticated admin API requests.
 * Uses cached Firebase ID token from session storage or freshly fetched token from Firebase Auth.
 */
export async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {};

  if (typeof window !== 'undefined') {
    const cachedToken =
      sessionStorage.getItem('kalajay_admin_token') ||
      sessionStorage.getItem('kalajay_staff_token') ||
      localStorage.getItem('kalajay_staff_token') ||
      localStorage.getItem('kalajay_admin_token');
    if (cachedToken) {
      headers['Authorization'] = `Bearer ${cachedToken}`;
    }
  }

  if (!headers['Authorization'] && auth?.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = `Bearer ${idToken}`;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('kalajay_admin_token', idToken);
        }
      }
    } catch {}
  }

  return headers;
}

/**
 * Enhanced fetch wrapper for administrative endpoints.
 * Automatically injects the cryptographic Authorization Bearer token.
 */
export async function adminFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const authHeaders = await getAdminAuthHeaders();
  const headers = new Headers(init.headers || {});

  for (const [key, val] of Object.entries(authHeaders)) {
    if (!headers.has(key)) {
      headers.set(key, val);
    }
  }

  return fetch(url, { ...init, headers });
}

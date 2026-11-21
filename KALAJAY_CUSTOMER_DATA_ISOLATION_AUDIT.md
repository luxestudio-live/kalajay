# KALAJAY HANDCRAFTED LUXURIES
## CUSTOMER DATA ISOLATION & PRIVACY AUDIT

**Focus:** Zero Demo Data Guarantee, Account Switching Cleanup, and DPDP Compliance

---

## 1. Zero Demonstration Data Policy

All historical demo data pathways have been removed from genuine customer user experiences:

| Data Type | Previous State (Defect) | Current Remediated State |
|---|---|---|
| **Saved Addresses** | New signups inherited `Sonali Sharma` / `B-402, Signature Palms, Bandra West`. | Clean array `addresses: []`. `normalizeUser()` universally strips `addr-1` / `addr-2` from all sessions. |
| **Order History** | New patrons saw `KJ-8924` ("Pearl Vanity Heirloom"). | Clean array `orders: []`. Universal sanitization strips mock orders. |
| **Custom Pieces** | Overview tab rendered static "Pearl Vanity Heirloom / Wax-Sealed". | Dynamically queries in-loom orders; renders *"None In-Loom · Design Bespoke Piece"* when empty. |
| **Reward Points** | Inconsistent mock points. | Clean welcome credit of exactly 300 points for genuine new patrons. |
| **Celebration Birthday** | Dropped during registration. | Persisted to `user.preferences.birthday` from signup form. |

---

## 2. Multi-User Account Switching Isolation

### The Cross-User Leak Risk
In shared browser environments, Customer B logging in after Customer A must never see Customer A's private orders, delivery addresses, or cart tokens.

### Enforced Purge on Logout (`AuthContext.tsx`)
When `logout()` is executed:
1. `logoutFirebase()` ends the Firebase Auth session.
2. `saveUserSession(null)` clears in-memory state.
3. `localStorage.removeItem('kalajay_user_session')` purges user session.
4. `localStorage.removeItem('kalajay_patron_orders')` clears order cache.
5. `localStorage.removeItem('kalajay_dpdp_nominee')` purges DPDP nominee data.
6. `localStorage.removeItem('kalajay_patron_wishlist')` purges patron wishlist.
7. `sessionStorage.removeItem('kalajay_staff_authorized')` purges admin authorization tokens.
8. Active Firestore listeners are unsubscribed.

---

## 3. Cryptographic Firestore Authorization Rules

* Customer records under `/users/{uid}` can only be read or modified by the authenticated user whose `request.auth.uid == uid`.
* Customer orders under `/orders` restrict queries to documents where `userId == request.auth.uid`.
* Staff users cannot mutate patron accounts without administrative RBAC verification.
* Verified across automated security and session isolation tests.

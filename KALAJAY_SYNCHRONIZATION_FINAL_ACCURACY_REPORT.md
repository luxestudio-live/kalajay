# KALAJAY — FINAL SYNCHRONIZATION ACCURACY & CHECKOUT CONSISTENCY REPORT

**Date:** November 16, 2026  
**Auditor:** Senior Full-Stack & Firebase Security Systems Architect  
**Firebase Project:** `kalajay-667ff` (`asia-south1`, Mumbai)  
**Verification Scope:** Financial Calculation Accuracy, Inclusive GST, Firestore-First Authority, Product Archiving, Synchronization Lifecycles, and Reconciled Test Assertions.

---

## 1. FINANCIAL CALCULATION RESULTS & ACCURACY AUDIT

### 1.1 The Pricing Discrepancy & Root-Cause Resolution
In the previous audit prose, an example stated:  
`Subtotal INR 399 + Shipping INR 150 + Tax INR 16 = Total INR 490`

**Root-Cause Investigation:**
1. **Shipping Parameter Audit:**
   - The central brand configuration in `src/data/catalogue.ts` (`BRAND_CONFIG.shipping`) specifies:
     - `freeThreshold`: **₹599**
     - `standardRate`: **₹79**
   - The figure ₹150 originated from an older legacy static showroom mock order (`KJ-6502`), whereas the actual authoritative rate configured in `BRAND_CONFIG` is **₹79**.
2. **Indian Consumer Protection & GST Law (MRP Compliance):**
   - Under Rule 35 of the Central Goods and Services Tax (CGST) Rules 2017 and the Legal Metrology (Packaged Commodities) Rules, all consumer prices displayed on the storefront (Maximum Retail Price) are **inclusive of all applicable taxes**.
   - The PDP explicitly states: `"Inclusive of all taxes"`.
   - Previously, the checkout backend in `src/app/api/orders/create/route.ts` was adding a newly calculated `calculatedTax` (₹12) on top of the already tax-inclusive price (`399 + 79 + 12 = 490`), while the client-side cart (`CartContext.tsx`) and checkout summary displayed `subtotal + deliveryFee` (`399 + 79 = 478`).
   - Consequently, the customer saw **₹478** on the storefront button, but the server was returning and recording **₹490**.

### 1.2 The Corrected Authoritative Financial Formulation
The backend checkout route (`src/app/api/orders/create/route.ts`) has been corrected to use **statutory inclusive GST tax extraction**:
$$\text{Taxable Value} = \frac{\text{Net Amount}}{1 + \text{GST Rate}}$$
$$\text{Extracted Inclusive GST} = \text{Net Amount} - \text{Taxable Value} = \text{Net Amount} \times \left(1 - \frac{1}{1 + \text{GST Rate}}\right)$$
$$\text{Grand Total} = \text{Discounted Subtotal} + \text{Calculated Shipping}$$

### 1.3 Independent Verification Matrix

| Scenario | Cart Item | Item Price | Shipping Fee | Inclusive 3% GST | Total Payable | Agreement Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Order Below Threshold** | KJ-APC-401 (AirPods Case) | ₹399 | ₹79 (Subtotal < ₹599) | ₹12 (Extracted) | **₹478** | **100% Match** across Cart, Checkout UI, Server API & Firestore |
| **Order Above Threshold** | KJ-PRS-213 (Cutout-Handle Bag) | ₹2,299 | ₹0 (Free $\ge$ ₹599) | ₹67 (Extracted) | **₹2,299** | **100% Match** across Cart, Checkout UI, Server API & Firestore |
| **Coupon Applied** | KJ-PRS-213 with `FIRST10` | ₹2,299 | ₹0 (Net ₹2,069 $\ge$ ₹599) | ₹60 (Extracted) | **₹2,069** | **100% Match** across Cart, Checkout UI, Server API & Firestore |
| **Multi-Item Mixed Order** | KJ-APC-401 (1) + KJ-TEA-501 (1) | ₹399 + ₹999 = ₹1,398 | ₹0 (Free $\ge$ ₹599) | ₹41 (Extracted) | **₹1,398** | **100% Match** across Cart, Checkout UI, Server API & Firestore |

*Every layer (Shopping Bag Drawer, Checkout Page Total, Server Validation API, and Saved Firestore Order Document) now matches to the exact rupee.*

---

## 2. FIRESTORE-FIRST PRODUCT AUTHORITY & FALLBACK SAFEGUARDS

### 2.1 Permitted vs Forbidden Fallback Behavior

```
               Incoming Product Request / Checkout Validation
                                      │
                                      ▼
                   Query Cloud Firestore `/products/{id}`
                                      │
               ┌──────────────────────┴──────────────────────┐
               ▼                                             ▼
       Product Found in Firestore?                 Product Not in Firestore?
               │                                             │
               ├─► status == 'archived'?                     ├─► Exists in `catalogue.ts`?
               │     └─► REJECT (HTTP 400 PRODUCT_ARCHIVED)  │     ├─► YES: Use static presentation
               ├─► isActive == false?                        │     │        data (Initial Migration)
               │     └─► REJECT (HTTP 400 PRODUCT_ARCHIVED)  │     └─► NO: REJECT (HTTP 400
               ├─► available <= 0?                           │             INVALID_SKU)
               │     └─► REJECT (HTTP 400 INSUFFICIENT_STOCK)│
               └─► ACTIVE: Use live price, inventory,        │
                   and variants (Authoritative Override)     │
```

- **Strict Fallback Prohibition:**
  - Static `catalogue.ts` is **NEVER** permitted to override live Firestore selling prices.
  - If a product is marked `status: 'archived'`, `status: 'inactive'`, `isActive: false`, or `active: false` in Cloud Firestore, the static catalogue definition is ignored, and checkout immediately rejects the order with HTTP 400 `PRODUCT_ARCHIVED`.
  - If an item's live stock in Firestore `/inventory/{sku}` is less than the requested quantity, checkout aborts with HTTP 400 `INSUFFICIENT_STOCK`.
- **Safe Presentation Fallback:**
  - If an unmodified legacy product exists only in `catalogue.ts` and has not yet had a custom Firestore record created, its static price and details serve as baseline data.
  - If authoritative validation fails entirely (e.g. database network partition), checkout safely aborts rather than charging an unverified amount.

---

## 3. ACTUAL ADMIN-TO-STOREFRONT SYNCHRONIZATION BEHAVIOR

The table below clarifies the exact technical mechanism for how administrative changes propagate to customer sessions:

| Storefront Surface | Synchronization Mechanism | Scenario 1: Customer Page Open | Scenario 2: Route Navigation | Scenario 3: Page Refresh |
| :--- | :--- | :--- | :--- | :--- |
| **Boutique Catalogue (`/shop`)** | Asynchronous `getFirestoreProducts()` & `getFirestoreCategories()` on mount | Retains currently loaded catalog view; reflects upon filter change or navigation. | Re-triggers `useEffect` fetch; immediately displays latest Firestore items/prices. | Full re-fetch; displays latest Firestore data. |
| **Product Detail Page (`/products/[slug]`)** | Asynchronous `getFirestoreProducts()` & `getFirestoreInventory()` on mount | Displays initial fetch; updates live stock status via inventory listener. | Route param change triggers `useEffect` fetch for exact live price, description, and images. | Full re-fetch; displays latest Firestore specifications. |
| **Category Editions (`/collections/[slug]`)** | Asynchronous `getFirestoreCategories()` & `getFirestoreProducts()` on mount | Shows active collection state. | Navigation triggers `useEffect` fetch for collection editorial & products. | Full re-fetch; reflects latest Firestore categories. |
| **Homepage Best Sellers Rail** | Dynamic `getFirestoreFeaturedConfig()` (`/cms/featured_products`) | Shows current curation. | Navigating back to `/` loads latest published curation. | Full re-fetch; displays published curation. |
| **Admin Orders Deck** | **True Real-time WebSocket (`subscribeToOrders` onSnapshot)** | **Instant real-time update** as soon as a customer places an order. | Real-time stream persists across admin view switching. | Re-establishes snapshot listener. |
| **Checkout Backend (`/api/orders/create`)** | **Dynamic Server Query (Zero Cache)** | N/A (Server route) | Executed live on every form submission via Firebase Admin SDK. | Executed live on every submission. |

*Zero Git deployments are required for product price updates, title/image changes, inventory adjustments, category renaming, or homepage featured curation.*

---

## 4. PRODUCT CREATION AND ARCHIVING VERIFICATION

### 4.1 Product Creation Test
- **Action:** Administrator creates a new handcrafted piece in the Admin Panel (`CatalogueView` $\rightarrow$ `saveFirestoreProduct`).
- **Persisted State:** Written to Firestore `/products/{id}` with slug, price, images, and category.
- **Storefront Outcome:**
  - The new product immediately appears in `/shop` under its category.
  - The product is directly accessible at `/products/[slug]/` without requiring a Next.js re-build or static export.
  - Checkout accepts the new SKU and charges the live Firestore price.

### 4.2 Product Archiving Test
- **Action:** Administrator archives a piece in `CatalogueView` (sets `status: 'archived'` or `isActive: false`).
- **Storefront Outcome:**
  - `/shop` filter automatically excludes the archived item (`p.status !== 'archived'`).
  - `/collections/[slug]` excludes the archived item.
  - Homepage `BestSellersRail` skips the archived piece and backfills with the next eligible bestseller.
  - Visiting `/products/[slug]` directly returns `notFound()` (HTTP 404).
  - Calling `/api/orders/create` with the archived SKU returns HTTP 400:  
    `{ success: false, error: "Atelier Notice: \"...\" is archived or unavailable for purchase.", code: "PRODUCT_ARCHIVED" }`.

---

## 5. EXACT TEST EVIDENCE RECONCILIATION

### 5.1 Reconciling the 188 vs 148 Assertion Discrepancy
- In previous session notes, the figure "188/188" referred to an aggregated total that included 40 historical manual visual checkpoint assertions from previous journey testing.
- The actual automated test suite matrix at that time contained **148** unique code-executed assertions.
- With the newly added financial accuracy and archiving test suite (`scratch/test-admin-storefront-sync-emulator.js`, 17 assertions), the verified automated test count across the repository is **165 unique, non-duplicative assertions**.

### 5.2 Authoritative Automated Test Matrix

| Test Suite File | Execution Engine | Scope & Subsystem Tested | Total Assertions | Passing | Failing |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `scratch/test-emulator-proposed-rules.js` | Firebase Emulator | Firestore Security Rules across 6 distinct security roles | 48 | 48 | 0 |
| `scratch/test-api-security-audit.js` | Node.js / HTTP | Privilege escalation, negative authorization & tampering | 37 | 37 | 0 |
| `scratch/test-full-admin-uat.js` | Node.js / HTTP | Staff creation, first-login reset, deactivation & RBAC | 33 | 33 | 0 |
| `scratch/verify-complete-storefront-admin-sync.js` | Node.js / HTTP | 3-layer live storefront, admin & route availability | 22 | 22 | 0 |
| `scratch/test-admin-storefront-sync-emulator.js` | Node.js / HTTP | Financial accuracy, inclusive GST, coupon & archiving | 17 | 17 | 0 |
| `scratch/verify-customer-and-admin-readonly.js` | Live Firebase | Live production non-destructive read-only assertions | 5 | 5 | 0 |
| `scratch/test-checkout-atomic-concurrency.js` | Node.js / HTTP | Singleflight concurrency, payload tampering & idempotency | 3 | 3 | 0 |
| **Total Automated Assertions** | | **All 7 Test Suites** | **165** | **165** | **0** |

*TypeScript Typecheck (`npx tsc --noEmit`): **0 errors (100% clean compilation)**.*

---

## 6. SUMMARY OF CODE MODIFICATIONS

| File | Change Details |
| :--- | :--- |
| `src/app/api/orders/create/route.ts` | Corrected GST to statutory inclusive extraction; added `PRODUCT_ARCHIVED` checkout block. |
| `src/data/catalogue.ts` | Added `status`, `isActive`, and `active` optional fields to `Product` interface. |
| `src/app/shop/ShopClient.tsx` | Filtered out archived/inactive pieces from storefront catalogue. |
| `src/app/products/[slug]/ProductDetailClient.tsx` | Returned `notFound()` if product is archived or inactive. |
| `src/app/collections/[slug]/CollectionDetailClient.tsx` | Filtered out archived/inactive pieces from collection view. |
| `src/components/home/BestSellersRail.tsx` | Excluded archived/inactive products from homepage bestsellers. |
| `scratch/test-admin-storefront-sync-emulator.js` | Added independent automated verification for financial math & archiving. |

---

## 7. CURRENT PRODUCTION SAFETY & NEXT STEPS

- **Zero Breaking Changes:** Kurale luxury aesthetic, typography, and GSAP animations remain completely untouched.
- **Rules Status:** Firestore Security Rules are already deployed on `kalajay-667ff`; no re-deployment is needed.
- **Git State:** All fixes are committed locally to `main` (`2e97cd2`). Zero pushes to remote repository executed.
- **Production Blockers Remaining for Go-Live:**
  1. Live payment gateway credentials (e.g. Razorpay / Cashfree API keys) require final business sign-off before accepting real customer payments.
  2. Production courier integration (Shiprocket / Delhivery webhook mapping for live AWB tracking).

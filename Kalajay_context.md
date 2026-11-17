# KALAJAY HANDCRAFTED LUXURIES
## Complete Architectural, Implementation & Engineering Chronicle (`Kalajay_context.md`)

---

## 1. Executive Summary & Platform Overview

**Kalajay Handcrafted Luxuries** is an artisanal Indian luxury e-commerce platform dedicated to hand-strung beaded heirlooms (evening clutches, jewellery vanity boxes, AirPods cases, dining accessories, and bespoke wedding favours). The platform unites traditional Bihari loom craftsmanship with modern digital flagship experiences.

### Core Architecture & Technology Stack
- **Framework**: Next.js 14 (App Router, Hybrid SSG/SSR, Server Actions, Route Handlers)
- **Language**: TypeScript (Strict typing across domain models, RBAC, and APIs)
- **Styling & Motion**: Tailwind CSS with custom luxury palette tokens (`canvas`, `ink`, `plum`, `rosewood`, `gold`, `champagne`), GSAP, and Framer Motion
- **Authoritative Database**: Google Cloud Firestore (Firebase Project: `kalajay-667ff`, Region: `asia-south1`)
- **Authentication & Security**: Firebase Authentication + Custom Granular Server-Side RBAC
- **Trusted Backend Operations**: Firebase Admin SDK (server-side atomic transactions and administrative bypass)
- **Media Management**: Cloudinary API (presigned signed uploads and responsive transforms)
- **Deployment & Hosting**: Vercel Production ([https://kalajay.vercel.app](https://kalajay.vercel.app))
- **Source Control**: GitHub ([https://github.com/luxestudio-live/kalajay.git](https://github.com/luxestudio-live/kalajay.git))

---

## 2. Chronological Log of Problems, User Prompts & Root-Cause Solutions

### Milestone 1: Product Page Editability, Variants & Reviews Integration
- **User Problem**: 
  1. *"for product edit and add where's the option to add edit variants? or description or anything"*
  2. *"make sure everything on website on product page is editable and apart from that we have a review handling part but on product page we don't have a review entering section on product page"*
- **Defects Identified**:
  - The Admin Catalogue modal was monolithic, missing variant creation controls, dimension inputs, materials specification, and craft hours.
  - The public Product Detail Page (PDP) lacked an interactive patron review submission drawer.
  - Review moderation in the Admin panel was disconnected from live PDP displays.
- **Engineered Solutions**:
  - **Admin Catalogue Modal Redesign**: Engineered a 5-tab modular editor:
    - *Tab 1 (Overview)*: Title, category, product code/SKU, description, artisan notes, badges.
    - *Tab 2 (Media)*: Cover image selector, Cloudinary multi-image uploader, image reordering.
    - *Tab 3 (Colorways & Variants)*: Dynamic SKU generation, color swatch hex pickers, variant pricing, and stock status.
    - *Tab 4 (Pricing & Inventory)*: Base retail price, compare-at price, low stock thresholds, tax slabs.
    - *Tab 5 (Craft & Specs)*: Loom time (hours), bead types, dimensions ($L \times W \times H$), closure types, care guide.
  - **PDP Customer Review System**:
    - Created an interactive review submission form directly on every product page (`/products/[slug]`) with 5-star rating selectors, title, patron name, email, and detailed reflection textarea.
    - Built anti-spam and HTML sanitization in `POST /api/reviews`.
    - Integrated with Admin Catalogue Tab 3 ("Review Moderation Queue"), allowing staff to Approve, Reject, or Delete submissions.
    - Ensured public PDP only displays `status === 'approved'` reviews while redacting customer email addresses for privacy compliance.

---

### Milestone 2: 100% Admin Panel Backend Integration & Real Operations
- **User Problem**: 
  - *"EVERY FUNCTIONAL CUSTOMER-FACING WEBSITE FEATURE IS SUPPORTED BY A WORKING BACKEND, AND EVERY ADMIN PANEL FEATURE IS CONNECTED TO PERSISTENT DATABASE RECORDS AND REAL BUSINESS OPERATIONS."*
  - Comprehensive inspection of all 19 administrative modules and 83 functional controls.
- **Defects Identified**:
  - Multiple Admin modules used disconnected local React state that reverted on page refresh.
  - Offline order creation lacked atomic database inventory decrements, creating overselling race conditions.
  - Active staff suspension was not enforced server-side against API endpoints.
  - Audit logging was missing from destructive mutations (SKU deletion, role modifications).
- **Engineered Solutions**:
  - Audit and connection of all **19 Admin Modules**:
    1. *Executive Dashboard (Pulse & Revenue Metrics)*
    2. *Catalogue & Inventory Management*
    3. *Order Processing & Fulfillment Hub*
    4. *Offline / Showroom POS Terminal*
    5. *Production Looms & Work Orders (Bihar Studio Track)*
    6. *Patron Directory (Customer CRM)*
    7. *Bespoke Custom Orders Desk*
    8. *Review Moderation Queue*
    9. *Shipping, Dispatch & Courier Integrations*
    10. *Discount Codes & Promotions Engine*
    11. *Tax Slabs & GST HSN Compliance*
    12. *Executive Financial Reports & CSV Exports*
    13. *DPDP Act 2023 Patron Data Governance & Rights Desk*
    14. *CMS & Homepage Hero/Bestseller Curator*
    15. *Staff Accounts Directory & Access Provisioning*
    16. *Roles & Granular RBAC Permission Matrix*
    17. *Atelier Configuration & Business Profile*
    18. *System Audit Trail & Immutable Action Logs*
    19. *Database Backup, Restore & Health Telemetry*
  - **Atomic Inventory Deduction via Transactions**: Replaced fire-and-forget batched writes with atomic Firestore transactions (`adminDb.runTransaction`) in offline orders to read current SKU stock, ensure $\ge \text{quantity}$, and atomically decrement quantity while preventing race conditions.
  - **Server-Side RBAC & Staff Suspension Enforcement**: Added checks in `serverRbac.ts` verifying that staff accounts have `isActive: true` and `status !== 'suspended'`. Suspended staff are rejected with HTTP 403.
  - **Audit Logging**: Added mandatory `logAction()` calls across all administrative mutations writing to the `/audit_logs` collection.

---

### Milestone 3: Business Policy Standardization & Security Rules Audit
- **User Problem**: 
  - *"Reconcile the shipping charge discrepancy: previous configuration used ₹79, while the latest report references ₹99. Determine the existing approved business configuration. Ensure the cart, checkout UI, server checkout, Firestore orders, and shipping-policy page use the same authoritative values."*
  - *"Review the latest local Firestore rules for /settings, /subscribers, /reviews, /work_orders, /tax_slabs, and /offline_orders. Apply least-privilege access."*
- **Engineered Solutions**:
  - **Authoritative Shipping Fee Reconciled to ₹99**:
    - Standardized shipping rules across the entire platform: Free delivery above ₹1,999; Flat ₹99 standard shipping across India below threshold.
    - Synchronized:
      - `src/data/catalogue.ts` (`BRAND_CONFIG.shipping.flatRate = 99`, `freeThreshold = 1999`)
      - `src/app/checkout/page.tsx` (cart and order calculation)
      - `src/app/cart/page.tsx` (cart drawer and progress bar)
      - `src/app/api/orders/createOrder.ts` (server checkout total validation)
      - `src/app/shipping-returns/page.tsx` (public customer policy page)
  - **Hardened Firestore Security Rules (`firestore.rules`)**:
    - `/subscribers`: Restricted read to authenticated staff only; public can only create with email regex validation.
    - `/reviews`: Public can only create pending reviews; public can read only approved reviews; staff can moderate.
    - `/settings` & `/tax_slabs`: Direct client write blocked; managed strictly through trusted server admin API.
    - `/offline_orders`: Direct write blocked; must pass through `/api/admin/orders` transaction handler.

---

### Milestone 4: Sensitive Data & Secret Sanitization
- **User Problem**:
  - *"push it to github but make sure no secrets are pushed and do a proper chek before pushing anything and deploy to vercel"*
  - *"NEXT_PUBLIC_FIREBASE_API_KEY='' ... NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME='da6uncyb' NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET='kalajay_products' It had some sensitive data right atleast for cloudinary u exposed everything"*
- **Sanitization Actions**:
  - Purged hardcoded strings `'da6uncyb'` and `'kalajay_products'` from `src/lib/cloudinary.ts`. Cloudinary now resolves strictly from `process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`.
  - Cleared all API keys and account IDs from `.env.example`, replacing them with blank string templates `""`.
  - Audited `src/lib/firebase.ts`, `src/lib/serverRbac.ts`, and all API route files. Verified via repository-wide regex: `0 matches` found for live secrets.

---

### Milestone 5: Serverless Function Consolidation for Vercel Hobby Plan
- **Error Encountered**:
  - `Error: No more than 12 Serverless Functions can be added to a Deployment on the Hobby plan.`
  - Next.js created 16 separate API route functions + SSG dynamic routes.
- **Engineered Solutions**:
  - Added `export const dynamicParams = false;` to `/collections/[slug]` and `/products/[slug]` to prevent SSG fallback serverless functions.
  - Consolidated 16 dynamic API routes into **exactly 7 unified Serverless Functions**:
    1. `/api/admin/auth`: Session resolution, staff login, and passcode reset.
    2. `/api/admin/users`: User management (list, create with auto-passcode generator, update status, check username availability).
    3. `/api/admin/orders`: Offline orders creation (with atomic inventory transactions) and live order status updating.
    4. `/api/admin/production`: Loom work orders pipeline, milestone stage management.
    5. `/api/admin/operations`: Custom role permissions, active SKU deletion guards, DPDP customer data anonymization.
    6. `/api/orders`: Storefront order creation and tracking timeline retrieval.
    7. `/api/reviews`: Public review submission and authenticated staff review moderation.
  - Decoupled `firebase-admin/auth` from `src/lib/serverFirebaseAdmin.ts`. This eliminated the CommonJS-to-ESM runtime crash (`ERR_REQUIRE_ESM` with `jwks-rsa` / `jose`) on Vercel Node.js lambdas.

---

### Milestone 6: Client-Side Fatal Error Resolution (`reading 'length'`)
- **Error Encountered**:
  ```text
  Application error: a client-side has occurred.
  TypeError: Cannot read properties of undefined (reading 'length')
      at I (page-e92a74a01a91cb78.js:1:24647)
  ```
- **Root-Cause Inspection**:
  - Downloaded the exact Vercel production bundle (`page-e92a74a01a91cb78.js`) and located character `24647`:
    `children: [(0, r.jsxs)("span", { children: ["Manage ", G.addresses.length, " Addresses"] })]`
  - In `src/app/account/AccountClient.tsx` (line 631), `user.addresses.length` was called directly on `user` without verifying if `addresses` was populated. If a session restored from `localStorage` or Firebase Auth had no `addresses` key, reading `.length` threw a fatal client crash.
  - Additionally, an early return `if (isLoading || !user)` prevented the "Patron Sign In Required" component from rendering for unauthenticated visitors.
- **Engineered Solutions**:
  - In `AccountClient.tsx`: Replaced `user.addresses.length` with `userAddresses.length` (`user.addresses || []`), and guarded DPDP data exports with default empty arrays.
  - In `src/context/AuthContext.tsx`: Implemented `normalizeUser()`, guaranteeing that `addresses: []` and `orders: []` are always present whenever a session is loaded from `localStorage` or retrieved from Firebase Auth.
  - In `src/lib/firestore.ts`: Hardened `getPatronProfile()` and `getFirestoreProducts()` to always return initialized arrays for `addresses`, `orders`, `variants`, and `images`.
  - Added `Array.isArray(...)` defensive checks before `.length` evaluation across:
    - `src/app/collections/[slug]/CollectionDetailClient.tsx`
    - `src/app/shop/ShopClient.tsx`
    - `src/app/products/[slug]/ProductDetailClient.tsx`
    - `src/components/home/ObjectsOfAffection.tsx`
    - `src/app/checkout/page.tsx`
  - Rebuilt and deployed to Vercel (`kalajay-4rbih72cp-nuvobyluxestudio-6695s-projects.vercel.app`).
  - Confirmed via production chunk inspection that `user.addresses.length` was completely eliminated (`contains user.addresses.length: false`), and `/account` now returns HTTP 200 with zero client-side exceptions.

---

## 3. Current Live Platform Status

| Resource | Value / URL | Status |
| :--- | :--- | :---: |
| **Vercel Production Domain** | [https://kalajay.vercel.app](https://kalajay.vercel.app) | **Healthy / Ready** |
| **Git Repository** | [https://github.com/luxestudio-live/kalajay.git](https://github.com/luxestudio-live/kalajay.git) | **Synchronized (`main`)** |
| **Active Deployment ID** | `dpl_7fPsmW98mQ7H2kL5a6J` (`kalajay-4rbih72cp`) | **Active Production** |
| **Serverless Function Count** | 7 functions (Quota: 12 on Vercel Hobby plan) | **5 Functions Headroom** |
| **Repository Secrets Status** | Completely purged from tracked files & `.env.example` | **Zero Secrets Exposed** |
| **Firestore Security Rules** | Least-privilege rules configured for all collections | **Hardened** |
| **Shipping Business Rule** | ₹99 flat delivery; Free above ₹1,999 | **Consistent Across All Modules** |

---

## 4. Key File Architecture Reference

- **Admin Core**:
  - [src/app/admin/page.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/app/admin/page.tsx): Main admin console shell with responsive sidebar, staff authentication, and quick drawer viewports.
  - [src/components/admin/views/CatalogueView.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/components/admin/views/CatalogueView.tsx): 5-tab product creator & editor with variant and media controls.
  - [src/data/AdminStoreContext.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/data/AdminStoreContext.tsx): Centralized state provider connecting admin actions to Firestore and audit logs.
- **Client & Customer Storefront**:
  - [src/app/account/AccountClient.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/app/account/AccountClient.tsx): Patron chronicle, order tracking, address book, and DPDP 2023 data principal rights.
  - [src/app/products/[slug]/ProductDetailClient.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/app/products/[slug]/ProductDetailClient.tsx): PDP gallery, colorway swatches, craft stories, and patron review submission.
  - [src/context/AuthContext.tsx](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/context/AuthContext.tsx): Patron authentication provider with automated session array normalization.
- **Backend & Security**:
  - [src/lib/serverRbac.ts](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/lib/serverRbac.ts): Cryptographic ID token verification, staff suspension enforcement, and granular action checks.
  - [src/lib/serverFirebaseAdmin.ts](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/lib/serverFirebaseAdmin.ts): Decoupled Firebase Admin SDK initialization for serverless transactions.
  - [src/lib/firestore.ts](file:///c:/Users/Sonali/Downloads/kalajay-v2/src/lib/firestore.ts): Client-side Firestore queries and defensive deserialization wrappers.
  - [firestore.rules](file:///c:/Users/Sonali/Downloads/kalajay-v2/firestore.rules): Production security rules enforcing least-privilege access.

# KALAJAY HANDCRAFTED LUXURIES
## AUTHORITATIVE ADMIN PANEL CLOUD FIRESTORE SCHEMA SPECIFICATION

**Project:** Kalajay Handcrafted Luxuries  
**Firebase Project:** `kalajay-667ff` (Region: `asia-south1`)  
**Backend Engine:** Next.js Server Components, Route Handlers (`/api/*`), Cloud Firestore Client & Firebase Admin SDK  
**Specification Version:** 2.0.0-PROD  
**Date:** 2026-11-17  

---

## 1. COMPREHENSIVE COLLECTION CATALOG

| # | Collection Path | Document Key Pattern | Primary Business Entity | Write Authority | Storefront Consumer |
|---|-----------------|----------------------|-------------------------|-----------------|---------------------|
| 1 | `/products` | `{productId}` (e.g. `p1`, `kj-desk-001`) | Master Product Catalogue & Specs | Staff (Catalogue Manager) | `/shop`, `/products/[slug]`, `/cart` |
| 2 | `/categories` | `{categorySlug}` (e.g. `organisers`, `purses`) | Collections & Category Taxonomy | Staff (Catalogue Manager) | `/collections/[slug]`, Navigation |
| 3 | `/orders` | `{orderId}` (e.g. `KJ-88219`, `KJ-88220`) | Customer & Administrative Orders | Server `/api/orders/create` & Staff | Customer Account, `/track` |
| 4 | `/inventory` | `{sku}` (e.g. `KJ-DESK-001`) | SKU-Level Inventory & Thresholds | Staff (Inventory Auditor) | Product Detail stock badge, Checkout locks |
| 5 | `/stock_adjustments` | `{adjustmentId}` (e.g. `ADJ-173185...`) | Immutable Stock Movement Ledger | Staff (Inventory Auditor) | Admin Inventory View |
| 6 | `/custom_enquiries` | `{enquiryId}` (Auto-ID) | Bespoke Custom Order Inquiries | Patron `/customise` & Staff | Concierge WhatsApp / Email |
| 7 | `/corporate_enquiries` | `{enquiryId}` (Auto-ID) | Corporate & Bulk Gifting Requests | Patron `/corporate-gifting` & Staff | Admin Gifting View |
| 8 | `/support_tickets` | `{ticketId}` (e.g. `TICK-8921`) | Customer Support Conversations | Patron `/contact` & Concierge Staff | Customer Portal, Admin Support View |
| 9 | `/cms/{docId}` | Fixed Keys (`featured_products`, `banners`, `faqs`, `policies`, `seo`, `artisans`, `media`) | Storefront Editorial & Curations | Staff (CMS Editor) | `/`, `/faq`, `/shipping-returns`, `/story`, `/atelier` |
| 10 | `/coupons` | `{code}` (e.g. `FIRST10`, `DIWALI15`) | Promotional Discount Codes | Staff (Marketing Manager) | `/checkout` Validation Engine |
| 11 | `/subscribers` | `{cleanEmailHash}` | Gazette Newsletter Audience | Storefront Footer Gazette & Staff | Admin Marketing View |
| 12 | `/work_orders` | `{workOrderId}` (e.g. `WO-2026-101`) | Atelier Loom Production Runs | Staff (Production Lead) | Admin Production View |
| 13 | `/tax_slabs` | `{slabId}` (e.g. `slab-001`) | HSN Code Tax Classifications | Staff (Finance Lead) | Tax Invoice Engine & Reports |
| 14 | `/offline_orders` | `{orderId}` (e.g. `KJ-OFF-2026-001`) | Studio & Pop-up Cash/POS Sales | Staff (Finance Lead) | Master Order Ledger |
| 15 | `/settings/store` | Single document: `store` | Global Business Identity & Freight | Super Admin | Storefront Footer, Checkout Math |
| 16 | `/admin_users` | `{uid}` (Firebase Auth UID) | Staff Identity & RBAC Association | Super Admin | Admin Authentication Provider |
| 17 | `/admin_roles` | `{roleId}` (e.g. `role-super-admin`) | Granular RBAC Permission Matrices | Super Admin | API Middleware (`verifyStaffPermission`) |
| 18 | `/audit_logs` | `{logId}` (e.g. `aud-173185...`) | Immutable Administrative Action Trail | Automatic (System Logger) | Admin Audit Logs View |
| 19 | `/reviews` | `{reviewId}` (Auto-ID) | Patron Reviews & Reflections | Verified Buyers & Staff Moderation | Product Detail Pages (`/products/[slug]`) |
| 20 | `/users` | `{uid}` (Firebase Auth UID) | Patron Profiles & Saved Addresses | Patron Account & Support | Patron Dashboard, Admin CRM View |

---

## 2. DETAILED DOCUMENT SCHEMAS

### 2.1 `/products/{productId}`
```typescript
interface ProductDoc {
  id: string;                          // Product ID (e.g. 'p1')
  name: string;                        // Public piece title
  slug: string;                        // URL slug (e.g. 'signature-pearl-vanity-box')
  code: string;                        // Internal model code
  description: string;                 // Detailed luxury storytelling
  price: number;                       // Retail price in INR (Statutory MRP, inclusive of 3% GST)
  originalPrice?: number;              // Strike-through comparison price
  category: string;                    // Category key (e.g. 'organisers')
  categorySlug: string;                // Category route slug
  images: string[];                    // Multi-image gallery URLs (Cloudinary / CDN)
  coverImage?: string;                 // Primary listing cover image
  stock: number;                       // Published stock quantity
  inStock: boolean;                    // Active purchase toggle
  isBestseller?: boolean;              // Merchandising badge
  isFeatured?: boolean;                // Merchandising badge
  isNewArrival?: boolean;              // Merchandising badge
  materials?: string;                  // e.g. "Czech crystal glass beads, mulberry silk"
  dimensions?: string;                 // e.g. "18cm x 12cm x 10cm"
  craftTime?: string;                  // e.g. "14 patient artisan loom hours"
  // Extended Craft Specs (100% Dynamically Bound)
  artisanTitle?: string;
  artisanNote?: string;
  origin?: string;
  dimensionsNote?: string;
  careNote?: string;
  shippingPolicy?: string;
  transitGuarantee?: string;
  dispatchTimeline?: string;
  bulkEnquiryNote?: string;
  variants?: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    inStock: boolean;
    image?: string;
  }>;
  reviews?: Array<{
    id: string;
    userName: string;
    rating: number;
    title: string;
    body: string;
    date: string;
    verifiedBuyer: boolean;
    status: 'approved' | 'pending' | 'rejected';
  }>;
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### 2.2 `/orders/{orderId}`
```typescript
interface OrderDoc {
  id: string;                          // Order ID (e.g. 'KJ-88219')
  userId?: string;                     // Firebase Auth UID if patron signed in
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    image: string;
    variantName?: string;
  }>;
  subtotal: number;                    // Product subtotal (inclusive of 3% GST)
  discount: number;                    // Promotional coupon deduction
  shipping: number;                    // ₹0 for orders >= ₹599, else ₹79
  tax: number;                         // Statutory inclusive GST (CGST + SGST)
  total: number;                       // Final payable grand total
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'UPI Instant' | 'Net Banking' | 'Credit/Debit Card' | 'WhatsApp Direct';
  fulfillmentStatus: 'unfulfilled' | 'in_loom' | 'quality_checked' | 'shipped' | 'delivered' | 'rto';
  trackingAwb?: string;                // Consignment AWB tracking number
  courier?: string;                    // Courier partner or "Kalajay In-House Logistics"
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: Array<{
    title: string;
    timestamp: string;
    note?: string;
    by?: string;
    staffId?: string;
  }>;
  paymentReconciliation?: {
    confirmedBy: string;
    confirmedByName: string;
    confirmedByRole: string;
    bankReference: string;             // Mandatory UTR reference
    justification: string;             // Operational reason
    source: string;
    timestamp: string;
  };
  couponCode?: string;
  createdAt: string;
  createdAtServer: FirebaseFirestore.Timestamp;
  updatedAt?: FirebaseFirestore.Timestamp;
}
```

### 2.3 `/work_orders/{workOrderId}`
```typescript
interface WorkOrderDoc {
  id: string;                          // e.g. 'WO-2026-101'
  productName: string;
  sku: string;
  assignedArtisan: string;             // Master artisan (e.g. 'Renu Devi')
  loomCluster: string;                 // Loom station (e.g. 'Madhubani Hub · Loom A2')
  quantity: number;
  stage: 'loom_queued' | 'bead_stringing' | 'structure_weaving' | 'lining_fitting' | 'qc_inspection' | 'wax_sealed';
  qcPassed: boolean;
  targetDate: string;
  actualDate?: string;
  notes?: string;
  updatedAtServer?: FirebaseFirestore.Timestamp;
}
```

### 2.4 `/settings/store`
```typescript
interface StoreSettingsDoc {
  storeName: string;                   // 'Kalajay Handcrafted Luxuries'
  legalEntity: string;                 // 'Kalajay Creations LLP'
  gstin: string;                       // Statutory GSTIN (e.g. '27AAECK1294F1Z3')
  supportEmail: string;                // 'concierge@kalajay.in'
  supportPhone: string;                // '+91 97405 40847'
  mumbaiAddress: string;               // Studio address
  biharHubAddress: string;             // Craft House Atelier address
  shippingThreshold: number;           // Free shipping minimum (₹599)
  standardFreight: number;             // Standard transit packaging (₹79)
  dispatchHours: number;               // 48 hours
  returnDays: number;                  // 7 days
  updatedAt: FirebaseFirestore.Timestamp;
}
```

### 2.5 `/tax_slabs/{slabId}`
```typescript
interface TaxSlabDoc {
  id: string;                          // e.g. 'slab-001'
  hsnCode: string;                     // e.g. 'HSN 7018.10.20' (Glass beads & crystal items)
  description: string;
  gstRate: number;                     // 3 (Statutory 3% GST)
  cgstRate: number;                    // 1.5%
  sgstRate: number;                    // 1.5%
  igstRate: number;                    // 3% (Inter-state)
  taxableTurnover: number;             // Cumulative taxable sales in INR
  taxCollected: number;                // Cumulative tax collected in INR
  updatedAtServer: FirebaseFirestore.Timestamp;
}
```

---

## 3. FIRESTORE SECURITY RULES INTEGRATION

All admin-managed collections are protected by server-side verification:
- `/products`, `/categories`, `/cms/**`, `/settings/**`, `/coupons`: Public read access for storefront consumers. Privileged write access gated to authenticated staff with valid role claims or Server Admin SDK.
- `/orders`: Customers can read only their own orders (`resource.data.userId == request.auth.uid`). Creation requires schema validation. Privileged status updates gated to `/api/admin/orders/update` with RBAC checking.
- `/admin_users`, `/admin_roles`, `/audit_logs`: Strictly restricted from public read/write. Accessible exclusively via authenticated Admin SDK route handlers.
- `/reviews`: Public read of approved reviews (`resource.data.status == 'approved'`). Submission creates review with `status: 'pending'`. Status modifications gated to authenticated staff.

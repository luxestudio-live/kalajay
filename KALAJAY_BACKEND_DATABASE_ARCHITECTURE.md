# KALAJAY HANDCRAFTED LUXURIES
# BACKEND & DATABASE ARCHITECTURE SPECIFICATION

**Document ID:** `KJ-ARCH-2026-DB-001`  
**Date:** November 17, 2026  
**Environment:** Firebase Cloud Firestore (Mumbai `asia-south1`) + Next.js App Router  
**Architect:** Principal Cloud & Security Systems Architect

---

## 1. Cloud Firestore Authoritative Collections

The production database is organized into 13 authoritative top-level collections:

```
Cloud Firestore (asia-south1)
├── /products/{productId}            --> Authoritative catalog items, prices, variants, specs
├── /categories/{slug}               --> Category editorial, hero imagery, slugs
├── /inventory/{sku}                 --> Live stock counts, on-hand, available, reserved
├── /stock_adjustments/{adjId}       --> Immutable audit trail of inventory adjustments
├── /orders/{orderId}                --> Transactional orders, line items, customer manifest
├── /users/{uid}                     --> Patron profiles, saved addresses, preferences
├── /admin_users/{staffId}           --> Staff roster, roles, departments, PBKDF2 hashes
├── /roles/{roleId}                  --> Custom & system RBAC permission definitions
├── /reviews/{reviewId}              --> Patron reflections, star ratings, moderation status
├── /custom_enquiries/{enquiryId}    --> Bespoke studio customization requests
├── /corporate_enquiries/{leadId}    --> Institutional, wedding, & corporate bulk leads
├── /support_tickets/{ticketId}      --> Patron concierge tickets & message threads
├── /coupons/{couponCode}            --> Promotional discount rules & limits
├── /subscribers/{subscriberId}      --> Newsletter subscriptions from storefront
├── /audit_logs/{logId}              --> Immutable staff operation audit records
└── /cms/{documentId}
    ├── /cms/banners                 --> Promotional announcement tickers & banners
    └── /cms/featured_products       --> Dynamic curated homepage product IDs & limits
```

---

## 2. Comprehensive Entity Schemas & Validation

### 2.1 Collection: `/products`
- **Document ID:** Sourced from SKU or auto-generated (`KJ-APC-402`, `KJ-BAG-001`, etc.).
- **Schema:**
  ```typescript
  interface ProductDocument {
    id: string;                          // Unique product ID
    code: string;                        // Unique SKU code (e.g. KJ-APC-402)
    name: string;                        // Title of the piece
    slug: string;                        // URL slug (e.g. colorful-beaded-airpods-case-kj-apc-402)
    category: string;                    // Category name (e.g. Airpod Cases)
    categorySlug: string;                // Category URL slug (e.g. airpod-cases)
    price: number;                       // Authoritative selling price in INR (inclusive of GST)
    originalPrice: number;               // Strike-through MRP price in INR
    coverImage: string;                  // Primary display image URL (Cloudinary)
    images: string[];                    // Multi-angle gallery images
    inStock: boolean;                    // Storefront purchase availability flag
    status: 'active' | 'inactive' | 'archived'; // Lifecycle status
    isBestSeller: boolean;               // Merchandising badge: Craft House Signature
    isFeatured: boolean;                 // Homepage spotlight flag
    isNewArrival: boolean;               // New addition badge
    variants: Array<{                    // Finish/colorway options
      code: string;
      label: string;
      price: number;
      inStock: boolean;
      image?: string;
    }>;
    materials: string[];                 // List of components (Miyuki beads, brass wire, silk)
    dimensions: string;                  // Physical measurements
    craftHours: string;                  // Artisan lead time (e.g. 18 to 24 hours)
    care: string;                        // Primary care instructions
    description: string;                 // Editorial narrative text
    taxRate?: number;                    // Inclusive GST percentage (default 0.03)
    
    // Dynamic Product Detail Page Control Fields
    artisanTitle?: string;               // e.g. "Made by Hand: Variation is Part of the Charm"
    artisanNote?: string;                // Nuance & handcrafted variation disclaimer
    origin?: string;                     // e.g. "Hand-crafted loom stringing; studio curation & dispatch."
    dimensionsNote?: string;             // Capacity/usage guidance
    careNote?: string;                   // Longevity preservation guidance
    shippingPolicy?: string;             // Pan-India shipping terms
    transitGuarantee?: string;           // 48-Hour White-Glove transit guarantee
    dispatchTimeline?: string;           // Handcrafted dispatch window
    bulkEnquiryNote?: string;            // Corporate / favour enquiry callout
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
  }
  ```

### 2.2 Collection: `/orders`
- **Document ID:** Canonical format `KJ-XXXXXX` (e.g. `KJ-88219`, `KJ-8924`).
- **Schema:**
  ```typescript
  interface OrderDocument {
    id: string;                          // Canonical Order ID
    userId?: string;                     // Authenticated Firebase UID (verified server-side)
    customerName: string;                // Full recipient name
    customerEmail: string;               // Verified customer email
    customerPhone: string;               // 10-digit mobile phone
    shippingAddress: {
      addressLine: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: Array<{
      productId: string;
      sku: string;
      name: string;
      price: number;                     // Transaction-time price snapshot
      quantity: number;
      image: string;
    }>;
    subtotal: number;                    // Gross line-item subtotal
    discount: number;                    // Verified coupon discount applied
    couponCode?: string;                 // Validated promo code
    deliveryFee: number;                 // Sourced from authoritative threshold (₹0 or ₹79)
    tax: number;                         // Statutory inclusive GST component (extracted)
    total: number;                       // Grand payable total in INR (Subtotal - Discount + Shipping)
    paymentMethod: 'upi' | 'card' | 'whatsapp';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    fulfillmentStatus: 'in_loom' | 'quality_checked' | 'shipped' | 'delivered' | 'cancelled';
    trackingAwb: string;                 // Consignment AWB tracking number
    courier: string;                     // Dispatch fleet / courier name
    timeline: Array<{
      title: string;
      timestamp: string;
      note?: string;
    }>;
    createdAt: string;                   // ISO date string
    createdAtServer?: Timestamp;
  }
  ```

### 2.3 Collection: `/reviews`
- **Document ID:** Auto-generated `rev-{timestamp}-{rand}`.
- **Schema:**
  ```typescript
  interface ReviewDocument {
    id: string;
    patron: string;                      // Display name of reviewer
    email?: string;                      // Confidential patron email (DPDP protected)
    product: string;                     // Name of the piece
    productId?: string;                  // SKU or product ID
    productSlug?: string;                // Product URL slug
    rating: number;                      // 1 to 5 integer
    headline?: string;                   // Reflection title
    comment: string;                     // Written experience
    date: string;                        // YYYY-MM-DD
    status: 'pending' | 'approved' | 'archived'; // Moderation status
    verifiedBuyer?: boolean;             // Verified badge
  }
  ```

---

## 3. Server API Route Inventory & Security Boundaries

| Route | Method | Purpose | Authentication | Authorization Policy |
|---|---|---|---|---|
| `/api/orders/create` | `POST` | Authoritative Order Creation | Optional Bearer Token | Server validates price, inventory, GST & idempotency |
| `/api/orders/track` | `GET` | Order Tracking Coordinates | Public / Optional Token | Enforces DPDP ownership check via email or PIN code |
| `/api/reviews` | `GET` | Retrieve Approved Reviews | Public | Returns approved reviews filtered by `slug` / `productId` |
| `/api/reviews` | `POST` | Submit Patron Reflection | Public Guest / Patron | Input sanitization; sets `status: 'pending'` |
| `/api/reviews` | `PATCH` | Moderate Review Status | Staff Token / Session | Updates status to `approved` or `archived` |
| `/api/admin/orders/update` | `POST` | Update Fulfillment Stage | Admin Bearer Token | Verifies staff active status & `orders.orders` permission |
| `/api/admin/roles` | `GET`, `POST`, `DELETE` | Custom RBAC Management | Admin Bearer Token | Restricted to Super Admin (`role-super-admin`) |
| `/api/admin/users/list` | `GET` | Staff Roster Directory | Admin Bearer Token | Restricted to Super Admin |
| `/api/admin/users/create` | `POST` | Provision New Staff | Admin Bearer Token | Generates secure PBKDF2 hash & provisional credentials |
| `/api/admin/users/update` | `POST` | Update / Deactivate Staff | Admin Bearer Token | Cannot deactivate last remaining Super Admin |
| `/api/admin/users/check-username` | `GET` | Validate Username | Public / Staff | Real-time uniqueness verification |
| `/api/admin/auth/resolve` | `POST` | Resolve Staff Credentials | Staff Session | Validates username/email and PBKDF2 hash |
| `/api/admin/auth/forgot-password`| `POST` | Reset Staff Password | Public / Staff | Dispatches secure recovery token |

---

## 4. Transactional Order Creation & Inventory Integrity

When `/api/orders/create` executes:

1. **Idempotency Guard:** Computes `SHA-256(customerEmail + sortedItems + total)` to prevent duplicate charges or duplicate documents under network jitter.
2. **Authoritative Price Calculation:** Queries Firestore `/products/{id}`. Client-supplied prices in the payload are ignored and discarded.
3. **Inclusive GST Extraction:** In compliance with Section 36 of the CGST Act 2017 and Legal Metrology rules, all prices are tax-inclusive:
   $$\text{Inclusive Tax} = \text{Amount} \times \left(1 - \frac{1}{1 + \text{Tax Rate}}\right)$$
4. **Atomic Inventory Reservation:** Where configured, runs a Firestore transaction on `/inventory/{sku}` ensuring `available = available - qty` and `reserved = reserved + qty`. If available stock is insufficient, the transaction rolls back and returns HTTP 400.
5. **Durable Persistence:** Writes order document via Firebase Admin SDK, bypassing client rules safely while enforcing strict server authorization.

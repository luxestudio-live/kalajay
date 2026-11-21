# KALAJAY HANDCRAFTED LUXURIES
## COMPLETE APPLICATION LIFECYCLE & BUSINESS FLOW AUDIT

**Target:** Enterprise Architecture, Data Flows, and Collection Dependencies  
**Environment:** Next.js Flagship Engine & Cloud Firestore (`kalajay-667ff`, `asia-south1`)  
**Standard:** 100% Backend Integrated, Authoritative Persistence & Synchronization  

---

## 1. End-to-End Architecture Data Flow

```
+-----------------------------------------------------------------------------------------+
|                                    KALAJAY ECOSYSTEM                                    |
+-----------------------------------------------------------------------------------------+
       |                                                                   |
       v                                                                   v
[ STOREFRONT / PATRONS ]                                        [ ATELIER ADMIN PANEL ]
• Browsing (/shop, /collections)                                • Dashboard & Analytics (Mod 1, 15)
• Product Details (/products/[slug])                            • Master Catalogue & Review Queue (Mod 2)
• Bespoke Studio (/customise)                                   • Orders & Fulfillment (Mod 4)
• Bag & Checkout (/cart, /checkout)                             • Multi-Location Inventory & ERP (Mod 5)
• Patron Account & Orders (/account)                            • Loom Production & QC (Mod 7)
• Order Tracking (/track)                                       • Bespoke & Gifting Pipelines (Mod 8, 9)
       |                                                                   |
       +---------------------------------+---------------------------------+
                                         |
                                         v
                      [ BACKEND INTEGRATION & RBAC LAYER ]
                      • API Routes (/api/orders, /api/admin/*)
                      • Atomic Transactions (runTransaction)
                      • Cryptographic Role Verification (serverRbac.ts)
                      • Idempotency Cache (.next/cache/idempotency)
                                         |
                                         v
                      [ CLOUD FIRESTORE AUTHORITATIVE DB ]
                      • /products               • /work_orders
                      • /categories             • /inventory
                      • /orders                 • /stock_adjustments
                      • /users                  • /tax_slabs
                      • /custom_enquiries       • /coupons
                      • /corporate_enquiries    • /cms (banners, faqs, stages)
                      • /support_tickets        • /audit_logs
```

---

## 2. Comprehensive Major Business Flow Chronicles

### Flow 1: Product Lifecycle
1. **Creation**: Admin creates product via `CatalogueView` modal covering identity, variants, pricing, media, and 12 craft specifications.
2. **Persistence**: Saved to Firestore `/products/{code}` via `saveFirestoreProduct()` and inventory initialized in `/inventory/{code}`.
3. **Storefront Sync**: `ShopClient` and `collections/[slug]` dynamically hydrate from Firestore; PDP renders full craft specs, image zoom gallery, and swatches.
4. **Ordering & Archival**: When archived, `inStock: false` blocks new checkouts, while historical order snapshots in `/orders` remain immutable.

### Flow 2: Category Lifecycle
1. **Authoring**: Admin creates category in `CatalogueView` (Collections tab) with name, slug, description, and cover image.
2. **Persistence**: Stored in `/categories/{slug}` via `saveFirestoreCategory()`.
3. **Cross-System Sync**: Immediately populates category selector dropdowns in product creator, collection archive routes (`/collections/[slug]`), and `/shop` category filter tabs.

### Flow 3: Inventory & Raw Materials ERP Lifecycle
1. **Types**: Categorized into `finished_good` and `raw_material` across Mumbai Packing Atelier and Bihar Craft House.
2. **Bill of Materials (BOM)**: Each finished piece resolves required quantities of glass beads, metallic thread, lining fabric, and hardware.
3. **Allocation**: When a Work Order is issued, raw materials are reserved (`reserved += needed`, `available = onHand - reserved`).
4. **Consumption & Finished Goods Receipt**: Upon passing QC (`wax_sealed`), reserved materials are deducted from `onHand`, and finished goods stock is incremented.

### Flow 4: Order & Fulfillment Lifecycle
1. **Online Checkout**: Customer submits cart $\to$ `/api/orders` verifies stock atomically $\to$ executes Firestore `runTransaction` $\to$ decrements inventory and persists `/orders/{id}`.
2. **Manual Order**: Staff enters order in Admin $\to$ validates line items $\to$ decrements inventory $\to$ persists `/orders/{id}` $\to$ logs audit event.
3. **Fulfillment Progression**: Status advances from `unfulfilled` $\to$ `in_loom` $\to$ `wax_sealed` $\to$ `shipped` (AWB assigned) $\to$ `delivered`.
4. **Cancellation & RTO**: When cancelled before fulfillment, reservations/stock are atomically restored to available inventory, timeline note appended, and audit event logged.

### Flow 5: Customer Account & Isolation Lifecycle
1. **Signup**: Creates Firebase Auth UID $\to$ initializes Firestore `/users/{uid}` with empty addresses and orders (`addresses: []`, `orders: []`).
2. **Zero-Demo Guarantee**: Real customer accounts never receive mock data (`Sonali Sharma` / `Signature Palms`).
3. **Account Switching**: Logout completely purges local storage, session storage, and context, ensuring Customer B never sees Customer A's private records.

### Flow 6: CMS & Storefront Synchronization
1. **Banners & Announcements**: Edited in `CmsView` $\to$ saved to `/cms/banners` $\to$ updates storefront header tickers and hero carousels.
2. **FAQs & Policies**: Saved to `/cms/faqs` and `/cms/policies` $\to$ hydrates `/faq`, `/shipping-returns`, and floating Concierge Bot.
3. **Master Artisan Profiles**: Saved to `/cms/artisans` $\to$ rendered in PDP artisan notes and `/atelier`.

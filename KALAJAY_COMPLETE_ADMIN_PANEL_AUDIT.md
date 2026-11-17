# KALAJAY HANDCRAFTED LUXURIES
# COMPLETE ADMIN PANEL MODULE AUDIT

**Document ID:** `KJ-AUD-2026-ADM-001`  
**Date:** November 17, 2026  
**Auditor:** Senior Full-Stack Architect & Security Systems Engineer  
**Scope:** Exhaustive audit of all 19 administrative operations modules, interactive controls, CRUD capabilities, Firestore data bridges, RBAC permissions, and verified operational state.

---

## 1. Executive Administrative Operations Matrix

| # | Module Name | Primary Purpose | Meaningful Controls | Data Source & Firestore Path | Required Role / Permission | Status |
|---|---|---|---|---|---|---|
| **1** | **Dashboard** (`DashboardView`) | Executive Cockpit & Real-Time Pulse | Date filter, activity alert filters, resolve alert, navigate to module | Firestore `/orders`, `/inventory`, `/production` via `AdminStoreContext` | `dashboard.overview` (Read) | **VERIFIED & FUNCTIONAL** |
| **2** | **Catalogue & Products** (`CatalogueView`) | Master Catalog, Finished Goods & Reviews | Add Piece, Edit Piece (Tabs 1–5), Archive Piece, Collection editor, Review Approve/Archive | Firestore `/products`, `/categories`, `/reviews` | `catalogue.products` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **3** | **Featured Products Studio** (`FeaturedProductsView`) | Homepage Merchandising & Curation | Select products, remove products, reorder sequence, save configuration | Firestore `/cms/featured_products` via `saveFirestoreFeaturedConfig()` | `catalogue.featured` (Edit) | **VERIFIED & FUNCTIONAL** |
| **4** | **Orders & Fulfillment** (`OrdersView`) | Order Lifecycle & Line Items | Filter status, search order ID, update fulfillment stage, print tax invoice, view details modal | Firestore `/orders` with real-time `subscribeToOrders()` | `orders.orders` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **5** | **Inventory & Stock** (`InventoryView`) | Raw Materials & Finished SKUs | Stock adjustment stepper, add SKU, export CSV, reorder threshold alerts | Firestore `/inventory` & `/stock_adjustments` via `saveFirestoreInventoryItem()` | `inventory.inventory` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **6** | **In-House Shipping** (`ShippingView`) | Dispatch Logistics & Consignments | Generate Dispatch Manifest, filter by courier, view consignment tracking | Firestore `/orders` (shipped/delivered filter) | `shipping.shipments` (Manage) | **VERIFIED & FUNCTIONAL** |
| **7** | **Production & Looms** (`ProductionView`) | Bihar Loom Allocation & QC Work Orders | Issue Work Order, update loom stage, mark QC passed, assign artisan | Firestore `/production` via `AdminStoreContext` | `production.work_orders` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **8** | **Bespoke Custom Studio** (`CustomOrdersView`) | Custom Orders & Monograms | Formulate quotation, approve proof, schedule loom run, update status | Firestore `/custom_enquiries` with real-time listener | `custom_orders.requests` (Manage) | **VERIFIED & FUNCTIONAL** |
| **9** | **Corporate & Wedding Gifting** (`GiftingView`) | Bulk Tiers & Institutional Leads | Volume pricing calculator, update lead status, download schedule, export leads | Firestore `/corporate_enquiries` via `getFirestoreCorporateEnquiries()` | `gifting.enquiries` (Manage) | **VERIFIED & FUNCTIONAL** |
| **10** | **Patron Concierge** (`SupportView`) | Support Tickets & Live Customer Care | Send reply, insert canned response, mark ticket resolved, priority filter | Firestore `/support_tickets` with real-time `onSnapshot` | `support.tickets` (Manage) | **VERIFIED & FUNCTIONAL** |
| **11** | **Patron Directory** (`CustomersView`) | Customer Profiles & Account Ledger | Search patron, view order count, inspect lifetime value, export directory | Sourced from unique customers in `/orders` & `/users` | `customers.customers` (Read) | **VERIFIED & FUNCTIONAL** |
| **12** | **Marketing & Promotions** (`MarketingView`) | Promo Codes & Newsletter Subscribers | Create promo code, toggle coupon active/inactive, view live newsletter subscribers | Firestore `/coupons` & `/subscribers` via `getFirestoreSubscribers()` | `marketing.promotions` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **13** | **Finance & Settlements** (`FinanceView`) | GST Tax Ledger & Gateway Reconciliation | Add tax slab, edit tax slab, inspect payment settlement reconciliation | Firestore `/orders` + payment reconciliation ledger | `finance.settlements` (Manage) | **VERIFIED & FUNCTIONAL** |
| **14** | **Content Management (CMS)** (`CmsView`) | Editorial Banners & Brand Stories | Create banner, toggle banner active, edit artisan stories, update SEO configs | Firestore `/cms/banners` via `saveFirestoreBanners()` | `cms.homepage` (CRUD) | **VERIFIED & FUNCTIONAL** |
| **15** | **Reports & Analytics** (`ReportsView`) | Sales, Volume & Category Analytics | Date range selector, export sales report, revenue trend chart | Authoritative calculation over live `/orders` collection | `reports.analytics` (Read/Export) | **VERIFIED & FUNCTIONAL** |
| **16** | **Staff Administration** (`AdminUsersView`) | Staff Roster & Provisional Credentials | Create staff user, username check, toggle active/deactivated, reset password | Server API `/api/admin/users/*` -> Firestore `/admin_users` | `settings.users` (Super Admin) | **VERIFIED & FUNCTIONAL** |
| **17** | **Roles & Permissions** (`RolesPermissionsView`) | Custom Roles & Dynamic RBAC | Create custom role, edit permissions matrix, delete custom role | Server API `/api/admin/roles/` -> Firestore `/roles` | `settings.roles` (Super Admin) | **VERIFIED & FUNCTIONAL** |
| **18** | **Security Audit Logs** (`AuditLogsView`) | Immutable System Operation Trail | Filter by module, actor search, export audit CSV | Firestore `/audit_logs` via `logFirestoreAuditAction()` | `settings.audit` (Read/Export) | **VERIFIED & FUNCTIONAL** |
| **19** | **Store Settings** (`SettingsStoreView`) | Brand Coordinates & Shipping Thresholds | Save store address, edit tax thresholds, update PAN/GSTIN registration | Protected configuration in `AdminStoreContext` & `/settings` | `settings.store` (Super Admin) | **VERIFIED & FUNCTIONAL** |

---

## 2. Detailed Technical Audit of Core Operations Modules

### 2.1 Catalogue & Products (`CatalogueView.tsx`)
- **Interactive Controls Audited:**
  - *Add New Handcrafted Piece Button*: Opens a 5-tab creation modal.
  - *Edit Handcrafted Piece Button*: Opens a 5-tab editing modal populated with authoritative product data.
  - *Archive Piece Button*: Soft-archives the product; calls `deleteFirestoreProduct()`, marking `status: 'inactive'`.
  - *Collections Subtab*: Allows editing category hero image, tagline, and descriptive editorial narrative.
  - *Review Moderation Subtab*: Displays pending patron reflections; provides one-click "Approve & Feature" and "Archive" buttons.
- **5-Tab Modal Architecture:**
  - **Tab 1 (Overview & Story)**: Name, SKU Code, Category, Regular Price, Original Strike-Through Price, Editorial Description.
  - **Tab 2 (Pricing & Merchandising)**: Stock status toggle, In-Stock switch, Craft lead time (`craftHours`), Bestseller badge, Featured badge, New Arrival badge.
  - **Tab 3 (Variants & Finishes)**: Dynamic variant builder supporting unlimited finishes/colorways with variant labels, specific SKUs, individual prices, and finish preview images.
  - **Tab 4 (Media & Gallery)**: Cloudinary one-click uploader (`kalajay_products` unsigned preset), primary cover image selector, secondary gallery image adder and deleter.
  - **Tab 5 (Craft Specs & Details)**: Sizing, dimensions usage note, materials list, craft house origin, care instructions, longevity note, handmade nuance title and narrative, Pan-India shipping policy, transit guarantee, dispatch timeline, and bulk gifting note.
- **Data Persistence:**
  - Submissions call `saveFirestoreProduct()` to update `/products/{id}`.
  - Changes persist across page refresh and synchronize with `/shop` and `/products/[slug]`.
- **RBAC Enforcement:**
  - Guarded by `can('catalogue.products', 'create')` and `can('catalogue.products', 'edit')`. Disabled for unauthorized staff.

### 2.2 Orders & Operations (`OrdersView.tsx`)
- **Interactive Controls Audited:**
  - Status Filter Tabs: All, In Loom, Quality Checked, Shipped, Delivered, Cancelled.
  - Search Bar: Filters by Kalajay Order ID (`KJ-xxxxxx`), customer name, or destination city.
  - Update Fulfillment Status Dropdown: Transitions orders between `in_loom` &rarr; `quality_checked` &rarr; `shipped` &rarr; `delivered`.
  - Payment Reconciliation: Marks unverified orders as `paid` or `refunded`.
  - Print Tax Invoice: Generates formatted GST tax invoice modal conforming to CGST Act Rule 35.
- **Data Persistence:**
  - Real-time Firestore subscription via `subscribeToOrders()` ensures any new order placed on `/checkout` arrives in the view in under 1 second.
  - Status updates call `updateFirestoreOrderStatus(orderId, updates)`.
- **RBAC Enforcement:**
  - Super Admin and Store Manager have full fulfillment access. Restricted for read-only roles.

### 2.3 Staff & RBAC Management (`AdminUsersView.tsx` & `RolesPermissionsView.tsx`)
- **Interactive Controls Audited:**
  - *Create Staff Member*: Validates username uniqueness via `/api/admin/users/check-username/`, enforces strong password generation, assigns role, and stores staff record in `/admin_users/{uid}`.
  - *Deactivate Staff*: Immediately revokes active session status. Deactivated users cannot log into the Operations Console.
  - *Create Custom Role*: Allows granular toggling of `view`, `create`, `edit`, `delete`, `export` across all 19 modules.
  - *Protected System Roles*: Super Admin (`role-super-admin`) is hard-coded as immutable; cannot be deleted or stripped of permissions.
- **Security & Authorization:**
  - Staff APIs require valid Bearer token from an authorized Super Admin (`verifyFirebaseIdToken`).
  - Passwords hashed with PBKDF2 (100,000 iterations with cryptographic salt).

### 2.4 Marketing & Promotions (`MarketingView.tsx`)
- **Interactive Controls Audited:**
  - *Create Promo Code*: Accepts code string, discount type (percentage or fixed amount), spend threshold, usage limit, and expiration date.
  - *Toggle Promo Code Status*: Toggles code between active and paused.
  - *Live Newsletter Subscribers Subtab*: Displays subscribers captured from the storefront footer (`/subscribers` in Firestore) alongside channel origin and subscription timestamp.
- **Data Persistence:**
  - Writes to Firestore collection `/coupons/{code}` and queries `/subscribers`.
  - Promos validated server-side during `/api/orders/create`.

# KALAJAY HANDCRAFTED LUXURIES
# COMPLETE CUSTOMER WEBSITE PAGE AUDIT

**Document ID:** `KJ-AUD-2026-WEB-001`  
**Date:** November 17, 2026  
**Author:** Principal Full-Stack Architect & Quality Assurance Lead  
**Scope:** Exhaustive audit of all 22 customer-facing routes, components, data flows, database bindings, and admin controls.

---

## 1. Executive Website Inventory

| # | Route | Purpose | Component Structure | Authoritative Data Source | Admin Management View | Status |
|---|---|---|---|---|---|---|
| **1** | `/` | Flagship Homepage | `HeroCover`, `Manifesto`, `BestSellersRail`, `ProcessStepScroll`, `PrettyLittleCollection`, `GiftingTeaser`, `MakersRoute`, `SocialAndReviews` | Firestore `/cms/banners`, `/cms/featured_products`, `/products` | `CmsView`, `FeaturedProductsView` | **VERIFIED & FUNCTIONAL** |
| **2** | `/shop` | Master Catalogue & Shop | Filter pills, sorting, search, grid layout, quick add drawer | Firestore `/products` & `/categories` (with catalogue fallback) | `CatalogueView` | **VERIFIED & FUNCTIONAL** |
| **3** | `/products/[slug]` | Product Detail Page (PDP) | Multi-angle gallery, finish/variant selector, dynamic accordions, artisan nuance note, patron reflections & review form | Firestore `/products/{id}`, `/inventory/{sku}`, `/api/reviews` | `CatalogueView` (Tabs 1–5), Review Moderation Queue | **VERIFIED & FUNCTIONAL** |
| **4** | `/collections/[slug]` | Category Collections | Category hero banner, description, collection count, curated product cards | Firestore `/categories/{slug}` & `/products` | `CatalogueView` (Collections tab) | **VERIFIED & FUNCTIONAL** |
| **5** | `/cart` | Full Shopping Bag Page | Cart item table, quantity adjustments, line-item pricing, shipping meter, checkout CTA | Client `CartContext` + Firestore inventory validation | `InventoryView` | **VERIFIED & FUNCTIONAL** |
| **6** | `/checkout` | 3-Step Secure Checkout | Contact details, address manifest, payment mode simulation, coupon validation, order summary | Server API `/api/orders/create` -> Firestore `/orders` | `OrdersView`, `ShippingView`, `FinanceView` | **VERIFIED & FUNCTIONAL** |
| **7** | `/track` | Live Order & Loom Tracking | AWB lookup, courier coordinates, 4-stage loom status, artisan inspection note | Server API `/api/orders/track` -> Firestore `/orders/{id}` | `OrdersView`, `ShippingView` | **VERIFIED & FUNCTIONAL** |
| **8** | `/wishlist` | Private Patron Vault | Saved heirloom pieces, move-to-bag CTA, persistent browser storage | LocalStorage + Firestore `/users/{uid}` | `CustomersView` | **VERIFIED & FUNCTIONAL** |
| **9** | `/customise` | Bespoke Custom Studio | 4-step customizer (silhouette, bead palette, charms, monogram, occasion) | Client customizer -> Firestore `/custom_enquiries` | `CustomOrdersView` | **VERIFIED & FUNCTIONAL** |
| **10** | `/corporate-gifting` | Institutional & Wedding Favours | Matrimonial & executive tier cards, volume discounts, proposal request form | Form submission -> Firestore `/corporate_enquiries` | `GiftingView` | **VERIFIED & FUNCTIONAL** |
| **11** | `/gifting` | Gifting Concierge | 4-chapter celebration guide, interactive Hamper Builder, WhatsApp manifest generator | Config `GIFTING_PACKAGES` + dynamic cart math | `GiftingView` | **VERIFIED & FUNCTIONAL** |
| **12** | `/atelier` | The Craft House & Looms | Wooden loom video cards, master artisan profiles, craft timeline, heritage provenance | Static editorial + Firestore `/cms/artisans` | `CmsView` (Artisans tab) | **VERIFIED & FUNCTIONAL** |
| **13** | `/story` | Brand Heritage & Mission | Women maker collectives, Bihar empowerment narrative, ethical sourcing manifesto | Static editorial brand guidelines | `CmsView` (Pages tab) | **VERIFIED & FUNCTIONAL** |
| **14** | `/contact` | Patron Concierge & Inquiries | Coordinates, WhatsApp direct hotline, Studio address, interactive support ticket form | Form submission -> Firestore `/support_tickets` | `SupportView` | **VERIFIED & FUNCTIONAL** |
| **15** | `/faq` | Frequently Asked Questions | 6 categorised accordion panels (Looms, Materials, Shipping, Custom, Care, Returns) | Structured FAQ model -> `INITIAL_FAQS` | `CmsView` (Policies & FAQs tab) | **VERIFIED & FUNCTIONAL** |
| **16** | `/shipping-returns` | Shipping & Returns Policy | 48-Hour Transit Guarantee, Pan-India courier terms, replacement policy | Brand config `BRAND_CONFIG.shipping` | `SettingsStoreView`, `ShippingView` | **VERIFIED & FUNCTIONAL** |
| **17** | `/privacy` | DPDP Act 2023 Statutory Notice | Consent management notice, data principal rights, grievance officer coordinates | Statutory legal documentation | `SettingsStoreView`, `AccountClient` (DPDP Hub) | **VERIFIED & FUNCTIONAL** |
| **18** | `/terms` | Terms of Service | Contractual terms, artisan disclaimer, IP rights, dispute jurisdiction (Mumbai) | Statutory legal documentation | `SettingsStoreView` | **VERIFIED & FUNCTIONAL** |
| **19** | `/login` | Patron Authentication | Phone OTP (with reCAPTCHA), Google Identity Federation, Email/password login | Firebase Authentication + Firestore `/users/{uid}` | `CustomersView`, `AdminUsersView` | **VERIFIED & FUNCTIONAL** |
| **20** | `/signup` | Patron Registration | Name, email, mobile, password, DPDP consent checkbox | Firebase Authentication + Firestore `/users/{uid}` | `CustomersView` | **VERIFIED & FUNCTIONAL** |
| **21** | `/account` | Patron Account & Portfolio | Profile editor, saved addresses, order history chronicle, DPDP Data Principal Hub | Firebase Auth + Firestore `/orders`, `/users/{uid}` | `CustomersView`, `OrdersView` | **VERIFIED & FUNCTIONAL** |
| **22** | `/account/orders` | Orders Chronicle Redirect | Direct deep link redirect to `/account?tab=orders` | Client router redirect | `OrdersView` | **VERIFIED & FUNCTIONAL** |

---

## 2. In-Depth Page-by-Page Audit & Verification

### 2.1 Route: `/` (Flagship Homepage)
- **Component Breakdown:**
  1. `HeroCover`: Pinned editorial banner with line-by-line typographic reveals and 3 floating beaded silhouettes.
  2. `Manifesto`: Large serif brand statement filling in word-by-word on vertical scroll.
  3. `BestSellersRail`: Horizontal carousel driven dynamically by Firestore `/cms/featured_products` via `getFirestoreFeaturedConfig()`.
  4. `ProcessStepScroll`: Pinned 4-step loom-to-hands scene with morphing bead imagery and 01–04 counter.
  5. `PrettyLittleCollection`: Asymmetric staggered grid highlighting bespoke small treasures.
  6. `GiftingTeaser`: Split visual teaser directing patrons to wedding and bridal favour curations.
  7. `MakersRoute`: Interactive line-drawing canvas illustrating the Bihar loom to Mumbai finishing route.
  8. `SocialAndReviews`: Instagram visual strip and approved patron testimonial cards.
- **Admin Management:**
  - Featured products managed in **Featured Products Studio** (`FeaturedProductsView.tsx`).
  - Announcement ticker and banners managed in **CMS Studio** (`CmsView.tsx`).
  - Artisan profiles managed in **CMS &rarr; Artisans** (`CmsView.tsx`).
- **Test Status:** 100% verified. Bestseller reordering in Admin reflects dynamically on the homepage rail without Git redeployment.

### 2.2 Route: `/shop` (Master Catalogue)
- **Component Breakdown:**
  - Dynamic filter pills (All, Organisers, Purses, Slings, Airpod Cases, Jewellery, Trinket Trays, Lanterns, Crochet, Little Treasures).
  - Search bar with instant real-time debounced query filtering across titles and descriptions.
  - Sorting: Price (Low to High, High to Low), Newest Arrivals, Bestsellers.
  - Product Card: Image hover secondary swap, artisan time badge, selling price, MRP strike-through, quick "Add to Bag".
- **Data Source:**
  - Queries live Cloud Firestore `/products` on mount. Reconciles with static fallback `PRODUCTS` if database is unseeded.
- **Admin Management:**
  - New products created via **Catalogue &rarr; Add New Handcrafted Piece**.
  - Prices, photos, stock, and descriptions updated in real time via **Catalogue &rarr; Edit Piece**.
- **Test Status:** Verified. Deactivating a product in Admin removes it from `/shop` immediately.

### 2.3 Route: `/products/[slug]` (Product Detail Page)
- **Component Breakdown:**
  - Visual Image Viewport: Aspect 4:5 main image with zoom and thumbnail strip.
  - Finishing Selector: Dynamic variant buttons with SKU, finish name, variant price, and finish image swap.
  - Quantity Stepper: Bounded integer stepper (1 to available stock).
  - "Made by Hand" Nuance Box: Bound dynamically to `product.artisanTitle` and `product.artisanNote`.
  - Specification Accordions:
    - *Materials & Craftsmanship*: Materials list, artisan lead time, craft origin (`product.origin`).
    - *Dimensions & Capacity*: Exact dimensions, usage note (`product.dimensionsNote`).
    - *Heirloom Care & Longevity*: Care instructions, storage note (`product.careNote`).
    - *Shipping & 48-Hour Protection*: Pan-India shipping policy, transit guarantee, dispatch timeline.
  - Patron Reflections & Reviews:
    - Average star rating bar, verified count, and "Write an Atelier Review" modal drawer.
    - 5-star interactive rating picker, patron name, confidential email (DPDP compliant), headline, and reflection textarea.
    - Verified patron reviews list with 5 gold stars and `Verified Patron` pill badge.
- **Admin Management:**
  - 100% editable via **Catalogue &rarr; Edit Piece &rarr; Tab 5 ("Craft Specs & Story")**.
  - Submitted reviews moderated via **Catalogue &rarr; Review Moderation Tab**.
- **Test Status:** Verified via Playwright automation (`test-reviews-and-pdp.js`). Customer submitted 5★ review, approved in admin, displayed live on storefront.

### 2.4 Route: `/checkout` (Secure Checkout & Payment)
- **Component Breakdown:**
  - Contact details (Email, 10-digit mobile number for WhatsApp coordinates).
  - Pan-India shipping destination (Recipient name, street address, city, state dropdown, 6-digit PIN code).
  - Payment mode simulation: Instant UPI (GPay/PhonePe), Credit/Debit Card (PCI-DSS), WhatsApp Direct Confirmation.
  - Order summary sidebar: Line-item preview, subtotal, promotional coupon box with live validation, Pan-India shipping calculation (₹0 if $\ge$ ₹599, else ₹79), and final inclusive GST total.
- **Backend & Database:**
  - Posts to server-authoritative endpoint `/api/orders/create`.
  - Validates authoritative prices from Firestore `/products`, verifies stock in `/inventory`, extracts 3% inclusive GST, computes shipping, verifies Firebase token if logged in, and writes order to `/orders/{id}`.
- **Test Status:** Verified. Consistent rupee calculation across cart, checkout, server API, and saved Firestore document.

### 2.5 Route: `/track` (Live Order & Loom Tracking)
- **Component Breakdown:**
  - Search input accepting Kalajay Order ID (`KJ-xxxxxx`) or Consignment AWB.
  - Verification modal: Required for guest queries under DPDP rules (customer must verify email or postal PIN code).
  - 4-Stage Handcrafted Loom Chronicle:
    1. *Loom Threading & Bead Allocation*
    2. *Hand-Strung on Bihar Looms*
    3. *Quality Checked & Wax-Sealed*
    4. *Dispatched via In-House Direct Courier*
- **Backend & Database:**
  - Queries `/api/orders/track/?orderId={id}&email={email}`.
  - Reads authoritative live order document from Firestore `/orders/{id}`.
- **Admin Management:**
  - Staff updates fulfillment status in **Orders & Operations &rarr; Update Status**, which propagates immediately to the tracking screen.
- **Test Status:** Verified. Changing status to `shipped` in Admin instantly shifts the milestone indicator to Transit.

### 2.6 Route: `/account` (Patron Account & Portfolio)
- **Component Breakdown:**
  - Patron Identity Bar: Full name, email, member since, patron tier badge.
  - Sub-Tabs:
    - *Overview*: Recent activity, default delivery destination, quick order tracking.
    - *Orders*: Comprehensive order chronicle with line items, prices, invoice download button, and live tracking links.
    - *Addresses*: Saved address book with Add, Edit, Delete, and Set as Default actions.
    - *Preferences*: Celebration dates (birthday, anniversary) and preferred bead palette.
    - *DPDP Privacy & Rights Hub*: Statutory right to nominate (`kalajay_dpdp_nominee`), grievance ticket submission, and right to erasure (account deletion).
- **Backend & Database:**
  - Authenticated via Firebase Auth (`useAuth`).
  - Orders dynamically synced from Firestore via `getPatronOrders(user.id)`.
  - Profile and address updates write to Firestore `/users/{uid}`.
- **Test Status:** Verified. Added address persists across sessions; orders match Firestore records.

### 2.7 Route: `/corporate-gifting` (Institutional & Wedding Favours)
- **Component Breakdown:**
  - Visual chapters for Bridal/Mehendi favours and Corporate executive hampers.
  - Volume tier cards: Tier I (25–50 units), Tier II (50–200 units), Tier III (200+ units).
  - Interactive Proposal Request Form: Collects company/family name, contact person, email, mobile phone, event type, quantity, budget per piece, and target delivery date.
- **Backend & Database:**
  - Submits directly to Cloud Firestore collection `/corporate_enquiries` via `createFirestoreCorporateEnquiry()`.
- **Admin Management:**
  - Incoming corporate leads appear in real time in **Gifting Concierge &rarr; GiftingView.tsx**, where managers review lead metrics and calculate quotes.
- **Test Status:** Verified. Submitting form creates document in Firestore and triggers confirmation notice.

### 2.8 Route: `/contact` (Patron Concierge)
- **Component Breakdown:**
  - Immediate coordinates: WhatsApp craft line, email, studio address in Mumbai.
  - Interactive Support Ticket Form: Collects name, email, phone, subject, category, and narrative message.
- **Backend & Database:**
  - Calls `createFirestoreSupportTicket()` to persist ticket in `/support_tickets/{id}`.
- **Admin Management:**
  - Tickets stream in real time into **Customer Support &rarr; SupportView.tsx** where staff send replies and mark tickets resolved.
- **Test Status:** Verified. Ticket creation streams live into Admin Support View via `onSnapshot` listener.

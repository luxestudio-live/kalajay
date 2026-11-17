# KALAJAY HANDCRAFTED LUXURIES
## ADMIN-TO-WEBSITE SYNCHRONIZATION MATRIX

**Project:** Kalajay Handcrafted Luxuries  
**Direction:** Admin Panel Modification $\longrightarrow$ Storefront Customer Experience  
**Date:** 2026-11-17  
**Authority:** Cloud Firestore (`kalajay-667ff`)  

---

## 1. COMPREHENSIVE SYNCHRONIZATION MATRIX

| # | Admin Action & Module | Target Firestore Record | Affected Storefront Route & Component | Propagation Speed | Safe Fallback Behavior | Verification Status |
|---|-----------------------|-------------------------|---------------------------------------|-------------------|------------------------|---------------------|
| 1 | **Update Product Price / Title / Details** (`CatalogueView`) | `/products/{productId}` | `/shop`, `/products/[slug]`, `/cart`, `/checkout` | Navigation / Refresh Fetch | Static `catalogue.ts` fallback (prices never overridden) | **VERIFIED & OPERATIONAL** |
| 2 | **Update Product Craft Specs** (`CatalogueView` Tab 5) | `/products/{productId}` (craft specs fields) | `/products/[slug]` (All 12 craft specs sections) | Navigation / Refresh Fetch | Static defaults from `catalogue.ts` | **VERIFIED & OPERATIONAL** |
| 3 | **Archive Product** (`CatalogueView`) | `/products/{productId}` (`status: 'archived'`, `inStock: false`) | `/shop` (hidden), `/products/[slug]` (unavailable), `/checkout` (rejected HTTP 400) | Immediate at Checkout; Fetch on Shop | Purchase blocked; displays "Piece Unavailable" | **VERIFIED & OPERATIONAL** |
| 4 | **Create New Category / Collection** (`CatalogueView`) | `/categories/{categorySlug}` | `/collections/[slug]`, Navigation dropdown | Navigation / Refresh Fetch | Build-time categories fallback | **VERIFIED & OPERATIONAL** |
| 5 | **Approve Customer Review** (`CatalogueView` Reviews Tab) | `/reviews/{reviewId}` (`status: 'approved'`) | `/products/[slug]` (Patron Reflections & Reviews section) | Navigation / Re-fetch | Only approved reviews displayed; pending hidden | **VERIFIED & OPERATIONAL** |
| 6 | **Curate Featured Products** (`FeaturedProductsView`) | `/cms/featured_products` (`productIds`, `status: 'published'`) | `/` (Homepage "Curated Heirlooms" showcase) | Navigation / Refresh Fetch | Static featured array | **VERIFIED & OPERATIONAL** |
| 7 | **Publish Ticker / Banners** (`CmsView` Banners Tab) | `/cms/banners` | Top Announcement Bar & Homepage Hero Tickers | Navigation / Refresh Fetch | Static announcement fallback | **VERIFIED & OPERATIONAL** |
| 8 | **Edit FAQs** (`CmsView` FAQs Tab) | `/cms/faqs` | `/faq` (Customer Knowledge Base Accordion) | Navigation / Refresh Fetch | Static initial FAQs | **VERIFIED & OPERATIONAL** |
| 9 | **Edit Delivery & Return Policies** (`CmsView` Policies Tab) | `/cms/policies` | `/shipping-returns`, PDP Shipping accordion, Checkout rules | Navigation / Refresh Fetch | Statutory 48h dispatch / 7-day exchange | **VERIFIED & OPERATIONAL** |
| 10 | **Edit Page SEO Metadata** (`CmsView` SEO Tab) | `/cms/seo` | Document `<head>` meta tags across storefront | Server render / Static revalidate | Next.js layout default metadata | **VERIFIED & OPERATIONAL** |
| 11 | **Update Master Artisan Stories** (`CmsView` Artisans Tab) | `/cms/artisans` | `/story`, `/atelier` (Karigar storytelling profiles) | Navigation / Refresh Fetch | Initial Bihar artisan biographies | **VERIFIED & OPERATIONAL** |
| 12 | **Create / Toggle Promo Coupon** (`MarketingView`) | `/coupons/{code}` | `/checkout` (Promotional discount validation) | Real-time at Checkout | Server rejects invalid or inactive codes with HTTP 400 | **VERIFIED & OPERATIONAL** |
| 13 | **Capture Newsletter Subscriber** (`Footer.tsx`) | `/subscribers/{hash}` | `MarketingView` (Subscribers Directory Tab) | Real-time write | Local duplicate rejection | **VERIFIED & OPERATIONAL** |
| 14 | **Submit Bespoke Inquiry** (`/customise`) | `/custom_enquiries/{id}` | `CustomOrdersView` (Live Custom Inquiries queue) | Real-time onSnapshot subscription | Ticket creation fallback | **VERIFIED & OPERATIONAL** |
| 15 | **Submit Corporate Proposal** (`/corporate-gifting`) | `/corporate_enquiries/{id}` | `GiftingView` (Live Corporate Inquiries pipeline) | Real-time onSnapshot subscription | Internal lead queue | **VERIFIED & OPERATIONAL** |
| 16 | **Submit Support Ticket / Message** (`/contact`, `/account`) | `/support_tickets/{id}` | `SupportView` (Concierge Support Tickets queue) | Real-time onSnapshot subscription | Internal support queue | **VERIFIED & OPERATIONAL** |
| 17 | **Reply to Support Ticket** (`SupportView`) | `/support_tickets/{id}` (messages array) | Customer Account Portal (`/account`) | Real-time onSnapshot subscription | Customer inbox polling | **VERIFIED & OPERATIONAL** |
| 18 | **Update Order Fulfillment Status** (`OrdersView`) | `/orders/{orderId}` (`fulfillmentStatus`) | `/track` (Live tracking milestones), `/account/orders` | Real-time onSnapshot subscription | Safe status fallback | **VERIFIED & OPERATIONAL** |
| 19 | **Assign Tracking AWB & Courier** (`OrdersView`) | `/orders/{orderId}` (`trackingAwb`, `courier`) | `/track` (Consignment tracking details & carrier link) | Real-time query | Direct concierge support link | **VERIFIED & OPERATIONAL** |
| 20 | **Adjust Inventory / Deplete Stock** (`InventoryView`) | `/inventory/{sku}` (`available: 0`, `status: 'out_of_stock'`) | `/products/[slug]` ("Sold Out" badge), `/checkout` (Server inventory lock) | Real-time at checkout submission | Checkout blocks overselling with HTTP 409 | **VERIFIED & OPERATIONAL** |
| 21 | **Update Store Identity & Addresses** (`SettingsStoreView`) | `/settings/store` | Storefront Footer, Invoices, Contact Page (`/contact`) | Navigation / Refresh Fetch | Registered LLP address fallback | **VERIFIED & OPERATIONAL** |
| 22 | **Staff Account Suspension** (`AdminUsersView`) | `/admin_users/{uid}` (`status: 'suspended'`) | Administrative Login & privileged API operations | Immediate token check (`verifyStaffPermission`) | HTTP 403 Forbidden on all staff endpoints | **VERIFIED & OPERATIONAL** |

---

## 2. SYNCHRONIZATION ARCHITECTURE PRINCIPLES

1. **Transactional Server Locks at Checkout**:
   - Storefront inventory and price display may use cached client reads, but **checkout submission (`/api/orders/create`) strictly issues a server-side read against Firestore `/products` and `/inventory`**.
   - If an admin changed the price or marked an item out of stock 1 millisecond before checkout, the server-side transaction rejects the order with the authoritative state.
2. **Real-time vs Fetch-based Propagation**:
   - Order tracking (`/track`), live support conversations (`/account`), and administrative inquiry queues (`custom_enquiries`, `support_tickets`, `orders`) use Firestore `onSnapshot` real-time listeners. Changes reflect within 200–500ms without page reloads.
   - Catalogue, CMS, and policy changes propagate upon route transition or page refresh.
3. **Safe Fallbacks**:
   - In offline or latency scenarios, client displays safe static placeholders from `catalogue.ts` or `adminSeedData.ts`.
   - Crucially, **static fallbacks are read-only and never write back or overwrite authoritative database records**.

# KALAJAY HANDCRAFTED LUXURIES
## STOREFRONT-TO-ADMIN FIELD LEVEL COVERAGE MATRIX

**Standard:** Complete bidirectional field parity between customer-facing website and backend administration.

---

| Storefront Page | Storefront Field | Database Schema Path | Admin Management Editor | API / Backend Handler | Verification Status |
|---|---|---|---|---|:---:|
| **PDP (`/products/[slug]`)** | Product Title | `/products/{id}.name` | Catalogue View (Tab 1) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | SKU Identifier | `/products/{id}.code` | Catalogue View (Tab 1) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Selling Price | `/products/{id}.price` | Catalogue View (Tab 4) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Compare MRP | `/products/{id}.mrp` | Catalogue View (Tab 4) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Artisanal Story | `/products/{id}.description` | Catalogue View (Tab 1) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Primary Image | `/products/{id}.images[0]` | Catalogue View (Tab 2) | Cloudinary + Firestore | VERIFIED |
| **PDP** | Gallery Images | `/products/{id}.images` | Catalogue View (Tab 2) | Cloudinary + Firestore | VERIFIED |
| **PDP** | Colorway Swatches | `/products/{id}.variants` | Catalogue View (Tab 3) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Stock Status | `/products/{id}.inStock` | Catalogue View (Tab 4) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Craft Hours | `/products/{id}.craftDurationHours`| Catalogue View (Tab 1) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 1: Core Material | `/products/{id}.specMaterial` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 2: Bead Diameter | `/products/{id}.specBeadSize` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 3: Weaving Style | `/products/{id}.specWeavingStyle` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 4: Lining Fabric | `/products/{id}.specLining` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 5: Hardware | `/products/{id}.specHardware` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 6: Dimensions | `/products/{id}.specDimensions` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 7: Finished Weight| `/products/{id}.specWeight` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 8: Strap Drop | `/products/{id}.specStrapDrop` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 9: Artisan Cluster| `/products/{id}.specOrigin` | Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 10: Care Protocol| `/products/{id}.specCareInstructions`| Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 11: Packaging | `/products/{id}.specPackagingIncludes`| Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Spec 12: Certificate Code| `/products/{id}.specCertificateCode`| Catalogue View (Tab 5) | `saveFirestoreProduct` | VERIFIED |
| **PDP** | Patron Reviews Feed | `/reviews/{id}` | Catalogue View (Reviews Tab)| `/api/reviews` | VERIFIED |
| **Shop (`/shop`)** | Category Filters | `/categories/{slug}` | Catalogue View (Collections)| `saveFirestoreCategory` | VERIFIED |
| **Shop** | Price Sort | Dynamic Query / Client Filter | Catalogue View (Pricing Tab)| `saveFirestoreProduct` | VERIFIED |
| **Customise (`/customise`)**| Bespoke Inquiries | `/custom_enquiries/{id}` | Custom Orders View | `updateFirestoreCustomEnquiry`| VERIFIED |
| **Gifting (`/corporate-gifting`)**| Bulk Gifting Leads | `/corporate_enquiries/{id}`| Gifting View | `updateFirestoreCorporateEnquiry`| VERIFIED |
| **Checkout (`/checkout`)** | Shipping Address | `/orders/{id}.shippingAddress`| Orders View (Details Drawer)| `/api/orders` | VERIFIED |
| **Checkout** | Payment Method | `/orders/{id}.paymentMethod` | Orders View (Payment Pill) | `/api/orders` | VERIFIED |
| **Checkout** | Applied Promo Code | `/coupons/{code}.usageCount` | Marketing View | `saveFirestoreCoupon` | VERIFIED |
| **Account (`/account`)** | Member Birthday | `/users/{id}.preferences.birthday`| Customers View (Drawer) | `updatePatronProfile` | VERIFIED |
| **Account** | Delivery Destinations| `/users/{id}.addresses` | Customers View (Drawer) | `updatePatronProfile` | VERIFIED |
| **Account** | In-Loom Orders | `/work_orders/{id}` | Production View (Loom Run) | `saveFirestoreWorkOrder` | VERIFIED |
| **Track (`/track`)** | AWB Consignment | `/orders/{id}.trackingAwb` | Shipping View (Dispatch Modal)| `/api/admin/orders` | VERIFIED |
| **Track** | Artisan Maker Card | `/orders/{id}.artisanName` | Orders View (Timeline) | `saveFirestoreOrder` | VERIFIED |
| **Footer (`Footer.tsx`)**| Newsletter Subscribers| `/subscribers/{email}` | Marketing View (Subscribers)| `saveFirestoreSubscriber`| VERIFIED |
| **Policies (`/policies`)**| Free Shipping Limit | `/settings/store.freeDeliveryThreshold`| Settings View | `saveFirestoreStoreSettings`| VERIFIED |

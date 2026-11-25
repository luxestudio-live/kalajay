export type AttributeDisplayType = 'color' | 'image' | 'button' | 'dropdown' | 'text';

export interface AttributeValue {
  id: string;
  label: string;
  value: string;
  hexColor?: string;
  swatchImage?: string;
  displayOrder?: number;
}

export interface ProductAttribute {
  id: string;
  name: string;
  displayType: AttributeDisplayType;
  isVariantDimension: boolean;
  displayOrder: number;
  values: AttributeValue[];
}

export interface CraftCosting {
  enabled: boolean;
  beadsUsed?: string;
  beadKg: number;
  beadCostKg: number;
  laborHours: number;
  laborRatePerHour: number; // default 50
  otherMaterialCost: number;
  calculatedCostPrice: number;
  manualOverrideCostPrice?: number;
  notes?: string;
}

export interface ProductVariant {
  code: string;
  label: string;
  price: number;
  inStock: boolean;
  image: string;
  id?: string;
  barcode?: string;
  mrp?: number;
  stock?: number;
  reservedStock?: number;
  reorderThreshold?: number;
  weightGrams?: number;
  dimensions?: string;
  leadTimeDays?: number;
  isAvailable?: boolean;
  isDefault?: boolean;
  unitCost?: number;
  costing?: CraftCosting;
  openingStock?: number;
  stockIn?: number;
  quantityMade?: number;
  quantitySold?: number;
  damaged?: number;
  marketingQty?: number;
  adjustmentQty?: number;
  attributes?: Record<string, string>; // attributeId -> valueId
  attributeNames?: Record<string, string>; // attributeName -> valueLabel
}

export interface Product {
  id: string;
  code: string;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  price: number;
  originalPrice: number;
  images: string[];
  coverImage: string;
  inStock: boolean;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  variants: ProductVariant[];
  attributes?: ProductAttribute[];
  defaultVariantCode?: string;
  hasDynamicVariants?: boolean;
  materials: string[];
  dimensions: string;
  craftHours: string;
  care: string;
  description: string;
  hsnCode?: string;
  taxRate?: number;
  unit?: string;
  unitCost?: number;
  costing?: CraftCosting;
  openingStock?: number;
  stockIn?: number;
  quantityMade?: number;
  quantitySold?: number;
  damaged?: number;
  marketingQty?: number;
  adjustmentQty?: number;
  grossMarginPct?: number;
  markupPct?: number;
  stockValue?: number;
  status?: 'published' | 'active' | 'archived' | 'inactive' | 'draft';
  isActive?: boolean;
  active?: boolean;
  archived?: boolean;
  isDraft?: boolean;
  published?: boolean;
  isPublished?: boolean;
  artisanTitle?: string;
  artisanNote?: string;
  origin?: string;
  dimensionsNote?: string;
  careNote?: string;
  shippingPolicy?: string;
  transitGuarantee?: string;
  dispatchTimeline?: string;
  bulkEnquiryNote?: string;
}

export interface ReviewItem {
  id: string;
  patron: string;
  email?: string;
  product: string;
  productId?: string;
  productSlug?: string;
  rating: number;
  headline?: string;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'archived';
  verifiedBuyer?: boolean;
}

export const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-01',
    patron: 'Ananya Deshmukh',
    email: 'ananya.deshmukh@example.com',
    product: 'Vintage Pearl Beaded Evening Bag',
    productId: 'KJ-BAG-001',
    productSlug: 'vintage-pearl-beaded-evening-bag',
    rating: 5,
    headline: 'Breathtaking craftsmanship & tight weave',
    comment: 'The beadwork is breathtaking. You can genuinely feel the hours of patient human craft in the tight, uniform weave.',
    date: '2026-11-10',
    status: 'approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-02',
    patron: 'Meera Singhania',
    email: 'meera.s@example.com',
    product: 'Signature Pearl Beaded Vanity Box',
    productId: 'KJ-ORG-101',
    productSlug: 'signature-pearl-beaded-vanity-box',
    rating: 5,
    headline: 'Sits like a sculpted treasure on my dresser',
    comment: 'Sits like a sculpted treasure on my dresser. The 90-degree corners are so rigid and well tensioned.',
    date: '2026-11-09',
    status: 'approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-03',
    patron: 'Kavita Chawla',
    email: 'kavita.c@example.com',
    product: 'Colorful Beaded AirPod Case',
    productId: 'KJ-APC-402',
    productSlug: 'colorful-beaded-airpods-case-kj-apc-402',
    rating: 5,
    headline: 'A whimsical jewel in my handbag!',
    comment: 'A whimsical jewel in my handbag! The snaps hold tight and the micro-beads sparkle wonderfully in natural light.',
    date: '2026-11-08',
    status: 'approved',
    verifiedBuyer: true,
  },
  {
    id: 'rev-04',
    patron: 'Radhika Kothari',
    email: 'radhika.k@example.com',
    product: 'Radiant Crystal Beaded Tealight Lantern',
    productId: 'KJ-CDL-601',
    productSlug: 'radiant-crystal-beaded-tealight-lantern',
    rating: 5,
    headline: 'Sublime geometric amber shadows',
    comment: 'Casts the most sublime geometric amber shadows across our dinner table. A true heritage conversation starter.',
    date: '2026-11-07',
    status: 'approved',
    verifiedBuyer: true,
  },
];

export interface Collection {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
}

export const BRAND_CONFIG = {
  "name": "Kalajay",
  "logo": "/logo.png",
  "tagline": "A World of Little Wonders",
  "subheadline": "Small wonders. Beautifully made.",
  "philosophy": "A single bead or a strand of yarn or a paint brush. A little patience. Something beautiful.",
  "story": "Kalajay began with a simple love for making things by hand. Today, we are a small business built almost entirely by women, creating pieces that bring beauty to everyday life. From jewellery boxes that shimmer on your dresser to beaded bags and charms that travel with you, every piece is made one bead, one stitch, one detail at a time.",
  "artisanCount": 21,
  "cityCount": 2,
  "craftHouses": [
    {
      "city": "Bihar",
      "role": "Design, Beadwork & Handcrafted Production"
    },
    {
      "city": "Mumbai",
      "role": "Product Planning, Curation, Packaging & Global Dispatch"
    }
  ],
  "ateliers": [
    {
      "city": "Bihar",
      "role": "Design, Beadwork & Handcrafted Production"
    },
    {
      "city": "Mumbai",
      "role": "Product Planning, Curation, Packaging & Global Dispatch"
    }
  ],
  "contact": {
    "phone": "+91 97405 40847",
    "displayPhone": "+91 97405 40847",
    "email": "support@kalajay.in",
    "altEmail": "kalajay.handcrafted@gmail.com",
    "instagram": "@kalajay.handcrafted",
    "instagramUrl": "https://www.instagram.com/kalajay.handcrafted/",
    "gst": "11XXXXX1111X1Z1",
    "location": "Mumbai, Maharashtra, India",
    "whatsappUrl": "https://wa.me/919740540847?text=Hi%20Kalajay!%20I%27d%20like%20to%20know%20more%20about%20your%20handcrafted%20pieces."
  },
  "shipping": {
    "freeThreshold": 599,
    "standardRate": 79,
    "turnaround": "Made to order. Dispatched within 3-5 business days across India."
  },
  "tax": {
    "gstRate": 0.03,
    "taxLabel": "GST (3%)",
    "hsnCode": "71179090",
    "description": "GST on handcrafted luxury imitation jewelry and artisan beadwork under HSN 7117"
  }
};

export const COLLECTIONS: Collection[] = [
  {
    "name": "Organisers",
    "slug": "organisers",
    "tagline": "Pearl-beaded boxes & trays for jewellery and everyday essentials",
    "description": "Luminous pearl-strung catch-alls, vanity trays, and lidded jewel boxes. Hand-assembled bead by bead with reinforced wire structures to bring poetic order to dressing tables, nightstands, and private craft houses.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442705/kalajay/catalogue/cagx2jryioijvapagk6a.jpg"
  },
  {
    "name": "Purses",
    "slug": "purses",
    "tagline": "Hand-beaded clutches and purses",
    "description": "Sculptural evening clutches and statement handheld purses constructed from faceted crystals and glass seed beads. Fluid yet structural, balancing tactile shimmer with contemporary silhouettes.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442716/kalajay/catalogue/yyf9ze2uluz32ujxl4mo.jpg"
  },
  {
    "name": "Slings",
    "slug": "slings",
    "tagline": "Colourful beaded sling bags with long handle straps",
    "description": "Vibrant cross-body and shoulder slings engineered with hand-strung long straps and playful bead palettes. Designed to catch light and turn casual movement into an artful statement.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/pb1ws9kzarikylbsxgm9.jpg"
  },
  {
    "name": "Airpod Cases",
    "slug": "airpod-cases",
    "tagline": "Pearl beaded airpod cases for everyday use",
    "description": "Snug, protective cases hand-beaded with lustrous pearls and crystal accents. Transforming everyday technology into an intimate, jewel-like personal talisman.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/olbboadvjaqiz0cjlb6s.jpg"
  },
  {
    "name": "Coasters & Mats",
    "slug": "coasters-mats",
    "tagline": "Pearl-beaded mats and\u00A0coasters",
    "description": "Intricately woven table mats, runners, and drink coasters. Crafted with dense bead lattices that offer heat resistance, tactile weight, and unforgettable tabletop radiance.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/catalogue/lhy85nxlwvgdpedsniao.jpg"
  },
  {
    "name": "Candle Holders",
    "slug": "candle-holders",
    "tagline": "Beaded tealight holders",
    "description": "Atmospheric tealight lanterns woven from prismatic crystal and coloured glass beads that cast dancing shadows across celebratory dinner tables and quiet evening spaces.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442723/kalajay/catalogue/n5q4ecn6crnluhkcsnnl.jpg"
  },
  {
    "name": "Key Rings",
    "slug": "key-rings",
    "tagline": "Beaded keyrings and charms",
    "description": "Pocket-sized miniature sculptures: beaded hearts, monograms, and musical notations designed to bring daily joy every time you reach for your keys.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/flixddc0ywvstfqwztwa.jpg"
  },
  {
    "name": "Crochet Magic",
    "slug": "crochet-magic",
    "tagline": "Handmade crochet accessories",
    "description": "Spun with fine threads and soft yarns, our crocheted flower charms and delicate bookmarks embody the tenderness of patient needlework and botanical wonder.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/v6vofiiptkamnwkvx5ta.jpg"
  },
  {
    "name": "Little Treasures",
    "slug": "little-treasures",
    "tagline": "One-of-a-kind crystal and beaded showpieces",
    "description": "One-of-a-kind bespoke creations, custom name plaques, crystal bottles, and limited-edition showpieces celebrating the pure joy of artisanal experimentation.",
    "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/q5nc8b7tditqhsn3vpvm.jpg"
  }
];

export const PRODUCTS: Product[] = [
  {
    "id": "KJ-APC-402",
    "code": "KJ-APC-402",
    "slug": "colorful-beaded-airpods-case-kj-apc-402",
    "name": "Colorful Beaded AirPods Case",
    "category": "Airpod Cases",
    "categorySlug": "airpod-cases",
    "price": 399,
    "originalPrice": 499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/olbboadvjaqiz0cjlb6s.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/olbboadvjaqiz0cjlb6s.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Glass Beads",
      "Elasticised Nylon Core",
      "Metal Lobster Clasp Clip"
    ],
    "dimensions": "Compatible with AirPods Gen 2/3 & AirPods Pro",
    "craftHours": "5 hours of meticulous bead calibration",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Colorful Beaded AirPods Case is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-APC-404",
    "code": "KJ-APC-404",
    "slug": "crystal-beaded-airpods-case-kj-apc-404",
    "name": "Crystal Beaded AirPods Case",
    "category": "Airpod Cases",
    "categorySlug": "airpod-cases",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/ng8e1t0xmb4z3jlvhlnq.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/ng8e1t0xmb4z3jlvhlnq.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Faceted Glass Beads",
      "Elasticised Nylon Core",
      "Metal Lobster Clasp Clip"
    ],
    "dimensions": "Compatible with AirPods Gen 2/3 & AirPods Pro",
    "craftHours": "5 hours of meticulous bead calibration",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Beaded AirPods Case is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-APC-405",
    "code": "KJ-APC-405",
    "slug": "florescent-beaded-airpods-case-kj-apc-405",
    "name": "Florescent Beaded AirPods Case",
    "category": "Airpod Cases",
    "categorySlug": "airpod-cases",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/k4oophmjhjh0rqu6hrdr.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/ng8e1t0xmb4z3jlvhlnq.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442683/kalajay/catalogue/k4oophmjhjh0rqu6hrdr.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Glass Beads",
      "Elasticised Nylon Core",
      "Metal Lobster Clasp Clip"
    ],
    "dimensions": "Compatible with AirPods Gen 2/3 & AirPods Pro",
    "craftHours": "5 hours of meticulous bead calibration",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Florescent Beaded AirPods Case is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-APC-403",
    "code": "KJ-APC-403",
    "slug": "pastel-beaded-airpods-case-kj-apc-403",
    "name": "Pastel Beaded AirPods Case",
    "category": "Airpod Cases",
    "categorySlug": "airpod-cases",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/rvmxm8pr1cjslsz7gja5.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/rvmxm8pr1cjslsz7gja5.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Glass Beads",
      "Elasticised Nylon Core",
      "Metal Lobster Clasp Clip"
    ],
    "dimensions": "Compatible with AirPods Gen 2/3 & AirPods Pro",
    "craftHours": "5 hours of meticulous bead calibration",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pastel Beaded AirPods Case is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-APC-401",
    "code": "KJ-APC-401",
    "slug": "pearl-beaded-airpods-case-kj-apc-401",
    "name": "Pearl Beaded AirPods Case",
    "category": "Airpod Cases",
    "categorySlug": "airpod-cases",
    "price": 399,
    "originalPrice": 499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/ulojgtkola3pv8icll0n.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442684/kalajay/catalogue/ulojgtkola3pv8icll0n.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Glass Beads",
      "Elasticised Nylon Core",
      "Metal Lobster Clasp Clip"
    ],
    "dimensions": "Compatible with AirPods Gen 2/3 & AirPods Pro",
    "craftHours": "5 hours of meticulous bead calibration",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded AirPods Case is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CDL-602",
    "code": "KJ-CDL-602",
    "slug": "colorful-beaded-tealight-holder-set-kj-cdl-602",
    "name": "Colorful Beaded Tealight Holder Set",
    "category": "Candle Holders",
    "categorySlug": "candle-holders",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/n3uyvult1li1rf7funfp.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442685/kalajay/products/j7iapsunvayw8dmh1jij.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/v9fx7maa4u3pyzutglqo.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/p8bli1fnkwx54cfgorjy.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442687/kalajay/products/qlcuhmglvxs0cr30j5kr.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/smsjtvkkojgwfjsc4hxr.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/c0sp1v29lzruzr8hvnhk.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/hnjeqw48svcz0olgqegg.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/n3uyvult1li1rf7funfp.webp",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": true,
    "isNewArrival": true,
    "variants": [
      {
        "code": "KJ-CDL-602-1",
        "label": "Yellow",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442685/kalajay/products/j7iapsunvayw8dmh1jij.webp"
      },
      {
        "code": "KJ-CDL-602-2",
        "label": "Dark Pink",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/v9fx7maa4u3pyzutglqo.webp"
      },
      {
        "code": "KJ-CDL-602-3",
        "label": "Pastel Pink",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/p8bli1fnkwx54cfgorjy.webp"
      },
      {
        "code": "KJ-CDL-602-4",
        "label": "Lavender",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442686/kalajay/products/n3uyvult1li1rf7funfp.webp"
      },
      {
        "code": "KJ-CDL-602-5",
        "label": "Opaque",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442687/kalajay/products/qlcuhmglvxs0cr30j5kr.webp"
      },
      {
        "code": "KJ-CDL-602-6",
        "label": "Mint green",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/smsjtvkkojgwfjsc4hxr.webp"
      },
      {
        "code": "KJ-CDL-602-7",
        "label": "Aqua Blue",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/c0sp1v29lzruzr8hvnhk.webp"
      },
      {
        "code": "KJ-CDL-602-8",
        "label": "Shiny Black",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/hnjeqw48svcz0olgqegg.webp"
      }
    ],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Colorful Beaded Tealight Holder Set is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CDL-601",
    "code": "KJ-CDL-601",
    "slug": "pearl-beaded-tealight-holder-set-kj-cdl-601",
    "name": "Pearl Beaded Tealight Holder Set",
    "category": "Candle Holders",
    "categorySlug": "candle-holders",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/fp1wwuqi3ogmgwrynxls.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442688/kalajay/products/fp1wwuqi3ogmgwrynxls.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Tealight Holder Set is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-510",
    "code": "KJ-MAT-510",
    "slug": "beaded-nike-theme-mat-kj-mat-510",
    "name": "Beaded Nike Theme Mat",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 699,
    "originalPrice": 874,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442689/kalajay/catalogue/x58rsbntrjjnufdlolvl.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442689/kalajay/catalogue/x58rsbntrjjnufdlolvl.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Beaded Nike Theme Mat is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-513",
    "code": "KJ-MAT-513",
    "slug": "blush-crystal-coaster-set-kj-mat-513",
    "name": "Blush Crystal Coaster Set",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 400,
    "originalPrice": 500,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/catalogue/mdzvawgwdwne1bxd7xf0.png"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/catalogue/mdzvawgwdwne1bxd7xf0.png",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Blush Crystal Coaster Set is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-504",
    "code": "KJ-MAT-504",
    "slug": "grey-beaded-table-runner-kj-mat-504",
    "name": "Grey Beaded Table Runner",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 899,
    "originalPrice": 1124,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442689/kalajay/catalogue/kdlom04mz5imgnnhjaht.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442689/kalajay/catalogue/kdlom04mz5imgnnhjaht.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Grey Beaded Table Runner is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-507",
    "code": "KJ-MAT-507",
    "slug": "pearl-beaded-accent-coaster-kj-mat-507",
    "name": "Pearl Beaded Accent Coaster",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 175,
    "originalPrice": 219,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/products/ugs4bturpfbqsmvf11wx.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/products/ugs4bturpfbqsmvf11wx.webp",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-MAT-507-1",
        "label": "White",
        "price": 175,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/products/ugs4bturpfbqsmvf11wx.webp"
      }
    ],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Accent Coaster is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-509",
    "code": "KJ-MAT-509",
    "slug": "pearl-beaded-mat-with-colour-accents-kj-mat-509",
    "name": "Pearl Beaded Mat With Colour Accents",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 749,
    "originalPrice": 936,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/catalogue/ip23x9qdruaukunmocup.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442690/kalajay/catalogue/ip23x9qdruaukunmocup.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": true,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Mat With Colour Accents is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-508",
    "code": "KJ-MAT-508",
    "slug": "pearl-beaded-round-coaster-set-kj-mat-508",
    "name": "Pearl Beaded Round Coaster Set",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/catalogue/lhy85nxlwvgdpedsniao.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/products/tlex3aw9gqdjdfeot1rs.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/products/cvgh6ag1vetphn7q56bi.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/catalogue/lhy85nxlwvgdpedsniao.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-MAT-508-1",
        "label": "White",
        "price": 175,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/products/tlex3aw9gqdjdfeot1rs.webp"
      },
      {
        "code": "KJ-MAT-508-2",
        "label": "Pink",
        "price": 175,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442691/kalajay/products/cvgh6ag1vetphn7q56bi.webp"
      }
    ],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Round Coaster Set is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-506",
    "code": "KJ-MAT-506",
    "slug": "pearl-beaded-square-mat-kj-mat-506",
    "name": "Pearl Beaded Square Mat",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442692/kalajay/catalogue/fvx0tuklrsgdyi6hfsc1.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442692/kalajay/catalogue/fvx0tuklrsgdyi6hfsc1.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Square Mat is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-512",
    "code": "KJ-MAT-512",
    "slug": "pearl-hexagon-coaster-set-kj-mat-512",
    "name": "Pearl Hexagon Coaster Set",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 300,
    "originalPrice": 375,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/catalogue/zgugp5eo7wltikp1g7ya.png"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/catalogue/zgugp5eo7wltikp1g7ya.png",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Hexagon Coaster Set is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-503",
    "code": "KJ-MAT-503",
    "slug": "pink-grey-beaded-round-mat-kj-mat-503",
    "name": "Pink & Grey Beaded Round Mat",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 549,
    "originalPrice": 686,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442692/kalajay/catalogue/hsrabsqwyvzlxjkxp7lx.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442692/kalajay/catalogue/hsrabsqwyvzlxjkxp7lx.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pink & Grey Beaded Round Mat is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-MAT-514",
    "code": "KJ-MAT-514",
    "slug": "star-beaded-table-mat-kj-mat-514",
    "name": "Star Beaded Table Mat",
    "category": "Coasters & Mats",
    "categorySlug": "coasters-mats",
    "price": 599,
    "originalPrice": 749,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/products/lrngi6w3prvapnjkcrxu.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/products/lrngi6w3prvapnjkcrxu.webp",
    "inStock": false,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-MAT-514-1",
        "label": "Blush Punk Translucent",
        "price": 599,
        "inStock": false,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/products/lrngi6w3prvapnjkcrxu.webp"
      }
    ],
    "materials": [
      "Dense Glass Beads",
      "Water-Resistant Cotton Thread Lattice",
      "Heat-Resistant Core"
    ],
    "dimensions": "Diameter: 12cm (Coaster) / 32cm (Table Mat)",
    "craftHours": "8 hours of flat-loom needlework",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Star Beaded Table Mat is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CRO-803",
    "code": "KJ-CRO-803",
    "slug": "crochet-chicken-bookmarks-kj-cro-803",
    "name": "Crochet Chicken Bookmarks",
    "category": "Crochet Magic",
    "categorySlug": "crochet-magic",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/catalogue/o2zq3so1izokx1eicj3w.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442693/kalajay/catalogue/o2zq3so1izokx1eicj3w.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "100% Mercerised Botanical Cotton Yarn",
      "Hand-Dyed Natural Fibres"
    ],
    "dimensions": "28cm Ribbon Length · 5cm Floral Diameter",
    "craftHours": "4 hours of single-hook crochet craft",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crochet Chicken Bookmarks is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CRO-801",
    "code": "KJ-CRO-801",
    "slug": "crochet-flower-bookmark-bag-charm-kj-cro-801",
    "name": "Crochet Flower Bookmark/Bag Charm",
    "category": "Crochet Magic",
    "categorySlug": "crochet-magic",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/nlidl74xyqqlbikp5bsu.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/nlidl74xyqqlbikp5bsu.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "100% Mercerised Botanical Cotton Yarn",
      "Hand-Dyed Natural Fibres"
    ],
    "dimensions": "28cm Ribbon Length · 5cm Floral Diameter",
    "craftHours": "4 hours of single-hook crochet craft",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crochet Flower Bookmark/Bag Charm is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CRO-805",
    "code": "KJ-CRO-805",
    "slug": "crochet-flower-broad-bookmark-kj-cro-805",
    "name": "Crochet Flower Broad Bookmark",
    "category": "Crochet Magic",
    "categorySlug": "crochet-magic",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/ngshevs7ipxogmvyxdem.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/ngshevs7ipxogmvyxdem.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "100% Mercerised Botanical Cotton Yarn",
      "Hand-Dyed Natural Fibres"
    ],
    "dimensions": "28cm Ribbon Length · 5cm Floral Diameter",
    "craftHours": "4 hours of single-hook crochet craft",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crochet Flower Broad Bookmark is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-CRO-804",
    "code": "KJ-CRO-804",
    "slug": "crochet-heart-keyring-kj-cro-804",
    "name": "Crochet Heart Keyring",
    "category": "Crochet Magic",
    "categorySlug": "crochet-magic",
    "price": 199,
    "originalPrice": 249,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/j3wtvqqgpqnrq60uixi8.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442694/kalajay/catalogue/j3wtvqqgpqnrq60uixi8.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "100% Mercerised Botanical Cotton Yarn",
      "Hand-Dyed Natural Fibres"
    ],
    "dimensions": "28cm Ribbon Length · 5cm Floral Diameter",
    "craftHours": "4 hours of single-hook crochet craft",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crochet Heart Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-701",
    "code": "KJ-KEY-701",
    "slug": "colorful-beaded-alphabet-keyring-kj-key-701",
    "name": "Colorful Beaded Alphabet Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/catalogue/iwkgob2ornfoxs3h71cx.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/products/ejkc1pwbgsbif3nzv9fn.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/products/i03nlmsc35kmiccobhrs.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/products/f115njld07hughhoxj6y.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/products/drqt1iydqzadulimz3y3.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/catalogue/iwkgob2ornfoxs3h71cx.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [
      {
        "code": "KJ-KEY-701-1",
        "label": "Lime Green",
        "price": 199,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/products/ejkc1pwbgsbif3nzv9fn.webp"
      },
      {
        "code": "KJ-KEY-701-2",
        "label": "Cobalt Blue",
        "price": 199,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442695/kalajay/products/i03nlmsc35kmiccobhrs.webp"
      },
      {
        "code": "KJ-KEY-701-3",
        "label": "Mixed Pastel",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/products/f115njld07hughhoxj6y.webp"
      },
      {
        "code": "KJ-KEY-701-4",
        "label": "Peach",
        "price": 249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/products/drqt1iydqzadulimz3y3.webp"
      }
    ],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Colorful Beaded Alphabet Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-707",
    "code": "KJ-KEY-707",
    "slug": "colourful-beaded-heart-keyring-kj-key-707",
    "name": "Colourful Beaded Heart Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/flixddc0ywvstfqwztwa.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/flixddc0ywvstfqwztwa.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Colourful Beaded Heart Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-706",
    "code": "KJ-KEY-706",
    "slug": "crystal-beaded-heart-charm-keyring-kj-key-706",
    "name": "Crystal Beaded Heart Charm/Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 249,
    "originalPrice": 311,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/catalogue/zndcpbr9evbkmptcatow.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442696/kalajay/catalogue/zndcpbr9evbkmptcatow.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Beaded Heart Charm/Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-702",
    "code": "KJ-KEY-702",
    "slug": "pearl-beaded-alphabet-keyring-kj-key-702",
    "name": "Pearl Beaded Alphabet Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 229,
    "originalPrice": 286,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/wht9w9uj3rl5qnoe7zai.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/wht9w9uj3rl5qnoe7zai.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Alphabet Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-704",
    "code": "KJ-KEY-704",
    "slug": "pearl-beaded-heart-keyring-kj-key-704",
    "name": "Pearl Beaded Heart Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/a8a1hfhse09dtoejx8xz.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442697/kalajay/catalogue/a8a1hfhse09dtoejx8xz.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Heart Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-KEY-703",
    "code": "KJ-KEY-703",
    "slug": "pearl-beaded-music-note-keyring-kj-key-703",
    "name": "Pearl Beaded Music Note Keyring",
    "category": "Key Rings",
    "categorySlug": "key-rings",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/lrdplpps5zho0nog8t68.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/lrdplpps5zho0nog8t68.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Music Note Keyring is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SPL-901",
    "code": "KJ-SPL-901",
    "slug": "crystal-bling-bottle-kj-spl-901",
    "name": "Crystal Bling Bottle",
    "category": "Little Treasures",
    "categorySlug": "little-treasures",
    "price": 1699,
    "originalPrice": 2124,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/q5nc8b7tditqhsn3vpvm.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/q5nc8b7tditqhsn3vpvm.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Bling Bottle is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SPL-903",
    "code": "KJ-SPL-903",
    "slug": "custom-beaded-name-plaque-kj-spl-903",
    "name": "Custom Beaded Name Plaque",
    "category": "Little Treasures",
    "categorySlug": "little-treasures",
    "price": 1999,
    "originalPrice": 2499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/c1xpwikmwxl0jomqqcne.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/c1xpwikmwxl0jomqqcne.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Custom Beaded Name Plaque is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SPL-902",
    "code": "KJ-SPL-902",
    "slug": "mini-pearl-beaded-coin-bag-kj-spl-902",
    "name": "Mini Pearl Beaded Coin Bag",
    "category": "Little Treasures",
    "categorySlug": "little-treasures",
    "price": 149,
    "originalPrice": 186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/imjvuqgkfkqtkkyws25s.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442698/kalajay/catalogue/imjvuqgkfkqtkkyws25s.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Glass Seed Beads",
      "Synthetic Pearl Beads",
      "High-Tensile Monofilament Wire"
    ],
    "dimensions": "Standard Handcrafted Scale",
    "craftHours": "6 to 12 hours of hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Mini Pearl Beaded Coin Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-106",
    "code": "KJ-ORG-106",
    "slug": "beaded-textured-round-organiser-kj-org-106",
    "name": "Beaded Textured Round Organiser",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/catalogue/p0f3jsavegiz1i1vokwq.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/catalogue/p0f3jsavegiz1i1vokwq.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Beaded Textured Round Organiser is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-107",
    "code": "KJ-ORG-107",
    "slug": "black-beaded-ashtray-kj-org-107",
    "name": "Black Beaded Ashtray",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 599,
    "originalPrice": 749,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/catalogue/abklphqi89ad2htsg8u6.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/catalogue/abklphqi89ad2htsg8u6.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Black Beaded Ashtray is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-111",
    "code": "KJ-ORG-111",
    "slug": "crystal-beaded-pen-brush-holder-kj-org-111",
    "name": "Crystal Beaded Pen/Brush Holder",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 599,
    "originalPrice": 749,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/catalogue/zp2ep1ckllc5nnn0iaro.png",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/products/iotvjewusdp5stjfqjrx.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/catalogue/zp2ep1ckllc5nnn0iaro.png",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-ORG-111-1",
        "label": "Blush Pink",
        "price": 599,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442699/kalajay/products/iotvjewusdp5stjfqjrx.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Beaded Pen/Brush Holder is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-110",
    "code": "KJ-ORG-110",
    "slug": "crystal-beaded-tissue-dispenser-kj-org-110",
    "name": "Crystal Beaded Tissue Dispenser",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 1649,
    "originalPrice": 2061,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442700/kalajay/catalogue/ow1inwvsvx1cyczexxoo.png",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442700/kalajay/products/bdtwhqpgkosfzocy3izc.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442700/kalajay/catalogue/ow1inwvsvx1cyczexxoo.png",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [
      {
        "code": "KJ-ORG-110-1",
        "label": "Blush Pink",
        "price": 1449,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442700/kalajay/products/bdtwhqpgkosfzocy3izc.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Beaded Tissue Dispenser is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-109",
    "code": "KJ-ORG-109",
    "slug": "matte-beaded-desk-organiser-baskets-kj-org-109",
    "name": "Matte Beaded Desk Organiser Baskets",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 799,
    "originalPrice": 999,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442702/kalajay/catalogue/hfejpavwxc6phew0ybta.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/products/t2to1siprkvshjff8zvy.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/products/f9pdmykhesicetkxmqyh.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442702/kalajay/catalogue/hfejpavwxc6phew0ybta.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-ORG-109-1",
        "label": "Blue",
        "price": 799,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/products/t2to1siprkvshjff8zvy.webp"
      },
      {
        "code": "KJ-ORG-109-2",
        "label": "Lavender",
        "price": 799,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442701/kalajay/products/f9pdmykhesicetkxmqyh.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Matte Beaded Desk Organiser Baskets is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-112",
    "code": "KJ-ORG-112",
    "slug": "matte-beaded-pen-brush-holder-kj-org-112",
    "name": "Matte Beaded Pen/Brush Holder",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 549,
    "originalPrice": 686,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442704/kalajay/catalogue/as87aboowvodgpxn8xdc.png",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442703/kalajay/products/xfiqok1ghdwncd4abhh8.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442702/kalajay/products/wefahldhgfxtkzqfpnye.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442704/kalajay/catalogue/as87aboowvodgpxn8xdc.png",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-ORG-112-1",
        "label": "Lavender",
        "price": 499,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442703/kalajay/products/xfiqok1ghdwncd4abhh8.webp"
      },
      {
        "code": "KJ-ORG-112-2",
        "label": "Blue",
        "price": 499,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442702/kalajay/products/wefahldhgfxtkzqfpnye.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Matte Beaded Pen/Brush Holder is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-108",
    "code": "KJ-ORG-108",
    "slug": "pearl-beaded-catch-all-tray-kj-org-108",
    "name": "Pearl Beaded Catch-All Tray",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442704/kalajay/catalogue/hjeycopa7fnlf1nhqq39.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442704/kalajay/catalogue/hjeycopa7fnlf1nhqq39.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Catch-All Tray is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-101",
    "code": "KJ-ORG-101",
    "slug": "pearl-beaded-jewellery-box-with-mirror-kj-org-101",
    "name": "Pearl Beaded Jewellery Box with Mirror",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 2599,
    "originalPrice": 3249,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442705/kalajay/catalogue/cagx2jryioijvapagk6a.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442705/kalajay/catalogue/cagx2jryioijvapagk6a.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Jewellery Box with Mirror is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-113",
    "code": "KJ-ORG-113",
    "slug": "pearl-beaded-luxe-basket-kj-org-113",
    "name": "Pearl Beaded Luxe Basket",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 749,
    "originalPrice": 936,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442705/kalajay/products/bo9dwhm0os470xa0gcaz.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442705/kalajay/products/bo9dwhm0os470xa0gcaz.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Luxe Basket is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-105",
    "code": "KJ-ORG-105",
    "slug": "pearl-beaded-pen-stand-kj-org-105",
    "name": "Pearl Beaded Pen Stand",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 499,
    "originalPrice": 624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/catalogue/pay4pp87qwofbmwog7q5.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/products/stpjcyygfpvkqrzng4ca.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/products/d7ozhx8lmjxbiyzoh4dx.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/catalogue/pay4pp87qwofbmwog7q5.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-ORG-105-1",
        "label": "White Round (Small)",
        "price": 449,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/products/stpjcyygfpvkqrzng4ca.webp"
      },
      {
        "code": "KJ-ORG-105-2",
        "label": "White Square",
        "price": 449,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442706/kalajay/products/d7ozhx8lmjxbiyzoh4dx.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Pen Stand is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-102",
    "code": "KJ-ORG-102",
    "slug": "pearl-beaded-ring-earring-box-kj-org-102",
    "name": "Pearl Beaded Ring/Earring Box",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 599,
    "originalPrice": 749,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442707/kalajay/catalogue/wxgxbkzmgadryuke88wu.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/ibghteyg6idikpaaptpd.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/est2djknfj8m3q23fsor.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/evjw0vvkrjez5qngem11.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/products/kt8otqfktujlezrhicgz.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/products/jvtt0negmcsbpvdf4ln7.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442707/kalajay/catalogue/wxgxbkzmgadryuke88wu.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-ORG-102-1",
        "label": "White Square",
        "price": 549,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/ibghteyg6idikpaaptpd.webp"
      },
      {
        "code": "KJ-ORG-102-2",
        "label": "White Round",
        "price": 549,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/est2djknfj8m3q23fsor.webp"
      },
      {
        "code": "KJ-ORG-102-3",
        "label": "Colourful Round",
        "price": 599,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442708/kalajay/products/evjw0vvkrjez5qngem11.webp"
      },
      {
        "code": "KJ-ORG-102-4",
        "label": "Colourful Square",
        "price": 599,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/products/kt8otqfktujlezrhicgz.webp"
      },
      {
        "code": "KJ-ORG-102-5",
        "label": "Crystal Black",
        "price": 599,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/products/jvtt0negmcsbpvdf4ln7.webp"
      }
    ],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Ring/Earring Box is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-103",
    "code": "KJ-ORG-103",
    "slug": "pearl-beaded-round-watch-accessory-box-kj-org-103",
    "name": "Pearl Beaded Round Watch/Accessory Box",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 699,
    "originalPrice": 874,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/catalogue/movzwcwoxepeshnqbfof.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/catalogue/movzwcwoxepeshnqbfof.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Round Watch/Accessory Box is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-ORG-104",
    "code": "KJ-ORG-104",
    "slug": "pearl-beaded-vanity-tray-kj-org-104",
    "name": "Pearl Beaded Vanity Tray",
    "category": "Organisers",
    "categorySlug": "organisers",
    "price": 1199,
    "originalPrice": 1499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/catalogue/tfo8vfssqqlmwzprhn9g.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442709/kalajay/catalogue/tfo8vfssqqlmwzprhn9g.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Faceted Acrylic Crystal Beads",
      "Polished Synthetic Pearls",
      "Reinforced Stainless Steel Wire Frame",
      "Velvet Protective Base"
    ],
    "dimensions": "14cm (L) × 10cm (W) × 7cm (H)",
    "craftHours": "14 hours of continuous hand-stringing",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Vanity Tray is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-215",
    "code": "KJ-PRS-215",
    "slug": "beaded-honeycomb-handbag-kj-prs-215",
    "name": "Beaded Honeycomb Handbag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1599,
    "originalPrice": 1999,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/catalogue/ld6jd6pyrgsayzqsqwps.jpg",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442711/kalajay/products/o64whndr9mc3tf6cczbp.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/products/rnxy84so9avkehrrgash.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442711/kalajay/products/nuqglwprmugcnzybaiy7.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/catalogue/ld6jd6pyrgsayzqsqwps.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-PRS-215-1",
        "label": "Orange",
        "price": 1099,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442711/kalajay/products/o64whndr9mc3tf6cczbp.webp"
      },
      {
        "code": "KJ-PRS-215-2",
        "label": "Lemon Yellow",
        "price": 1099,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442710/kalajay/products/rnxy84so9avkehrrgash.webp"
      },
      {
        "code": "KJ-PRS-215-3",
        "label": "Lavender",
        "price": 1199,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442711/kalajay/products/nuqglwprmugcnzybaiy7.webp"
      }
    ],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Beaded Honeycomb Handbag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-216",
    "code": "KJ-PRS-216",
    "slug": "bluebell-beaded-diamond-handbag-kj-prs-216",
    "name": "Bluebell  Beaded Diamond Handbag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1349,
    "originalPrice": 1686,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442712/kalajay/products/lfqo8pdu1mtokvl18vej.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442712/kalajay/products/lfqo8pdu1mtokvl18vej.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Bluebell  Beaded Diamond Handbag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-222",
    "code": "KJ-PRS-222",
    "slug": "crystal-beaded-butterfly-purse-kj-prs-222",
    "name": "Crystal Beaded Butterfly Purse",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1449,
    "originalPrice": 1811,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442712/kalajay/products/z2uyxgb13ucabgtpr1fi.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/ggwsszczowjz9g16el38.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/acau4uwyxiu2ozskt1da.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442712/kalajay/products/z2uyxgb13ucabgtpr1fi.webp",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [
      {
        "code": "KJ-PRS-222-1",
        "label": "Crystal Shiny Transparent",
        "price": 1199,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442712/kalajay/products/z2uyxgb13ucabgtpr1fi.webp"
      },
      {
        "code": "KJ-PRS-222-2",
        "label": "Blue & White",
        "price": 1249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/ggwsszczowjz9g16el38.webp"
      },
      {
        "code": "KJ-PRS-222-3",
        "label": "Iridescent Black",
        "price": 1249,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/acau4uwyxiu2ozskt1da.webp"
      }
    ],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Crystal Beaded Butterfly Purse is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-217",
    "code": "KJ-PRS-217",
    "slug": "floral-beaded-shoulder-bag-kj-prs-217",
    "name": "Floral Beaded Shoulder Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 949,
    "originalPrice": 1186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/vskzgwmsrgxvfbwhtnrs.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/products/xrvrvebyyzyfm5ccclh6.webp",
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/products/s47kruyp0iaqh6fhtlkh.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/vskzgwmsrgxvfbwhtnrs.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [
      {
        "code": "KJ-PRS-217-1",
        "label": "Orange and Green Floral",
        "price": 949,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442713/kalajay/products/vskzgwmsrgxvfbwhtnrs.webp"
      },
      {
        "code": "KJ-PRS-217-2",
        "label": "Green and Orange Floral",
        "price": 949,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/products/xrvrvebyyzyfm5ccclh6.webp"
      },
      {
        "code": "KJ-PRS-217-3",
        "label": "Pastel green",
        "price": 949,
        "inStock": true,
        "image": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/products/s47kruyp0iaqh6fhtlkh.webp"
      }
    ],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Floral Beaded Shoulder Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-202",
    "code": "KJ-PRS-202",
    "slug": "ivory-beaded-backpack-kj-prs-202",
    "name": "Ivory Beaded Backpack",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2799,
    "originalPrice": 3499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/catalogue/oh1h1mvgnmb0qczpnlbj.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442714/kalajay/catalogue/oh1h1mvgnmb0qczpnlbj.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Ivory Beaded Backpack is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-218",
    "code": "KJ-PRS-218",
    "slug": "lavender-bloom-beaded-tote-bag-kj-prs-218",
    "name": "Lavender Bloom Beaded Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1249,
    "originalPrice": 1561,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/products/cfp7z1owdsssludzueur.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/products/cfp7z1owdsssludzueur.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Lavender Bloom Beaded Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-220",
    "code": "KJ-PRS-220",
    "slug": "midnight-bloom-beaded-shoulder-bag-kj-prs-220",
    "name": "Midnight Bloom Beaded Shoulder Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1349,
    "originalPrice": 1686,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/products/igiyjsnxrw8vabnygegq.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/products/igiyjsnxrw8vabnygegq.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Midnight Bloom Beaded Shoulder Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-214",
    "code": "KJ-PRS-214",
    "slug": "mint-green-beaded-tote-bag-kj-prs-214",
    "name": "Mint Green Beaded Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1799,
    "originalPrice": 2249,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/catalogue/sr8ntxrea57xczzywuji.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442715/kalajay/catalogue/sr8ntxrea57xczzywuji.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Mint Green Beaded Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-221",
    "code": "KJ-PRS-221",
    "slug": "mocha-beaded-tote-bag-kj-prs-221",
    "name": "Mocha Beaded Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1399,
    "originalPrice": 1749,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442716/kalajay/products/rrar0exhlrhpp4dilav6.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442716/kalajay/products/rrar0exhlrhpp4dilav6.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Mocha Beaded Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-201",
    "code": "KJ-PRS-201",
    "slug": "pearl-beaded-baguette-bag-kj-prs-201",
    "name": "Pearl Beaded Baguette Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1499,
    "originalPrice": 1874,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442716/kalajay/catalogue/yyf9ze2uluz32ujxl4mo.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442716/kalajay/catalogue/yyf9ze2uluz32ujxl4mo.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Baguette Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-212",
    "code": "KJ-PRS-212",
    "slug": "pearl-beaded-canteen-bag-kj-prs-212",
    "name": "Pearl Beaded Canteen Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2099,
    "originalPrice": 2624,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/u6cudwzc2zpvph3ifvqy.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/u6cudwzc2zpvph3ifvqy.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Canteen Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-209",
    "code": "KJ-PRS-209",
    "slug": "pearl-beaded-clutch-gold-dot-detail-kj-prs-209",
    "name": "Pearl Beaded Clutch, Gold Dot Detail",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 649,
    "originalPrice": 811,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/uewm2oye054abrs5ffvq.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/uewm2oye054abrs5ffvq.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Clutch, Gold Dot Detail is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-213",
    "code": "KJ-PRS-213",
    "slug": "pearl-beaded-cutout-handle-bag-kj-prs-213",
    "name": "Pearl Beaded Cutout-Handle Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2299,
    "originalPrice": 2874,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/ets2opnqxaw2w4ru2o65.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/ets2opnqxaw2w4ru2o65.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Cutout-Handle Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-206",
    "code": "KJ-PRS-206",
    "slug": "pearl-beaded-drop-bag-kj-prs-206",
    "name": "Pearl Beaded Drop Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2599,
    "originalPrice": 3249,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/tabtjxlh4bokknnrws9u.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442717/kalajay/catalogue/tabtjxlh4bokknnrws9u.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Drop Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-204",
    "code": "KJ-PRS-204",
    "slug": "pearl-beaded-envelope-clutch-kj-prs-204",
    "name": "Pearl Beaded Envelope Clutch",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1649,
    "originalPrice": 2061,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/igdnqgjebnlnorpzvhwm.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/igdnqgjebnlnorpzvhwm.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Envelope Clutch is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-210",
    "code": "KJ-PRS-210",
    "slug": "pearl-beaded-hobo-bag-kj-prs-210",
    "name": "Pearl Beaded Hobo Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1349,
    "originalPrice": 1686,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/b2eub8hun20qbybdcran.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442718/kalajay/catalogue/b2eub8hun20qbybdcran.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Hobo Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-205",
    "code": "KJ-PRS-205",
    "slug": "pearl-beaded-mega-tote-bag-kj-prs-205",
    "name": "Pearl Beaded Mega Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2299,
    "originalPrice": 2874,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/pawxok02k4hbaajfqsrn.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/pawxok02k4hbaajfqsrn.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Mega Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-208",
    "code": "KJ-PRS-208",
    "slug": "pearl-beaded-mini-pouch-with-flower-charm-kj-prs-208",
    "name": "Pearl Beaded Mini Pouch with Flower Charm",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 649,
    "originalPrice": 811,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/x5qnr4ljub59mjht95s3.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/x5qnr4ljub59mjht95s3.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Mini Pouch with Flower Charm is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-203",
    "code": "KJ-PRS-203",
    "slug": "pearl-beaded-mini-tote-bag-kj-prs-203",
    "name": "Pearl Beaded Mini Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1249,
    "originalPrice": 1561,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/u1vxbtxtxzszom32irmy.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442719/kalajay/catalogue/u1vxbtxtxzszom32irmy.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Mini Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-219",
    "code": "KJ-PRS-219",
    "slug": "pearl-beaded-scoop-tote-bag-kj-prs-219",
    "name": "Pearl Beaded Scoop Tote Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1099,
    "originalPrice": 1374,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442720/kalajay/products/pmuaqm4ykh30mzlgawtn.webp"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442720/kalajay/products/pmuaqm4ykh30mzlgawtn.webp",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Scoop Tote Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-211",
    "code": "KJ-PRS-211",
    "slug": "pearl-beaded-slice-bag-kj-prs-211",
    "name": "Pearl Beaded Slice Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 1999,
    "originalPrice": 2499,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442720/kalajay/catalogue/gvqgsht1leayj1iiki5h.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442720/kalajay/catalogue/gvqgsht1leayj1iiki5h.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Slice Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-PRS-207",
    "code": "KJ-PRS-207",
    "slug": "pearl-beaded-vintage-bag-kj-prs-207",
    "name": "Pearl Beaded Vintage Bag",
    "category": "Purses",
    "categorySlug": "purses",
    "price": 2399,
    "originalPrice": 2999,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/bixagjlzfdxso3ey2tds.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/bixagjlzfdxso3ey2tds.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Vintage Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SLG-303",
    "code": "KJ-SLG-303",
    "slug": "pastel-beaded-sling-bag-kj-slg-303",
    "name": "Pastel Beaded Sling Bag",
    "category": "Slings",
    "categorySlug": "slings",
    "price": 899,
    "originalPrice": 1124,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/k15ukcgezi7t2s9ixrtf.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/k15ukcgezi7t2s9ixrtf.jpg",
    "inStock": true,
    "isBestSeller": true,
    "isFeatured": false,
    "isNewArrival": true,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pastel Beaded Sling Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SLG-305",
    "code": "KJ-SLG-305",
    "slug": "pearl-beaded-sling-bag-kj-slg-305",
    "name": "Pearl Beaded Sling Bag",
    "category": "Slings",
    "categorySlug": "slings",
    "price": 649,
    "originalPrice": 811,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/c4g7u7bikkvprvzodscn.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442721/kalajay/catalogue/c4g7u7bikkvprvzodscn.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Sling Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SLG-304",
    "code": "KJ-SLG-304",
    "slug": "pearl-beaded-textured-sling-bag-kj-slg-304",
    "name": "Pearl Beaded Textured Sling Bag",
    "category": "Slings",
    "categorySlug": "slings",
    "price": 949,
    "originalPrice": 1186,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/ueuy6zmsagytveivkli8.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/ueuy6zmsagytveivkli8.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Pearl Beaded Textured Sling Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  },
  {
    "id": "KJ-SLG-302",
    "code": "KJ-SLG-302",
    "slug": "sunset-ombre-beaded-sling-bag-kj-slg-302",
    "name": "Sunset Ombre Beaded Sling Bag",
    "category": "Slings",
    "categorySlug": "slings",
    "price": 899,
    "originalPrice": 1124,
    "images": [
      "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/pb1ws9kzarikylbsxgm9.jpg"
    ],
    "coverImage": "https://res.cloudinary.com/da6uncyb/image/upload/f_auto,q_auto/v1795442722/kalajay/catalogue/pb1ws9kzarikylbsxgm9.jpg",
    "inStock": true,
    "isBestSeller": false,
    "isFeatured": false,
    "isNewArrival": false,
    "variants": [],
    "materials": [
      "Lustrous Faceted Crystal Beads",
      "Interwoven Steel Thread Core",
      "Magnetic Closure Mechanism",
      "Satin Dust Bag"
    ],
    "dimensions": "21cm (L) × 14cm (H) × 6cm (D) · Strap drop: 52cm",
    "craftHours": "18 to 24 hours of artisan hand-assembly",
    "care": "Gently wipe with a soft microfibre cloth. Store in the complimentary Kalajay canvas pouch away from direct moisture.",
    "description": "The Sunset Ombre Beaded Sling Bag is a testament to the patient art of hand-assembly. Shaped one element at a time by women artisans in our artisanal studios, it pairs radiant beadwork with structural resilience. Every bead is individually counted, tensioned, and anchored to create a tactile surface that catches the light from every angle. Designed to elevate daily rituals, whether showcased on your vanity or carried as an intimate conversation starter."
  }
];

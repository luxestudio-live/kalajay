export interface ProductVariant {
  code: string;
  label: string;
  price: number;
  inStock: boolean;
  image: string;
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
  materials: string[];
  dimensions: string;
  craftHours: string;
  care: string;
  description: string;
}

export interface Collection {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
}

export const BRAND_CONFIG = {
  "name": "Kalajay",
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
    "gst": "27FAAPS2113B1Z6",
    "location": "Mumbai, Maharashtra, India",
    "whatsappUrl": "https://wa.me/919740540847?text=Hi%20Kalajay!%20I%27d%20like%20to%20know%20more%20about%20your%20handcrafted%20pieces."
  },
  "shipping": {
    "freeThreshold": 599,
    "standardRate": 79,
    "turnaround": "Made to order. Dispatched within 3-5 business days across India."
  }
};

export const COLLECTIONS: Collection[] = [
  {
    "name": "Organisers",
    "slug": "organisers",
    "tagline": "Pearl-beaded boxes & trays for jewellery and everyday essentials",
    "description": "Luminous pearl-strung catch-alls, vanity trays, and lidded jewel boxes. Hand-assembled bead by bead with reinforced wire structures to bring poetic order to dressing tables, nightstands, and private craft houses.",
    "image": "https://www.kalajay.in/v2/p3-2.jpg"
  },
  {
    "name": "Purses",
    "slug": "purses",
    "tagline": "Hand-beaded clutches and purses",
    "description": "Sculptural evening clutches and statement handheld purses constructed from faceted crystals and glass seed beads. Fluid yet structural, balancing tactile shimmer with contemporary silhouettes.",
    "image": "https://www.kalajay.in/v2/p6-2.jpg"
  },
  {
    "name": "Slings",
    "slug": "slings",
    "tagline": "Colourful beaded sling bags with long handle straps",
    "description": "Vibrant cross-body and shoulder slings engineered with hand-strung long straps and playful bead palettes. Designed to catch light and turn casual movement into an artful statement.",
    "image": "https://www.kalajay.in/v2/p10-3.jpg"
  },
  {
    "name": "Airpod Cases",
    "slug": "airpod-cases",
    "tagline": "Pearl beaded airpod cases for everyday use",
    "description": "Snug, protective cases hand-beaded with lustrous pearls and crystal accents. Transforming everyday technology into an intimate, jewel-like personal talisman.",
    "image": "https://www.kalajay.in/v2/p12-3.jpg"
  },
  {
    "name": "Coasters & Mats",
    "slug": "coasters-mats",
    "tagline": "Pearl-beaded mats and\u00A0coasters",
    "description": "Intricately woven table mats, runners, and drink coasters. Crafted with dense bead lattices that offer heat resistance, tactile weight, and unforgettable tabletop radiance.",
    "image": "https://www.kalajay.in/v2/p14-5.jpg"
  },
  {
    "name": "Candle Holders",
    "slug": "candle-holders",
    "tagline": "Beaded tealight holders",
    "description": "Atmospheric tealight lanterns woven from prismatic crystal and coloured glass beads that cast dancing shadows across celebratory dinner tables and quiet evening spaces.",
    "image": "https://www.kalajay.in/v2/p16-3.jpg"
  },
  {
    "name": "Key Rings",
    "slug": "key-rings",
    "tagline": "Beaded keyrings and charms",
    "description": "Pocket-sized miniature sculptures: beaded hearts, monograms, and musical notations designed to bring daily joy every time you reach for your keys.",
    "image": "https://www.kalajay.in/v2/p18-4.jpg"
  },
  {
    "name": "Crochet Magic",
    "slug": "crochet-magic",
    "tagline": "Handmade crochet accessories",
    "description": "Spun with fine threads and soft yarns, our crocheted flower charms and delicate bookmarks embody the tenderness of patient needlework and botanical wonder.",
    "image": "https://www.kalajay.in/v2/p19-2.jpg"
  },
  {
    "name": "Little Treasures",
    "slug": "little-treasures",
    "tagline": "One-of-a-kind crystal and beaded showpieces",
    "description": "One-of-a-kind bespoke creations, custom name plaques, crystal bottles, and limited-edition showpieces celebrating the pure joy of artisanal experimentation.",
    "image": "https://www.kalajay.in/v2/p21-2.jpg"
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
      "https://www.kalajay.in/v2/p12-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p12-3.jpg",
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
      "https://www.kalajay.in/v2/p12-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p12-5.jpg",
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
      "https://www.kalajay.in/v2/p12-1.jpg",
      "https://www.kalajay.in/v2/p12-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p12-1.jpg",
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
      "https://www.kalajay.in/v2/p12-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p12-4.jpg",
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
      "https://www.kalajay.in/v2/p12-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p12-2.jpg",
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
      "https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp",
      "https://www.kalajay.in/media/products/b5a1631e32caa509213c367f01c900e7fd34176b190fe6c3a2e45bf42afeb743.webp",
      "https://www.kalajay.in/media/products/0d21af7de7feff822772964f66e9eb948abb612bd31fc2e8ee5e9c9241812e81.webp",
      "https://www.kalajay.in/media/products/d9c7ffc4b20bc8c6eb4386fb68aebb16a067802f6af578097bdb492d79b231b1.webp",
      "https://www.kalajay.in/media/products/11b631b047a84ef9636ad5cae256354490ceef7326514fd03d3a85b73fc105e0.webp",
      "https://www.kalajay.in/media/products/3f866ea2f8366f18dee11feed806f7fe8c885fbfc05c56acbc80beebdb94a24a.webp",
      "https://www.kalajay.in/media/products/692bdad3376130809d40986b4b1c587cddaabfdf6f05316d6b43f68d1e4910b6.webp",
      "https://www.kalajay.in/media/products/37188d910e2da4323d94e36ff02e21dd2973774e6e82144261ea9a4821207a4d.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp",
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
        "image": "https://www.kalajay.in/media/products/b5a1631e32caa509213c367f01c900e7fd34176b190fe6c3a2e45bf42afeb743.webp"
      },
      {
        "code": "KJ-CDL-602-2",
        "label": "Dark Pink",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/0d21af7de7feff822772964f66e9eb948abb612bd31fc2e8ee5e9c9241812e81.webp"
      },
      {
        "code": "KJ-CDL-602-3",
        "label": "Pastel Pink",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/d9c7ffc4b20bc8c6eb4386fb68aebb16a067802f6af578097bdb492d79b231b1.webp"
      },
      {
        "code": "KJ-CDL-602-4",
        "label": "Lavender",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp"
      },
      {
        "code": "KJ-CDL-602-5",
        "label": "Opaque",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/11b631b047a84ef9636ad5cae256354490ceef7326514fd03d3a85b73fc105e0.webp"
      },
      {
        "code": "KJ-CDL-602-6",
        "label": "Mint green",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/3f866ea2f8366f18dee11feed806f7fe8c885fbfc05c56acbc80beebdb94a24a.webp"
      },
      {
        "code": "KJ-CDL-602-7",
        "label": "Aqua Blue",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/692bdad3376130809d40986b4b1c587cddaabfdf6f05316d6b43f68d1e4910b6.webp"
      },
      {
        "code": "KJ-CDL-602-8",
        "label": "Shiny Black",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/37188d910e2da4323d94e36ff02e21dd2973774e6e82144261ea9a4821207a4d.webp"
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
      "https://www.kalajay.in/media/products/f9100df045eb4c3417af2e35fee911331342df90f6c02f30156dd1707e715cad.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/f9100df045eb4c3417af2e35fee911331342df90f6c02f30156dd1707e715cad.webp",
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
      "https://www.kalajay.in/v2/p13-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p13-2.jpg",
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
      "https://www.kalajay.in/v2/kj-mat-513.png"
    ],
    "coverImage": "https://www.kalajay.in/v2/kj-mat-513.png",
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
      "https://www.kalajay.in/v2/p13-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p13-5.jpg",
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
      "https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp",
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
        "image": "https://www.kalajay.in/media/products/c6ba77320bf18d7c8d58f35eb9cecc5b8f79055d2b92fae00d22cfdbc40d3f85.webp"
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
      "https://www.kalajay.in/v2/p15-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p15-2.jpg",
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
      "https://www.kalajay.in/v2/p14-5.jpg",
      "https://www.kalajay.in/media/products/11786fbf057954b5fa08859dcb413f3bb288bf74df7cd8ddc8ce16092b45ed51.webp",
      "https://www.kalajay.in/media/products/57e9a7da96b656b4785051c9fefd53edde9fd9640e99579cb14220e8cb782da4.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p14-5.jpg",
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
        "image": "https://www.kalajay.in/media/products/11786fbf057954b5fa08859dcb413f3bb288bf74df7cd8ddc8ce16092b45ed51.webp"
      },
      {
        "code": "KJ-MAT-508-2",
        "label": "Pink",
        "price": 175,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/57e9a7da96b656b4785051c9fefd53edde9fd9640e99579cb14220e8cb782da4.webp"
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
      "https://www.kalajay.in/v2/p14-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p14-3.jpg",
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
      "https://www.kalajay.in/v2/kj-mat-512.png"
    ],
    "coverImage": "https://www.kalajay.in/v2/kj-mat-512.png",
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
      "https://www.kalajay.in/v2/p13-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p13-4.jpg",
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
      "https://www.kalajay.in/media/products/298ce7d748a167c8f356cf934737ff8f6fca1297c6d450e1ae9f6db309e67711.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/298ce7d748a167c8f356cf934737ff8f6fca1297c6d450e1ae9f6db309e67711.webp",
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
        "image": "https://www.kalajay.in/media/products/298ce7d748a167c8f356cf934737ff8f6fca1297c6d450e1ae9f6db309e67711.webp"
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
      "https://www.kalajay.in/v2/p19-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p19-3.jpg",
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
      "https://www.kalajay.in/v2/x19-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/x19-2.jpg",
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
      "https://www.kalajay.in/v2/p20-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p20-3.jpg",
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
      "https://www.kalajay.in/v2/p20-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p20-2.jpg",
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
      "https://www.kalajay.in/v2/p17-3.jpg",
      "https://www.kalajay.in/media/products/71adb1ab3bc7dd4cb369d041f8dae6a49a8ded6388cc66c32462b76598ffd3c8.webp",
      "https://www.kalajay.in/media/products/8d5e1dcd70ee483163812137111ce6e0755bbc669785696450fc78be94ffa82c.webp",
      "https://www.kalajay.in/media/products/496ea29dd1dc3b8daca3e43c8454c7ec2058373621f65a67567cda5eaaccadcd.webp",
      "https://www.kalajay.in/media/products/7a261788facaca8cbfa2fde64129240247d16332a5c1bd6e0e45a551e46eaf36.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p17-3.jpg",
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
        "image": "https://www.kalajay.in/media/products/71adb1ab3bc7dd4cb369d041f8dae6a49a8ded6388cc66c32462b76598ffd3c8.webp"
      },
      {
        "code": "KJ-KEY-701-2",
        "label": "Cobalt Blue",
        "price": 199,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/8d5e1dcd70ee483163812137111ce6e0755bbc669785696450fc78be94ffa82c.webp"
      },
      {
        "code": "KJ-KEY-701-3",
        "label": "Mixed Pastel",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/496ea29dd1dc3b8daca3e43c8454c7ec2058373621f65a67567cda5eaaccadcd.webp"
      },
      {
        "code": "KJ-KEY-701-4",
        "label": "Peach",
        "price": 249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/7a261788facaca8cbfa2fde64129240247d16332a5c1bd6e0e45a551e46eaf36.webp"
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
      "https://www.kalajay.in/v2/p18-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p18-4.jpg",
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
      "https://www.kalajay.in/v2/p18-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p18-3.jpg",
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
      "https://www.kalajay.in/v2/p17-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p17-2.jpg",
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
      "https://www.kalajay.in/v2/p17-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p17-5.jpg",
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
      "https://www.kalajay.in/v2/p17-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p17-4.jpg",
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
      "https://www.kalajay.in/v2/p21-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p21-2.jpg",
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
      "https://www.kalajay.in/v2/p21-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p21-4.jpg",
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
      "https://www.kalajay.in/v2/p21-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p21-3.jpg",
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
      "https://www.kalajay.in/v2/p4-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p4-3.jpg",
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
      "https://www.kalajay.in/v2/p4-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p4-4.jpg",
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
      "https://www.kalajay.in/v2/p5-3b.png",
      "https://www.kalajay.in/media/products/0b171bb3e679ef491e7dd7bcf9835cb7f0c9f6afd8941d636a9ff2859c36159d.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p5-3b.png",
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
        "image": "https://www.kalajay.in/media/products/0b171bb3e679ef491e7dd7bcf9835cb7f0c9f6afd8941d636a9ff2859c36159d.webp"
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
      "https://www.kalajay.in/v2/p5-3a.png",
      "https://www.kalajay.in/media/products/c6f1a7cb4c3b94d914f74243f43d2242eef62330c0ef48e51521e009211664cb.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p5-3a.png",
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
        "image": "https://www.kalajay.in/media/products/c6f1a7cb4c3b94d914f74243f43d2242eef62330c0ef48e51521e009211664cb.webp"
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
      "https://www.kalajay.in/v2/p5-2.jpg",
      "https://www.kalajay.in/media/products/01420a416db370ce5c995a6372b0229e4eb66657f6c53a1602a1183d71ed0263.webp",
      "https://www.kalajay.in/media/products/9478137febb4d125b0ccca4f0480b7ef10eeeedba6625be6dd9ea04762564af0.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p5-2.jpg",
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
        "image": "https://www.kalajay.in/media/products/01420a416db370ce5c995a6372b0229e4eb66657f6c53a1602a1183d71ed0263.webp"
      },
      {
        "code": "KJ-ORG-109-2",
        "label": "Lavender",
        "price": 799,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/9478137febb4d125b0ccca4f0480b7ef10eeeedba6625be6dd9ea04762564af0.webp"
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
      "https://www.kalajay.in/v2/p5-4.png",
      "https://www.kalajay.in/media/products/0f9648dace54610730e26226a9a2936e849adbf2858d86d1b40ef583421dcb63.webp",
      "https://www.kalajay.in/media/products/d4360190076124ebd044502564d158a52de401c4f128b51b9ef69726ef12188b.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p5-4.png",
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
        "image": "https://www.kalajay.in/media/products/0f9648dace54610730e26226a9a2936e849adbf2858d86d1b40ef583421dcb63.webp"
      },
      {
        "code": "KJ-ORG-112-2",
        "label": "Blue",
        "price": 499,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/d4360190076124ebd044502564d158a52de401c4f128b51b9ef69726ef12188b.webp"
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
      "https://www.kalajay.in/v2/p4-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p4-5.jpg",
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
      "https://www.kalajay.in/v2/p3-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p3-2.jpg",
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
      "https://www.kalajay.in/media/products/b1bae023973762e04b7bd33024aec63f9ee9b6d6d97aac39f51a0a78d9c4df1b.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/b1bae023973762e04b7bd33024aec63f9ee9b6d6d97aac39f51a0a78d9c4df1b.webp",
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
      "https://www.kalajay.in/v2/p4-2.jpg",
      "https://www.kalajay.in/media/products/836fa543a8e12245ab83adc23211568e0ed18b42e97ca17b3baff46b60dc8fe6.webp",
      "https://www.kalajay.in/media/products/bca1096710fddd239f46efa101f91047996d0dfec30d18b586cb97314db1717e.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p4-2.jpg",
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
        "image": "https://www.kalajay.in/media/products/836fa543a8e12245ab83adc23211568e0ed18b42e97ca17b3baff46b60dc8fe6.webp"
      },
      {
        "code": "KJ-ORG-105-2",
        "label": "White Square",
        "price": 449,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/bca1096710fddd239f46efa101f91047996d0dfec30d18b586cb97314db1717e.webp"
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
      "https://www.kalajay.in/v2/p3-3.jpg",
      "https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp",
      "https://www.kalajay.in/media/products/92dcd604091320e757566c4c6f2c127ac6abe66bd468a4e088f66e10d4073892.webp",
      "https://www.kalajay.in/media/products/806d64b4c75cf4c44339359479eed5193f59921bf942a4c7e26d1e2db5be8dfd.webp",
      "https://www.kalajay.in/media/products/16592885ffc8aeaa87efb24e2088faf6a4d9f853e4e96477e591ab0a0be1beb1.webp",
      "https://www.kalajay.in/media/products/c17115c495b65d7dfbe7ba7dc8597223cc08b02acd29d54494930fda8cb25f5b.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p3-3.jpg",
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
        "image": "https://www.kalajay.in/media/products/82de6afd08ff448280211f0bfcc8dde73ecbfa427b97749596ad38de44c9d763.webp"
      },
      {
        "code": "KJ-ORG-102-2",
        "label": "White Round",
        "price": 549,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/92dcd604091320e757566c4c6f2c127ac6abe66bd468a4e088f66e10d4073892.webp"
      },
      {
        "code": "KJ-ORG-102-3",
        "label": "Colourful Round",
        "price": 599,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/806d64b4c75cf4c44339359479eed5193f59921bf942a4c7e26d1e2db5be8dfd.webp"
      },
      {
        "code": "KJ-ORG-102-4",
        "label": "Colourful Square",
        "price": 599,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/16592885ffc8aeaa87efb24e2088faf6a4d9f853e4e96477e591ab0a0be1beb1.webp"
      },
      {
        "code": "KJ-ORG-102-5",
        "label": "Crystal Black",
        "price": 599,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/c17115c495b65d7dfbe7ba7dc8597223cc08b02acd29d54494930fda8cb25f5b.webp"
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
      "https://www.kalajay.in/v2/p3-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p3-4.jpg",
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
      "https://www.kalajay.in/v2/p3-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p3-5.jpg",
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
      "https://www.kalajay.in/v2/p9-4.jpg",
      "https://www.kalajay.in/media/products/b9ea88960b80aefd3d8f30fb17d02c08bac01b5a2e57d88c2e8d72439219a5d4.webp",
      "https://www.kalajay.in/media/products/a87cc12c74f0b50dd89773b3bd05004366cc45b40e34782fddfd7fbaf48987af.webp",
      "https://www.kalajay.in/media/products/5e321e4b7b2a0635b210b2e16318b0fe855084cafe3a44611b1a134d449a6e6f.webp"
    ],
    "coverImage": "https://www.kalajay.in/v2/p9-4.jpg",
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
        "image": "https://www.kalajay.in/media/products/b9ea88960b80aefd3d8f30fb17d02c08bac01b5a2e57d88c2e8d72439219a5d4.webp"
      },
      {
        "code": "KJ-PRS-215-2",
        "label": "Lemon Yellow",
        "price": 1099,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/a87cc12c74f0b50dd89773b3bd05004366cc45b40e34782fddfd7fbaf48987af.webp"
      },
      {
        "code": "KJ-PRS-215-3",
        "label": "Lavender",
        "price": 1199,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/5e321e4b7b2a0635b210b2e16318b0fe855084cafe3a44611b1a134d449a6e6f.webp"
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
      "https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/b57e3efd6e2f7c2f0bcac6be9aaf5e1b506ff561e72739f1c3041d6fbf4afe8b.webp",
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
      "https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp",
      "https://www.kalajay.in/media/products/f5676a19cc07260c89a670f51fd169b552be69099e606a67a71f59c33f63d803.webp",
      "https://www.kalajay.in/media/products/8f02ff4080c089d140aa0dbcb18f2f47eca367e3fa83af361826d4b0d25d44a2.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp",
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
        "image": "https://www.kalajay.in/media/products/07d7dce169019ce6e08e80a9d10984dc7edcc0b529f69738b5c51fb2b43e0e5a.webp"
      },
      {
        "code": "KJ-PRS-222-2",
        "label": "Blue & White",
        "price": 1249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/f5676a19cc07260c89a670f51fd169b552be69099e606a67a71f59c33f63d803.webp"
      },
      {
        "code": "KJ-PRS-222-3",
        "label": "Iridescent Black",
        "price": 1249,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/8f02ff4080c089d140aa0dbcb18f2f47eca367e3fa83af361826d4b0d25d44a2.webp"
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
      "https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp",
      "https://www.kalajay.in/media/products/d7c3b6f4f28058c25b9ec7d872916ee02a797351b1d862c9b39ff88d7335d105.webp",
      "https://www.kalajay.in/media/products/9021e2609bc626d28db4ce0c463bc1e2a306b1727641267f9dc6b3b5c544b57f.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp",
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
        "image": "https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp"
      },
      {
        "code": "KJ-PRS-217-2",
        "label": "Green and Orange Floral",
        "price": 949,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/d7c3b6f4f28058c25b9ec7d872916ee02a797351b1d862c9b39ff88d7335d105.webp"
      },
      {
        "code": "KJ-PRS-217-3",
        "label": "Pastel green",
        "price": 949,
        "inStock": true,
        "image": "https://www.kalajay.in/media/products/9021e2609bc626d28db4ce0c463bc1e2a306b1727641267f9dc6b3b5c544b57f.webp"
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
      "https://www.kalajay.in/v2/p6-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p6-3.jpg",
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
      "https://www.kalajay.in/media/products/f0c5032d0b82d3644610122d138a5c9619c7892cbc870232a52482d78e0c0722.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/f0c5032d0b82d3644610122d138a5c9619c7892cbc870232a52482d78e0c0722.webp",
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
      "https://www.kalajay.in/media/products/dae8ab3a1f602e5d9903cc2219b46912e6085619bfd22a923443604120728fa9.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/dae8ab3a1f602e5d9903cc2219b46912e6085619bfd22a923443604120728fa9.webp",
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
      "https://www.kalajay.in/v2/p9-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p9-3.jpg",
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
      "https://www.kalajay.in/media/products/027823f3c22440caddc7ea75b5b47e1dde5e3c9c5b1db0f1d1d9a1e7e910eb2e.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/027823f3c22440caddc7ea75b5b47e1dde5e3c9c5b1db0f1d1d9a1e7e910eb2e.webp",
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
      "https://www.kalajay.in/v2/p6-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p6-2.jpg",
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
      "https://www.kalajay.in/v2/p8-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p8-5.jpg",
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
      "https://www.kalajay.in/v2/p8-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p8-2.jpg",
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
      "https://www.kalajay.in/v2/p9-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p9-2.jpg",
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
      "https://www.kalajay.in/v2/p7-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p7-3.jpg",
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
      "https://www.kalajay.in/v2/p6-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p6-5.jpg",
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
      "https://www.kalajay.in/v2/p8-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p8-3.jpg",
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
      "https://www.kalajay.in/v2/p7-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p7-2.jpg",
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
      "https://www.kalajay.in/v2/p7-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p7-5.jpg",
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
      "https://www.kalajay.in/v2/p6-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p6-4.jpg",
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
      "https://www.kalajay.in/media/products/afc6784546d51f2ce43375e908073d3049c859d263153eac198acd0a25efb451.webp"
    ],
    "coverImage": "https://www.kalajay.in/media/products/afc6784546d51f2ce43375e908073d3049c859d263153eac198acd0a25efb451.webp",
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
      "https://www.kalajay.in/v2/p8-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p8-4.jpg",
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
      "https://www.kalajay.in/v2/p7-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p7-4.jpg",
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
      "https://www.kalajay.in/v2/p10-4.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p10-4.jpg",
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
      "https://www.kalajay.in/v2/p11-2.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p11-2.jpg",
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
      "https://www.kalajay.in/v2/p10-5.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p10-5.jpg",
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
      "https://www.kalajay.in/v2/p10-3.jpg"
    ],
    "coverImage": "https://www.kalajay.in/v2/p10-3.jpg",
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

# KALAJAY — A World of Little Wonders
## Bespoke Luxury E-Commerce Flagship
**Original Creative Direction & Frontend Architecture by LuxeStudio**  
**Live Benchmark:** [kalajay.in](https://www.kalajay.in/)

---

## 1. Executive Summary & Brand Philosophy

Kalajay is an artisanal Indian luxury brand handcrafting 100% hand-strung beaded vanity boxes, evening totes, coin pouches, tealight lanterns, charms, and desk organisers. Powered by an independent sisterhood of **21 master women artisans** across **Bihar** (loom weaving and structural knotting) and **Mumbai** (curation, velvet finishing, and wax-sealed dispatch).

### The Brand Triad
> *"A single bead. A strand of yarn. Something beautiful."*
- **Handcrafted**: 100% hand-strung with high-tension 0.45mm stainless core wire; zero machine assembly lines.
- **Pretty**: Refined celebration of soft blush tones, light-splitting Czech crystals, and luminous faux pearls.
- **You**: Made-to-order intimacy for morning dressing rituals, evening dinner companions, bespoke wedding favours, and corporate gifting.

---

## 2. Design System & Tokens

Defined in [`src/data/tokens.ts`](src/data/tokens.ts) and integrated directly into `tailwind.config.js` and `src/app/globals.css`.

### The Luxury Color Palette
No pure digital white (`#FFFFFF`) and no harsh pure black (`#000000`).

| Token | Hex | Role | Contrast Ratio on Canvas |
|---|---|---|---|
| `canvas` (Pearl Ivory) | `#FBF7F2` | Primary background canvas | Base |
| `canvas-subtle` | `#F5EFE6` | Soft secondary card surface | Base tint |
| `blush` | `#F3D9D6` | Romantic secondary tint & badge fills | Accent tint |
| `rosewood` | `#8C3B4A` | Primary luxury emotional accent | 4.9:1 (WCAG AA compliant) |
| `antiqueGold` | `#B8924A` | Hairline dividers, bead motifs & wax seals | Subtle metallic accent |
| `plum` (Deep Plum Ink) | `#2B1A22` | Primary typography & high-contrast surfaces | 12.8:1 (AAA compliant) |
| `ink.muted` | `#524357` | Subheaders, descriptions, meta text | 7.9:1 (AAA compliant) |
| `ink.light` | `#5E4D63` | Caption text & secondary indicators | 6.6:1 (AA compliant) |

### Typography Hierarchy
- **Display Serif**: `Cormorant Garamond` / `Fraunces` (`font-serif`) — Used for editorial headings, chapter titles, price numbers, and pull quotes. Fluid scaling via `clamp()`.
- **Primary Sans**: `Plus Jakarta Sans` / `Inter` (`font-sans`) — Clean, modern sans for UI labels, metadata, buttons, filter chips, and form controls.
- **Accent Script**: `Caveat` (`font-script`) — Warm handwritten notes, maker signatures, and nuance stamps.
- **Letter Spacing**:
  - `tracking-monumental` (`0.22em`): Small uppercase category kickers and chapter markers.
  - `tracking-editorial` (`0.10em`): Action buttons, navigation links, and badge labels.
  - `tracking-refined` (`0.04em`): Secondary metadata and timestamps.

### Radii & Elevation
- **Image Radii**: `rounded-[28px]` or `rounded-[32px]` (`--radius-image`). Generous luxury curvature per creative direction; never sharp boxy corners or bubbly pill-shaped cards.
- **Card Surfaces**: 1px subtle gold/champagne hairline borders (`border-[#E8DFD3]` or `border-gold/30`), paper-grain ambient overlay, and soft diffused elevation shadows.

---

## 3. Motion System & Signature Elements

The motion system is built on **Lenis** (virtual smooth scrolling) and **GSAP 3.12** (`ScrollTrigger`, `matchMedia`).

### 1. Lenis Smooth Scroll Engine
- Paced smooth scroll with virtual inertia interpolation (`lerp: 0.1`, `smoothWheel: true`).
- GSAP ticker synchronization: `lenis.on('scroll', ScrollTrigger.update)` and `gsap.ticker.add((time) => lenis.raf(time * 1000))`.
- Automatic bypass on low-end devices and full support for native touch gestures on mobile.

### 2. Signature Element: The Thread (`TheThread.tsx`)
- One continuous, subtle SVG thread (`stroke-dashoffset`) scrubbed down the page by ScrollTrigger.
- Desktop: Weaves gracefully between alternating left/right layout columns.
- Mobile: Runs as an elegant, non-intrusive 1px vertical hairline along the left viewport edge.
- Milestones: Small gold bead shapes settle onto the thread at section transitions.

### 3. Custom Desktop Cursor (`CustomCursor.tsx`)
- Desktop-only custom cursor styled like a glowing pearlescent bead with smooth lerp tracking.
- Expands to an editorial 64px "VIEW" capsule with backdrop-blur over clickable product cards.
- Hides automatically on mouse-leave, touch devices, and input fields.

### 4. Pinned Hero Cover (`HeroCover.tsx`)
- Multi-phase pinned choreography (~200vh scroll budget).
- Line-by-line masked reveal of display typography.
- Three drifting hero creations (Pearl Tote, Vanity Box, Crystal Clutch) that float apart on scroll before transitioning into Chapter II.

### 5. Accessibility & Reduced Motion
- Uses `window.matchMedia('(prefers-reduced-motion: reduce)')` to automatically disable scrubbed transforms and instant-render static layouts for users with vestibular sensitivities.
- All animation durations adhere to strict luxury timing bounds:
  - Micro-interactions: `0.25s – 0.35s` (`power2.out`).
  - Section reveals: `0.7s – 1.1s` (`power3.out`).
  - Page wipe curtain: `<0.55s` (`expo.inOut`).

---

## 4. How to Add New Products

Kalajay's product catalogue is strictly typed in [`src/data/catalogue.ts`](src/data/catalogue.ts). No database or external CMS is required.

### Product Data Schema
```typescript
export interface Product {
  id: string;               // Unique ID, e.g. "kj-070"
  code: string;             // SKU code, e.g. "KJ-BOX-LUM"
  slug: string;             // URL slug, e.g. "luminous-crystal-vanity-box"
  name: string;             // Full display title
  category: string;         // "Jewellery Boxes", "Bags & Totes", "Charms", etc.
  categorySlug: string;     // URL slug for filter, e.g. "jewellery-boxes"
  price: number;            // Current selling price in INR (e.g. 1199)
  originalPrice: number;    // Strike-through MSRP (e.g. 1499)
  images: string[];         // High-res photo URLs (minimum 2 for hover swap)
  coverImage: string;       // Primary cover image
  inStock: boolean;         // Inventory flag
  isBestSeller: boolean;    // Surfaces in homepage horizontal rail
  isFeatured: boolean;      // Surfaces in hero & curated spots
  isNewArrival: boolean;    // Renders "New" pill
  variants: ProductVariant[]; // Colorways/sizes (minimum 1 default variant)
  materials: string[];      // e.g. ["Czech Crystal Beads", "High-Tension Wire"]
  dimensions: string;       // e.g. "12cm x 9cm x 8cm"
  craftHours: string;       // e.g. "14 hours hand-weaving"
  care: string;             // Maintenance instructions
  description: string;      // Editorial description
}
```

### Steps to Add a New Item:
1. Open [`src/data/catalogue.ts`](src/data/catalogue.ts).
2. Append your new product object to the `PRODUCTS` array following the interface above.
3. Ensure at least two high-resolution images are supplied in `images: [...]` to enable the interactive card hover swap.
4. Save the file. Next.js App Router will automatically generate the static route at `/products/[slug]` on next build or instantaneous fast-refresh in development.

---

## 5. Development & Production Runbook

### Prerequisites
- Node.js `18.x` or higher
- npm `9.x` or higher

### Install Dependencies
```bash
npm install
```

### Run Local Development Server
```bash
npm run dev
```
The site will be live at `http://localhost:3000`.

### Production Build & Verification
```bash
npm run build
npm run start
```
Runs the compiled standalone production server at `http://localhost:3000`.

---

## 6. Project Architecture Overview

```
kalajay-v2/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with fonts, metadata, and AppShell
│   │   ├── page.tsx                   # Homepage (8 choreographed editorial chapters)
│   │   ├── shop/page.tsx              # Shop catalogue with slide-over drawer & swatches
│   │   ├── products/[slug]/page.tsx   # Product detail page with gallery & WhatsApp action
│   │   ├── gifting/page.tsx           # Bespoke Gifting & Interactive Hamper Builder
│   │   ├── story/page.tsx             # Brand Chronicle, Sisterhood of 21, Bihar-Mumbai route
│   │   ├── shipping-returns/page.tsx  # 48-hour transit guarantee & 1-click WhatsApp return
│   │   ├── globals.css                # Custom CSS, hairlines, grain, Lenis styles
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx           # Global shell coordinating Lenis, cursor & curtains
│   │   │   ├── Navbar.tsx             # Collapsing announcement marquee & sticky luxury nav
│   │   │   ├── Footer.tsx             # Bespoke newsletter, GST info, maker route & links
│   │   │   └── CartDrawer.tsx         # Slide-over cart drawer with threshold calculator
│   │   ├── home/
│   │   │   ├── HeroCover.tsx          # Pinned 200vh hero with 3 drifting pieces
│   │   │   ├── Manifesto.tsx          # Scrubbed word-by-word display sentence
│   │   │   ├── BestSellersRail.tsx    # Horizontal swipe/pin rail with quick-add
│   │   │   ├── ProcessStepScroll.tsx  # Pinned 4-step artisan morphing sequence
│   │   │   ├── PrettyLittleCollection.tsx # Asymmetrical editorial staggered grid
│   │   │   ├── GiftingTeaser.tsx      # Stacking cards with volume tier breakdown
│   │   │   ├── MakersRoute.tsx        # Animated Bihar-to-Mumbai route line & stats
│   │   │   └── SocialAndReviews.tsx   # Verified buyer testimonials & Instagram strip
│   │   ├── motion/
│   │   │   ├── SmoothScroll.tsx       # Lenis virtual scroll synchronized with GSAP
│   │   │   └── TheThread.tsx          # Scrubbed continuous SVG signature line
│   │   ├── ui/
│   │   │   ├── CustomCursor.tsx       # Desktop pearlescent bead cursor with "VIEW" mode
│   │   │   ├── Preloader.tsx          # Wordmark draw-in animation (session-cached)
│   │   │   └── PageTransitionCurtain.tsx # Soft blush wipe on navigation
│   ├── context/
│   │   └── CartContext.tsx            # Persistent client cart in localStorage
│   ├── data/
│   │   ├── tokens.ts                  # Design system tokens single source of truth
│   │   └── catalogue.ts               # Typed 69-item authentic Kalajay product database
│   └── hooks/
│       └── useMotion.ts               # Reusable GSAP reveal, parallax, and reduced-motion hooks
├── PHOTOGRAPHY_BRIEF.md               # Luxury art-direction photography guide
└── README.md                          # Project documentation
```

---

## 7. Quality & Compliance Checklist
- [x] **WCAG AA Compliance**: All body text contrasts >4.5:1; secondary captions >6.6:1 (`#5E4D63` on `#FBF7F2`); high-contrast deep plum ink >12.8:1.
- [x] **Touch Targets**: All mobile buttons, swatch chips, and cart controls meet the `min-w-[44px] min-h-[44px]` touch target guideline.
- [x] **Keyboard Navigation**: Skip links, visible focus rings (`focus-visible:ring-2 focus-visible:ring-gold`), and ESC key handling on drawers.
- [x] **No Digital Artifacts**: Smooth Lenis scroll without jitter; hardware-accelerated transforms; responsive across 320px to 2560px.


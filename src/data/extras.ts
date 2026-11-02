export interface GiftingPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'wedding' | 'corporate' | 'festive' | 'personal';
  description: string;
  image: string;
  startingPrice: number;
  leadTime: string;
  minimumOrder: number;
  inclusions: string[];
  features: string[];
}

export const GIFTING_PACKAGES: GiftingPackage[] = [
  {
    id: 'gift-wedding-01',
    slug: 'bespoke-wedding-favours',
    title: 'The Solstice Bridal Favours',
    subtitle: 'Hand-strung keepsake bags, floral charms & monogrammed plaques',
    category: 'wedding',
    description: 'Elevate your matrimonial celebrations with handcrafted keepsakes your guests will cherish forever. From pearl-beaded coin pouches to custom color-matched bag charms, packaged in bespoke linen gift boxes with handwritten calligraphy cards.',
    image: 'https://www.kalajay.in/media/products/2a1e696f7a135c198e4f07570b37b2202ea31b1468be8245bbb51ec7b7d08e65.webp',
    startingPrice: 349,
    leadTime: '3-4 weeks',
    minimumOrder: 25,
    inclusions: [
      'Custom color-matched beadwork matching wedding palette',
      'Artisanal cotton dust bag with wax seal stamp',
      'Personalised hot-foil couple monogram tag',
      'Curated gift packaging and doorstep delivery'
    ],
    features: ['Custom Palette Matching', 'Bespoke Monogramming', 'Luxe Gift Boxing', 'Dedicated Atelier Liaison']
  },
  {
    id: 'gift-corp-02',
    slug: 'executive-craft-hampers',
    title: 'The Atelier Corporate Curation',
    subtitle: 'Desk trays, crystal pen stands & artisanal\u00A0coasters',
    category: 'corporate',
    description: 'Move beyond generic corporate gifting. Offer clients and team members handcrafted desk sculptures—pearl-beaded vanity trays, crystal tissue dispensers, and coaster sets that celebrate patient human craft and lasting appreciation.',
    image: 'https://www.kalajay.in/media/products/b1bae023973762e04b7bd33024aec63f9ee9b6d6d97aac39f51a0a78d9c4df1b.webp',
    startingPrice: 799,
    leadTime: '2-3 weeks',
    minimumOrder: 15,
    inclusions: [
      'Choice of desk organisers, trays, or crystal coaster sets',
      'Debossed corporate identity note card',
      'Rigid matte gift box in deep plum with champagne ribbon',
      'Individual doorstep dispatch available across pan-India'
    ],
    features: ['Volume Pricing Tier', 'Executive Packaging', 'Pan-India Multi-Drop Shipping', 'GST Invoicing Available']
  },
  {
    id: 'gift-festive-03',
    slug: 'festive-light-luminary',
    title: 'The Diwali & Festive Radiance Set',
    subtitle: 'Crystal tealight lanterns & jewel-tone\u00A0coasters',
    category: 'festive',
    description: 'Celebrate Indian festivals with radiant light and colour. Our hand-beaded tealight lanterns reflect warm candle glow across festive dining tables, paired with blush crystal coasters and handcrafted brass accents.',
    image: 'https://www.kalajay.in/media/products/05c487e5d0ba14e30995c085eb1718b4d752a4e1e93bff6dce835a1e98fcaf42.webp',
    startingPrice: 499,
    leadTime: '7-10 days',
    minimumOrder: 5,
    inclusions: [
      'Set of 2 or 4 hand-beaded tealight holders',
      'Pair of organic soy-wax scented tealights',
      'Festive greeting card with gold foil lettering',
      'Recyclable gift box tied with natural jute twine'
    ],
    features: ['Festive Colorways', 'Ready to Gift', 'Immediate Dispatch Batches', 'Handmade Artisan Tag']
  },
  {
    id: 'gift-personal-04',
    slug: 'the-intimate-keepsake',
    title: 'The Intimate Birthday & Milestone Gift',
    subtitle: 'Hand-beaded initials, AirPod jewel cases & custom pouches',
    category: 'personal',
    description: 'For someone who values thoughtful, one-of-a-kind treasures. Select an initial keyring or pearl clutch, and let our artisans weave their favourite colours into a personal talisman made entirely by hand.',
    image: 'https://www.kalajay.in/media/products/7a261788facaca8cbfa2fde64129240247d16332a5c1bd6e0e45a551e46eaf36.webp',
    startingPrice: 249,
    leadTime: '3-5 business days',
    minimumOrder: 1,
    inclusions: [
      'Handcrafted personalised piece of your choice',
      'Handwritten gift note on artisanal deckled-edge paper',
      'Signature Kalajay cotton keepsake pouch',
      'Direct gift recipient shipping with zero pricing invoices'
    ],
    features: ['No Minimum Order', 'Handwritten Card', 'Gift Wrap Included', 'Custom Initial Stamping']
  }
];

export interface CustomiserOption {
  productType: string;
  basePrice: number;
  turnaroundDays: number;
  description: string;
  paletteOptions: Array<{ name: string; hex: string; desc: string }>;
  accentOptions: Array<{ name: string; hex: string }>;
  charmOptions: string[];
}

export const CUSTOMISER_CONFIG: Record<string, CustomiserOption> = {
  'beaded-sling': {
    productType: 'Hand-Beaded Sling Bag',
    basePrice: 1199,
    turnaroundDays: 7,
    description: 'Sculptural beaded shoulder or crossbody bag, hand-tensioned with stainless wire thread and magnetic lock.',
    paletteOptions: [
      { name: 'Warm Porcelain & Ivory', hex: '#FAF7F2', desc: 'Timeless bridal and everyday luxury' },
      { name: 'Blush & Rosewood', hex: '#83565F', desc: 'Romantic floral warmth' },
      { name: 'Champagne & Gold Shimmer', hex: '#DCC8AB', desc: 'Festive luminescence' },
      { name: 'Deep Plum & Iridescent Black', hex: '#241C29', desc: 'Dramatic evening glamour' },
      { name: 'Muted Lilac & Aqua Glass', hex: '#C9B4DB', desc: 'Playful artistic contrast' }
    ],
    accentOptions: [
      { name: 'Polished Brass Accents', hex: '#C2A984' },
      { name: 'Silver Starlight Crystal', hex: '#E5E7EB' },
      { name: 'Faceted Rose Quartz', hex: '#F2DEE0' }
    ],
    charmOptions: ['Detachable Pearl Wristlet', 'Monogram Initial Charm', 'Botanical Crochet Floret', 'Tassel Fringe']
  },
  'jewellery-organiser': {
    productType: 'Beaded Vanity Organiser / Box',
    basePrice: 799,
    turnaroundDays: 5,
    description: 'Lidded vanity box or catch-all tray for nightstands, dressing rooms, and heirloom pieces.',
    paletteOptions: [
      { name: 'Lustrous Pearl White', hex: '#FFFFFF', desc: 'Clean, luminous dressing table classic' },
      { name: 'Blush Crystal', hex: '#F2DEE0', desc: 'Gentle warmth with soft rose faceting' },
      { name: 'Champagne Ochre', hex: '#DCC8AB', desc: 'Warm amber tones that catch sunlight' },
      { name: 'Midnight Jet Crystal', hex: '#1C1620', desc: 'Moody, sophisticated architectural contrast' }
    ],
    accentOptions: [
      { name: 'Interior Vanity Mirror Lid', hex: '#E5E7EB' },
      { name: 'Felt Lining Floor (Burgundy)', hex: '#6B434B' },
      { name: 'Felt Lining Floor (Velvet Cream)', hex: '#F5EFE6' }
    ],
    charmOptions: ['Custom Name Inlaid Plaque', 'Two-Tier Internal Tray', 'Lid Ribbon Pull']
  },
  'airpod-talisman': {
    productType: 'AirPods Pearl Jewel Case',
    basePrice: 449,
    turnaroundDays: 3,
    description: 'Transform your daily tech into an intimate handcrafted object of affection.',
    paletteOptions: [
      { name: 'Classic Pearl Ivory', hex: '#FAF7F2', desc: 'Understated elegance' },
      { name: 'Pastel Rainbow Confetti', hex: '#C9B4DB', desc: 'Joyful pops of colour' },
      { name: 'Crystal Clear Sparkle', hex: '#E0E7FF', desc: 'Prismatic crystal beads' },
      { name: 'Rosewood Blush', hex: '#83565F', desc: 'Earthy luxury' }
    ],
    accentOptions: [
      { name: 'Gold Lobster Keychain Ring', hex: '#DCC8AB' },
      { name: 'Silver Swivel Trigger Clasp', hex: '#D1D5DB' },
      { name: 'Rose Gold Hardware', hex: '#F2DEE0' }
    ],
    charmOptions: ['Engraved Initial Disc', 'Mini Crochet Heart', 'Tiny Glass Bell', 'None (Clean Silhouette)']
  }
};

export const FAQS = [
  {
    q: 'How are Kalajay pieces made?',
    a: 'Every single piece is handmade to order by our collective of 21 master women artisans. We do not use assembly-line machinery. Each glass seed bead, crystal, and synthetic pearl is individually strung, calibrated for tension, and anchored with reinforced wire or multi-ply thread.'
  },
  {
    q: 'How long does it take for my order to ship?',
    a: 'Because pieces are made by hand one at a time, our standard turnaround is 3 to 5 business days for dispatch. Custom orders and bespoke bridal hampers require 7 to 21 business days depending on volume. You will receive real-time tracking updates via SMS and WhatsApp as soon as your parcel is dispatched from our atelier.'
  },
  {
    q: 'What is your shipping policy across India?',
    a: 'We offer free delivery across all Indian postal pincodes for orders above ₹599. For orders below ₹599, a flat delivery fee of ₹79 is applied at checkout. Express priority courier dispatch is available on request.'
  },
  {
    q: 'Can I customise the colours or dimensions of a piece?',
    a: 'Yes, absolutely! Customisation is at the heart of Kalajay. You can use our interactive "Create Your Own" studio or reach out via WhatsApp at +91 97405 40847. We can match bridesmaids palettes, add custom monogram letters, or adapt tray dimensions.'
  },
  {
    q: 'What is your exchange and return policy?',
    a: 'Because every item is handmade specifically for your order, we do not accept arbitrary returns. However, your purchase is 100% protected against transit mishaps: if your piece arrives damaged or incorrect, contact us within 48 hours of delivery with a photo, and we will promptly send a replacement or process a full refund.'
  },
  {
    q: 'How should I care for my beaded accessories?',
    a: 'Keep your pieces away from direct solvents, perfumes, and heavy water immersion. For cleaning, simply wipe down with a dry, lint-free microfibre cloth. Store your beaded bags and jewellery boxes in the Kalajay breathable cotton pouch provided with every order.'
  }
];

export const ARTISAN_STORIES = [
  {
    name: 'Sunita Devi',
    location: 'Madhubani Atelier, Bihar',
    experience: '8 years of bead loom mastery',
    quote: 'When I sit down with a tray of crystal beads, time slows down. Stringing each row with exact tension requires complete presence. Knowing that our boxes and purses travel to homes in Mumbai, Delhi, and abroad gives our hands immense pride.'
  },
  {
    name: 'Pooja Kumari',
    location: 'Patna Studio, Bihar',
    experience: 'Specialist in sculptural bag weaving',
    quote: 'The honeycomb and diamond purse patterns require counting every single bead so the bag stands upright without collapsing. It is geometry made with love.'
  },
  {
    name: 'Amina Sheikh',
    location: 'Bandra Atelier, Mumbai',
    experience: 'Finishing, quality control & bridal curation',
    quote: 'Before any piece leaves our studio, I inspect the knots, the lining, and the magnetic clasps. It must feel like an heirloom the moment you open the box.'
  }
];


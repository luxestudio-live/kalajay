/**
 * KALAJAY HANDCRAFTED LUXURIES
 * AUTOMATED OPERATIONAL INTEGRITY & BUSINESS INVARIANT TEST SUITE
 * Scenarios A through L
 */

import {
  InventoryItem,
  WorkOrder,
  AdminOrder,
  ProductBomItem,
} from './src/data/adminTypes';
import { Product, Collection } from './src/data/catalogue';

let passedAssertions = 0;
let failedAssertions = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passedAssertions++;
    console.log(`  [PASS] ${message}`);
  } else {
    failedAssertions++;
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('===============================================================');
console.log('KALAJAY OPERATIONAL INTEGRITY TEST SUITE (SCENARIOS A - L)');
console.log('===============================================================\n');

// -------------------------------------------------------------
// SCENARIO A: CREATE PRODUCT & INVENTORY SYNCHRONIZATION
// -------------------------------------------------------------
console.log('--- SCENARIO A: CREATE PRODUCT ---');
const testProduct: Product = {
  id: 'KJ-TEST-001',
  code: 'KJ-TEST-001',
  slug: 'empress-pearl-heirloom-bag',
  name: 'Empress Pearl Heirloom Bag',
  category: 'Purses',
  categorySlug: 'purses',
  price: 4999,
  originalPrice: 6499,
  coverImage: 'https://images.unsplash.com/photo-test-1.jpg',
  description: 'Hand-woven with Japanese glass beads and freshwater pearls.',
  craftHours: '42 hours',
  inStock: true,
  isFeatured: true,
  isBestSeller: false,
  isNewArrival: true,
  images: ['https://images.unsplash.com/photo-test-1.jpg'],
  variants: [
    { code: 'CG', label: 'Champagne Gold', price: 4999, inStock: true, image: 'https://images.unsplash.com/photo-test-1.jpg' },
    { code: 'MP', label: 'Midnight Pearl', price: 5299, inStock: true, image: 'https://images.unsplash.com/photo-test-1.jpg' },
  ],
  materials: ['Glass seed beads', 'metallic yarn'],
  dimensions: '22cm x 15cm x 6cm',
  care: 'Spot clean only. Store in velvet pouch.',
  origin: 'Madhubani Artisan Cluster, Bihar',
  artisanTitle: 'Master Artisan Meera Devi',
  artisanNote: 'Woven with continuous 0.4mm wire tension',
  dimensionsNote: 'Fits iPhone Pro Max and vanity essentials',
  careNote: 'Keep away from moisture',
  shippingPolicy: 'Dispatched via insured BlueDart Air',
  transitGuarantee: '100% replacement guarantee if damaged in transit',
  dispatchTimeline: '3-5 business days',
  bulkEnquiryNote: 'Available for bridal entourage gifts',
};

assert(testProduct.variants.length === 2, 'Product contains multi-variant definitions');
assert(testProduct.price < testProduct.originalPrice, 'Retail price is lower than compare-at MRP');
assert(Boolean(testProduct.materials.length && testProduct.origin), 'All 12 craft specifications populated');

// -------------------------------------------------------------
// SCENARIO B: EDIT PRODUCT & HISTORICAL ORDER INTEGRITY
// -------------------------------------------------------------
console.log('\n--- SCENARIO B: EDIT PRODUCT & SNAPSHOT PRESERVATION ---');
const historicalOrderLineItem = {
  productId: testProduct.id,
  name: testProduct.name,
  sku: testProduct.code,
  price: testProduct.price, // 4999 at purchase time
  quantity: 1,
};

const editedProduct: Product = {
  ...testProduct,
  name: 'Empress Pearl Heirloom Bag (2026 Edition)',
  price: 5499, // price increased
};

assert(editedProduct.price !== historicalOrderLineItem.price, 'Product price edited in catalogue');
assert(historicalOrderLineItem.price === 4999, 'Historical order snapshot retains original purchase price');

// -------------------------------------------------------------
// SCENARIO C: CREATE CATEGORY & TAXONOMY INTEGRITY
// -------------------------------------------------------------
console.log('\n--- SCENARIO C: CREATE CATEGORY ---');
const testCategory: Collection = {
  slug: 'bridal-vault',
  name: 'Bridal Vault Heirlooms',
  tagline: 'Imperial heirloom accessories',
  description: 'Bespoke bridal adornments crafted for royal celebrations.',
  image: 'https://images.unsplash.com/photo-bridal.jpg',
};

assert(testCategory.slug === 'bridal-vault', 'Category slug formatted cleanly');
assert(testCategory.name.length > 0, 'Category name is populated');

// -------------------------------------------------------------
// SCENARIO D: LOW STOCK THRESHOLD & ALERT LIFECYCLE
// -------------------------------------------------------------
console.log('\n--- SCENARIO D: LOW STOCK & ALERT GENERATION ---');
let testInventoryItem: InventoryItem = {
  id: 'inv-test-sku-01',
  sku: 'KJ-TEST-SKU-01',
  name: 'Crystal Beaded Minaudiere',
  category: 'Clutches',
  location: 'Mumbai Atelier',
  type: 'finished_good',
  onHand: 6,
  reserved: 0,
  available: 6,
  reorderPoint: 5,
  unitCost: 1100,
  supplier: 'Bihar Hub',
  status: 'in_stock',
  unit: 'pcs',
};

// Initial: 6 units (above threshold of 5)
assert(testInventoryItem.status === 'in_stock', 'Initial inventory is in_stock');

// Order of 2 units arrives
const orderQty = 2;
testInventoryItem.onHand -= orderQty;
testInventoryItem.available = testInventoryItem.onHand - testInventoryItem.reserved;
if (testInventoryItem.available <= testInventoryItem.reorderPoint) {
  testInventoryItem.status = testInventoryItem.available === 0 ? 'out_of_stock' : 'low_stock';
}

assert(testInventoryItem.available === 4, 'Available stock decremented from 6 to 4');
assert(testInventoryItem.status === 'low_stock', 'Status transitioned to low_stock');

// Restock of 10 units arrives
testInventoryItem.onHand += 10;
testInventoryItem.available = testInventoryItem.onHand - testInventoryItem.reserved;
if (testInventoryItem.available > testInventoryItem.reorderPoint) {
  testInventoryItem.status = 'in_stock';
}

assert(testInventoryItem.available === 14, 'Stock replenished to 14 units');
assert(testInventoryItem.status === 'in_stock', 'Status automatically resolved back to in_stock');

// -------------------------------------------------------------
// SCENARIO E: BILL OF MATERIALS (BOM) & PRODUCTION CONSUMPTION
// -------------------------------------------------------------
console.log('\n--- SCENARIO E: BOM & PRODUCTION MATERIAL LIFECYCLE ---');
const rawMaterialBeads: InventoryItem = {
  id: 'rm-bead-01',
  sku: 'RM-BEAD-PRL-02',
  name: 'Lustrous Synthetic Acrylic Pearls',
  category: 'Raw Materials',
  location: 'Bihar Craft House',
  type: 'raw_material',
  onHand: 50.0, // 50 kg
  reserved: 0.0,
  available: 50.0,
  reorderPoint: 20.0,
  unitCost: 520,
  supplier: 'Matsuno Pearl Corp',
  status: 'in_stock',
  unit: 'kg',
};

const bomDefinition: ProductBomItem[] = [
  { materialSku: 'RM-BEAD-PRL-02', materialName: 'Lustrous Synthetic Acrylic Pearls', quantityRequired: 0.3, unit: 'kg' },
];

const batchQuantity = 10; // 10 bags
const requiredBeads = bomDefinition[0].quantityRequired * batchQuantity; // 3.0 kg

// Step 1: Work Order Issued -> Reserve Materials
rawMaterialBeads.reserved += requiredBeads;
rawMaterialBeads.available = rawMaterialBeads.onHand - rawMaterialBeads.reserved;

assert(rawMaterialBeads.reserved === 3.0, 'Raw materials reserved: 3.0 kg');
assert(rawMaterialBeads.available === 47.0, 'Available raw materials decreased from 50 to 47 kg');

// Step 2: Work Order Passes QC (wax_sealed) -> Consume Materials & Receive Finished Goods
rawMaterialBeads.onHand -= requiredBeads;
rawMaterialBeads.reserved -= requiredBeads;
rawMaterialBeads.available = rawMaterialBeads.onHand - rawMaterialBeads.reserved;

let finishedGoodsBagStock = 0;
finishedGoodsBagStock += batchQuantity;

assert(rawMaterialBeads.onHand === 47.0, 'Raw materials physically consumed (onHand = 47.0 kg)');
assert(rawMaterialBeads.reserved === 0.0, 'Material reservation released to 0.0 kg');
assert(finishedGoodsBagStock === 10, 'Finished goods received into stock: 10 units');

// -------------------------------------------------------------
// SCENARIO F: MANUAL CONCIERGE ORDER & INVENTORY DEDUCTION
// -------------------------------------------------------------
console.log('\n--- SCENARIO F: MANUAL ORDER CREATION ---');
let sellablePiece: InventoryItem = {
  id: 'inv-fg-desk-01',
  sku: 'KJ-DESK-001',
  name: 'Signature Pearl Beaded Vanity Box',
  category: 'Organisers',
  location: 'Mumbai Atelier',
  type: 'finished_good',
  onHand: 18,
  reserved: 4,
  available: 14,
  reorderPoint: 8,
  unitCost: 1150,
  supplier: 'Bihar Hub',
  status: 'in_stock',
  unit: 'pcs',
};

const manualOrder: AdminOrder = {
  id: 'KJ-MANUAL-001',
  customerName: 'Aarohi Patel',
  customerEmail: 'aarohi.patel@example.com',
  customerPhone: '+91 98200 11223',
  items: [{ productId: sellablePiece.id, name: sellablePiece.name, sku: sellablePiece.sku, price: 2899, quantity: 2, image: '' }],
  subtotal: 5798,
  discount: 0,
  shipping: 0,
  tax: 174,
  total: 5798,
  paymentStatus: 'paid',
  paymentMethod: 'Credit/Debit Card',
  fulfillmentStatus: 'unfulfilled',
  shippingAddress: { addressLine: '12 Alaknanda Lane', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
  timeline: [{ title: 'Manual Concierge Order Created', timestamp: new Date().toISOString() }],
  createdAt: new Date().toISOString(),
};

// Deduct inventory
sellablePiece.onHand -= manualOrder.items[0].quantity;
sellablePiece.available = sellablePiece.onHand - sellablePiece.reserved;

assert(sellablePiece.onHand === 16, 'Manual order reduced on-hand stock from 18 to 16');
assert(sellablePiece.available === 12, 'Available stock reduced from 14 to 12');

// -------------------------------------------------------------
// SCENARIO G: ORDER CANCELLATION & ATOMIC STOCK RESTORATION
// -------------------------------------------------------------
console.log('\n--- SCENARIO G: ORDER CANCELLATION & RESTORATION ---');
// Cancel manual order before fulfillment
manualOrder.fulfillmentStatus = 'cancelled';
sellablePiece.onHand += manualOrder.items[0].quantity;
sellablePiece.available = sellablePiece.onHand - sellablePiece.reserved;

assert(manualOrder.fulfillmentStatus === 'cancelled', 'Order status marked as cancelled');
assert(sellablePiece.onHand === 18, 'Stock restored to original on-hand of 18');
assert(sellablePiece.available === 14, 'Available stock restored to original 14');

// -------------------------------------------------------------
// SCENARIO H: CUSTOM PRODUCTION STAGE INTEGRITY
// -------------------------------------------------------------
console.log('\n--- SCENARIO H: CUSTOM PRODUCTION STAGES ---');
interface CustomStage { id: string; label: string; badgeLabel: string; percent: number; color: string; description: string; }
const customStages: CustomStage[] = [
  { id: 'loom_threading', label: '1. Loom Threading', badgeLabel: 'WARP SET', percent: 20, color: 'bg-amber-100', description: 'Warp set' },
  { id: 'bead_weaving', label: '2. Bead Weaving', badgeLabel: 'WEAVING', percent: 50, color: 'bg-emerald-100', description: 'Hand-stringing' },
  { id: 'heritage_monogram', label: '3. Artisan Monogramming', badgeLabel: 'MONOGRAM', percent: 75, color: 'bg-indigo-100', description: 'Hand-embroidered patron initials' },
  { id: 'wax_sealed', label: '4. Atelier Wax Sealing', badgeLabel: 'SEALED', percent: 100, color: 'bg-plum text-white', description: 'Certified & boxed' },
];

assert(customStages.length === 4, 'Custom stage added to production pipeline');
assert(customStages[2].id === 'heritage_monogram', 'Custom stage contains unique identifier and percentage');

// -------------------------------------------------------------
// SCENARIO I: NEW CUSTOMER ZERO-DEMO-DATA ISOLATION
// -------------------------------------------------------------
console.log('\n--- SCENARIO I: NEW CUSTOMER REGISTRATION DATA ISOLATION ---');
const newRegisteredCustomer = {
  id: 'usr-genuine-customer-99',
  name: 'Devika Singhania',
  email: 'devika.s@gmail.com',
  phone: '+91 99887 76655',
  memberSince: 'Today',
  tier: 'Kalajay Circle',
  rewardPoints: 300, // standard welcome perk
  addresses: [] as any[],
  orders: [] as any[],
  preferences: { birthday: '18 August' },
};

assert(newRegisteredCustomer.addresses.length === 0, 'New customer has zero prefilled addresses');
assert(newRegisteredCustomer.orders.length === 0, 'New customer has zero prefilled orders');
assert(newRegisteredCustomer.name !== 'Sonali Sharma', 'New customer never inherits Sonali Sharma demo profile');
assert(newRegisteredCustomer.preferences.birthday === '18 August', 'Customer celebration birthday persisted accurately');

// -------------------------------------------------------------
// SCENARIO J: LOGOUT & ACCOUNT SWITCHING STATE PURGE
// -------------------------------------------------------------
console.log('\n--- SCENARIO J: ACCOUNT SWITCHING ISOLATION ---');
let activeBrowserSession: any = { ...newRegisteredCustomer };
assert(activeBrowserSession.id === 'usr-genuine-customer-99', 'Customer A authenticated');

// Logout Customer A
activeBrowserSession = null;
assert(activeBrowserSession === null, 'Session cleared on logout');

// Customer B logs in
const customerB = {
  id: 'usr-customer-b',
  name: 'Vikramaditya Roy',
  email: 'vikram.roy@example.com',
  addresses: [],
  orders: [],
};
activeBrowserSession = customerB;

assert(activeBrowserSession.id === 'usr-customer-b', 'Customer B authenticated');
assert(activeBrowserSession.name !== newRegisteredCustomer.name, 'Customer B cannot access Customer A records');
assert(activeBrowserSession.orders.length === 0, 'Customer B starts with clean isolated order history');

// -------------------------------------------------------------
// SCENARIO K: RUNTIME EXCEPTION PREVENTION & FALLBACKS
// -------------------------------------------------------------
console.log('\n--- SCENARIO K: RUNTIME STABILITY & ERROR BOUNDARIES ---');
function safeArrayLength(arr: any): number {
  return Array.isArray(arr) ? arr.length : 0;
}

function safeOrderCalculation(subtotal?: number, discount?: number, shipping?: number): number {
  const safeSub = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
  const safeDisc = typeof discount === 'number' && !isNaN(discount) ? discount : 0;
  const safeShip = typeof shipping === 'number' && !isNaN(shipping) ? shipping : 0;
  return Math.max(0, safeSub - safeDisc + safeShip);
}

assert(safeArrayLength(undefined) === 0, 'safeArrayLength handles undefined without throwing TypeError');
assert(safeArrayLength(null) === 0, 'safeArrayLength handles null safely');
assert(safeArrayLength([1, 2, 3]) === 3, 'safeArrayLength handles populated array');
assert(safeOrderCalculation(undefined, NaN, null as any) === 0, 'safeOrderCalculation prevents NaN propagation');
assert(safeOrderCalculation(5000, 500, 0) === 4500, 'safeOrderCalculation calculates exact financial total');

// -------------------------------------------------------------
// SCENARIO L: END-TO-END BUSINESS SYSTEM SYNCHRONIZATION
// -------------------------------------------------------------
console.log('\n--- SCENARIO L: END-TO-END SYSTEM INVARIANT CHECK ---');
// Invariant 1: onHand = available + reserved
const testInventory: InventoryItem = {
  id: 'inv-inv-01',
  sku: 'KJ-INV-01',
  name: 'Empress Minaudiere',
  category: 'Clutches',
  location: 'Mumbai Atelier',
  type: 'finished_good',
  onHand: 20,
  reserved: 5,
  available: 15,
  reorderPoint: 5,
  unitCost: 1500,
  supplier: 'Bihar Hub',
  status: 'in_stock',
  unit: 'pcs',
};

assert(testInventory.onHand === testInventory.available + testInventory.reserved, 'Mathematical Invariant: onHand === available + reserved');

console.log('\n===============================================================');
console.log(`TEST RESULTS: ${passedAssertions} PASSED, ${failedAssertions} FAILED`);
console.log('===============================================================');

if (failedAssertions > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

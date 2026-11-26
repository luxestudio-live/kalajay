import {
  resolveLiveWithDemoFallback,
  resolveProducts,
  resolveOrders,
  resolveCustomers,
  resolveInventory,
  resolveCollections,
  resolveBanners,
  resolveCoupons,
  resolveReviews,
  resolveWorkOrders,
  resolveOfflineOrders,
  resolveTaxSlabs,
  resolveAuditLogs,
  resolveSingleEntity,
  calculateSeparatedMetrics,
  assertLiveForTransaction,
  isActionAllowedOnRecord,
  isDemoFallbackEnabled,
  type WithProvenance,
} from '../src/lib/dataProvenance';

let testPassed = 0;
let testFailed = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testPassed++;
  } else {
    console.error(`[FAIL] ${testName}`, detail || '');
    testFailed++;
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('KALAJAY V2 — GLOBAL LIVE + DEMO ARCHITECTURE VERIFICATION SUITE');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test Suite 1: Priority & Fallback Logic (Cases A, B, C, D, E)
  // -------------------------------------------------------------
  console.log('--- SUITE 1: Priority & Deduplication Scenarios ---');

  // Case A: Live data exists and has some overlap with demo
  const demoProducts = [
    { id: 'p1', code: 'PROD-01', slug: 'banarasi-silk', name: 'Banarasi Saree Demo', price: 12000 },
    { id: 'p2', code: 'PROD-02', slug: 'chanderi-cotton', name: 'Chanderi Saree Demo', price: 8000 },
    { id: 'p3', code: 'PROD-03', slug: 'tussar-georgette', name: 'Tussar Saree Demo', price: 15000 },
  ];

  const liveProducts = [
    { id: 'p1-live', code: 'PROD-01', slug: 'banarasi-silk', name: 'Authentic Banarasi Heirloom', price: 14500 },
    { id: 'p4-live', code: 'PROD-04', slug: 'kanjivaram-gold', name: 'Pure Zari Kanjivaram', price: 28000 },
  ];

  const resolvedA = resolveProducts(liveProducts, demoProducts);
  assert(resolvedA.length === 4, 'Case A: Correct total items merged without duplicate PROD-01');
  const prod1 = resolvedA.find(p => p.code === 'PROD-01');
  assert(prod1?.name === 'Authentic Banarasi Heirloom', 'Case A: Live record overrides demo on collision');
  assert(prod1?.provenance === 'live' && prod1?.isDemo === false, 'Case A: Live record provenance is "live"');
  const prod2 = resolvedA.find(p => p.code === 'PROD-02');
  assert(prod2?.name === 'Chanderi Saree Demo', 'Case A: Non-conflicting demo fills gap');
  assert(prod2?.provenance === 'demo' && prod2?.isDemo === true, 'Case A: Demo fallback provenance is "demo"');

  // Case B: Live data is empty
  const resolvedB = resolveProducts([], demoProducts);
  assert(resolvedB.length === 3, 'Case B: Demo data fully fills missing live data');
  assert(resolvedB.every(p => p.provenance === 'demo' && p.isDemo === true), 'Case B: All items marked as demo');

  // Case C: Live data is null or undefined (API failure / cold start)
  const resolvedC = resolveProducts(null, demoProducts);
  assert(resolvedC.length === 3, 'Case C: Null live data gracefully falls back to demo data without error');

  // Case D: Live data exists, demo data is empty
  const resolvedD = resolveProducts(liveProducts, []);
  assert(resolvedD.length === 2, 'Case D: Live data alone works perfectly when demo is empty');
  assert(resolvedD.every(p => p.provenance === 'live'), 'Case D: All live items marked provenance live');

  // Case E: Both live and demo empty
  const resolvedE = resolveProducts([], []);
  assert(resolvedE.length === 0, 'Case E: Empty live and empty demo returns clean empty array');

  // -------------------------------------------------------------
  // Test Suite 2: Specific Domain Resolvers
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: Domain Entity Resolvers ---');

  // Orders Resolver
  const liveOrders = [
    { id: 'ORD-LIVE-001', customerName: 'Rahul Kushwaha', total: 24500, createdAt: '2026-11-26T10:00:00Z' },
  ];
  const demoOrders = [
    { id: 'ORD-LIVE-001', customerName: 'Sample Colliding Order', total: 5000, createdAt: '2026-11-20T10:00:00Z' },
    { id: 'ORD-DEMO-002', customerName: 'Demo Patron', total: 12000, createdAt: '2026-11-21T10:00:00Z' },
  ];
  const resolvedOrders = resolveOrders(liveOrders, demoOrders);
  assert(resolvedOrders.length === 2, 'Orders Resolver: Deduplicates on order id');
  assert(resolvedOrders[0].id === 'ORD-LIVE-001' && resolvedOrders[0].customerName === 'Rahul Kushwaha', 'Orders: Live order wins');
  assert(resolvedOrders[0].provenance === 'live', 'Orders: Live order has provenance "live"');
  assert(resolvedOrders[1].provenance === 'demo', 'Orders: Fallback order has provenance "demo"');

  // Customers Resolver
  const liveCustomers = [
    { id: 'usr_live_1', email: 'rahul@example.com', name: 'Rahul Kushwaha' },
  ];
  const demoCustomers = [
    { id: 'usr_demo_1', email: 'rahul@example.com', name: 'Conflicting Email Patron' },
    { id: 'usr_demo_2', email: 'aarav@example.com', name: 'Aarav Mehta' },
  ];
  const resolvedCust = resolveCustomers(liveCustomers, demoCustomers);
  assert(resolvedCust.length === 2, 'Customers Resolver: Deduplicates on secondary key (email)');
  const rahul = resolvedCust.find(c => c.email === 'rahul@example.com');
  assert(rahul?.name === 'Rahul Kushwaha' && rahul?.provenance === 'live', 'Customers: Live customer wins on email collision');

  // Inventory Resolver
  const liveInv = [{ sku: 'SKU-001', name: 'Live Silk Scarf', available: 12 }];
  const demoInv = [
    { sku: 'SKU-001', name: 'Demo Silk Scarf', available: 5 },
    { sku: 'SKU-002', name: 'Demo Brocade Shawl', available: 20 },
  ];
  const resolvedInv = resolveInventory(liveInv, demoInv);
  assert(resolvedInv.length === 2, 'Inventory Resolver: Deduplicates on SKU');
  assert(resolvedInv.find(i => i.sku === 'SKU-001')?.available === 12, 'Inventory: Live stock value preserved');

  // Collections Resolver
  const liveCols = [{ slug: 'bridal-lehengas', name: 'Live Bridal Heritage' }];
  const demoCols = [
    { slug: 'bridal-lehengas', name: 'Demo Bridal Collection' },
    { slug: 'festive-kurtas', name: 'Festive Kurtas' },
  ];
  const resolvedCols = resolveCollections(liveCols, demoCols);
  assert(resolvedCols.length === 2, 'Collections Resolver: Deduplicates on slug');
  assert(resolvedCols.find(c => c.slug === 'bridal-lehengas')?.name === 'Live Bridal Heritage', 'Collections: Live title wins');

  // -------------------------------------------------------------
  // Test Suite 3: Metrics Separation
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: Financial & Operational Metrics Separation ---');

  const metrics = calculateSeparatedMetrics(resolvedOrders, o => o.total);
  assert(metrics.liveTotal === 24500, 'Metrics: Live total strictly reflects live orders (24,500 INR)');
  assert(metrics.demoTotal === 12000, 'Metrics: Demo total strictly reflects demo orders (12,000 INR)');
  assert(metrics.liveCount === 1, 'Metrics: Live count is strictly 1');
  assert(metrics.demoCount === 1, 'Metrics: Demo count is strictly 1');
  assert(metrics.combinedTotal === 36500, 'Metrics: Combined total matches sum');

  // -------------------------------------------------------------
  // Test Suite 4: Business Operation Security Guards
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: Business Operation Security Guards ---');

  const liveOrder = resolvedOrders.find(o => o.provenance === 'live')!;
  const demoOrder = resolvedOrders.find(o => o.provenance === 'demo')!;

  assert(isActionAllowedOnRecord(liveOrder) === true, 'Security: Live record allowed for business operations');
  assert(isActionAllowedOnRecord(demoOrder) === false, 'Security: Demo record blocked from business operations');

  let liveAssertionPassed = false;
  try {
    assertLiveForTransaction(liveOrder, 'razorpay_order_create');
    liveAssertionPassed = true;
  } catch (err) {
    liveAssertionPassed = false;
  }
  assert(liveAssertionPassed, 'Security: assertLiveForTransaction allows live record');

  let demoBlocked = false;
  try {
    assertLiveForTransaction(demoOrder, 'razorpay_order_create');
  } catch (err: any) {
    if (err.message.includes('SECURITY EXCEPTION')) {
      demoBlocked = true;
    }
  }
  assert(demoBlocked, 'Security: assertLiveForTransaction throws SECURITY EXCEPTION on demo record');

  // -------------------------------------------------------------
  // Test Suite 5: Fallback Switch (Disabled in Production)
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: Environment Fallback Toggle (Production Simulation) ---');

  // Temporarily simulate APP_DEMO_FALLBACK_ENABLED="false"
  process.env.APP_DEMO_FALLBACK_ENABLED = 'false';
  process.env.NEXT_PUBLIC_APP_DEMO_FALLBACK_ENABLED = 'false';

  const prodResolved = resolveProducts(liveProducts, demoProducts);
  assert(prodResolved.length === 2, 'Prod Switch: When fallback is disabled, exactly live items returned');
  assert(prodResolved.every(p => p.provenance === 'live'), 'Prod Switch: 0 demo items included');

  const prodEmptyLive = resolveProducts([], demoProducts);
  assert(prodEmptyLive.length === 0, 'Prod Switch: Empty live returns 0 items when fallback disabled');

  // Reset back to preproduction mode
  process.env.APP_DEMO_FALLBACK_ENABLED = 'true';
  process.env.NEXT_PUBLIC_APP_DEMO_FALLBACK_ENABLED = 'true';

  console.log('\n================================================================');
  console.log(`SUMMARY: ${testPassed} PASSED, ${testFailed} FAILED`);
  console.log('================================================================\n');

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTestSuite();

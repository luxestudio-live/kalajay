/**
 * KALAJAY V2 — Inventory Costing & GSTIN Mathematical Verification Suite
 */

import { validateGstin, KALAJAY_BUSINESS_PROFILE } from '../src/lib/businessProfile';
import {
  calculateRawMaterialLineCost,
  calculateInventoryCosting,
} from '../src/lib/inventoryCosting';

console.log('====================================================');
console.log('KALAJAY V2 — GSTIN & INVENTORY COSTING VERIFICATION');
console.log('====================================================\n');

let failed = 0;
let passed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passed++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failed++;
  }
}

// 1. GSTIN Validation Tests
console.log('--- 1. GSTIN VALIDATION & PROFILE TESTS ---');
assert(KALAJAY_BUSINESS_PROFILE.gstin === '27FAAPS2113B1Z8', 'Official GSTIN matches 27FAAPS2113B1Z8');
assert(validateGstin('27FAAPS2113B1Z8'), 'Validates official GSTIN 27FAAPS2113B1Z8');
assert(validateGstin('27faaps2113b1z8'), 'Validates case-insensitively');
assert(!validateGstin('11XXXXX1111X1Z1'), 'Rejects placeholder 11XXXXX1111X1Z1');
assert(!validateGstin('INVALID_GSTIN'), 'Rejects random string');
assert(!validateGstin(''), 'Rejects empty string');

// 2. Raw Material Line Cost & Grams-to-Kg Conversion Tests
console.log('\n--- 2. RAW MATERIAL & CONVERSION TESTS ---');
// Case: 0.25 kg at ₹800/kg -> ₹200
const costKg = calculateRawMaterialLineCost(0.25, 'kg', 800);
assert(costKg === 200, `0.25 kg @ ₹800/kg = ₹200 (Got: ₹${costKg})`);

// Case: 250 grams at ₹800/kg -> ₹200
const costGrams = calculateRawMaterialLineCost(250, 'grams', 800);
assert(costGrams === 200, `250 grams @ ₹800/kg = ₹200 (Got: ₹${costGrams})`);

const costG = calculateRawMaterialLineCost(250, 'g', 800);
assert(costG === 200, `250 g @ ₹800/kg = ₹200 (Got: ₹${costG})`);

// Non-weight: 4 pieces at ₹15 each -> ₹60
const costPieces = calculateRawMaterialLineCost(4, 'pieces', 15);
assert(costPieces === 60, `4 pieces @ ₹15 each = ₹60 (Got: ₹${costPieces})`);

// 3. User Specification Test Case:
// Raw Material (₹800/kg * 0.25kg = ₹200), Labour (2.5h @ ₹120 = ₹300), Other Charges (₹50) -> Total ₹550
console.log('\n--- 3. USER SPECIFICATION TEST CASE ---');

// Per-Unit basis
const perUnitResult = calculateInventoryCosting({
  costingBasis: 'per_unit',
  productionQuantity: 1,
  rawMaterials: [
    {
      id: 'mat-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.25,
      unit: 'kg',
      costPerKg: 800,
      lineCost: 200,
    },
  ],
  labourHours: 2.5,
  labourCostPerHour: 120,
  otherCharges: 50,
});

assert(perUnitResult.totalRawMaterialCost === 200, `Total Raw Material Cost = ₹200 (Got: ₹${perUnitResult.totalRawMaterialCost})`);
assert(perUnitResult.labourCost === 300, `Labour Cost = ₹300 (Got: ₹${perUnitResult.labourCost})`);
assert(perUnitResult.otherCharges === 50, `Other Charges = ₹50 (Got: ₹${perUnitResult.otherCharges})`);
assert(perUnitResult.totalProductionCost === 550, `Total Production Cost = ₹550 (Got: ₹${perUnitResult.totalProductionCost})`);
assert(perUnitResult.unitCost === 550, `Per-Unit Basis Unit Cost = ₹550 (Got: ₹${perUnitResult.unitCost})`);

// Per-Batch basis: batch of 5 units
const perBatchResult = calculateInventoryCosting({
  costingBasis: 'per_batch',
  productionQuantity: 5,
  rawMaterials: [
    {
      id: 'mat-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.25,
      unit: 'kg',
      costPerKg: 800,
      lineCost: 200,
    },
  ],
  labourHours: 2.5,
  labourCostPerHour: 120,
  otherCharges: 50,
});

assert(perBatchResult.totalProductionCost === 550, `Batch Total Production Cost = ₹550 (Got: ₹${perBatchResult.totalProductionCost})`);
assert(perBatchResult.unitCost === 110, `Batch of 5 Unit Cost = ₹110 (Got: ₹${perBatchResult.unitCost})`);

// Multiple raw materials test
console.log('\n--- 4. MULTIPLE RAW MATERIALS & BREAKDOWN TEST ---');
const multiMatResult = calculateInventoryCosting({
  costingBasis: 'per_unit',
  productionQuantity: 1,
  rawMaterials: [
    {
      id: 'mat-1',
      materialName: 'High-Luster Faux Pearls 6mm',
      quantityRequired: 500, // 500 grams = 0.5 kg
      unit: 'grams',
      costPerKg: 1200,
      lineCost: 0,
    },
    {
      id: 'mat-2',
      materialName: 'Stainless Steel Core Wire',
      quantityRequired: 15,
      unit: 'meters',
      costPerKg: 10, // ₹10/meter
      lineCost: 0,
    },
  ],
  labourHours: 4,
  labourCostPerHour: 150,
  otherCharges: 0,
  otherChargesBreakdown: [
    { id: 'chg-1', label: 'Custom Velvet Dust Pouch', amount: 85 },
    { id: 'chg-2', label: 'Kalajay Brass Clasp', amount: 65 },
  ],
  notes: 'Artisan Batch test notes for bridal box production.',
});

// Mat 1: 500g @ ₹1200/kg = ₹600
// Mat 2: 15m @ ₹10/m = ₹150
// Total Raw Mat = ₹750
// Labour: 4h @ ₹150/h = ₹600
// Other Charges: 85 + 65 = ₹150
// Total Production Cost = 750 + 600 + 150 = ₹1500
assert(multiMatResult.totalRawMaterialCost === 750, `Multi-Mat Total Raw Mat = ₹750 (Got: ₹${multiMatResult.totalRawMaterialCost})`);
assert(multiMatResult.labourCost === 600, `Multi-Mat Labour = ₹600 (Got: ₹${multiMatResult.labourCost})`);
assert(multiMatResult.otherCharges === 150, `Multi-Mat Other Charges = ₹150 (Got: ₹${multiMatResult.otherCharges})`);
assert(multiMatResult.totalProductionCost === 1500, `Multi-Mat Total Production Cost = ₹1500 (Got: ₹${multiMatResult.totalProductionCost})`);
assert(multiMatResult.unitCost === 1500, `Multi-Mat Unit Cost = ₹1500 (Got: ₹${multiMatResult.unitCost})`);
assert(multiMatResult.enhancedCosting.notes === 'Artisan Batch test notes for bridal box production.', 'Notes preserved in enhanced costing');

console.log('\n====================================================');
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}

/**
 * KALAJAY V2 — Inventory Costing & GSTIN Mathematical Verification Suite
 */

import { validateGstin, KALAJAY_BUSINESS_PROFILE } from '../src/lib/businessProfile';
import {
  calculateRawMaterialLineCost,
  calculateInventoryCosting,
  normalizeRawMaterialRequirement,
  createCostingHistorySnapshot,
  getRateUnitForMaterialUnit,
  getRateBasisLabel,
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

// 1. GSTIN Validation & Status Tests
console.log('--- 1. GSTIN VALIDATION & PROFILE TESTS ---');
assert(KALAJAY_BUSINESS_PROFILE.gstin === '27FAAPS2113B1Z8', 'Official GSTIN matches 27FAAPS2113B1Z8');
assert(KALAJAY_BUSINESS_PROFILE.pan === 'FAAPS2113B', 'Extracted PAN matches FAAPS2113B');
assert(KALAJAY_BUSINESS_PROFILE.stateCode === '27', 'State code matches 27 (Maharashtra)');
assert(KALAJAY_BUSINESS_PROFILE.approvalStatus === 'PENDING_CLIENT_ACCOUNTANT_APPROVAL', 'Approval status is PENDING_CLIENT_ACCOUNTANT_APPROVAL');
assert(validateGstin('27FAAPS2113B1Z8'), 'Validates official GSTIN 27FAAPS2113B1Z8');
assert(validateGstin('27faaps2113b1z8'), 'Validates case-insensitively');
assert(!validateGstin('11XXXXX1111X1Z1'), 'Rejects placeholder 11XXXXX1111X1Z1');
assert(!validateGstin('27FAAPS2113B100000'), 'Rejects masks with 00000');
assert(!validateGstin('INVALID_GSTIN'), 'Rejects random string');
assert(!validateGstin(''), 'Rejects empty string');

// 2. Raw Material Explicit Rate Basis & Conversion Tests
console.log('\n--- 2. RAW MATERIAL EXPLICIT RATE BASIS & CONVERSIONS ---');
// Weight: kg
const costKg = calculateRawMaterialLineCost(0.25, 'kg', 800, 'per_kg');
assert(costKg === 200, `0.25 kg @ ₹800/kg = ₹200 (Got: ₹${costKg})`);

// Weight: grams -> (250 / 1000) * 800 = 200
const costGrams = calculateRawMaterialLineCost(250, 'grams', 800, 'per_kg');
assert(costGrams === 200, `250 grams @ ₹800/kg = ₹200 (Got: ₹${costGrams})`);

const costG = calculateRawMaterialLineCost(500, 'g', 400, 'per_kg');
assert(costG === 200, `500 g @ ₹400/kg = ₹200 (Got: ₹${costG})`);

// Length: meters -> quantity * rate (rateUnit: per_meter)
const costMeters = calculateRawMaterialLineCost(3, 'meters', 150, 'per_meter');
assert(costMeters === 450, `3 meters @ ₹150/m = ₹450 (Got: ₹${costMeters})`);

const costMetres = calculateRawMaterialLineCost(1.5, 'metres', 200, 'per_meter');
assert(costMetres === 300, `1.5 metres @ ₹200/m = ₹300 (Got: ₹${costMetres})`);

// Quantity: pieces -> quantity * rate (rateUnit: per_piece)
const costPieces = calculateRawMaterialLineCost(5, 'pieces', 35, 'per_piece');
assert(costPieces === 175, `5 pieces @ ₹35/pc = ₹175 (Got: ₹${costPieces})`);

const costPcs = calculateRawMaterialLineCost(12, 'pcs', 10, 'per_piece');
assert(costPcs === 120, `12 pcs @ ₹10/pc = ₹120 (Got: ₹${costPcs})`);

// Rate unit resolution helper
assert(getRateUnitForMaterialUnit('kg') === 'per_kg', 'kg maps to per_kg');
assert(getRateUnitForMaterialUnit('grams') === 'per_kg', 'grams maps to per_kg');
assert(getRateUnitForMaterialUnit('meters') === 'per_meter', 'meters maps to per_meter');
assert(getRateUnitForMaterialUnit('pieces') === 'per_piece', 'pieces maps to per_piece');
assert(getRateBasisLabel('per_kg') === '₹/kg', 'per_kg label is ₹/kg');
assert(getRateBasisLabel('per_meter') === '₹/m', 'per_meter label is ₹/m');
assert(getRateBasisLabel('per_piece') === '₹/pc', 'per_piece label is ₹/pc');

// 3. Normalization & Schema Integrity (costPerKg NOT populated for meter/piece)
console.log('\n--- 3. SCHEMA INTEGRITY & BACKWARD COMPATIBILITY ---');
const normWeight = normalizeRawMaterialRequirement({
  materialName: 'Seed Beads',
  quantityRequired: 0.5,
  unit: 'kg',
  rate: 600,
});
assert(normWeight.costPerKg === 600, 'Weight material populates costPerKg');
assert(normWeight.rateUnit === 'per_kg', 'Weight material sets rateUnit to per_kg');
assert(normWeight.lineCost === 300, 'Weight material computes lineCost 300');

const normMeter = normalizeRawMaterialRequirement({
  materialName: 'Silk Lining Ribbons',
  quantityRequired: 4,
  unit: 'meters',
  rate: 45,
});
assert(normMeter.costPerKg === undefined, 'Meter material leaves costPerKg undefined');
assert(normMeter.rateUnit === 'per_meter', 'Meter material sets rateUnit to per_meter');
assert(normMeter.lineCost === 180, 'Meter material computes lineCost 180');

const normPiece = normalizeRawMaterialRequirement({
  materialName: 'Metallic Clasps',
  quantityRequired: 10,
  unit: 'pieces',
  rate: 15,
});
assert(normPiece.costPerKg === undefined, 'Piece material leaves costPerKg undefined');
assert(normPiece.rateUnit === 'per_piece', 'Piece material sets rateUnit to per_piece');
assert(normPiece.lineCost === 150, 'Piece material computes lineCost 150');

// Backward compatibility: legacy record with costPerKg only
const legacyRecord = normalizeRawMaterialRequirement({
  materialName: 'Legacy Crystal Beads',
  quantityRequired: 0.25,
  unit: 'kg',
  costPerKg: 800,
});
assert(legacyRecord.rate === 800, 'Legacy costPerKg migrated to rate');
assert(legacyRecord.rateUnit === 'per_kg', 'Legacy kg resolved to rateUnit per_kg');
assert(legacyRecord.lineCost === 200, 'Legacy line cost accurately computed as 200');

// 4. Mathematical Safety & Boundary Tests
console.log('\n--- 4. MATHEMATICAL SAFETY & REJECTION TESTS ---');
assert(calculateRawMaterialLineCost(-5, 'kg', 800) === 0, 'Rejects negative quantity');
assert(calculateRawMaterialLineCost(5, 'kg', -800) === 0, 'Rejects negative rate');
assert(calculateRawMaterialLineCost(NaN, 'kg', 800) === 0, 'Rejects NaN quantity');
assert(calculateRawMaterialLineCost(5, 'kg', Infinity) === 0, 'Rejects Infinity rate');

// 5. Complete Inventory Costing Calculation Engine Tests
console.log('\n--- 5. INVENTORY COSTING CALCULATION ENGINE ---');
// Specification Scenario:
// Raw Materials: 0.25 kg @ ₹800/kg = ₹200
// Labour: 2.5 hours @ ₹120/hr = ₹300
// Other charges: ₹50
// Total Production Cost = ₹550
const perUnitResult = calculateInventoryCosting({
  costingBasis: 'per_unit',
  productionQuantity: 1,
  rawMaterials: [
    {
      id: 'rm-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.25,
      unit: 'kg',
      rate: 800,
      rateUnit: 'per_kg',
      lineCost: 200,
    },
  ],
  labourHours: 2.5,
  labourCostPerHour: 120,
  otherCharges: 50,
  notes: 'Artisan test run',
});

assert(perUnitResult.totalRawMaterialCost === 200, `Per-unit RM Cost = ₹200 (Got: ₹${perUnitResult.totalRawMaterialCost})`);
assert(perUnitResult.labourCost === 300, `Labour Cost = ₹300 (Got: ₹${perUnitResult.labourCost})`);
assert(perUnitResult.otherCharges === 50, `Other Charges = ₹50 (Got: ₹${perUnitResult.otherCharges})`);
assert(perUnitResult.totalProductionCost === 550, `Total Production Cost = ₹550 (Got: ₹${perUnitResult.totalProductionCost})`);
assert(perUnitResult.unitCost === 550, `Per-unit Unit Cost = ₹550 (Got: ₹${perUnitResult.unitCost})`);

// Batch Scenario: Batch of 5 units
// Total Production Cost = ₹550, Unit Cost = 550 / 5 = ₹110
const perBatchResult = calculateInventoryCosting({
  costingBasis: 'per_batch',
  productionQuantity: 5,
  rawMaterials: [
    {
      id: 'rm-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.25,
      unit: 'kg',
      rate: 800,
      rateUnit: 'per_kg',
      lineCost: 200,
    },
  ],
  labourHours: 2.5,
  labourCostPerHour: 120,
  otherCharges: 50,
});

assert(perBatchResult.totalProductionCost === 550, `Batch Total Cost = ₹550 (Got: ₹${perBatchResult.totalProductionCost})`);
assert(perBatchResult.unitCost === 110, `Batch of 5 Unit Cost = ₹110 (Got: ₹${perBatchResult.unitCost})`);

// Edge case: Batch quantity <= 0 falls back to 1
const invalidBatchResult = calculateInventoryCosting({
  costingBasis: 'per_batch',
  productionQuantity: 0,
  rawMaterials: [
    {
      id: 'rm-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.25,
      unit: 'kg',
      rate: 800,
      rateUnit: 'per_kg',
      lineCost: 200,
    },
  ],
  labourHours: 2.5,
  labourCostPerHour: 120,
  otherCharges: 50,
});
assert(invalidBatchResult.unitCost === 550, 'Invalid batch quantity <= 0 safely defaults to 1 unit');

// 6. History Snapshot Preservation Tests
console.log('\n--- 6. HISTORY SNAPSHOT PRESERVATION ---');
const snapshot = createCostingHistorySnapshot(perUnitResult.enhancedCosting);
assert(snapshot.totalProductionCost === 550, 'Snapshot captures total production cost');
assert(snapshot.unitCost === 550, 'Snapshot captures unit cost');
assert(snapshot.costingBasis === 'per_unit', 'Snapshot captures costing basis');

const updatedWithHistory = calculateInventoryCosting({
  costingBasis: 'per_unit',
  productionQuantity: 1,
  rawMaterials: [
    {
      id: 'rm-1',
      materialName: 'Faceted Czech Crystal Beads',
      quantityRequired: 0.3,
      unit: 'kg',
      rate: 800,
      rateUnit: 'per_kg',
      lineCost: 240,
    },
  ],
  labourHours: 3,
  labourCostPerHour: 120,
  otherCharges: 60,
  existingHistory: [snapshot],
});
assert(updatedWithHistory.enhancedCosting.history?.length === 1, 'Preserves historical snapshot in history array');
assert(updatedWithHistory.enhancedCosting.history?.[0].unitCost === 550, 'Previous unit cost preserved in history');

console.log(`\n====================================================`);
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`====================================================`);

if (failed > 0) {
  process.exit(1);
}

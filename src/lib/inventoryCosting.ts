/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Authoritative Inventory & Craft Production Costing Engine
 *
 * Core Costing Formulas:
 * 1. Raw Material Line Cost:
 *    - Grams to Kg conversion: quantityInKg = grams / 1000
 *    - Line Cost = quantityInKg * costPerKg (or quantityRequired * costPerUnit)
 * 2. Total Raw Material Cost = sum(all raw material line costs)
 * 3. Labour Cost = labourHours * labourCostPerHour
 * 4. Other Charges = direct input or sum of other charges breakdown
 * 5. Total Production Cost = Total Raw Material Cost + Labour Cost + Other Charges
 * 6. Unit Cost:
 *    - If Per-Unit: Unit Cost = Total Production Cost
 *    - If Per-Batch: Unit Cost = Total Production Cost / productionQuantity (productionQuantity >= 1)
 */

import {
  RawMaterialRequirement,
  MaterialUnit,
  OtherChargeBreakdown,
  CostingBasis,
  EnhancedInventoryCosting,
} from '@/data/adminTypes';

export interface CostingCalculationInput {
  costingBasis: CostingBasis;
  productionQuantity: number;
  rawMaterials: RawMaterialRequirement[];
  labourHours: number;
  labourCostPerHour: number;
  otherCharges: number;
  otherChargesBreakdown?: OtherChargeBreakdown[];
  notes?: string;
}

export interface CostingCalculationResult {
  totalRawMaterialCost: number;
  labourCost: number;
  otherCharges: number;
  totalProductionCost: number;
  unitCost: number;
  enhancedCosting: EnhancedInventoryCosting;
}

/**
 * Calculates line cost for a single raw material requirement with grams-to-kg conversion
 */
export function calculateRawMaterialLineCost(
  quantityRequired: number,
  unit: MaterialUnit,
  costPerKgOrUnit: number
): number {
  const qty = Number(quantityRequired) || 0;
  const rate = Number(costPerKgOrUnit) || 0;
  if (qty <= 0 || rate <= 0) return 0;

  if (unit === 'g' || unit === 'grams') {
    const qtyInKg = qty / 1000;
    return Math.round(qtyInKg * rate * 100) / 100;
  }

  return Math.round(qty * rate * 100) / 100;
}

/**
 * Computes full inventory production and unit costing
 */
export function calculateInventoryCosting(
  input: CostingCalculationInput
): CostingCalculationResult {
  // 1. Process and recalculate raw materials
  const rawMaterials = (input.rawMaterials || []).map((m) => {
    const lineCost = calculateRawMaterialLineCost(m.quantityRequired, m.unit, m.costPerKg);
    return {
      ...m,
      lineCost,
    };
  });

  const totalRawMaterialCost = Math.round(
    rawMaterials.reduce((acc, m) => acc + (Number(m.lineCost) || 0), 0) * 100
  ) / 100;

  // 2. Labour costing
  const hours = Math.max(0, Number(input.labourHours) || 0);
  const rate = Math.max(0, Number(input.labourCostPerHour) || 0);
  const labourCost = Math.round(hours * rate * 100) / 100;

  // 3. Other charges
  let otherCharges = Math.max(0, Number(input.otherCharges) || 0);
  if (input.otherChargesBreakdown && input.otherChargesBreakdown.length > 0) {
    const breakdownTotal = input.otherChargesBreakdown.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    if (breakdownTotal > 0) {
      otherCharges = Math.round(breakdownTotal * 100) / 100;
    }
  }

  // 4. Total production cost
  const totalProductionCost = Math.round(
    (totalRawMaterialCost + labourCost + otherCharges) * 100
  ) / 100;

  // 5. Unit Cost
  const basis = input.costingBasis || 'per_unit';
  let unitCost = totalProductionCost;

  if (basis === 'per_batch') {
    const batchQty = Math.max(1, Number(input.productionQuantity) || 1);
    unitCost = Math.round((totalProductionCost / batchQty) * 100) / 100;
  }

  const enhancedCosting: EnhancedInventoryCosting = {
    enabled: true,
    costingBasis: basis,
    productionQuantity: basis === 'per_batch' ? Math.max(1, Number(input.productionQuantity) || 1) : 1,
    rawMaterials,
    totalRawMaterialCost,
    labourHours: hours,
    labourCostPerHour: rate,
    labourCost,
    otherCharges,
    otherChargesBreakdown: input.otherChargesBreakdown,
    totalProductionCost,
    unitCost,
    calculatedCostPrice: unitCost,
    notes: input.notes || '',
    calculatedAt: new Date().toISOString(),
  };

  return {
    totalRawMaterialCost,
    labourCost,
    otherCharges,
    totalProductionCost,
    unitCost,
    enhancedCosting,
  };
}

/**
 * Currency formatter for Indian Rupees (INR)
 */
export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

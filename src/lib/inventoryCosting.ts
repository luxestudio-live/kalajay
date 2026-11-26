/**
 * KALAJAY HANDCRAFTED LUXURIES
 * Authoritative Inventory & Craft Production Costing Engine
 *
 * Explicit Rate Basis & Units:
 * 1. Material Units:
 *    - Weight: 'kg', 'g', 'grams' -> rateUnit: 'per_kg'
 *      Conversion for grams: (quantity / 1000) * rate
 *    - Length: 'meters', 'metres' -> rateUnit: 'per_meter'
 *      Calculation: quantity * rate
 *    - Quantity: 'pieces', 'pcs' -> rateUnit: 'per_piece'
 *      Calculation: quantity * rate
 *
 * 2. Total Raw Material Cost = sum(all raw material line costs)
 * 3. Labour Cost = labourHours * labourCostPerHour
 * 4. Other Charges = direct input or sum of other charges breakdown (applied to entire run)
 * 5. Total Production Cost = Total Raw Material Cost + Labour Cost + Other Charges
 * 6. Unit Cost:
 *    - Per-Unit basis: Unit Cost = Total Production Cost
 *    - Per-Batch basis: Unit Cost = Total Production Cost / productionQuantity (productionQuantity >= 1)
 *
 * Note: Customer selling price (retailPrice, mrp) is strictly preserved and NEVER modified by costing engine.
 */

import {
  RawMaterialRequirement,
  MaterialUnit,
  MaterialRateBasis,
  OtherChargeBreakdown,
  CostingBasis,
  EnhancedInventoryCosting,
  CostingHistorySnapshot,
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
  existingHistory?: CostingHistorySnapshot[];
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
 * Returns the canonical rate basis for a given material unit.
 */
export function getRateUnitForMaterialUnit(unit: MaterialUnit): MaterialRateBasis {
  switch (unit) {
    case 'meters':
    case 'metres':
      return 'per_meter';
    case 'pieces':
    case 'pcs':
      return 'per_piece';
    case 'kg':
    case 'g':
    case 'grams':
    default:
      return 'per_kg';
  }
}

/**
 * User-facing display label for a rate basis.
 */
export function getRateBasisLabel(rateUnit: MaterialRateBasis): string {
  switch (rateUnit) {
    case 'per_meter':
      return '₹/m';
    case 'per_piece':
      return '₹/pc';
    case 'per_kg':
    default:
      return '₹/kg';
  }
}

/**
 * Calculates line cost for a single raw material requirement with explicit rate basis.
 * Rejects negative, NaN, or non-finite inputs.
 */
export function calculateRawMaterialLineCost(
  quantityRequired: number,
  unit: MaterialUnit,
  rate: number,
  rateUnit?: MaterialRateBasis
): number {
  const qty = Number(quantityRequired);
  const unitRate = Number(rate);

  if (!isFinite(qty) || isNaN(qty) || qty <= 0) return 0;
  if (!isFinite(unitRate) || isNaN(unitRate) || unitRate <= 0) return 0;

  const basis = rateUnit || getRateUnitForMaterialUnit(unit);

  if (basis === 'per_kg') {
    if (unit === 'g' || unit === 'grams') {
      const qtyInKg = qty / 1000;
      return Math.round(qtyInKg * unitRate * 100) / 100;
    }
    return Math.round(qty * unitRate * 100) / 100;
  }

  // Length or piece basis: direct multiplication
  return Math.round(qty * unitRate * 100) / 100;
}

/**
 * Normalizes a raw material requirement, ensuring backward compatibility with
 * legacy records that only possessed costPerKg or costPerUnit.
 */
export function normalizeRawMaterialRequirement(
  m: Partial<RawMaterialRequirement> & Record<string, any>,
  fallbackId?: string
): RawMaterialRequirement {
  const unit: MaterialUnit = (m.unit as MaterialUnit) || 'kg';
  const rateUnit: MaterialRateBasis = m.rateUnit || getRateUnitForMaterialUnit(unit);
  
  // Resolve rate with backward compatibility
  const resolvedRate = Math.max(
    0,
    Number(m.rate ?? m.costPerKg ?? m.costPerUnit ?? 0)
  );
  const rate = isFinite(resolvedRate) && !isNaN(resolvedRate) ? resolvedRate : 0;

  const resolvedQty = Math.max(0, Number(m.quantityRequired ?? 0));
  const quantityRequired = isFinite(resolvedQty) && !isNaN(resolvedQty) ? resolvedQty : 0;

  const lineCost = calculateRawMaterialLineCost(quantityRequired, unit, rate, rateUnit);

  const normalized: RawMaterialRequirement = {
    id: m.id || fallbackId || `rm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    materialName: String(m.materialName || 'Unnamed Material').trim(),
    materialSku: m.materialSku ? String(m.materialSku).trim() : undefined,
    description: m.description ? String(m.description).trim() : undefined,
    quantityRequired,
    unit,
    rate,
    rateUnit,
    lineCost,
  };

  // Only assign costPerKg if rateUnit is per_kg (prevents meter/piece rates in costPerKg)
  if (rateUnit === 'per_kg') {
    normalized.costPerKg = rate;
  }

  return normalized;
}

/**
 * Creates an immutable historical snapshot from an existing enhanced costing record.
 */
export function createCostingHistorySnapshot(
  costing: EnhancedInventoryCosting
): CostingHistorySnapshot {
  return {
    calculatedAt: costing.calculatedAt || new Date().toISOString(),
    costingBasis: costing.costingBasis,
    productionQuantity: costing.productionQuantity,
    totalRawMaterialCost: costing.totalRawMaterialCost,
    labourCost: costing.labourCost,
    otherCharges: costing.otherCharges,
    totalProductionCost: costing.totalProductionCost,
    unitCost: costing.unitCost,
    notes: costing.notes,
  };
}

/**
 * Computes full inventory production and unit costing with mathematical rigor.
 */
export function calculateInventoryCosting(
  input: CostingCalculationInput
): CostingCalculationResult {
  // 1. Process and normalize raw materials
  const rawMaterials = (input.rawMaterials || []).map((m, idx) =>
    normalizeRawMaterialRequirement(m, `rm-${idx + 1}`)
  );

  const totalRawMaterialCost = Math.round(
    rawMaterials.reduce((acc, m) => acc + (Number(m.lineCost) || 0), 0) * 100
  ) / 100;

  // 2. Labour costing
  const rawHours = Number(input.labourHours);
  const rawRate = Number(input.labourCostPerHour);
  const hours = isFinite(rawHours) && !isNaN(rawHours) ? Math.max(0, rawHours) : 0;
  const rate = isFinite(rawRate) && !isNaN(rawRate) ? Math.max(0, rawRate) : 0;
  const labourCost = Math.round(hours * rate * 100) / 100;

  // 3. Other charges (applies to total run)
  let rawCharges = Number(input.otherCharges);
  let otherCharges = isFinite(rawCharges) && !isNaN(rawCharges) ? Math.max(0, rawCharges) : 0;

  if (input.otherChargesBreakdown && input.otherChargesBreakdown.length > 0) {
    const breakdownTotal = input.otherChargesBreakdown.reduce((sum, item) => {
      const amt = Number(item.amount);
      return sum + (isFinite(amt) && !isNaN(amt) ? Math.max(0, amt) : 0);
    }, 0);
    if (breakdownTotal > 0) {
      otherCharges = Math.round(breakdownTotal * 100) / 100;
    }
  }

  // 4. Total production cost
  const totalProductionCost = Math.round(
    (totalRawMaterialCost + labourCost + otherCharges) * 100
  ) / 100;

  // 5. Unit Cost
  const basis: CostingBasis = input.costingBasis || 'per_unit';
  let unitCost = totalProductionCost;
  let productionQty = 1;

  if (basis === 'per_batch') {
    const rawBatchQty = Number(input.productionQuantity);
    productionQty = isFinite(rawBatchQty) && !isNaN(rawBatchQty) && rawBatchQty >= 1
      ? Math.floor(rawBatchQty)
      : 1;
    unitCost = Math.round((totalProductionCost / productionQty) * 100) / 100;
  }

  const enhancedCosting: EnhancedInventoryCosting = {
    enabled: true,
    costingBasis: basis,
    productionQuantity: productionQty,
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
    notes: input.notes ? String(input.notes).trim() : '',
    calculatedAt: new Date().toISOString(),
    history: input.existingHistory || [],
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
  if (isNaN(amount) || amount === null || amount === undefined || !isFinite(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);
}

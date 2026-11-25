# KALAJAY V2 — PHASE 2B: MATERIALS, CRAFT COSTING & VARIANT SAFEGUARDS IMPLEMENTATION REPORT

**STATUS:** COMPLETE & LOCALLY VERIFIED  
**EXECUTION DATE:** 2026-11-25  
**ENVIRONMENT:** Local Production Candidate

---

## 1. Executive Summary

Phase 2B re-establishes the client's proprietary manufacturing costing calculation while integrating it cleanly into Kalajay V2's advanced multi-dimensional variant architecture. It also implements an architectural safeguard that resolves the variant double-counting conflict.

---

## 2. Craft Costing Formula Specification

### Legacy Formula Implementation:
$$\text{Calculated CP} = \text{round}\Big((\text{beadKg} \times \text{beadCostKg}) + (\text{laborHours} \times \text{laborRatePerHour}) + \text{otherMaterialCost}, \; 2\Big)$$

Where:
- `beadKg`: Raw glass bead or acrylic pearl weight in kilograms (e.g., 0.45 kg).
- `beadCostKg`: Procurement cost per kilogram of beads in INR (e.g., ₹600/kg).
- `laborHours`: Handloom weaving and assembly time in hours (e.g., 14 hours).
- `laborRatePerHour`: Standard legacy artisan rate of **₹50/hour** (retained as default, configurable by authorized managers).
- `otherMaterialCost`: Tension wires, Mulberry silk lining, and antiqued brass frame clasps in INR (e.g., ₹200).

### Terminology Disambiguation:
- **Markup %**: Rate of price elevation over cost price:
  $$\text{Markup \%} = \frac{\text{Selling Price} - \text{Cost Price}}{\text{Cost Price}} \times 100$$
- **Gross Margin %**: Percentage of revenue retained after production cost:
  $$\text{Gross Margin \%} = \frac{\text{Selling Price} - \text{Cost Price}}{\text{Selling Price}} \times 100$$

Both metrics are computed and displayed side-by-side in real-time, eliminating the legacy ambiguity where markup was labelled as margin.

---

## 3. Variant Stock Aggregation Safeguard

When a product contains active child variants (such as colors, finishes, or hardware options):
1. **Parent Stock Lock**: The parent container product's on-hand balance is strictly derived as:
   $$\text{parentOnHand} = \sum_{v \in \text{variants}} \text{variantStock}(v)$$
2. **Double-Counting Elimination**: The parent SKU cannot hold independent physical inventory that duplicates or inflates warehouse stock totals.
3. **Synchronization**: Editing variant stock in `CatalogueView.tsx` automatically reconciles the parent inventory record in the Master Inventory ledger.

---

## 4. UI Enhancements in CatalogueView

- **Product Edit Modal (`pricing` tab)**:
  - Interactive "Artisan Craft Costing & Materials Engine" card with formula activation toggle.
  - Granular inputs for Bead Weight (kg), Bead Cost (₹/kg), Labour Hours, and Other Materials.
  - Dynamic preview of Effective CP, Markup %, Gross Margin %, and MRP Headroom.
  - Manual Cost Price Override input when direct supplier negotiation supersedes formula calculation.

---

## 5. Verification & Test Execution

The automated test suite (`scratch/test_phase_2b.mjs`) verified:
- [x] Craft Costing formula calculation: $0.45\text{ kg} \times ₹600 + 14\text{ hrs} \times ₹50/\text{hr} + ₹200 = ₹1,170.00$.
- [x] Markup % vs Gross Margin % separation: SP=₹2,000, CP=₹1,000 correctly produces Markup 100% and Gross Margin 50%.
- [x] Precedence of manual override over formula CP.
- [x] Zero-division safety checks.
- [x] Variant stock aggregation: Verified sum of 3 child variants (5 + 7 + 3 = 15) maps to parent onHand balance without double counting.
- [x] TypeScript Type Check: Exited with code 0 (`npx tsc --noEmit`).

---

## 6. Modified Files

1. `src/data/adminTypes.ts` (added `CraftCosting` interface)
2. `src/data/catalogue.ts` (added `CraftCosting` and cost fields to `Product` and `ProductVariant`)
3. `src/components/admin/views/CatalogueView.tsx` (added Craft Costing calculator, metrics card, and variant stock synchronization safeguard)

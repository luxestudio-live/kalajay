# KALAJAY V2 — PHASE 2A: MASTER INVENTORY & STOCK LEDGER IMPLEMENTATION REPORT

**STATUS:** COMPLETE & LOCALLY VERIFIED  
**EXECUTION DATE:** 2026-11-25  
**ENVIRONMENT:** Local Production Candidate (Netlify Deployment / Live Firestore Mutation Bypassed)

---

## 1. Executive Summary

Phase 2A delivers comprehensive functional parity with the client's legacy ERP Master Inventory while preserving Kalajay V2's advanced multi-dimensional variant architecture, reserved stock calculations, and dual-hub operational structure.

The legacy 7-counter inventory math has been unified into an authoritative, immutable ledger movement engine that guarantees non-drift inventory valuation and physical accountability across Mumbai Finishing Atelier and Bihar Craft House looms.

---

## 2. Field-by-Field Parity Specification

| Legacy ERP Field | V2 Authoritative Field | Data Type | Function & Behavior |
| :--- | :--- | :--- | :--- |
| `S.No` | Row Index / Display Counter | `number` | Deterministic sequential counter across grid views |
| `Item Name` | `name` | `string` | Full luxury piece title |
| `Code / SKU` | `sku` | `string` | Authoritative stock-keeping identifier |
| `Category` | `category` | `string` | Primary collection grouping |
| `Unit` | `unit` | `string` | Physical unit (`pcs`, `kg`, `spools`, `meters`) |
| `HSN` | `hsnCode` | `string` | GST commodity classification code (e.g. `7117.90`, `5609.00`) |
| `GST %` | `taxRate` | `number` | Statutory GST percentage (3.0%, 5.0%, 18.0%) |
| `Open` | `openingStock` | `number` | Cutover baseline balance |
| `In` | `stockIn` | `number` | Components / finished goods received from vendor procurement |
| `Made` | `quantityMade` | `number` | Units completed from Bihar & Mumbai artisan looms |
| `Sold` | `quantitySold` | `number` | Fulfilled customer storefront & studio offline orders |
| `Dmg` | `damaged` | `number` | Scrapped artisan tension defects & transit damage write-offs |
| `Marketing` | `marketingQty` | `number` | PR loans, VIP gifting, and editorial campaign samples |
| `Adjustment` | `adjustmentQty` | `number` | Net signed variance discovered during physical cycle counts |
| `Remaining Stock` | `onHand` | `number` | Authoritative physical balance: $Open + In + Made - Sold - Dmg - Mkt \pm Adj$ |
| *V2 ATS* | `reserved` | `number` | Units allocated to pending active checkout & packing orders |
| *V2 Available* | `available` | `number` | Available-to-Sell stock: $\max(0, onHand - reserved)$ |
| `CP (Unit Cost)` | `unitCost` | `number` | Procurement or artisan crafted cost price in INR |
| `SP (Price)` | `retailPrice` | `number` | Customer selling price in INR |
| `MRP` | `mrp` | `number` | Tagged Maximum Retail Price in INR |
| `Margin %` | `grossMarginPct` | `number` | Authoritative Gross Margin: $((SP - CP) / SP) \times 100$ |
| `Stock Value` | `stockValue` | `number` | Financial inventory valuation: $onHand \times unitCost$ |
| `Status` | `status` | `enum` | `'in_stock' \| 'low_stock' \| 'out_of_stock'` |
| `Deficit` | `deficit` | `number` | Replenishment shortfall: $\max(0, reorderPoint - available)$ |
| `Suggested Make` | `suggestedMake` | `number` | Recommended batch production target: $\max(0, reorderPoint \times 2 - onHand)$ |

---

## 3. Mathematical Formula Reconciliation

1. **Physical On-Hand Equation**:
   $$\text{onHand} = \text{openingStock} + \text{stockIn} + \text{quantityMade} - \text{quantitySold} - \text{damaged} - \text{marketingQty} + \text{adjustmentQty}$$

2. **Available-to-Sell (ATS)**:
   $$\text{available} = \max\Big(0, \; \text{onHand} - \text{reserved}\Big)$$

3. **Valuation & Gross Margin**:
   $$\text{stockValue} = \text{onHand} \times \text{unitCost}$$
   $$\text{grossMarginPct} = \begin{cases} \text{round}\left(\frac{\text{retailPrice} - \text{unitCost}}{\text{retailPrice}} \times 100, 1\right), & \text{retailPrice} > 0 \\ 0, & \text{otherwise} \end{cases}$$

---

## 4. UI & Interaction Enhancements

1. **Master Ledger Grid (`InventoryView.tsx`)**:
   - Sticky SKU & Product Name left-pane for frictionless horizontal scrolling across all 19 columns.
   - Distinct color badges for movements (+In, +Made, -Sold, -Dmg, $\pm$Adj).
   - Real-time stock status pills with visual thresholds.
   - Dynamic table footer showing total SKU count, total units on-hand, total available units, blended margin %, and total warehouse valuation in INR.

2. **Replenishment Watchlist (`low_stock` tab)**:
   - Dedicated low-stock dashboard displaying Reorder Point, Available balance, Shortfall Deficit, and Suggested Batch Production quantity.

3. **Authoritative Movement Trail (`adjustments` tab)**:
   - Toggle between discrete signed movements (`inventoryMovements`) and physical count audits (`stockAdjustments`).
   - Audit drawer allowing deep-dive into historical changes per SKU with timestamp, operator, delta, and reference voucher.

4. **Post Movement Modal**:
   - Enables operators to post signed inward/outward events (`PURCHASE_IN`, `PRODUCTION_IN`, `SALE_OUT`, `DAMAGE_OUT`, `MARKETING_OUT`, `RETURN_IN`) with notes and voucher references.

---

## 5. Verification & Test Execution

A dedicated automated test suite (`scratch/test_phase_2a.mjs`) verified:
- [x] Fundamental 7-counter equation: Verified exact balance $15 + 5 + 10 - 8 - 2 - 2 + 0 = 18$ units.
- [x] Multi-step movement sequence: Verified non-drift invariance across purchases, production, sales, defect write-offs, and PR samples.
- [x] Replenishment deficit & suggested batch quantity: Verified mathematical accuracy against low-stock threshold.
- [x] Idempotency: Verified duplicate transaction keys are rejected cleanly without inflating physical quantities.
- [x] TypeScript Type Check: Exited with code 0 (`npx tsc --noEmit`).

---

## 6. Modified Files

1. `src/data/adminTypes.ts` (added `InventoryMovement`, `InventoryMovementType`, accumulators, valuation fields)
2. `src/data/catalogue.ts` (added inventory and costing interfaces to `Product` and `ProductVariant`)
3. `src/data/adminSeedData.ts` (enriched `SEED_INVENTORY_ITEMS` with consistent 7 accumulators and seeded `SEED_INVENTORY_MOVEMENTS`)
4. `src/lib/firestore.ts` (added `getInventoryMovements`, `logFirestoreInventoryMovement`)
5. `src/app/api/admin/operations/route.ts` (added action `inventory_movement`)
6. `src/data/AdminStoreContext.tsx` (added `inventoryMovements` state, `logMovement`, enhanced `adjustStock`)
7. `src/components/admin/views/InventoryView.tsx` (comprehensive 19-column master grid, footer summaries, modals, audit drawer)

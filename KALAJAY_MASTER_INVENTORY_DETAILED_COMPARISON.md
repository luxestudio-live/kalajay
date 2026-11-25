# KALAJAY V2 — MASTER INVENTORY DETAILED COMPARISON & CONSOLIDATED SCHEMA

**DOCUMENT TYPE:** Deep-Dive Technical Inventory Audit  
**SCOPE:** Master Inventory Grid, Stock Calculations, Costing Engine, and Variant Data Models  
**OBJECTIVE:** Bridge the gap between the client's legacy operational inventory grid and V2's e-commerce inventory architecture.

---

## 1. Field-by-Field Matrix: Legacy ERP vs Kalajay V2

| # | Field Concept | Legacy ERP (`index.html` / `shared_store.py`) | Current Kalajay V2 (`adminTypes.ts` / `InventoryView.tsx`) | Status | Recommended Action |
| :-: | :--- | :--- | :--- | :---: | :--- |
| **1** | Serial Number | `sno` (Auto integer 1..N) | Table row index (derived) | **MATCH** | Add explicit `displayOrder` property |
| **2** | Product Code | `code` (e.g. `KJ-ORG-101`) | `sku` / `code` | **MATCH** | Retain V2 SKU indexing |
| **3** | Product Name | `name` | `name` | **MATCH** | Retain V2 title |
| **4** | Category | `cat` (string) | `category` / `categorySlug` | **MATCH** | Retain V2 category slug linkage |
| **5** | Unit of Measure | `unit` (`pcs`, `set`) | `unit` (partial, on InventoryItem only) | **PARTIAL** | Add `unit` to `Product` interface |
| **6** | HSN Code | `hsn` (e.g. `56090000`) | `hsnCode` (in Catalogue/Finance) | **PARTIAL** | Expose in Master Inventory table |
| **7** | GST Rate % | `gst` (3, 5, 12, 18) | `taxRate` (in Catalogue/Finance) | **PARTIAL** | Expose in Master Inventory table |
| **8** | Opening Stock | `open` (integer counter) | None (Missing) | **MISSING** | Add `openingStock` to inventory item |
| **9** | Stock-In / Purchases | `purch` (integer counter) | None (Missing) | **MISSING** | Add `stockIn` / `purch` counter |
| **10**| Quantity Made | `made` (integer counter) | None (Missing) | **MISSING** | Add `quantityMade` / `made` counter |
| **11**| Quantity Sold | `sold` (integer counter) | None (Missing) | **MISSING** | Add `quantitySold` / `sold` counter |
| **12**| Damaged Units | `dmg` (integer counter) | None (Logged in adjustments only) | **MISSING** | Add `damaged` / `dmg` counter |
| **13**| Marketing Samples | `marketing` (integer counter) | None (Logged in adjustments only) | **MISSING** | Add `marketingQty` counter |
| **14**| Net Adjustments | `adjustment` (signed integer) | None (Logged in adjustments only) | **MISSING** | Add `adjustmentQty` counter |
| **15**| Remaining Stock | `stock = open+purch+made-sold-dmg-mkt+adj` | `onHand` (manually overwritten) | **CONFLICT**| Harmonize `onHand` with ledger formula |
| **16**| Reserved Stock | None | `reserved` | **V2_ONLY** | **RETAIN (Prevents checkout overselling)** |
| **17**| Available to Sell | None | `available = onHand - reserved` | **V2_ONLY** | **RETAIN (Storefront stock gating)** |
| **18**| Reorder Level | `reorder` | `reorderPoint` | **EQUIVALENT**| Map `reorderPoint` to reorder column |
| **19**| Replenishment Deficit| `deficit = max(0, reorder - stock)` | None | **MISSING** | Add Deficit column in Low Stock tab |
| **20**| Suggested Make Qty | `suggest = max(reorder * 2 - stock, reorder)`| None | **MISSING** | Add Suggested Make column in Low Stock |
| **21**| Cost Price (CP) | `cp` (calculated or manual) | `unitCost` | **MATCH** | Retain `unitCost`; connect formula |
| **22**| Selling Price (SP) | `sp` | `price` / `retailPrice` | **MATCH** | Retain `price` |
| **23**| MRP | `mrp` | `originalPrice` / `mrp` | **EQUIVALENT**| Expose MRP in Master Inventory table |
| **24**| Gross Margin % | `margin = ((sp - cp) / cp) * 100` | None | **MISSING** | Add Margin % column with color badge |
| **25**| Stock Valuation | `value = stock * cp` | None in inventory table | **MISSING** | Add Stock Value column & footer totals |
| **26**| Last Updated Date | `upd` (`YYYY-MM-DD`) | `updatedAt` (Firestore Timestamp) | **MATCH** | Format as date string in table |

---

## 2. Calculation & Business Logic Analysis

### 2.1 The Stock Balance Formula
In the client's legacy system (`shared_store.py:57`), inventory integrity is maintained by:
$$\text{Stock} = \text{open} + \text{purch} + \text{made} - \text{sold} - \text{dmg} - \text{marketing} + \text{adjustment}$$

In Kalajay V2, `onHand` is currently stored as an isolated number. If a manager creates a Stock Adjustment, `onHand` is set directly to the new quantity. While this works simply, it loses the operational breakdown of **why** stock changed (how much was made vs sold vs damaged).

**Safe Proposed Resolution:**
Retain `onHand`, `reserved`, and `available` in V2, but augment `InventoryItem` with the 7 ledger accumulators. Every transaction atomically updates both its specific accumulator and `onHand`:
$$\Delta \text{Stock-In} \implies \text{purch} \mathrel{+}= Q, \quad \text{onHand} \mathrel{+}= Q$$
$$\Delta \text{Production Made} \implies \text{made} \mathrel{+}= Q, \quad \text{onHand} \mathrel{+}= Q$$
$$\Delta \text{Order Fulfilled} \implies \text{sold} \mathrel{+}= Q, \quad \text{onHand} \mathrel{-}= Q, \quad \text{reserved} \mathrel{-}= Q$$
$$\Delta \text{Damage Write-off} \implies \text{dmg} \mathrel{+}= Q, \quad \text{onHand} \mathrel{-}= Q$$
$$\Delta \text{Manual Variance} \implies \text{adjustment} \mathrel{+}= \Delta, \quad \text{onHand} \mathrel{+}= \Delta$$

### 2.2 Cost Price & Artisan Craft Formula
In Legacy ERP (`inventory_costing.py:21`), Cost Price (CP) is calculated dynamically from craft inputs:
$$\text{Calculated CP} = \text{round}\Big(\text{beadKg} \times \text{beadCostKg} + 50 \times \text{laborHours} + \text{otherMaterialCost}, \; 2\Big)$$

Where:
- $\text{beadKg}$: Weight of beads used per unit (e.g. 0.35 kg).
- $\text{beadCostKg}$: Procurement cost per kilogram of beads (e.g. ₹600/kg).
- $\text{laborHours}$: Artisan crafting time in hours (e.g. 4.5 hours).
- $50$: Fixed master artisan labour rate (₹50 / hour).
- $\text{otherMaterialCost}$: Auxiliary hardware, mirrors, velvet, metal frames, clasps.

**Safe Proposed Resolution:**
Add an optional `costing` object inside the Product and Variant models:
```typescript
interface CraftCosting {
  enabled: boolean;
  beadKg: number;
  beadCostKg: number;
  laborHours: number;
  laborRatePerHour: number; // default 50
  otherMaterialCost: number;
  calculatedCostPrice: number;
  manualOverrideCostPrice?: number;
  notes?: string;
}
```
If `enabled` is true, `unitCost` is computed via formula; if false, manual `unitCost` applies.

### 2.3 Variant-Level Inventory & Double-Counting Safeguards
- **Legacy ERP:** Followed a strict parent-child pattern (`variant_inventory.py`). If a product had varieties, the parent was marked `isVariantGroup = True` and held **0 stock**. Only child variety SKUs held stock.
- **V2 Current State:** `ProductVariant` in `catalogue.ts` has `stock?: number`, while `inventory` collection has top-level `InventoryItem` records.
- **Double-Counting Risk:** If an Admin sets stock on both the parent `KJ-ORG-101` (10 units) and its variants `KJ-ORG-101-1` (5 units) and `KJ-ORG-101-2` (5 units), aggregate inventory reports would calculate 20 units instead of 10.
- **Safeguard Rule:** When a product has dynamic variants, parent inventory is strictly derived as $\sum \text{variantStock}$, and direct editing on the parent record is locked. Stock must be adjusted at the variant SKU level.

---

## 3. Proposed Consolidated Master Inventory Schema

This proposed schema is a strict superset combining all legacy operational fields with all advanced V2 capabilities:

```typescript
export interface ConsolidatedMasterInventoryItem {
  // 1. Identity & Classification (Both Systems)
  id: string;                     // Firestore document ID
  sku: string;                    // Product or Variant SKU code (e.g. 'KJ-ORG-101' or 'KJ-ORG-101-1')
  name: string;                   // Human title
  category: string;               // Category name ('Organisers')
  categorySlug: string;           // Category URL slug ('organisers')
  unit: string;                   // Unit of measurement ('pcs', 'set')
  hsnCode: string;                // HSN Code ('56090000')
  taxRate: number;                // GST % (3, 5, 12, 18)
  displayOrder?: number;          // S.No sort order

  // 2. Hierarchy & Variant Linkage (V2 + Legacy Safeguards)
  isVariantGroup: boolean;        // True if parent container with child options
  parentSku?: string;             // Parent SKU if this item is a variant child
  variantLabel?: string;          // e.g. 'Champagne Pink'
  variantAttributes?: Record<string, string>; // { color: 'Pink', size: 'Medium' }

  // 3. Location & Type (V2 Existing)
  location: 'Mumbai Atelier' | 'Bihar Craft House';
  type: 'finished_good' | 'raw_material';
  supplier?: string;
  vendorId?: string;

  // 4. Seven Legacy Ledger Accumulators (Restoring Full Historical Integrity)
  openingStock: number;           // Baseline starting stock (open)
  stockIn: number;                // Total purchased / restocked (purch)
  quantityMade: number;           // Total manufactured in atelier (made)
  quantitySold: number;           // Total sold via online/offline orders (sold)
  damaged: number;                // Total defective / transit damage write-offs (dmg)
  marketingQty: number;           // Total PR samples / influencer giveaways (marketing)
  adjustmentQty: number;          // Net manual audit count corrections (adjustment)

  // 5. Active Operational Balances (V2 + Formula Reconciled)
  onHand: number;                 // Physical stock = open + purch + made - sold - dmg - mkt + adj
  reserved: number;               // Held in active customer checkout carts (V2 exclusive)
  available: number;              // Available to sell = onHand - reserved (V2 exclusive)

  // 6. Replenishment Thresholds (Both Systems)
  reorderPoint: number;           // Minimum stock threshold (reorder)
  deficit: number;                // Math.max(0, reorderPoint - onHand)
  suggestedMake: number;          // Math.max(reorderPoint * 2 - onHand, reorderPoint)
  status: 'in_stock' | 'low_stock' | 'out_of_stock';

  // 7. Pricing, Costing & Valuation (Both Systems + Craft Formula)
  costing?: {
    enabled: boolean;
    beadsUsed: string;            // Text formulation description
    beadKg: number;               // Bead weight per unit
    beadCostKg: number;           // Bead purchase cost / kg
    laborHours: number;           // Artisan time in hours
    laborRatePerHour: number;     // ₹50 / hour
    otherMaterialCost: number;    // Velvet, mirror, clasp, frame
    calculatedCp: number;         // Formula result
  };
  unitCost: number;               // Effective Cost Price (CP)
  retailPrice: number;            // Selling Price (SP)
  mrp: number;                    // Maximum Retail Price
  grossMarginPct: number;         // Markup = ((retailPrice - unitCost) / unitCost) * 100
  stockValue: number;             // onHand * unitCost

  // 8. Timestamps & Audit (V2 Existing)
  updatedAt: any;                 // Firestore server timestamp
  lastUpdatedDate: string;        // 'YYYY-MM-DD' ISO date
}
```

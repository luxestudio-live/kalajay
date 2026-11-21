# KALAJAY HANDCRAFTED LUXURIES
## INVENTORY, PRODUCTION & ORDER INTEGRITY REPORT

**Focus:** ERP Mathematical Consistency, BOM Relationships, and Multi-Location Stock

---

## 1. Inventory & ERP Mathematical Invariant

Throughout the entire Kalajay ecosystem, inventory follows strict mathematical consistency:

$$\text{onHand} = \text{available} + \text{reserved}$$

* **Finished Goods (`finished_good`)**: Tracked in `pcs` at Mumbai Packing Atelier and Bihar Craft House.
* **Raw Materials (`raw_material`)**: Tracked in `kg`, `spools`, and `meters` at Bihar Craft House Hub.
* **Stock Depletion & Reorder Logic**:
  * If $\text{available} \le \text{reorderPoint}$, status $\to$ `low_stock`.
  * If $\text{available} = 0$, status $\to$ `out_of_stock`.
  * If $\text{available} > \text{reorderPoint}$, status $\to$ `in_stock`.

---

## 2. Product Bill of Materials (BOM) Architecture

Every handcrafted piece maps deterministically to its raw material requirements:

```typescript
export interface ProductBomItem {
  materialSku: string;
  materialName: string;
  quantityRequired: number; // Consumption per 1 unit finished good
  unit: string;
}
```

### Standard BOM Reference Matrix
* **Heirloom Evening Bags / Purses / Clutches**:
  * `RM-BEAD-PRL-02` (Synthetic Acrylic Pearls): $0.3\text{ kg / piece}$
  * `RM-WIRE-STEEL-01` (High-Tensile Coated Steel Wire): $0.1\text{ spools / piece}$
  * `RM-FABRIC-SILK-01` (Mulberry Silk Lining Fabric): $0.5\text{ meters / piece}$
* **AirPods Capsules & Small Accessories**:
  * `RM-BEAD-GLS-01` (Czech Faceted Crystal Beads): $0.05\text{ kg / piece}$
  * `RM-WIRE-STEEL-01` (High-Tensile Coated Steel Wire): $0.02\text{ spools / piece}$

---

## 3. Work Order & Production Lifecycle Accounting

1. **Issue Work Order**:
   * Resolves BOM based on product SKU.
   * Calculates required raw material quantities: $\text{needed} = \text{bom.quantityRequired} \times \text{batchQty}$.
   * Atomically reserves raw materials: $\text{reserved} \leftarrow \text{reserved} + \text{needed}$.
   * Recalculates available raw materials.
2. **Advance Stages & 5-Point Quality Control (QC)**:
   * Inspects: (1) Bead Tension, (2) Pattern Chromatic Fidelity, (3) Lining Seams, (4) Hardware Integrity, (5) Wax Seal.
3. **Stage Completion (`wax_sealed`)**:
   * Physically consumes reserved raw materials: $\text{onHand} \leftarrow \text{onHand} - \text{needed}$; $\text{reserved} \leftarrow \text{reserved} - \text{needed}$.
   * Receives finished goods into sellable inventory: $\text{fg.onHand} \leftarrow \text{fg.onHand} + \text{batchQty}$.
   * Logs stock adjustment in `/stock_adjustments`.

---

## 4. Order Cancellation & Stock Restoration Protocol

* **Online Checkout**: Stock is decremented transactionally via Firestore `runTransaction`.
* **Manual Admin Order**: Staff order creation atomically decrements on-hand inventory.
* **Order Cancellation / RTO**:
  * Triggered when `fulfillmentStatus` transitions to `cancelled` or `rto`.
  * Server reads line items from the order document and atomically restores on-hand stock.
  * Re-evaluates `reorderPoint` thresholds.
  * Logs immutable audit movement record in `/stock_adjustments`.
  * Protects against duplicate cancellation calls (idempotent state transition).

---

## 5. Automated Concurrency & Invariant Verification

* **Simultaneous Checkout vs. Offline Order**: Handled via Firestore transactional isolation (`adminDb.runTransaction`).
* **Test Results**: 39/39 assertions passing (`test_master_operational_integrity.ts`).

# KALAJAY V2 — ADMIN PARITY IMPLEMENTATION ROADMAP

**DOCUMENT TYPE:** Technical Implementation Strategy & Planning Monograph  
**PURPOSE:** Roadmap for achieving complete functional parity with the client's legacy ERP without degrading existing V2 capabilities.  
**EXECUTION STATUS:** PROPOSED ONLY. No implementation has begun. Execution requires explicit client authorization.

---

## 1. Prioritization Matrix

Changes are grouped strictly into four priority tiers based on data integrity, operational necessity, and business impact:

```
┌────────────────────────────────────────────────────────────────────────┐
│ P0: CRITICAL (Data Integrity, Inventory Ledger, Financial Accuracy)    │
│  - 7-Counter Inventory Ledger Engine                                  │
│  - Full Expense & Financial Ledger Module                             │
│  - Variant Stock vs Parent Item Synchronization Safeguards            │
├────────────────────────────────────────────────────────────────────────┤
│ P1: ESSENTIAL (Operational Gaps in Daily Workflows)                    │
│  - Artisan Craft Costing Engine (Bead Kg + Labor Hours Formula)        │
│  - Dedicated Vendor & Supplier Master Directory                       │
│  - Rural Artisan Collective Directory (Bihar & Mumbai Profiles)        │
│  - Master Inventory Grid Enhancements (HSN, GST%, Margin%, Stock Value)│
│  - Excel (.xlsx) Bulk Import/Preview Mechanism                         │
├────────────────────────────────────────────────────────────────────────┤
│ P2: FEATURE PARITY (Useful Secondary Capabilities)                     │
│  - Low Stock Replenishment Deficit & Suggested Make Analytics          │
│  - Category Gross Profit & Margin Performance Table                    │
│  - Damage Rate by SKU Analytics                                       │
│  - Monthly Units Made vs Units Sold Capacity Balance Trend            │
├────────────────────────────────────────────────────────────────────────┤
│ P3: OPTIONAL ENHANCEMENTS & USABILITY                                  │
│  - One-Click Verified JSON Database Backup Download in Admin Settings  │
│  - Inline Spreadsheet Editing for Quick Price/Reorder Adjustments     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Work Breakdown by Phase

### Phase 2A: Master Inventory Ledger Engine & UI Parity (P0 / P1)
- **Goal:** Transform V2 `InventoryView.tsx` into a full-fidelity operational master grid while reconciling on-hand stock with immutable ledger math.
- **Data Model:**
  - Update `src/data/adminTypes.ts` with `openingStock`, `stockIn`, `quantityMade`, `quantitySold`, `damaged`, `marketingQty`, and `adjustmentQty`.
- **UI Enhancements (`InventoryView.tsx`):**
  - Add missing columns to master table: `HSN`, `GST %`, `Opening`, `Stock In`, `Made`, `Sold`, `Dmg`, `Margin %` (with color badges), `Stock Value (₹)`.
  - Add totals summary row to table footer displaying total units in stock, total stock value in INR, and blended margin %.
  - In `low_stock` watchlist, add `Deficit` and `Suggested Make` columns.
- **Backend API (`/api/admin/operations`):**
  - Update stock adjustment handler to atomically adjust `adjustmentQty` and recompute `onHand`.
- **Estimated Complexity:** Medium (3 days).
- **Dependencies:** None.

---

### Phase 2B: Craft Costing Engine & Variant Synchronization (P0 / P1)
- **Goal:** Implement the client's proprietary bead & labour costing formula and eliminate variant double-counting.
- **Data Model:**
  - Add `CraftCosting` sub-schema to `Product` and `ProductVariant` in `src/data/catalogue.ts`.
- **Formula Implementation:**
  $$\text{CP} = \text{round}\Big(\text{beadKg} \times \text{beadCostKg} + 50 \times \text{laborHours} + \text{otherMaterialCost}, \; 2\Big)$$
- **UI Enhancements (`CatalogueView.tsx`):**
  - In product pricing tab, add toggle "Automate Cost Price from Craft Formula".
  - Provide live interactive inputs for Bead Weight (kg), Bead Cost (₹/kg), Labour Hours, and Other Material Costs with dynamic CP preview.
- **Variant Safeguard:**
  - When dynamic variants are enabled, lock direct stock editing on parent container and derive parent onHand as sum of child variety stock.
- **Estimated Complexity:** Medium (2 days).
- **Dependencies:** Phase 2A.

---

### Phase 2C: Full Expense Book & Vendor Master (P0 / P1)
- **Goal:** Re-create the complete financial expense tracking and supplier management capabilities from `expense_store.py`.
- **Data Model:**
  - Create `expenses` collection in Firestore: `date`, `amount`, `type` (`expense`/`income`), `status` (`paid`/`pending`), `category`, `subcategory`, `party`, `method`, `treatment` (`OPEX`/`CAPEX`), `notes`, `bills[]`.
  - Create `vendors` collection in Firestore: `name`, `gst`, `contact`, `email`, `contracts`, `knownSince`.
  - Create `budgets` doc in Firestore: monthly spend limits per category.
- **UI Implementation (`FinanceView.tsx`):**
  - Add new tabs in `FinanceView`: `Expense Book` and `Vendors Master`.
  - Support receipt upload to Cloudinary (up to 3 attachments per expense).
  - Include Budget vs Actual spend indicator bar.
- **Backend API (`/api/admin/finance`):**
  - REST endpoints for creating, editing, and listing expenses with RBAC permission check `finance.expenses`.
- **Estimated Complexity:** High (4 days).
- **Dependencies:** None.

---

### Phase 2D: Rural Artisan Collective Directory (P1)
- **Goal:** Establish a dedicated operational registry for the Bihar & Mumbai artisan collective without requiring software login accounts.
- **Data Model:**
  - Create `artisans` collection in Firestore: `name`, `capacity` (Role: Master Weaver, Finisher, Stringer), `memberCode` (e.g. `KJ-ART-001`), `phone`, `address`, `emergencyContact`, `joinedDate`, `isFoundational21Artisan`, `photos[]`.
- **UI Implementation (`ProductionView.tsx`):**
  - Add "Artisan Collective" tab in ProductionView.
  - Link Work Order loom assignments directly to registered artisans from this directory.
- **Estimated Complexity:** Low (2 days).
- **Dependencies:** None.

---

### Phase 2E: Enhanced Financial & Damage Reports (P2)
- **Goal:** Restore the analytical tables from legacy ERP into V2 `ReportsView.tsx`.
- **UI Implementation (`ReportsView.tsx`):**
  - Add **Category Profitability Table**: Collection, SKUs, Units Made, Units Sold, Revenue, Gross Profit, Blended Margin %.
  - Add **Damage Rate by SKU Table**: Highlights fragile designs with high defect rates.
  - Add **MRP Headroom KPI Card**: Displays average tag discount headroom across catalogue.
  - Update Monthly Trend chart to show **Units Made vs Units Sold**.
- **Estimated Complexity:** Low (1.5 days).
- **Dependencies:** Phase 2A.

---

### Phase 2F: Bulk Data Excel (.xlsx) Exchange (P1 / P2)
- **Goal:** Enable bulk catalogue updates via Excel spreadsheets matching legacy `catalogue_excel.py`.
- **Features:**
  - Download current catalogue as formatted 7-column `.xlsx` (`Code`, `Name`, `Category`, `Current Qty`, `New Qty`, `Current Price`, `New Price`).
  - Upload updated workbook with interactive **Preview Changes Modal** showing modified quantities and prices before applying to Firestore.
- **Estimated Complexity:** Medium (2 days).
- **Dependencies:** Phase 2A.

---

## 3. Total Implementation Effort Summary

| Phase | Module Scope | Priority | Estimated Days |
| :--- | :--- | :---: | :---: |
| **Phase 2A** | Master Inventory Ledger & UI Parity | P0 / P1 | 3.0 days |
| **Phase 2B** | Craft Costing Engine & Variant Safeguards | P0 / P1 | 2.0 days |
| **Phase 2C** | Expense Book & Vendor Master | P0 / P1 | 4.0 days |
| **Phase 2D** | Rural Artisan Collective Directory | P1 | 2.0 days |
| **Phase 2E** | Enhanced Analytics & Damage Reports | P2 | 1.5 days |
| **Phase 2F** | Bulk Excel Exchange & Preview | P1 / P2 | 2.0 days |
| **Total** | **Comprehensive Full Parity Supersystem** | | **14.5 Days** |

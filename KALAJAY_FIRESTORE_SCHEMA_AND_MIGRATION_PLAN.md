# KALAJAY V2 — FIRESTORE SCHEMA ENHANCEMENTS & LIVE MIGRATION PLAN
**Document Version**: 2.0.0  
**Environment**: Local Staging (Zero Live Mutations Performed)  

---

## 1. Overview
This plan defines the new and enhanced Firestore collections required to support the legacy ERP capabilities in Kalajay V2. As per the strict mandate, **no writes were made to the live production Firestore database**. This document provides the authoritative blueprint for when the client authorizes the live cutover.

---

## 2. Augmented & New Firestore Collections

### 2.1 Collection: `inventory` (Augmented)
Existing documents are augmented with 7 movement accumulators and valuation metrics without overwriting existing fields:
```typescript
interface FirestoreInventoryDoc {
  sku: string;                 // Document ID
  name: string;
  category: string;
  onHand: number;              // Current balance
  available: number;           // ATS: max(0, onHand - reserved)
  reserved: number;            // V2 reservation holds
  openingStock: number;        // Legacy accumulator
  stockIn: number;             // Legacy accumulator
  quantityMade: number;        // Legacy accumulator
  quantitySold: number;        // Legacy accumulator
  damaged: number;             // Legacy accumulator
  marketingQty: number;        // Legacy accumulator
  adjustmentQty: number;       // Legacy accumulator
  reorderPoint: number;
  unitCost: number;            // Cost Price (INR)
  retailPrice: number;         // Selling Price (INR)
  mrp: number;                 // Maximum Retail Price (INR)
  stockValue: number;          // onHand * unitCost
  retailValuation: number;     // onHand * retailPrice
  grossMarginPct: number;      // ((retailPrice - unitCost) / retailPrice) * 100
  location: string;            // 'mumbai_studio' | 'bihar_craft_house'
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
  updatedAt: string;           // ISO 8601
}
```

### 2.2 Collection: `inventory_movements` (New)
Append-only immutable stock ledger entries:
```typescript
interface FirestoreInventoryMovementDoc {
  id: string;                  // Document ID: mov-{timestamp}-{rand}
  sku: string;
  productName: string;
  location: string;
  movementType: 
    | 'PURCHASE_IN'
    | 'PRODUCTION_IN'
    | 'SALES_OUT'
    | 'DAMAGE_OUT'
    | 'MARKETING_OUT'
    | 'MANUAL_ADJUSTMENT'
    | 'RESERVATION_HOLD'
    | 'RESERVATION_RELEASE';
  quantity: number;
  sourceEntity: 'purchase_order' | 'work_order' | 'order' | 'damage_report' | 'marketing_event' | 'manual_audit';
  sourceId?: string;
  unitCost?: number;
  notes?: string;
  userId: string;
  createdAt: string;           // ISO 8601
}
```

### 2.3 Collection: `expenses` (New)
Expense vouchers with OPEX/CAPEX allocation:
```typescript
interface FirestoreExpenseDoc {
  id: string;                  // Document ID: EXP-YYYY-XXXX
  date: string;                // YYYY-MM-DD
  category: 'Materials' | 'Artisan Wages' | 'Packaging' | 'Freight' | 'Studio Rent' | 'Marketing' | 'Utilities' | 'Machinery';
  treatment: 'OPEX' | 'CAPEX';
  amount: number;
  vendorId?: string;
  vendorName?: string;
  paymentMethod: 'Bank Transfer' | 'UPI' | 'Cash' | 'Credit Card';
  description: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'paid' | 'void';
  createdAt: string;
}
```

### 2.4 Collection: `vendors` (New)
Directory of raw material suppliers and trade guilds:
```typescript
interface FirestoreVendorDoc {
  id: string;                  // Document ID: VND-XXXX
  name: string;
  category: 'Glass Beads' | 'Brass Frames' | 'Velvet & Silk' | 'Loom Hardware' | 'Packaging';
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  gstin?: string;
  paymentTerms: string;
  leadTimeDays: number;
  rating: number;              // 1.0 - 5.0
  active: boolean;
  createdAt: string;
}
```

### 2.5 Collection: `artisans` (New)
Rural artisan collective master directory (strictly isolated from admin software users):
```typescript
interface FirestoreArtisanDoc {
  id: string;                  // Document ID: ART-BIH-XXX
  fullName: string;
  craftSpecialty: 'Loom Weaving' | 'Micro-Bead Embroidery' | 'Frame Assembly' | 'QC Inspection';
  hubLocation: 'Bihar Craft House Looms' | 'Mumbai Finishing Studio';
  village: string;
  enrollmentDate: string;
  assignedLoom: string;        // E.g. 'Loom Frame A-01'
  monthlyCapacityHours: number;
  hourlyRate: number;          // Default: 50 INR/hr
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  kycVerified: boolean;
  active: boolean;
  createdAt: string;
}
```

---

## 3. Migration Roadmap for Production Cutover

When live deployment is authorized, execute this safe 4-step sequence:

```
[ Step 1: Pre-Migration Backup ]
  -> Run automated read-only backup script exporting collections to local timestamped JSON fixtures.
  
[ Step 2: Schema Addition (Zero-Downtime) ]
  -> Deploy security rules defining access to new collections (`inventory_movements`, `expenses`, `vendors`, `artisans`).
  
[ Step 3: Seed Augmentation ]
  -> Seed foundational records for registered vendors, category budgets, and the 5 master artisans in Bihar & Mumbai.
  -> Populate existing inventory documents with opening stock accumulators matching current onHand values.
  
[ Step 4: Verification ]
  -> Execute read-only verification comparing document counts and math invariants across all 78 documents.
```

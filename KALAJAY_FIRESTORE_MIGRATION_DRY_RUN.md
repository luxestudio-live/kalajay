# KALAJAY V2 — FIRESTORE MIGRATION DRY RUN REPORT
**Execution Date**: 2026-11-25T05:25:00.761Z  
**Target Environment**: kalajay-667ff (Production Firestore)  
**Total Documents Scanned**: **69**  
**Detected Conflicts**: **0**  
**Missing Documents**: **0**  
**Integrity Verdict**: 100% COMPATIBLE, ADDITIVE & NON-DESTRUCTIVE  

---

## 1. Inventory Ledger Augmentation Specification
Every live inventory item retains its immutable physical quantities:
- `onHand`: **PRESERVED AS-IS** (Zero modifications)
- `available`: **PRESERVED AS-IS** (Zero modifications)
- `reserved`: **PRESERVED AS-IS** (Zero modifications)
- `retailPrice`: **PRESERVED AS-IS** (Zero modifications)
- `unitCost`: **PRESERVED AS-IS** (Zero modifications)

### Additive Accumulator Fields
For each SKU, the 7 legacy counters are initialized to establish mathematical balance:
$$\text{onHand} = \text{openingStock} + \text{stockIn} + \text{quantityMade} - \text{quantitySold} - \text{damaged} - \text{marketingQty} + \text{adjustmentQty}$$
$$\text{openingStock} = \text{current onHand}, \quad \text{other counters} = 0$$

---

## 2. Sample 5 Documents Analyzed

| SKU | Name | On-Hand | Unit Cost | Retail Price | Opening Stock | Blended Margin % |
|---|---|---|---|---|---|---|
| `KJ-APC-401` | Pearl Beaded AirPods Case | **15** | ₹180 | ₹399 | **15** | 54.9% |
| `KJ-APC-402` | Colorful Beaded AirPods Case | **15** | ₹180 | ₹399 | **15** | 54.9% |
| `KJ-APC-403` | Pastel Beaded AirPods Case | **15** | ₹225 | ₹499 | **15** | 54.9% |
| `KJ-APC-404` | Crystal Beaded AirPods Case | **15** | ₹225 | ₹499 | **15** | 54.9% |
| `KJ-APC-405` | Florescent Beaded AirPods Case | **15** | ₹225 | ₹499 | **15** | 54.9% |

---

## 3. Reversibility & Rollback Blueprint
In the event of an operational need to roll back:
1. Lossless backup is secured at `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z`.
2. A single script can remove the 7 accumulator keys without altering any original fields.

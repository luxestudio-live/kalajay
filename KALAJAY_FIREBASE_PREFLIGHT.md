# KALAJAY V2 — FIRESTORE PRODUCTION PREFLIGHT REPORT
**Date**: 2026-11-25T05:24:05.906Z  
**Firebase Project ID**: kalajay-667ff  
**Database**: (default) Cloud Firestore  
**Mode**: Read-Only Inspection  

---

## 1. Live Document Counts & Inventory Baselines

| Collection Name | Live Document Count | Sample Document IDs | Schema Notes |
|---|---|---|---|
| `products` | **69** | KJ-APC-401, KJ-APC-402, KJ-APC-403 | Catalogue products |
| `categories` | **9** | airpod-cases, candle-holders, coasters-mats | Product categories |
| `inventory` | **69** | KJ-APC-401, KJ-APC-402, KJ-APC-403 | Master inventory records |
| `orders` | **35** | KJ-129121, KJ-130062, KJ-139968 | ERP operational store |
| `users` | **24** | 4Mht1CMNtuZ9D7tPm63Ig9xPafS2, 5SWIY26CaXgfDnN2anZOnNBuxV72, 5iQ0TA1Mx6NXaTfErP9wxt4dVIz1 | ERP operational store |
| `admin_users` | **4** | 5SWIY26CaXgfDnN2anZOnNBuxV72, 5iQ0TA1Mx6NXaTfErP9wxt4dVIz1, mJ6lPWSeACcLSCSKqonwcksD87I2 | ERP operational store |
| `roles` | **0** |  | ERP operational store |
| `stock_adjustments` | **0** |  | ERP operational store |
| `audit_logs` | **3** | aud-1794819111948, aud-1794820362833, aud-1794820781269 | ERP operational store |
| `inventory_movements` | **0** |  | ERP operational store |
| `expenses` | **0** |  | ERP operational store |
| `vendors` | **0** |  | ERP operational store |
| `budgets` | **0** |  | ERP operational store |
| `artisans` | **0** |  | ERP operational store |

---

## 2. Sample Inventory Field Keys
```json
[
  {
    "id": "KJ-APC-401",
    "keys": [
      "reorderPoint",
      "available",
      "onHand",
      "reserved",
      "unitCost",
      "name",
      "location",
      "id",
      "category",
      "sku",
      "retailPrice",
      "status",
      "updatedAt"
    ]
  },
  {
    "id": "KJ-APC-402",
    "keys": [
      "reorderPoint",
      "available",
      "onHand",
      "reserved",
      "unitCost",
      "name",
      "location",
      "id",
      "category",
      "sku",
      "retailPrice",
      "status",
      "updatedAt"
    ]
  }
]
```

---

## 3. Legacy Website Dependency Assessment
- Target legacy site: `https://kalajay.in`
- The legacy site runs on an independent architecture. The collections examined are namespaced to the Kalajay V2 application store and shared Firebase project `kalajay-667ff`.
- All updates will be strictly **additive** to avoid any structural incompatibility.

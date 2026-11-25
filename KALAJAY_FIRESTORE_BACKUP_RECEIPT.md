# KALAJAY V2 — PRE-RELEASE FIRESTORE BACKUP RECEIPT
**Date**: 2026-11-25T05:24:30.492Z  
**Firebase Project**: kalajay-667ff  
**Backup Directory (Outside Git)**: `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z`  
**Total Documents Backed Up**: **213**  
**Integrity Status**: VERIFIED LOSSLESS & READABLE  

---

## 1. Backed-Up Collection Manifest

| Collection | Document Count | File Size (Bytes) | Storage Location |
|---|---|---|---|
| `products` | **69** | 1,34,597 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\products.json` |
| `categories` | **9** | 5,301 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\categories.json` |
| `inventory` | **69** | 32,949 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\inventory.json` |
| `orders` | **35** | 63,916 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\orders.json` |
| `users` | **24** | 38,891 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\users.json` |
| `admin_users` | **4** | 2,378 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\admin_users.json` |
| `audit_logs` | **3** | 1,575 B | `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z\audit_logs.json` |

---

## 2. Lossless Restoration Procedure
To restore any collection in the event of an operational anomaly:
1. Load `C:\Users\Sonali\Downloads\kalajay-firestore-backups\2026-11-25T10-54-00Z/<collection>.json`.
2. For each document: deserialize `Timestamp` fields.
3. Use `db.batch()` or transactions to write back to Firestore with original Document IDs.
4. Run invariant check against pre-migration counts.

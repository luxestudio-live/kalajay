import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { SEED_ROLES } from '@/data/adminPermissions';
import { AdminRole } from '@/data/adminTypes';
import { readRbacStore, writeRbacStore, verifyStaffPermission } from '@/lib/serverRbac';
import { getAdminFirestore } from '@/lib/serverFirebaseAdmin';

export const dynamic = 'force-dynamic';

// ==========================================
// GET HANDLER: Fetch Roles, Customers, or Inventory
// ==========================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // ------------------------------------------
    // ACTION: Fetch Registered Customers/Patrons
    // ------------------------------------------
    if (action === 'customers_list' || action === 'patrons') {
      const authCheck = await verifyStaffPermission(request, null, 'customers.directory', 'view');
      if (!authCheck.authorized && authCheck.code !== 'PERMISSION_DENIED') {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      const customers: any[] = [];

      if (adminDb) {
        const snapshot = await adminDb.collection('users').get();
        snapshot.forEach(docSnap => {
          customers.push({ id: docSnap.id, ...docSnap.data() });
        });
      } else if (db && db.type) {
        const snapshot = await getDocs(collection(db, 'users'));
        snapshot.forEach((docSnap: any) => {
          customers.push({ id: docSnap.id, ...docSnap.data() });
        });
      }

      return NextResponse.json({ success: true, customers });
    }

    // ------------------------------------------
    // ACTION: Fetch Authoritative Inventory ERP
    // ------------------------------------------
    if (action === 'inventory_list' || action === 'inventory') {
      let authCheck = await verifyStaffPermission(request, null, 'inventory.master', 'view');
      if (!authCheck.authorized) {
        authCheck = await verifyStaffPermission(request, null, 'inventory.all', 'view');
      }
      if (!authCheck.authorized) {
        authCheck = await verifyStaffPermission(request, null, 'inventory.low_stock', 'view');
      }
      if (!authCheck.authorized && authCheck.code !== 'PERMISSION_DENIED') {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      const inventory: any[] = [];

      if (adminDb) {
        const snapshot = await adminDb.collection('inventory').get();
        snapshot.forEach(docSnap => {
          inventory.push({ id: docSnap.id, ...docSnap.data() });
        });
      } else if (db && db.type) {
        const snapshot = await getDocs(collection(db, 'inventory'));
        snapshot.forEach((docSnap: any) => {
          inventory.push({ id: docSnap.id, ...docSnap.data() });
        });
      }

      return NextResponse.json({ success: true, inventory });
    }

    // ------------------------------------------
    // DEFAULT ACTION: Fetch Roles
    // ------------------------------------------
    const authCheck = await verifyStaffPermission(request, null, 'settings.roles', 'view');
    if (!authCheck.authorized && authCheck.code !== 'PERMISSION_DENIED') {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    const store = readRbacStore();
    const customRoles = store.customRoles || {};
    const usersMap = store.users || {};

    try {
      const fsSnap = await getDocs(collection(db, 'admin_roles'));
      fsSnap.forEach(d => {
        const data = d.data() as AdminRole;
        if (data && (data.id || d.id)) {
          customRoles[data.id || d.id] = data;
        }
      });
    } catch {}

    const roleUserCounts: Record<string, number> = {};
    Object.values(usersMap).forEach((u: any) => {
      if (u.roleId && u.status === 'active') {
        roleUserCounts[u.roleId] = (roleUserCounts[u.roleId] || 0) + 1;
      }
    });

    const roleMap = new Map<string, AdminRole>();

    SEED_ROLES.forEach(r => {
      roleMap.set(r.id, {
        ...r,
        userCount: roleUserCounts[r.id] ?? r.userCount ?? 0,
      });
    });

    Object.values(customRoles).forEach((r: any) => {
      roleMap.set(r.id, {
        ...r,
        userCount: roleUserCounts[r.id] ?? 0,
      });
    });

    const allRoles = Array.from(roleMap.values());
    return NextResponse.json({ success: true, roles: allRoles });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to list roles.' },
      { status: 500 }
    );
  }
}

// ==========================================
// POST HANDLER: Save Role, Delete SKU, Anonymize Patron
// ==========================================
export async function POST(request: Request) {
  try {
    const body: any = await request.json().catch(() => ({}));
    const action = body.action;

    // ------------------------------------------
    // ACTION 00: Process / Sweep Notification Outbox
    // ------------------------------------------
    if (action === 'process_outbox' || action === 'sweep_notifications') {
      const authCheck = await verifyStaffPermission(request, body, 'orders.orders', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const { processPendingNotificationOutbox } = await import('@/lib/orderEmailDispatcher');
      const stats = await processPendingNotificationOutbox({
        maxAttempts: body.maxAttempts ? Number(body.maxAttempts) : 3,
        limit: body.limit ? Number(body.limit) : 50,
      });

      return NextResponse.json({
        success: true,
        stats,
        message: `Notification outbox sweep completed: ${stats.processed} processed, ${stats.succeeded} recovered/sent, ${stats.failed} failed.`,
      });
    }

    // ------------------------------------------
    // ACTION 0A: Save Inventory SKU (Create/Update)
    // ------------------------------------------
    if (action === 'inventory_save') {
      const item = body.item || body;
      const targetSku = item.sku || item.id;
      if (!targetSku) {
        return NextResponse.json(
          { success: false, error: 'Mandatory field missing: sku is required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'inventory.all', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        const invRef = adminDb.collection('inventory').doc(targetSku);
        await invRef.set({
          ...item,
          sku: targetSku,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        const auditLogRecord = {
          id: `aud-inv-${Date.now()}`,
          userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          userName: authCheck.staffUser?.name || 'Staff User',
          action: 'SAVE_INVENTORY_SKU',
          module: 'inventory',
          details: `Saved inventory SKU ${targetSku} (${item.name || ''}, available: ${item.available ?? item.onHand}) with server RBAC enforcement.`,
          timestamp: new Date().toISOString(),
        };
        await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
      }

      return NextResponse.json({
        success: true,
        sku: targetSku,
        message: `Inventory SKU ${targetSku} saved successfully.`,
      });
    }

    // ------------------------------------------
    // ACTION 0B: Stock Adjustment Audit
    // ------------------------------------------
    if (action === 'stock_adjust') {
      const { adjustment } = body;
      if (!adjustment || !adjustment.sku) {
        return NextResponse.json(
          { success: false, error: 'Mandatory fields missing: adjustment and sku are required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'inventory.all', 'adjust_stock');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        const invRef = adminDb.collection('inventory').doc(adjustment.sku);
        const invSnap = await invRef.get();
        if (invSnap.exists) {
          const invData = invSnap.data()!;
          const currentReserved = Number(invData.reserved ?? 0);
          const nextOnHand = Number(adjustment.adjustedQty);
          const nextAvailable = Math.max(0, nextOnHand - currentReserved);
          const nextStatus = nextAvailable === 0 ? 'out_of_stock' : nextAvailable <= (invData.reorderPoint || 5) ? 'low_stock' : 'in_stock';

          await invRef.update({
            onHand: nextOnHand,
            available: nextAvailable,
            status: nextStatus,
            updatedAt: new Date().toISOString(),
          });
        }

        const adjId = adjustment.id || `adj-${Date.now()}`;
        await adminDb.collection('stock_adjustments').doc(adjId).set({
          ...adjustment,
          id: adjId,
          loggedBy: authCheck.staffUser?.name || 'Authorized Staff',
          timestamp: new Date().toISOString(),
        });

        const auditLogRecord = {
          id: `aud-adj-${Date.now()}`,
          userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          userName: authCheck.staffUser?.name || 'Staff User',
          action: 'LOG_STOCK_ADJUSTMENT',
          module: 'inventory',
          details: `Adjusted physical stock for SKU ${adjustment.sku}: ${adjustment.previousQty} -> ${adjustment.adjustedQty} (diff: ${adjustment.difference}) [Reason: ${adjustment.reason}]`,
          timestamp: new Date().toISOString(),
        };
        await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
      }

      return NextResponse.json({
        success: true,
        adjustmentId: adjustment.id,
        message: `Stock adjustment for ${adjustment.sku} logged in audit ledger.`,
      });
    }

    // ------------------------------------------
    // ACTION 0B2: Authoritative Inventory Movement Ledger Entry
    // ------------------------------------------
    if (action === 'inventory_movement') {
      const { movement } = body;
      if (!movement || !movement.sku || !movement.movementType || typeof movement.quantity !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Mandatory fields missing: movement, sku, movementType, and quantity are required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'inventory.all', 'adjust_stock');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        const invRef = adminDb.collection('inventory').doc(movement.sku);
        const invSnap = await invRef.get();
        const invData = invSnap.exists ? invSnap.data()! : {};

        let openingStock = Number(invData.openingStock ?? 0);
        let stockIn = Number(invData.stockIn ?? 0);
        let quantityMade = Number(invData.quantityMade ?? 0);
        let quantitySold = Number(invData.quantitySold ?? 0);
        let damaged = Number(invData.damaged ?? 0);
        let marketingQty = Number(invData.marketingQty ?? 0);
        let adjustmentQty = Number(invData.adjustmentQty ?? 0);
        const reserved = Number(invData.reserved ?? 0);
        const reorderPoint = Number(invData.reorderPoint ?? 5);
        const unitCost = Number(invData.unitCost ?? movement.unitCost ?? 0);

        const qty = movement.quantity;
        switch (movement.movementType) {
          case 'OPENING_BALANCE':
            openingStock = Math.max(0, qty);
            break;
          case 'PURCHASE_IN':
            stockIn += Math.max(0, qty);
            break;
          case 'PRODUCTION_IN':
            quantityMade += Math.max(0, qty);
            break;
          case 'SALE_OUT':
            quantitySold += Math.max(0, Math.abs(qty));
            break;
          case 'DAMAGE_OUT':
            damaged += Math.max(0, Math.abs(qty));
            break;
          case 'MARKETING_OUT':
            marketingQty += Math.max(0, Math.abs(qty));
            break;
          case 'MANUAL_ADJUSTMENT':
            adjustmentQty += qty;
            break;
          case 'RETURN_IN':
            quantitySold = Math.max(0, quantitySold - Math.max(0, qty));
            break;
          default:
            break;
        }

        const prevOnHand = Number(invData.onHand ?? 0);
        const nextOnHand = Math.max(0, openingStock + stockIn + quantityMade - quantitySold - damaged - marketingQty + adjustmentQty);
        const nextAvailable = Math.max(0, nextOnHand - reserved);
        const nextStatus = nextOnHand === 0 ? 'out_of_stock' : nextOnHand <= reorderPoint ? 'low_stock' : 'in_stock';
        const stockValue = nextOnHand * unitCost;

        await invRef.set({
          ...invData,
          openingStock,
          stockIn,
          quantityMade,
          quantitySold,
          damaged,
          marketingQty,
          adjustmentQty,
          onHand: nextOnHand,
          available: nextAvailable,
          status: nextStatus,
          stockValue,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        const movId = movement.id || `mov-${Date.now()}`;
        await adminDb.collection('inventory_movements').doc(movId).set({
          ...movement,
          id: movId,
          previousBalance: prevOnHand,
          newBalance: nextOnHand,
          actor: authCheck.staffUser?.name || 'Staff User',
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        message: `Inventory movement logged successfully for ${movement.sku}.`,
      });
    }

    // ------------------------------------------
    // ACTION 0B3: Expense Save (Phase 2C)
    // ------------------------------------------
    if (action === 'expense_save') {
      const { expense } = body;
      if (!expense || !expense.id || typeof expense.amount !== 'number') {
        return NextResponse.json(
          { success: false, error: 'Mandatory fields missing: valid expense object with id and amount is required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'finance.overview', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('expenses').doc(expense.id).set({
          ...expense,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return NextResponse.json({ success: true, message: `Expense ${expense.id} persisted.` });
    }

    // ------------------------------------------
    // ACTION 0B4: Vendor Save (Phase 2C)
    // ------------------------------------------
    if (action === 'vendor_save') {
      const { vendor } = body;
      if (!vendor || !vendor.id || !vendor.name) {
        return NextResponse.json(
          { success: false, error: 'Mandatory fields missing: vendor id and name are required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'finance.overview', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('vendors').doc(vendor.id).set({
          ...vendor,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return NextResponse.json({ success: true, message: `Vendor ${vendor.name} persisted.` });
    }

    // ------------------------------------------
    // ACTION 0B5: Artisan Save (Phase 2D)
    // ------------------------------------------
    if (action === 'artisan_save') {
      const { artisan } = body;
      if (!artisan || !artisan.id || !artisan.name || !artisan.memberCode) {
        return NextResponse.json(
          { success: false, error: 'Mandatory fields missing: artisan id, memberCode, and name are required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'production.looms', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('artisans').doc(artisan.id).set({
          ...artisan,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return NextResponse.json({ success: true, message: `Artisan ${artisan.name} (${artisan.memberCode}) persisted.` });
    }

    // ------------------------------------------
    // ACTION 0C: Store Settings Save (Identity & Logistics)
    // ------------------------------------------
    if (action === 'store_settings_save') {
      const { settings } = body;
      if (!settings || typeof settings !== 'object') {
        return NextResponse.json(
          { success: false, error: 'Mandatory field missing: settings object is required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'settings.store', 'edit');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();
      if (adminDb) {
        const storeRef = adminDb.collection('settings').doc('store');
        await storeRef.set({
          ...settings,
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        const auditLogRecord = {
          id: `aud-store-${Date.now()}`,
          userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          userName: authCheck.staffUser?.name || 'Staff User',
          action: 'UPDATE_STORE_IDENTITY',
          module: 'settings',
          details: `Updated store identity & logistics settings in /settings/store per authorized staff operation.`,
          timestamp: new Date().toISOString(),
        };
        await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
      } else {
        await setDoc(doc(db, 'settings', 'store'), {
          ...settings,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      }

      return NextResponse.json({
        success: true,
        message: 'Store settings saved successfully.',
      });
    }

    // ------------------------------------------
    // ACTION 1: Delete Inventory SKU
    // ------------------------------------------
    if (action === 'inventory_delete' || (body.sku && !body.role && !body.patronId && !action)) {
      const targetSku = body.sku || body.id;

      if (!targetSku) {
        return NextResponse.json(
          { success: false, error: 'Mandatory field missing: sku is required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'inventory.all', 'delete');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();

      if (adminDb) {
        const activeOrdersSnap = await adminDb
          .collection('orders')
          .where('fulfillmentStatus', 'in', ['unfulfilled', 'in_loom', 'quality_checked'])
          .get();

        for (const orderDoc of activeOrdersSnap.docs) {
          const orderData = orderDoc.data();
          const items = orderData.items || [];
          const hasCommittedItem = items.some(
            (it: any) => it.sku === targetSku || it.productId === targetSku
          );
          if (hasCommittedItem) {
            return NextResponse.json(
              {
                success: false,
                code: 'SKU_COMMITTED_TO_ACTIVE_ORDERS',
                error: `Operational Guardrail: Cannot delete or archive SKU "${targetSku}". It is currently committed to active pending order #${orderDoc.id} (${orderData.customerName || 'Patron'}). Fulfill or cancel the order first.`,
              },
              { status: 400 }
            );
          }
        }

        const invRef = adminDb.collection('inventory').doc(targetSku);
        await invRef.delete();

        const auditLogRecord = {
          id: `aud-${Date.now()}`,
          userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          userName: authCheck.staffUser?.name || 'Staff User',
          action: 'DELETE_INVENTORY_SKU',
          module: 'inventory',
          details: `Deleted inventory SKU ${targetSku} after verifying 0 committed units in active order queues.`,
          timestamp: new Date().toISOString(),
        };
        await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
      } else {
        await deleteDoc(doc(db, 'inventory', targetSku));
      }

      return NextResponse.json({
        success: true,
        sku: targetSku,
        message: `Inventory SKU ${targetSku} successfully removed.`,
      });
    }

    // ------------------------------------------
    // ACTION 2: DPDP Patron Data Erasure
    // ------------------------------------------
    if (action === 'customer_anonymize' || body.patronId) {
      const patronId = body.patronId;

      if (!patronId) {
        return NextResponse.json(
          { success: false, error: 'Mandatory field missing: patronId is required.' },
          { status: 400 }
        );
      }

      const authCheck = await verifyStaffPermission(request, body, 'customers.all', 'delete');
      if (!authCheck.authorized) {
        return NextResponse.json(
          { success: false, error: authCheck.error, code: authCheck.code },
          { status: authCheck.status }
        );
      }

      const adminDb = getAdminFirestore();

      if (adminDb) {
        const activeOrdersSnap = await adminDb
          .collection('orders')
          .where('userId', '==', patronId)
          .where('fulfillmentStatus', 'in', ['in_loom', 'quality_checked', 'shipped'])
          .get();

        if (!activeOrdersSnap.empty) {
          return NextResponse.json(
            {
              success: false,
              code: 'IN_TRANSIT_ORDERS_EXIST',
              error: `DPDP Guardrail: Cannot anonymize patron ${patronId} while order #${activeOrdersSnap.docs[0].id} is in transit or loom production. Delivery must complete before personal data can be purged.`,
            },
            { status: 400 }
          );
        }

        const userRef = adminDb.collection('users').doc(patronId);
        const userSnap = await userRef.get();
        if (userSnap.exists) {
          await userRef.update({
            name: `Anonymized Patron (DPDP Ref #${patronId})`,
            email: 'redacted@privacy.kalajay.in',
            phone: '+91 XXXXX XXXXX',
            addresses: [],
            deviceTokens: [],
            marketingConsent: false,
            dpdpErasureStatus: 'COMPLETED',
            dpdpErasureDate: new Date().toISOString(),
            dpdpErasureAuthorizedBy: authCheck.staffUser?.staffId || authCheck.staffUser?.id,
            updatedAt: new Date().toISOString(),
          });
        }

        const auditLogRecord = {
          id: `aud-dpdp-${Date.now()}`,
          userId: authCheck.staffUser?.staffId || authCheck.staffUser?.id || 'KJ-ADM-001',
          userName: authCheck.staffUser?.name || 'Staff User',
          action: 'DPDP_RIGHT_TO_BE_FORGOTTEN_EXECUTED',
          module: 'customers',
          details: `Personal identifiers for patron ${patronId} purged under Digital Personal Data Protection Act 2023. Statutory tax transaction records retained per Sec 36 CGST Act 2017.`,
          timestamp: new Date().toISOString(),
        };
        await adminDb.collection('audit_logs').doc(auditLogRecord.id).set(auditLogRecord);
      } else {
        const userRef = doc(db, 'users', patronId);
        await updateDoc(userRef, {
          name: `Anonymized Patron (DPDP Ref #${patronId})`,
          email: 'redacted@privacy.kalajay.in',
          phone: '+91 XXXXX XXXXX',
          addresses: [],
          dpdpErasureStatus: 'COMPLETED',
          updatedAt: new Date().toISOString(),
        });
      }

      return NextResponse.json({
        success: true,
        patronId,
        message: `Personal identifiers for patron ${patronId} successfully anonymized per DPDP Act 2023.`,
      });
    }

    // ------------------------------------------
    // ACTION 3: Save / Create Role
    // ------------------------------------------
    const { role } = body;

    const authCheck = await verifyStaffPermission(request, body, 'settings.roles', 'manage_roles');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    if (!role || !role.name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Role name and permissions are required.' },
        { status: 400 }
      );
    }

    if (role.id === 'role-super-admin') {
      return NextResponse.json(
        { success: false, error: 'Immutable Role: System role "role-super-admin" cannot be edited or modified.' },
        { status: 403 }
      );
    }

    const store = readRbacStore();
    store.customRoles = store.customRoles || {};

    const nowIso = new Date().toISOString();
    const isEditing = Boolean(role.id && store.customRoles[role.id]);
    const roleId = isEditing ? role.id : role.id || `role-custom-${Date.now()}`;

    const savedRole: AdminRole = {
      id: roleId,
      name: role.name.trim(),
      description: role.description?.trim() || 'Custom operational role.',
      isSystem: false,
      userCount: store.customRoles[roleId]?.userCount || 0,
      permissions: role.permissions || {},
      created: store.customRoles[roleId]?.created || nowIso,
      updated: nowIso,
    };

    store.customRoles[roleId] = savedRole;
    writeRbacStore(store);

    try {
      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('admin_roles').doc(roleId).set(savedRole, { merge: true });
      } else {
        await setDoc(doc(db, 'admin_roles', roleId), savedRole, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore role sync warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      role: savedRole,
      message: `Role "${savedRole.name}" saved successfully.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error processing operation.' },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE HANDLER: Delete Role
// ==========================================
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');

    const authCheck = await verifyStaffPermission(request, null, 'settings.roles', 'manage_roles');
    if (!authCheck.authorized) {
      return NextResponse.json(
        { success: false, error: authCheck.error, code: authCheck.code },
        { status: authCheck.status }
      );
    }

    if (!roleId) {
      return NextResponse.json(
        { success: false, error: 'roleId parameter is required.' },
        { status: 400 }
      );
    }

    const isSystemRole = SEED_ROLES.some(r => r.id === roleId);
    if (isSystemRole || roleId === 'role-super-admin') {
      return NextResponse.json(
        { success: false, error: 'System Role Protection: Predefined system template roles cannot be deleted.' },
        { status: 403 }
      );
    }

    const store = readRbacStore();
    const usersMap = store.users || {};
    const assignedStaff = Object.values(usersMap).filter(
      (u: any) => u.roleId === roleId && u.status === 'active'
    );

    if (assignedStaff.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete role. There are ${assignedStaff.length} active staff member(s) assigned to this role. Please reassign them first.`,
        },
        { status: 409 }
      );
    }

    if (store.customRoles && store.customRoles[roleId]) {
      delete store.customRoles[roleId];
      writeRbacStore(store);
    }

    try {
      const adminDb = getAdminFirestore();
      if (adminDb) {
        await adminDb.collection('admin_roles').doc(roleId).delete();
      } else {
        await deleteDoc(doc(db, 'admin_roles', roleId));
      }
    } catch (fsErr) {
      console.warn('Firestore role deletion warning:', fsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Role "${roleId}" has been safely retired.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Server error deleting role.' },
      { status: 500 }
    );
  }
}

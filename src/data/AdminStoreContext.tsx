'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AdminModuleId,
  PermissionAction,
  AdminRole,
  AdminUser,
  FeaturedProductsConfig,
  HomepageSectionConfig,
  BannerItem,
  InventoryItem,
  StockAdjustment,
  WorkOrder,
  AdminOrder,
  CustomOrderRequest,
  CorporateEnquiry,
  SupportTicket,
  CouponItem,
  AuditLogItem,
} from './adminTypes';
import { ADMIN_MODULE_DEFINITIONS, SEED_ROLES } from './adminPermissions';
import {
  SEED_ADMIN_USERS,
  SEED_FEATURED_PRODUCTS_CONFIG,
  SEED_HOMEPAGE_SECTIONS,
  SEED_BANNERS,
  SEED_INVENTORY_ITEMS,
  SEED_STOCK_ADJUSTMENTS,
  SEED_WORK_ORDERS,
  SEED_ORDERS,
  SEED_CUSTOM_REQUESTS,
  SEED_CORPORATE_ENQUIRIES,
  SEED_SUPPORT_TICKETS,
  SEED_COUPONS,
  SEED_AUDIT_LOGS,
} from './adminSeedData';

interface AdminStoreContextType {
  // Navigation & Role Simulation
  activeRole: AdminRole;
  allRoles: AdminRole[];
  currentUser: AdminUser;
  allUsers: AdminUser[];
  activeModule: AdminModuleId;
  activeSubPage: string;
  setActiveModule: (mod: AdminModuleId) => void;
  setActiveSubPage: (sub: string) => void;
  switchRole: (roleId: string) => void;

  // Permission Checks (UI-Demonstration only)
  can: (pageId: string, action: PermissionAction) => boolean;
  isPageAccessible: (pageId: string) => boolean;
  isModuleAccessible: (moduleId: AdminModuleId) => boolean;

  // Role Management
  createRole: (role: Omit<AdminRole, 'id' | 'created' | 'updated'>) => AdminRole;
  updateRole: (id: string, updates: Partial<AdminRole>) => void;
  deleteRole: (id: string) => { success: boolean; error?: string };

  // Staff User Management with Cryptographic Credentials
  createAdminUser: (data: {
    name: string;
    email: string;
    phone?: string;
    roleId: string;
    department: string;
  }) => { user: AdminUser; provisionalPassword: string };
  toggleUserStatus: (userId: string) => void;

  // Featured Products Management
  featuredConfig: FeaturedProductsConfig;
  updateFeaturedProducts: (updates: Partial<FeaturedProductsConfig>) => void;

  // Website & Content CMS
  homepageSections: HomepageSectionConfig[];
  updateHomepageSection: (sectionId: string, fields: Record<string, any>) => void;
  banners: BannerItem[];
  updateBanner: (bannerId: string, updates: Partial<BannerItem>) => void;
  createBanner: (banner: Omit<BannerItem, 'id'>) => void;
  deleteBanner: (bannerId: string) => void;

  // Inventory & Stock Adjustments (ERP)
  inventory: InventoryItem[];
  stockAdjustments: StockAdjustment[];
  adjustStock: (
    sku: string,
    adjustedQty: number,
    reason: StockAdjustment['reason'],
    notes: string
  ) => void;
  createInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Production & Work Orders (Bihar Hub)
  workOrders: WorkOrder[];
  updateWorkOrderStage: (orderId: string, stage: WorkOrder['stage'], qcPassed?: boolean) => void;
  createWorkOrder: (order: Omit<WorkOrder, 'id'>) => void;

  // Orders & Sales
  orders: AdminOrder[];
  updateOrderStatus: (
    orderId: string,
    fulfillmentStatus: AdminOrder['fulfillmentStatus'],
    note?: string
  ) => void;
  createManualOrder: (order: Omit<AdminOrder, 'id' | 'createdAt'>) => AdminOrder;

  // Custom Orders & Gifting
  customRequests: CustomOrderRequest[];
  updateCustomRequestStatus: (
    id: string,
    status: CustomOrderRequest['status'],
    finalQuotedPrice?: number
  ) => void;
  corporateEnquiries: CorporateEnquiry[];
  updateCorporateStatus: (id: string, status: CorporateEnquiry['status']) => void;

  // Support
  supportTickets: SupportTicket[];
  addSupportMessage: (ticketId: string, text: string) => void;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status']) => void;

  // Marketing & Coupons
  coupons: CouponItem[];
  createCoupon: (coupon: Omit<CouponItem, 'id' | 'usageCount'>) => void;
  toggleCouponStatus: (id: string) => void;

  // Audit Logs
  auditLogs: AuditLogItem[];
  logAction: (action: string, module: AdminModuleId, details: string) => void;

  // State Reset
  resetDemoData: () => void;
}

const AdminStoreContext = createContext<AdminStoreContextType | null>(null);

const STORAGE_KEY = 'kalajay_admin_store_v3';

export function AdminStoreProvider({ children }: { children: React.ReactNode }) {
  // 1. Core State
  const [activeRoleId, setActiveRoleId] = useState<string>('role-super-admin');
  const [activeModule, setActiveModule] = useState<AdminModuleId>('dashboard');
  const [activeSubPage, setActiveSubPage] = useState<string>('dashboard.overview');

  const [roles, setRoles] = useState<AdminRole[]>(SEED_ROLES);
  const [users, setUsers] = useState<AdminUser[]>(SEED_ADMIN_USERS);
  const [featuredConfig, setFeaturedConfig] = useState<FeaturedProductsConfig>(
    SEED_FEATURED_PRODUCTS_CONFIG
  );
  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(
    SEED_HOMEPAGE_SECTIONS
  );
  const [banners, setBanners] = useState<BannerItem[]>(SEED_BANNERS);
  const [inventory, setInventory] = useState<InventoryItem[]>(SEED_INVENTORY_ITEMS);
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(
    SEED_STOCK_ADJUSTMENTS
  );
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(SEED_WORK_ORDERS);
  const [orders, setOrders] = useState<AdminOrder[]>(SEED_ORDERS);
  const [customRequests, setCustomRequests] = useState<CustomOrderRequest[]>(
    SEED_CUSTOM_REQUESTS
  );
  const [corporateEnquiries, setCorporateEnquiries] = useState<CorporateEnquiry[]>(
    SEED_CORPORATE_ENQUIRIES
  );
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(
    SEED_SUPPORT_TICKETS
  );
  const [coupons, setCoupons] = useState<CouponItem[]>(SEED_COUPONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(SEED_AUDIT_LOGS);

  // 2. Load from LocalStorage if available on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.roles) setRoles(parsed.roles);
        if (parsed.users) {
          const sanitized = parsed.users.map((u: AdminUser) =>
            u.id === 'KJ-ADM-001'
              ? { ...u, name: 'Soumya (Founder)', email: 'soumya@kalajay.in', roleName: 'Founder & Head of Maison', department: 'Founders Office & Creative Direction' }
              : u
          );
          setUsers(sanitized);
        }
        if (parsed.featuredConfig) setFeaturedConfig(parsed.featuredConfig);
        if (parsed.homepageSections) setHomepageSections(parsed.homepageSections);
        if (parsed.banners) setBanners(parsed.banners);
        if (parsed.inventory) setInventory(parsed.inventory);
        if (parsed.stockAdjustments) setStockAdjustments(parsed.stockAdjustments);
        if (parsed.workOrders) setWorkOrders(parsed.workOrders);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.customRequests) setCustomRequests(parsed.customRequests);
        if (parsed.corporateEnquiries) setCorporateEnquiries(parsed.corporateEnquiries);
        if (parsed.supportTickets) setSupportTickets(parsed.supportTickets);
        if (parsed.coupons) setCoupons(parsed.coupons);
        if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      }
    } catch {
      // safe fallback to in-memory state
    }
  }, []);

  // 3. Persist to LocalStorage on changes
  const saveState = (updated: any) => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          roles,
          users,
          featuredConfig,
          homepageSections,
          banners,
          inventory,
          stockAdjustments,
          workOrders,
          orders,
          customRequests,
          corporateEnquiries,
          supportTickets,
          coupons,
          auditLogs,
          ...updated,
        })
      );
    } catch {
      // ignore storage quota errors
    }
  };

  // Log audit helper
  const logAction = (action: string, module: AdminModuleId, details: string) => {
    const newLog: AuditLogItem = {
      id: `aud-${Date.now()}`,
      userId: users[0]?.id || 'KJ-ADM-001',
      userName: users[0]?.name || 'Soumya (Founder)',
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => {
      const next = [newLog, ...prev.slice(0, 99)];
      saveState({ auditLogs: next });
      return next;
    });
  };

  // Active Role & User resolution
  const activeRole = useMemo(() => {
    return roles.find(r => r.id === activeRoleId) || roles[0] || SEED_ROLES[0];
  }, [roles, activeRoleId]);

  const currentUser = users[0] || SEED_ADMIN_USERS[0];

  // Permission Checks (UI demonstration)
  const can = (pageId: string, action: PermissionAction): boolean => {
    if (activeRole.id === 'role-super-admin') return true;
    const actions = activeRole.permissions[pageId];
    if (!actions) return false;
    return actions.includes(action);
  };

  const isPageAccessible = (pageId: string): boolean => {
    if (activeRole.id === 'role-super-admin') return true;
    const actions = activeRole.permissions[pageId];
    return Boolean(actions && actions.length > 0 && actions.includes('view'));
  };

  const isModuleAccessible = (moduleId: AdminModuleId): boolean => {
    if (activeRole.id === 'role-super-admin') return true;
    const modDef = ADMIN_MODULE_DEFINITIONS.find(m => m.moduleId === moduleId);
    if (!modDef) return false;
    return modDef.pages.some(pg => isPageAccessible(pg.id));
  };

  // Switch role ("View as Role" simulation)
  const switchRole = (roleId: string) => {
    setActiveRoleId(roleId);
    logAction('ROLE_SIMULATION_SWITCH', 'settings', `Simulating perspective of role ID: ${roleId}`);
  };

  // Role Management
  const createRole = (roleData: Omit<AdminRole, 'id' | 'created' | 'updated'>): AdminRole => {
    const newRole: AdminRole = {
      ...roleData,
      id: `role-${Date.now()}`,
      isSystem: false,
      userCount: 0,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
    };
    const next = [...roles, newRole];
    setRoles(next);
    saveState({ roles: next });
    logAction('CREATE_CUSTOM_ROLE', 'settings', `Created custom role: ${newRole.name}`);
    return newRole;
  };

  const updateRole = (id: string, updates: Partial<AdminRole>) => {
    const next = roles.map(r => {
      if (r.id === id) {
        return {
          ...r,
          ...updates,
          updated: new Date().toISOString(),
        };
      }
      return r;
    });
    setRoles(next);
    saveState({ roles: next });
    logAction('UPDATE_ROLE_PERMISSIONS', 'settings', `Updated permissions for role ID: ${id}`);
  };

  const deleteRole = (id: string): { success: boolean; error?: string } => {
    const target = roles.find(r => r.id === id);
    if (!target) return { success: false, error: 'Role not found' };
    if (target.isSystem) {
      return { success: false, error: 'System template roles are protected and cannot be deleted.' };
    }
    const next = roles.filter(r => r.id !== id);
    setRoles(next);
    saveState({ roles: next });
    logAction('DELETE_CUSTOM_ROLE', 'settings', `Deleted custom role: ${target.name}`);
    return { success: true };
  };

  // Cryptographic Runtime User Creation
  const createAdminUser = (data: {
    name: string;
    email: string;
    phone?: string;
    roleId: string;
    department: string;
  }): { user: AdminUser; provisionalPassword: string } => {
    // Generate high-entropy provisional password using window.crypto
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*';
    const array = new Uint8Array(14);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < 14; i++) array[i] = Math.floor(Math.random() * 256);
    }
    let provisionalPassword = 'Kj#';
    for (let i = 0; i < 11; i++) {
      provisionalPassword += chars[array[i] % chars.length];
    }

    const assignedRole = roles.find(r => r.id === data.roleId) || roles[0];
    const newId = `KJ-ADM-${Math.floor(100 + Math.random() * 900)}`;

    const newUser: AdminUser = {
      id: newId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      roleId: assignedRole.id,
      roleName: assignedRole.name,
      department: data.department,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    // Update state WITHOUT persisting the plaintext password to localStorage or DB
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveState({ users: nextUsers });

    logAction(
      'CREATE_STAFF_USER',
      'settings',
      `Provisioned demo staff account for ${newUser.name} (${newUser.email}) with role ${assignedRole.name}`
    );

    return { user: newUser, provisionalPassword };
  };

  const toggleUserStatus = (userId: string) => {
    // Safeguard: cannot deactivate final Super Admin
    if (userId === 'KJ-ADM-001') {
      alert('Safeguard Alert: The primary Super Admin account cannot be deactivated.');
      return;
    }
    const nextUsers = users.map(u => {
      if (u.id === userId) {
        const newStatus: 'active' | 'deactivated' = u.status === 'active' ? 'deactivated' : 'active';
        return { ...u, status: newStatus };
      }
      return u;
    });
    setUsers(nextUsers);
    saveState({ users: nextUsers });
    logAction('TOGGLE_USER_STATUS', 'settings', `Toggled account status for user ID: ${userId}`);
  };

  // Featured Products
  const updateFeaturedProducts = (updates: Partial<FeaturedProductsConfig>) => {
    const next: FeaturedProductsConfig = {
      ...featuredConfig,
      ...updates,
      lastEdited: new Date().toISOString(),
    };
    setFeaturedConfig(next);
    saveState({ featuredConfig: next });
    logAction(
      'UPDATE_FEATURED_PRODUCTS',
      'featured-products',
      `Updated featured curation (${next.productIds.length} pieces, mode: ${next.mode}, status: ${next.status})`
    );
  };

  // Homepage Sections
  const updateHomepageSection = (sectionId: string, fields: Record<string, any>) => {
    const next = homepageSections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          fields: { ...sec.fields, ...fields },
          lastEdited: new Date().toISOString(),
        };
      }
      return sec;
    });
    setHomepageSections(next);
    saveState({ homepageSections: next });
    logAction('UPDATE_HOMEPAGE_SECTION', 'cms', `Modified content fields for section: ${sectionId}`);
  };

  // Banners
  const updateBanner = (bannerId: string, updates: Partial<BannerItem>) => {
    const next = banners.map(b => (b.id === bannerId ? { ...b, ...updates } : b));
    setBanners(next);
    saveState({ banners: next });
    logAction('UPDATE_BANNER', 'cms', `Updated banner/ticker ID: ${bannerId}`);
  };

  const createBanner = (bannerData: Omit<BannerItem, 'id'>) => {
    const newBanner: BannerItem = {
      ...bannerData,
      id: `ban-${Date.now()}`,
    };
    const next = [newBanner, ...banners];
    setBanners(next);
    saveState({ banners: next });
    logAction('CREATE_BANNER', 'cms', `Created promotional announcement: ${newBanner.title}`);
  };

  const deleteBanner = (bannerId: string) => {
    const next = banners.filter(b => b.id !== bannerId);
    setBanners(next);
    saveState({ banners: next });
    logAction('DELETE_BANNER', 'cms', `Removed banner ID: ${bannerId}`);
  };

  // Stock Adjustment (ERP)
  const adjustStock = (
    sku: string,
    adjustedQty: number,
    reason: StockAdjustment['reason'],
    notes: string
  ) => {
    let previousQty = 0;
    let targetName = sku;

    const nextInventory = inventory.map(item => {
      if (item.sku === sku) {
        previousQty = item.onHand;
        targetName = item.name;
        const diff = adjustedQty - previousQty;
        const newAvailable = Math.max(0, item.available + diff);
        const newStatus: InventoryItem['status'] =
          adjustedQty === 0
            ? 'out_of_stock'
            : adjustedQty <= item.reorderPoint
            ? 'low_stock'
            : 'in_stock';
        return {
          ...item,
          onHand: adjustedQty,
          available: newAvailable,
          status: newStatus,
        };
      }
      return item;
    });

    const newAdjustment: StockAdjustment = {
      id: `ADJ-${Date.now()}`,
      sku,
      productName: targetName,
      previousQty,
      adjustedQty,
      difference: adjustedQty - previousQty,
      reason,
      loggedBy: currentUser.name,
      timestamp: new Date().toISOString(),
      notes,
    };

    setInventory(nextInventory);
    const nextAdj = [newAdjustment, ...stockAdjustments];
    setStockAdjustments(nextAdj);
    saveState({ inventory: nextInventory, stockAdjustments: nextAdj });

    logAction(
      'STOCK_ADJUSTMENT',
      'inventory',
      `Adjusted ${sku} (${targetName}) from ${previousQty} to ${adjustedQty} [Reason: ${reason}]`
    );
  };

  const createInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
    };
    const next = [newItem, ...inventory];
    setInventory(next);
    saveState({ inventory: next });
    logAction(
      'CREATE_INVENTORY_ITEM',
      'inventory',
      `Registered new SKU: ${newItem.sku} (${newItem.name}) in ${newItem.location}`
    );
  };

  const updateInventoryItem = (id: string, updates: Partial<InventoryItem>) => {
    const next = inventory.map(item => (item.id === id ? { ...item, ...updates } : item));
    setInventory(next);
    saveState({ inventory: next });
    logAction('UPDATE_INVENTORY_ITEM', 'inventory', `Updated inventory SKU specifications: ${id}`);
  };

  const deleteInventoryItem = (id: string) => {
    const target = inventory.find(i => i.id === id);
    const next = inventory.filter(item => item.id !== id);
    setInventory(next);
    saveState({ inventory: next });
    logAction(
      'DELETE_INVENTORY_ITEM',
      'inventory',
      `Archived inventory item: ${target?.sku || id} (${target?.name || ''})`
    );
  };

  // Work Orders (Atelier Production)
  const updateWorkOrderStage = (
    orderId: string,
    stage: WorkOrder['stage'],
    qcPassed?: boolean
  ) => {
    const next = workOrders.map(wo => {
      if (wo.id === orderId) {
        return {
          ...wo,
          stage,
          qcPassed: qcPassed !== undefined ? qcPassed : wo.qcPassed,
          actualDate: stage === 'wax_sealed' ? new Date().toISOString().split('T')[0] : wo.actualDate,
        };
      }
      return wo;
    });
    setWorkOrders(next);
    saveState({ workOrders: next });
    logAction(
      'PRODUCTION_STAGE_TRANSITION',
      'production',
      `Work order ${orderId} transitioned to ${stage}`
    );
  };

  const createWorkOrder = (orderData: Omit<WorkOrder, 'id'>) => {
    const newWo: WorkOrder = {
      ...orderData,
      id: `WO-${Date.now().toString().slice(-6)}`,
    };
    const next = [newWo, ...workOrders];
    setWorkOrders(next);
    saveState({ workOrders: next });
    logAction('CREATE_WORK_ORDER', 'production', `Issued new work order for ${newWo.productName}`);
  };

  // Orders
  const updateOrderStatus = (
    orderId: string,
    fulfillmentStatus: AdminOrder['fulfillmentStatus'],
    note?: string
  ) => {
    const next = orders.map(ord => {
      if (ord.id === orderId) {
        const newTimeline = [
          ...ord.timeline,
          {
            title: `Fulfillment Status: ${fulfillmentStatus.toUpperCase()}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            note,
          },
        ];
        return {
          ...ord,
          fulfillmentStatus,
          timeline: newTimeline,
        };
      }
      return ord;
    });
    setOrders(next);
    saveState({ orders: next });
    logAction('ORDER_FULFILLMENT_UPDATE', 'orders', `Order ${orderId} updated to ${fulfillmentStatus}`);
  };

  const createManualOrder = (orderData: Omit<AdminOrder, 'id' | 'createdAt'>): AdminOrder => {
    const newOrder: AdminOrder = {
      ...orderData,
      id: `KJ-${Math.floor(88220 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    const next = [newOrder, ...orders];
    setOrders(next);
    saveState({ orders: next });
    logAction('CREATE_MANUAL_ORDER', 'orders', `Created manual concierge order ${newOrder.id}`);
    return newOrder;
  };

  // Custom & Corporate
  const updateCustomRequestStatus = (
    id: string,
    status: CustomOrderRequest['status'],
    finalQuotedPrice?: number
  ) => {
    const next = customRequests.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          finalQuotedPrice: finalQuotedPrice !== undefined ? finalQuotedPrice : c.finalQuotedPrice,
        };
      }
      return c;
    });
    setCustomRequests(next);
    saveState({ customRequests: next });
    logAction('CUSTOM_REQUEST_STATUS', 'custom-orders', `Custom request ${id} updated to ${status}`);
  };

  const updateCorporateStatus = (id: string, status: CorporateEnquiry['status']) => {
    const next = corporateEnquiries.map(c => (c.id === id ? { ...c, status } : c));
    setCorporateEnquiries(next);
    saveState({ corporateEnquiries: next });
    logAction('CORPORATE_ENQUIRY_STATUS', 'gifting', `Corporate enquiry ${id} updated to ${status}`);
  };

  // Support
  const addSupportMessage = (ticketId: string, text: string) => {
    const next = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'waiting_patron' as const,
          messages: [
            ...t.messages,
            {
              sender: 'concierge' as const,
              senderName: currentUser.name,
              text,
              timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            },
          ],
        };
      }
      return t;
    });
    setSupportTickets(next);
    saveState({ supportTickets: next });
    logAction('SUPPORT_TICKET_REPLY', 'support', `Replied to support ticket ${ticketId}`);
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    const next = supportTickets.map(t => (t.id === ticketId ? { ...t, status } : t));
    setSupportTickets(next);
    saveState({ supportTickets: next });
  };

  // Coupons
  const createCoupon = (couponData: Omit<CouponItem, 'id' | 'usageCount'>) => {
    const newCoupon: CouponItem = {
      ...couponData,
      id: `coup-${Date.now()}`,
      usageCount: 0,
    };
    const next = [newCoupon, ...coupons];
    setCoupons(next);
    saveState({ coupons: next });
    logAction('CREATE_COUPON', 'marketing', `Created promo code: ${newCoupon.code}`);
  };

  const toggleCouponStatus = (id: string) => {
    const next = coupons.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setCoupons(next);
    saveState({ coupons: next });
  };

  // Reset demo data to fresh seed state
  const resetDemoData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setRoles(SEED_ROLES);
    setUsers(SEED_ADMIN_USERS);
    setFeaturedConfig(SEED_FEATURED_PRODUCTS_CONFIG);
    setHomepageSections(SEED_HOMEPAGE_SECTIONS);
    setBanners(SEED_BANNERS);
    setInventory(SEED_INVENTORY_ITEMS);
    setStockAdjustments(SEED_STOCK_ADJUSTMENTS);
    setWorkOrders(SEED_WORK_ORDERS);
    setOrders(SEED_ORDERS);
    setCustomRequests(SEED_CUSTOM_REQUESTS);
    setCorporateEnquiries(SEED_CORPORATE_ENQUIRIES);
    setSupportTickets(SEED_SUPPORT_TICKETS);
    setCoupons(SEED_COUPONS);
    setAuditLogs(SEED_AUDIT_LOGS);
    setActiveRoleId('role-super-admin');
    setActiveModule('dashboard');
    setActiveSubPage('dashboard.overview');
    alert('Kalajay Management Console demo state has been reset to pristine seed defaults.');
  };

  return (
    <AdminStoreContext.Provider
      value={{
        activeRole,
        allRoles: roles,
        currentUser,
        allUsers: users,
        activeModule,
        activeSubPage,
        setActiveModule,
        setActiveSubPage,
        switchRole,
        can,
        isPageAccessible,
        isModuleAccessible,
        createRole,
        updateRole,
        deleteRole,
        createAdminUser,
        toggleUserStatus,
        featuredConfig,
        updateFeaturedProducts,
        homepageSections,
        updateHomepageSection,
        banners,
        updateBanner,
        createBanner,
        deleteBanner,
        inventory,
        stockAdjustments,
        adjustStock,
        createInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,
        workOrders,
        updateWorkOrderStage,
        createWorkOrder,
        orders,
        updateOrderStatus,
        createManualOrder,
        customRequests,
        updateCustomRequestStatus,
        corporateEnquiries,
        updateCorporateStatus,
        supportTickets,
        addSupportMessage,
        updateTicketStatus,
        coupons,
        createCoupon,
        toggleCouponStatus,
        auditLogs,
        logAction,
        resetDemoData,
      }}
    >
      {children}
    </AdminStoreContext.Provider>
  );
}

export function useAdminStore() {
  const context = useContext(AdminStoreContext);
  if (!context) {
    throw new Error('useAdminStore must be used within an AdminStoreProvider');
  }
  return context;
}


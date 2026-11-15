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
  TaxSlab,
  OfflineOrder,
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
  SEED_TAX_SLABS,
  SEED_OFFLINE_ORDERS,
} from './adminSeedData';
import {
  getAllFirestoreOrders,
  createFirestoreOrder,
  updateFirestoreOrderStatus,
  subscribeToOrders,
  getFirestoreCustomEnquiries,
  updateFirestoreCustomEnquiry,
  subscribeToCustomEnquiries,
  getFirestoreCorporateEnquiries,
  updateFirestoreCorporateEnquiry,
  getFirestoreSupportTickets,
  addFirestoreSupportMessage,
  updateFirestoreTicketStatus,
  subscribeToSupportTickets,
  getFirestoreFeaturedConfig,
  saveFirestoreFeaturedConfig,
  getFirestoreBanners,
  saveFirestoreBanners,
  getFirestoreInventory,
  saveFirestoreInventoryItem,
  logFirestoreStockAdjustment,
  getFirestoreCoupons,
  saveFirestoreCoupon,
  logFirestoreAuditAction,
} from '@/lib/firestore';

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
    note?: string,
    paymentStatus?: AdminOrder['paymentStatus']
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

  // Finance, GST & Offline Orders
  taxSlabs: TaxSlab[];
  createTaxSlab: (slab: Omit<TaxSlab, 'id' | 'taxableTurnover' | 'taxCollected'>) => TaxSlab;
  updateTaxSlab: (id: string, updates: Partial<TaxSlab>) => void;
  deleteTaxSlab: (id: string) => void;

  offlineOrders: OfflineOrder[];
  createOfflineOrder: (order: Omit<OfflineOrder, 'id' | 'createdAt'>) => OfflineOrder;
  updateOfflineOrderStatus: (orderId: string, paymentStatus: OfflineOrder['paymentStatus']) => void;

  // Global Luxury Modal / Dialog System (Replaces browser alert and confirm)
  globalModal: {
    isOpen: boolean;
    title: string;
    subtitle?: string;
    icon?: 'info' | 'success' | 'warning' | 'danger' | 'shield';
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    isDestructive?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  } | null;
  showModal: (config: {
    title: string;
    subtitle?: string;
    icon?: 'info' | 'success' | 'warning' | 'danger' | 'shield';
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm?: () => void;
    isDestructive?: boolean;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  }) => void;
  closeModal: () => void;

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
  const [taxSlabs, setTaxSlabs] = useState<TaxSlab[]>(SEED_TAX_SLABS);
  const [offlineOrders, setOfflineOrders] = useState<OfflineOrder[]>(SEED_OFFLINE_ORDERS);

  // Global Luxury Modal / Dialog State
  const [globalModal, setGlobalModal] = useState<AdminStoreContextType['globalModal']>(null);

  const showModal = (config: Parameters<AdminStoreContextType['showModal']>[0]) => {
    setGlobalModal({
      isOpen: true,
      confirmLabel: 'Acknowledge',
      ...config,
    });
  };

  const closeModal = () => {
    setGlobalModal(null);
  };

  // 2. Load from LocalStorage and sync with Cloud Firestore
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
        if (parsed.taxSlabs) setTaxSlabs(parsed.taxSlabs);
        if (parsed.offlineOrders) setOfflineOrders(parsed.offlineOrders);
      }
    } catch {
      // safe fallback to in-memory state
    }

    // Async hydration from live Cloud Firestore
    const hydrateFromFirestore = async () => {
      try {
        const [liveOrders, liveCustom, liveTickets, liveFeatured, liveBanners, liveInv, liveCoupons] =
          await Promise.allSettled([
            getAllFirestoreOrders(),
            getFirestoreCustomEnquiries(),
            getFirestoreSupportTickets(),
            getFirestoreFeaturedConfig(),
            getFirestoreBanners(),
            getFirestoreInventory(),
            getFirestoreCoupons(),
          ]);

        if (liveOrders.status === 'fulfilled' && liveOrders.value.length > 0) {
          setOrders(liveOrders.value);
        }
        if (liveCustom.status === 'fulfilled' && liveCustom.value.length > 0) {
          setCustomRequests(liveCustom.value);
        }
        if (liveTickets.status === 'fulfilled' && liveTickets.value.length > 0) {
          setSupportTickets(liveTickets.value);
        }
        if (liveFeatured.status === 'fulfilled' && liveFeatured.value) {
          setFeaturedConfig(liveFeatured.value);
        }
        if (liveBanners.status === 'fulfilled' && liveBanners.value.length > 0) {
          setBanners(liveBanners.value);
        }
        if (liveInv.status === 'fulfilled' && liveInv.value.length > 0) {
          setInventory(liveInv.value);
        }
        if (liveCoupons.status === 'fulfilled' && liveCoupons.value.length > 0) {
          setCoupons(liveCoupons.value);
        }
      } catch (err) {
        console.warn('Initial Firestore hydration deferred:', err);
      }
    };

    hydrateFromFirestore();

    // Setup live real-time listeners
    const unsubOrders = subscribeToOrders((liveOrders) => {
      if (liveOrders.length > 0) {
        setOrders(liveOrders);
      }
    });

    const unsubCustom = subscribeToCustomEnquiries((liveCustom) => {
      if (liveCustom.length > 0) {
        setCustomRequests(liveCustom);
      }
    });

    const unsubTickets = subscribeToSupportTickets((liveTickets) => {
      if (liveTickets.length > 0) {
        setSupportTickets(liveTickets);
      }
    });

    return () => {
      if (unsubOrders) unsubOrders();
      if (unsubCustom) unsubCustom();
      if (unsubTickets) unsubTickets();
    };
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
          taxSlabs,
          offlineOrders,
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
    logFirestoreAuditAction(newLog).catch(() => {});
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

    // Update state and cache provisioned runtime credentials for admin login gate
    const nextUsers = [...users, newUser];
    setUsers(nextUsers);
    saveState({ users: nextUsers });

    if (typeof window !== 'undefined') {
      try {
        const storedCreds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
        storedCreds[newUser.email.toLowerCase()] = provisionalPassword;
        storedCreds[newUser.id.toUpperCase()] = provisionalPassword;
        localStorage.setItem('kalajay_staff_credentials', JSON.stringify(storedCreds));
      } catch (e) {
        console.warn('Failed caching staff credentials:', e);
      }
    }

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
      showModal({
        title: 'Security Safeguard Notice',
        subtitle: 'Protected Super Admin Account',
        icon: 'shield',
        message: 'The primary Super Admin account for Soumya (Founder) is protected and cannot be deactivated to ensure permanent platform access.',
        confirmLabel: 'Understood',
      });
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
    saveFirestoreFeaturedConfig(next).catch(() => {});
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
    saveFirestoreBanners(next).catch(() => {});
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
    saveFirestoreBanners(next).catch(() => {});
    logAction('CREATE_BANNER', 'cms', `Created promotional announcement: ${newBanner.title}`);
  };

  const deleteBanner = (bannerId: string) => {
    const next = banners.filter(b => b.id !== bannerId);
    setBanners(next);
    saveState({ banners: next });
    saveFirestoreBanners(next).catch(() => {});
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

    // Sync to Firestore
    const changedItem = nextInventory.find(i => i.sku === sku);
    if (changedItem) {
      saveFirestoreInventoryItem(changedItem).catch(() => {});
    }
    logFirestoreStockAdjustment(newAdjustment).catch(() => {});

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
    note?: string,
    paymentStatus?: AdminOrder['paymentStatus']
  ) => {
    let updatedOrder: AdminOrder | undefined;
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
        updatedOrder = {
          ...ord,
          fulfillmentStatus,
          timeline: newTimeline,
          ...(paymentStatus ? { paymentStatus } : {}),
        };
        return updatedOrder;
      }
      return ord;
    });
    setOrders(next);
    saveState({ orders: next });

    if (updatedOrder) {
      updateFirestoreOrderStatus(orderId, {
        fulfillmentStatus,
        timeline: updatedOrder.timeline,
        ...(paymentStatus ? { paymentStatus } : {}),
      }).catch(() => {});
    }

    logAction('ORDER_FULFILLMENT_UPDATE', 'orders', `Order ${orderId} updated to ${fulfillmentStatus}${paymentStatus ? ` (payment: ${paymentStatus})` : ''}`);
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
    createFirestoreOrder(newOrder).catch(() => {});
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
    updateFirestoreCustomEnquiry(id, {
      status,
      finalQuotedPrice,
    }).catch(() => {});
    logAction('CUSTOM_REQUEST_STATUS', 'custom-orders', `Custom request ${id} updated to ${status}`);
  };

  const updateCorporateStatus = (id: string, status: CorporateEnquiry['status']) => {
    const next = corporateEnquiries.map(c => (c.id === id ? { ...c, status } : c));
    setCorporateEnquiries(next);
    saveState({ corporateEnquiries: next });
    updateFirestoreCorporateEnquiry(id, { status }).catch(() => {});
    logAction('CORPORATE_ENQUIRY_STATUS', 'gifting', `Corporate enquiry ${id} updated to ${status}`);
  };

  // Support
  const addSupportMessage = (ticketId: string, text: string) => {
    const msgObj = {
      sender: 'concierge' as const,
      senderName: currentUser.name,
      text,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    const next = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: 'waiting_patron' as const,
          messages: [
            ...t.messages,
            msgObj,
          ],
        };
      }
      return t;
    });
    setSupportTickets(next);
    saveState({ supportTickets: next });
    addFirestoreSupportMessage(ticketId, msgObj).catch(() => {});
    logAction('SUPPORT_TICKET_REPLY', 'support', `Replied to support ticket ${ticketId}`);
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status']) => {
    const next = supportTickets.map(t => (t.id === ticketId ? { ...t, status } : t));
    setSupportTickets(next);
    saveState({ supportTickets: next });
    updateFirestoreTicketStatus(ticketId, status).catch(() => {});
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
    saveFirestoreCoupon(newCoupon).catch(() => {});
    logAction('CREATE_COUPON', 'marketing', `Created promo code: ${newCoupon.code}`);
  };

  const toggleCouponStatus = (id: string) => {
    let toggled: CouponItem | undefined;
    const next = coupons.map(c => {
      if (c.id === id) {
        toggled = { ...c, isActive: !c.isActive };
        return toggled;
      }
      return c;
    });
    setCoupons(next);
    saveState({ coupons: next });
    if (toggled) {
      saveFirestoreCoupon(toggled).catch(() => {});
    }
  };

  // Tax Slabs (HSN) Management
  const createTaxSlab = (slabData: Omit<TaxSlab, 'id' | 'taxableTurnover' | 'taxCollected'>): TaxSlab => {
    const newSlab: TaxSlab = {
      ...slabData,
      id: `slab-${Date.now().toString().slice(-4)}`,
      taxableTurnover: 0,
      taxCollected: 0,
    };
    const next = [...taxSlabs, newSlab];
    setTaxSlabs(next);
    saveState({ taxSlabs: next });
    logAction('CREATE_TAX_SLAB', 'finance', `Created tax slab ${newSlab.hsnCode} (${newSlab.gstRate}% GST)`);
    return newSlab;
  };

  const updateTaxSlab = (id: string, updates: Partial<TaxSlab>) => {
    const next = taxSlabs.map(s => (s.id === id ? { ...s, ...updates } : s));
    setTaxSlabs(next);
    saveState({ taxSlabs: next });
    logAction('UPDATE_TAX_SLAB', 'finance', `Updated tax slab ID: ${id}`);
  };

  const deleteTaxSlab = (id: string) => {
    const target = taxSlabs.find(s => s.id === id);
    const next = taxSlabs.filter(s => s.id !== id);
    setTaxSlabs(next);
    saveState({ taxSlabs: next });
    logAction('DELETE_TAX_SLAB', 'finance', `Archived/Removed tax slab ${target?.hsnCode || id}`);
  };

  // Offline Orders & Studio Sales
  const createOfflineOrder = (orderData: Omit<OfflineOrder, 'id' | 'createdAt'>): OfflineOrder => {
    const newId = `KJ-OFF-2026-${String(offlineOrders.length + 1).padStart(3, '0')}`;
    const newOrder: OfflineOrder = {
      ...orderData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    const nextOffline = [newOrder, ...offlineOrders];
    setOfflineOrders(nextOffline);

    // Update tax slab turnover & tax collected
    const matchedSlab = taxSlabs.find(s => s.hsnCode === newOrder.hsnCode);
    let nextTaxSlabs = taxSlabs;
    if (matchedSlab) {
      nextTaxSlabs = taxSlabs.map(s => {
        if (s.id === matchedSlab.id) {
          return {
            ...s,
            taxableTurnover: s.taxableTurnover + newOrder.taxableAmount,
            taxCollected: s.taxCollected + (newOrder.cgst + newOrder.sgst + newOrder.igst),
          };
        }
        return s;
      });
      setTaxSlabs(nextTaxSlabs);
    }

    // Reflect into master orders
    const companionAdminOrder: AdminOrder = {
      id: newOrder.id,
      customerName: newOrder.customerName,
      customerEmail: newOrder.customerEmail || 'concierge@kalajay.in',
      customerPhone: newOrder.customerPhone,
      items: newOrder.items.map(it => ({
        productId: it.productId,
        name: it.name,
        sku: it.sku,
        price: it.price,
        quantity: it.quantity,
        image: 'https://www.kalajay.in/v2/p3-2.jpg',
      })),
      subtotal: newOrder.subtotal,
      discount: newOrder.discount,
      shipping: 0,
      tax: newOrder.cgst + newOrder.sgst + newOrder.igst,
      total: newOrder.total,
      paymentStatus: newOrder.paymentStatus === 'paid' ? 'paid' : 'pending',
      paymentMethod: (newOrder.paymentMethod === 'Direct UPI QR' ? 'UPI Instant' : 'WhatsApp Direct') as AdminOrder['paymentMethod'],
      fulfillmentStatus: 'delivered',
      shippingAddress: {
        addressLine: newOrder.location,
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400018',
      },
      timeline: [
        { title: `Offline Sale Recorded (${newOrder.channelLabel})`, timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') },
        { title: 'Tax Invoice Handed / Sent to Patron', timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ') },
      ],
      artisanNote: `Offline studio transaction recorded by ${newOrder.recordedBy}. Invoice: ${newOrder.invoiceNumber}`,
      createdAt: newOrder.createdAt,
    };
    const nextOrders = [companionAdminOrder, ...orders];
    setOrders(nextOrders);

    saveState({
      offlineOrders: nextOffline,
      taxSlabs: nextTaxSlabs,
      orders: nextOrders,
    });

    logAction('RECORD_OFFLINE_ORDER', 'finance', `Recorded offline sale ${newOrder.invoiceNumber} (₹${newOrder.total}) via ${newOrder.channelLabel}`);
    return newOrder;
  };

  const updateOfflineOrderStatus = (orderId: string, paymentStatus: OfflineOrder['paymentStatus']) => {
    const next = offlineOrders.map(o => (o.id === orderId ? { ...o, paymentStatus } : o));
    setOfflineOrders(next);
    saveState({ offlineOrders: next });
    logAction('UPDATE_OFFLINE_PAYMENT', 'finance', `Updated offline order ${orderId} payment status to ${paymentStatus}`);
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
    setTaxSlabs(SEED_TAX_SLABS);
    setOfflineOrders(SEED_OFFLINE_ORDERS);
    setActiveRoleId('role-super-admin');
    setActiveModule('dashboard');
    setActiveSubPage('dashboard.overview');
    showModal({
      title: 'Console Reset Complete',
      subtitle: 'Seed Defaults Restored',
      icon: 'success',
      message: 'The Kalajay Management Console demo state has been reset to pristine seed defaults across inventory, loom work orders, and tax ledgers.',
      confirmLabel: 'Continue to Console',
    });
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
        taxSlabs,
        createTaxSlab,
        updateTaxSlab,
        deleteTaxSlab,
        offlineOrders,
        createOfflineOrder,
        updateOfflineOrderStatus,
        globalModal,
        showModal,
        closeModal,
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


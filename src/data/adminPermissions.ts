import type { ModulePermissionDef, AdminRole, PermissionAction } from './adminTypes';

export const ADMIN_MODULE_DEFINITIONS: ModulePermissionDef[] = [
  {
    moduleId: 'dashboard',
    name: 'Overview & Dashboard',
    description: 'Executive KPIs, sales trends, activity logs, and pending approvals.',
    pages: [
      {
        id: 'dashboard.overview',
        name: 'Executive Dashboard',
        description: 'High-level commerce & operations summary metrics and trends.',
        supportedActions: ['view', 'export'],
      },
      {
        id: 'dashboard.activity',
        name: 'Live Activity & Alerts',
        description: 'Real-time order, loom, and inventory alert streams.',
        supportedActions: ['view'],
      },
    ],
  },
  {
    moduleId: 'cms',
    name: 'Website & Content (Visual CMS)',
    description: 'Manage storefront pages, visual sections, banners, storytelling, and SEO.',
    pages: [
      {
        id: 'cms.homepage',
        name: 'Homepage Builder',
        description: 'Visual section-by-section homepage layout and copy editor.',
        supportedActions: ['view', 'edit', 'publish'],
      },
      {
        id: 'cms.banners',
        name: 'Banners & Announcements',
        description: 'Marquee tickers, header promos, and scheduled popups.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'publish'],
      },
      {
        id: 'cms.media',
        name: 'Media Library',
        description: 'Digital asset gallery, photography, dimension inspector.',
        supportedActions: ['view', 'create', 'delete'],
      },
      {
        id: 'cms.story',
        name: 'Our Story & Artisans',
        description: 'Chronicle chapters, 21 women makers profiles, and atelier visits.',
        supportedActions: ['view', 'edit', 'publish'],
      },
      {
        id: 'cms.navigation',
        name: 'Navigation & Menus',
        description: 'Header link sequences, collection dropdowns, and footer columns.',
        supportedActions: ['view', 'edit', 'publish'],
      },
      {
        id: 'cms.policies',
        name: 'FAQ & Policies',
        description: 'Shipping & returns terms, care advice, privacy policy content.',
        supportedActions: ['view', 'edit', 'publish'],
      },
      {
        id: 'cms.seo',
        name: 'SEO & Metadata',
        description: 'Meta titles, OpenGraph imagery, canonical URLs, and 301 redirects.',
        supportedActions: ['view', 'edit', 'publish'],
      },
    ],
  },
  {
    moduleId: 'featured-products',
    name: 'Featured Products Studio',
    description: 'Curate, order, and preview showcase pieces for the storefront rail.',
    pages: [
      {
        id: 'featured.curator',
        name: 'Featured Products Curator',
        description: 'Direct catalogue search, manual sequencing, stock alerts, live preview.',
        supportedActions: ['view', 'edit', 'publish'],
      },
    ],
  },
  {
    moduleId: 'catalogue',
    name: 'Catalogue & Products',
    description: 'Manage handcrafted pieces, collections, categories, and reviews.',
    pages: [
      {
        id: 'catalogue.products',
        name: 'All Products',
        description: 'Search, filter, edit prices, materials, dimensions, and variants.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'publish', 'export'],
      },
      {
        id: 'catalogue.collections',
        name: 'Collections & Editions',
        description: 'Curate the 9 signature collections, cover assets, and taglines.',
        supportedActions: ['view', 'create', 'edit', 'publish'],
      },
      {
        id: 'catalogue.reviews',
        name: 'Review Moderation',
        description: 'Approve, feature, or archive patron reviews and star ratings.',
        supportedActions: ['view', 'approve', 'delete'],
      },
    ],
  },
  {
    moduleId: 'inventory',
    name: 'Inventory & Procurement (ERP)',
    description: 'Master stock ledger across Mumbai and Bihar, low-stock alerts, BOM, adjustments.',
    pages: [
      {
        id: 'inventory.master',
        name: 'Master Inventory Ledger',
        description: 'Finished goods and raw materials on-hand, reserved, available.',
        supportedActions: ['view', 'export', 'adjust_stock'],
      },
      {
        id: 'inventory.low_stock',
        name: 'Low Stock Alerts',
        description: 'Threshold alerts triggering reorders and artisan loom runs.',
        supportedActions: ['view', 'export'],
      },
      {
        id: 'inventory.adjustments',
        name: 'Stock Adjustments Log',
        description: 'Audit log of count variances, defects, samples, and damage with reason.',
        supportedActions: ['view', 'create', 'export'],
      },
      {
        id: 'inventory.materials',
        name: 'Raw Materials & Suppliers',
        description: 'Czech glass beads, wire spools, silk linings, brass hardware.',
        supportedActions: ['view', 'create', 'edit'],
      },
    ],
  },
  {
    moduleId: 'orders',
    name: 'Orders & Sales',
    description: 'Ecommerce customer orders, manual orders, timeline stages, invoices.',
    pages: [
      {
        id: 'orders.all',
        name: 'All Orders',
        description: 'Multi-status order tracking, fulfillment states, timeline milestones.',
        supportedActions: ['view', 'create', 'edit', 'export', 'refund'],
      },
      {
        id: 'orders.manual',
        name: 'Create Manual Order',
        description: 'Concierge phone, WhatsApp, and private client bespoke entries.',
        supportedActions: ['view', 'create'],
      },
      {
        id: 'orders.invoices',
        name: 'Invoices & Receipts',
        description: 'GST-compliant tax invoices and commercial credit notes.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    moduleId: 'production',
    name: 'Production & Atelier',
    description: 'Work orders, artisan loom allocation in Bihar, quality control inspections.',
    pages: [
      {
        id: 'production.work_orders',
        name: 'Work Orders & Looms',
        description: 'Active loom runs, artisan assignments, target handcraft finish dates.',
        supportedActions: ['view', 'create', 'edit', 'approve', 'export'],
      },
      {
        id: 'production.qc',
        name: 'Quality Control (QC)',
        description: 'Bead tension, knot concealment, and structural balance sign-off.',
        supportedActions: ['view', 'approve', 'edit'],
      },
      {
        id: 'production.stages',
        name: 'Craft Pipeline Stages',
        description: 'Configure, reorder, add, and edit artisan loom stages and action workflows.',
        supportedActions: ['view', 'create', 'edit', 'delete'],
      },
    ],
  },
  {
    moduleId: 'shipping',
    name: 'Shipping & Fulfilment',
    description: 'Shipment manifests, carrier AWB tracking, dispatch, RTO handling.',
    pages: [
      {
        id: 'shipping.shipments',
        name: 'Shipments & Dispatch',
        description: 'Kalajay in-house dispatch, self-managed deliveries, consignment labels, and tracking.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        id: 'shipping.rules',
        name: 'Shipping Rules & Zones',
        description: 'Free shipping threshold (₹599) and express dispatch policies.',
        supportedActions: ['view', 'edit'],
      },
    ],
  },
  {
    moduleId: 'customers',
    name: 'Customers & Patrons',
    description: 'Patron directory, spend history, addresses, preferences, privacy requests.',
    pages: [
      {
        id: 'customers.directory',
        name: 'Patron Directory',
        description: 'Circle patron tiers, lifetime spend, orders, contact profiles.',
        supportedActions: ['view', 'export', 'edit'],
      },
    ],
  },
  {
    moduleId: 'custom-orders',
    name: 'Custom Orders & Bespoke Studio',
    description: 'Customer requests from /customise, quotations, design approval, proofs.',
    pages: [
      {
        id: 'custom.requests',
        name: 'Custom Requests & Quotes',
        description: 'Review custom requests, formulate prices, upload photos, schedule looms.',
        supportedActions: ['view', 'create', 'edit', 'approve'],
      },
    ],
  },
  {
    moduleId: 'gifting',
    name: 'Gifting & Bulk Enquiries',
    description: 'Wedding favours, corporate bulk quotes, luxury hampers, event dates.',
    pages: [
      {
        id: 'gifting.corporate',
        name: 'Corporate & Wedding Favours',
        description: 'Bulk volume quotes, sample dispatch, event timeline coordination.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
    ],
  },
  {
    moduleId: 'marketing',
    name: 'Marketing & Offers',
    description: 'Coupon codes, promotional campaigns, newsletter subscribers.',
    pages: [
      {
        id: 'marketing.coupons',
        name: 'Coupons & Promo Codes',
        description: 'Discount percentages, flat rupee codes, usage caps, and expirations.',
        supportedActions: ['view', 'create', 'edit', 'delete'],
      },
      {
        id: 'marketing.subscribers',
        name: 'Newsletter Patrons',
        description: 'Audience list, opt-in timestamps, and campaign engagement.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    moduleId: 'finance',
    name: 'Finance & GST',
    description: 'Revenue reconciliation, payment settlements, expenses, GST breakdown.',
    pages: [
      {
        id: 'finance.overview',
        name: 'Financial Ledger',
        description: 'Gross revenue, COGS, payment gateway fees, and operating margins.',
        supportedActions: ['view', 'export'],
      },
      {
        id: 'finance.offline',
        name: 'Offline & Studio Sales',
        description: 'Direct studio walk-ins, exhibitions, pop-ups, and offline tax invoices.',
        supportedActions: ['view', 'create', 'edit', 'export'],
      },
      {
        id: 'finance.gst',
        name: 'Tax Slabs & GST Reports',
        description: 'Handicraft HSN codes, GST rate slabs, and monthly GSTIN turnover statements.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'export'],
      },
    ],
  },
  {
    moduleId: 'support',
    name: 'Support & Concierge',
    description: 'Customer inquiries from WhatsApp and website, issue resolution.',
    pages: [
      {
        id: 'support.tickets',
        name: 'Support Tickets Queue',
        description: 'Categorized patron cases, priority flags, assignment, canned replies.',
        supportedActions: ['view', 'create', 'edit', 'approve'],
      },
    ],
  },
  {
    moduleId: 'reports',
    name: 'Insights & Reports',
    description: 'Deep performance analytics across commerce, craft, inventory, and logistics.',
    pages: [
      {
        id: 'reports.analytics',
        name: 'Performance Reports',
        description: 'Product velocity, artisan hours, return rates, customer retention.',
        supportedActions: ['view', 'export'],
      },
    ],
  },
  {
    moduleId: 'settings',
    name: 'Settings & Administration',
    description: 'Staff users with runtime credentials, custom role builder, audit logs, store identity.',
    pages: [
      {
        id: 'settings.users',
        name: 'Staff & Admin Users',
        description: 'Create admin accounts with cryptographic runtime provisional credentials.',
        supportedActions: ['view', 'create', 'edit', 'manage_users'],
      },
      {
        id: 'settings.roles',
        name: 'Roles & Permission Matrix',
        description: 'Searchable hierarchical permission tree and custom role authoring.',
        supportedActions: ['view', 'create', 'edit', 'delete', 'manage_roles'],
      },
      {
        id: 'settings.audit',
        name: 'Security & Audit Logs',
        description: 'Immutable chronological trace of all admin console operations.',
        supportedActions: ['view', 'export'],
      },
      {
        id: 'settings.store',
        name: 'Store Identity & Seams',
        description: 'Legal registered business details, GSTIN, and future ERP API boundaries.',
        supportedActions: ['view', 'edit', 'manage_integrations'],
      },
    ],
  },
];

// Helper: build full permissions map granting all supported actions on all pages
export function getAllPermissions(): Record<string, PermissionAction[]> {
  const perms: Record<string, PermissionAction[]> = {};
  ADMIN_MODULE_DEFINITIONS.forEach(mod => {
    mod.pages.forEach(pg => {
      perms[pg.id] = [...pg.supportedActions];
    });
  });
  return perms;
}

// Seed system roles with realistic scoped rights
export const SEED_ROLES: AdminRole[] = [
  {
    id: 'role-super-admin',
    name: 'Super Admin',
    description: 'Complete unrestricted control over commerce, ERP, staff accounts, roles, and settings.',
    isSystem: true,
    userCount: 2,
    permissions: getAllPermissions(),
    created: '2026-10-01T00:00:00Z',
    updated: '2026-11-10T12:00:00Z',
  },
  {
    id: 'role-store-manager',
    name: 'Store Operations Manager',
    description: 'Oversees daily commerce, catalogue, customer orders, shipping, and marketing.',
    isSystem: true,
    userCount: 3,
    permissions: {
      'dashboard.overview': ['view', 'export'],
      'dashboard.activity': ['view'],
      'cms.homepage': ['view', 'edit', 'publish'],
      'cms.banners': ['view', 'create', 'edit', 'publish'],
      'featured.curator': ['view', 'edit', 'publish'],
      'catalogue.products': ['view', 'create', 'edit', 'publish', 'export'],
      'catalogue.collections': ['view', 'edit', 'publish'],
      'catalogue.reviews': ['view', 'approve', 'delete'],
      'inventory.master': ['view', 'export'],
      'inventory.low_stock': ['view', 'export'],
      'orders.all': ['view', 'create', 'edit', 'export'],
      'orders.manual': ['view', 'create'],
      'orders.invoices': ['view', 'export'],
      'shipping.shipments': ['view', 'create', 'edit'],
      'customers.directory': ['view', 'export'],
      'custom.requests': ['view', 'edit', 'approve'],
      'marketing.coupons': ['view', 'create', 'edit'],
      'support.tickets': ['view', 'edit', 'approve'],
      'reports.analytics': ['view', 'export'],
    },
    created: '2026-10-15T00:00:00Z',
    updated: '2026-11-05T09:00:00Z',
  },
  {
    id: 'role-content-editor',
    name: 'Editorial & Content Architect',
    description: 'Manages visual storytelling, homepage sections, banners, Our Story, and SEO.',
    isSystem: true,
    userCount: 2,
    permissions: {
      'dashboard.overview': ['view'],
      'cms.homepage': ['view', 'edit', 'publish'],
      'cms.banners': ['view', 'create', 'edit', 'publish'],
      'cms.media': ['view', 'create'],
      'cms.story': ['view', 'edit', 'publish'],
      'cms.navigation': ['view', 'edit', 'publish'],
      'cms.policies': ['view', 'edit', 'publish'],
      'cms.seo': ['view', 'edit', 'publish'],
      'featured.curator': ['view', 'edit', 'publish'],
      'catalogue.products': ['view'],
      'catalogue.collections': ['view'],
      'catalogue.reviews': ['view', 'approve'],
    },
    created: '2026-10-15T00:00:00Z',
    updated: '2026-11-02T14:30:00Z',
  },
  {
    id: 'role-production-manager',
    name: 'Bihar Atelier & Production Head',
    description: 'Coordinates 21 women master artisans, loom work orders, quality control, raw materials.',
    isSystem: true,
    userCount: 2,
    permissions: {
      'dashboard.overview': ['view'],
      'dashboard.activity': ['view'],
      'production.work_orders': ['view', 'create', 'edit', 'approve', 'export'],
      'production.qc': ['view', 'approve', 'edit'],
      'production.stages': ['view', 'create', 'edit', 'delete'],
      'inventory.master': ['view', 'adjust_stock'],
      'inventory.materials': ['view', 'create', 'edit'],
      'inventory.low_stock': ['view'],
      'custom.requests': ['view', 'approve'],
      'orders.all': ['view'],
    },
    created: '2026-10-20T00:00:00Z',
    updated: '2026-11-08T11:00:00Z',
  },
  {
    id: 'role-fulfilment-agent',
    name: 'Fulfilment & Dispatch Agent',
    description: 'Generates in-house dispatch manifests, prints consignment labels, manages packaging and order transit.',
    isSystem: true,
    userCount: 4,
    permissions: {
      'dashboard.overview': ['view'],
      'orders.all': ['view', 'edit'],
      'shipping.shipments': ['view', 'create', 'edit', 'export'],
      'shipping.rules': ['view'],
      'inventory.master': ['view'],
    },
    created: '2026-10-20T00:00:00Z',
    updated: '2026-11-01T16:00:00Z',
  },
  {
    id: 'role-support-agent',
    name: 'Patron Concierge & Support',
    description: 'Handles customer inquiries, WhatsApp communications, and order status updates.',
    isSystem: true,
    userCount: 3,
    permissions: {
      'dashboard.overview': ['view'],
      'support.tickets': ['view', 'create', 'edit', 'approve'],
      'orders.all': ['view'],
      'customers.directory': ['view'],
      'custom.requests': ['view'],
      'catalogue.products': ['view'],
    },
    created: '2026-10-25T00:00:00Z',
    updated: '2026-11-04T10:00:00Z',
  },
  {
    id: 'role-finance-manager',
    name: 'Finance & GST Accountant',
    description: 'Accesses revenue ledgers, tax reports, expenses, refunds, and bank settlements.',
    isSystem: true,
    userCount: 1,
    permissions: {
      'dashboard.overview': ['view', 'export'],
      'finance.overview': ['view', 'export'],
      'finance.offline': ['view', 'create', 'edit', 'export'],
      'finance.gst': ['view', 'create', 'edit', 'delete', 'export'],
      'orders.all': ['view', 'export', 'refund'],
      'orders.invoices': ['view', 'export'],
      'reports.analytics': ['view', 'export'],
    },
    created: '2026-10-18T00:00:00Z',
    updated: '2026-11-09T08:00:00Z',
  },
];


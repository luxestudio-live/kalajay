export type AdminModuleId =
  | 'dashboard'
  | 'cms'
  | 'catalogue'
  | 'featured-products'
  | 'inventory'
  | 'orders'
  | 'production'
  | 'shipping'
  | 'customers'
  | 'custom-orders'
  | 'gifting'
  | 'marketing'
  | 'finance'
  | 'support'
  | 'reports'
  | 'settings';

export type PermissionAction =
  | 'view'
  | 'create'
  | 'edit'
  | 'delete'
  | 'publish'
  | 'export'
  | 'approve'
  | 'refund'
  | 'adjust_stock'
  | 'manage_users'
  | 'manage_roles'
  | 'manage_integrations';

export interface PagePermissionDef {
  id: string;
  name: string;
  description: string;
  supportedActions: PermissionAction[];
}

export interface ModulePermissionDef {
  moduleId: AdminModuleId;
  name: string;
  description: string;
  pages: PagePermissionDef[];
}

export interface AdminRole {
  id: string;
  name: string;
  description: string;
  isSystem: boolean;
  userCount: number;
  permissions: Record<string, PermissionAction[]>; // pageId -> granted actions
  created: string;
  updated: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  roleId: string;
  roleName: string;
  department: string;
  status: 'active' | 'deactivated';
  lastLogin?: string;
  createdAt: string;
}

export interface HomepageSectionConfig {
  id: string;
  name: string;
  subtitle: string;
  isVisible: boolean;
  order: number;
  lastEdited: string;
  fields: Record<string, string | number | boolean | string[]>;
}

export interface FeaturedProductsConfig {
  mode: 'manual' | 'auto-bestsellers' | 'auto-new';
  title: string;
  subtitle: string;
  displayLimit: number;
  productIds: string[];
  status: 'published' | 'draft';
  lastEdited: string;
}

export interface BannerItem {
  id: string;
  title: string;
  text: string;
  ctaText: string;
  ctaUrl: string;
  location: 'top-ticker' | 'hero-announcement' | 'modal-popup';
  priority: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  location: 'Mumbai Atelier' | 'Bihar Craft House';
  type: 'finished_good' | 'raw_material';
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  unitCost: number;
  retailPrice?: number;
  supplier: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  unit: string;
}

export interface StockAdjustment {
  id: string;
  sku: string;
  productName: string;
  previousQty: number;
  adjustedQty: number;
  difference: number;
  reason:
    | 'count_variance'
    | 'craft_defect'
    | 'photo_sample'
    | 'shrinkage'
    | 'damage_transit'
    | 'artisan_return';
  loggedBy: string;
  timestamp: string;
  notes: string;
}

export interface WorkOrder {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  artisanName: string;
  artisanLocation: string;
  loomId: string;
  stage:
    | 'loom_threading'
    | 'bead_weaving'
    | 'mirror_fitting'
    | 'quality_inspection'
    | 'wax_sealed'
    | (string & {});
  targetDate: string;
  actualDate?: string;
  priority: 'normal' | 'high' | 'bridal_express';
  qcPassed: boolean;
  materialAllocated: boolean;
  notes?: string;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AdminOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: 'UPI Instant' | 'Credit/Debit Card' | 'NetBanking' | 'WhatsApp Direct';
  fulfillmentStatus:
    | 'unfulfilled'
    | 'in_loom'
    | 'quality_checked'
    | 'shipped'
    | 'delivered'
    | 'rto';
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: Array<{ title: string; timestamp: string; note?: string }>;
  artisanNote?: string;
  courier?: string;
  trackingAwb?: string;
  createdAt: string;
}

export interface CustomOrderRequest {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  silhouette: string;
  palette: string;
  accents: string[];
  monogram: string;
  occasion: string;
  notes: string;
  estimatedPrice: number;
  finalQuotedPrice?: number;
  status: 'inquiry_received' | 'quote_sent' | 'proof_approved' | 'in_loom' | 'dispatched';
  submittedAt: string;
}

export interface CorporateEnquiry {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  eventType: 'Wedding Favour' | 'Corporate Milestone' | 'Festive Gifting' | 'VIP Hamper';
  quantity: number;
  budgetPerPiece: number;
  targetDate: string;
  status: 'new' | 'quote_prepared' | 'sample_dispatched' | 'confirmed' | 'closed';
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  email: string;
  subject: string;
  category: 'Order Status' | 'Customization' | 'Damaged in Transit' | 'Care & Repair' | 'Corporate';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'waiting_patron' | 'resolved';
  assignedTo: string;
  messages: Array<{
    sender: 'customer' | 'concierge';
    senderName: string;
    text: string;
    timestamp: string;
  }>;
  createdAt: string;
}

export interface CouponItem {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat_inr' | 'free_shipping';
  value: number;
  minSpend: number;
  usageCount: number;
  usageLimit: number;
  expiresAt: string;
  isActive: boolean;
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: AdminModuleId;
  details: string;
  timestamp: string;
}

export interface TaxSlab {
  id: string;
  hsnCode: string;
  category: string;
  description: string;
  gstRate: number; // e.g. 3.0, 5.0, 12.0, 18.0
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  taxableTurnover: number;
  taxCollected: number;
  effectiveFrom: string;
  status: 'active' | 'archived';
  notes?: string;
}

export interface OfflineOrderItem {
  productId: string;
  name: string;
  sku: string;
  hsnCode: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OfflineOrder {
  id: string;
  invoiceNumber: string;
  channel: 'studio_walkin' | 'exhibition_popup' | 'whatsapp_direct' | 'private_trunk_show' | 'b2b_consignment';
  channelLabel: string;
  location: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  items: OfflineOrderItem[];
  subtotal: number;
  discount: number;
  taxableAmount: number;
  hsnCode: string;
  gstRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
  paymentMethod: 'Cash on Counter' | 'Studio POS (Card Terminal)' | 'Direct UPI QR' | 'Bank NEFT/RTGS';
  paymentStatus: 'paid' | 'partial' | 'credit';
  receiptIssued: boolean;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}


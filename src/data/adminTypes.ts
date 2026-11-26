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
  username?: string;
  phone?: string;
  roleId: string;
  roleName: string;
  department: string;
  status: 'active' | 'deactivated' | 'suspended';
  active?: boolean;
  staffId?: string;
  uid?: string;
  requiresPasswordReset?: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
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

export type InventoryMovementType =
  | 'OPENING_BALANCE'
  | 'PURCHASE_IN'
  | 'PRODUCTION_IN'
  | 'SALE_OUT'
  | 'DAMAGE_OUT'
  | 'MARKETING_OUT'
  | 'MANUAL_ADJUSTMENT'
  | 'RETURN_IN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RESERVATION'
  | 'RESERVATION_RELEASE';

export interface CraftCosting {
  enabled: boolean;
  beadsUsed?: string;
  beadKg: number;
  beadCostKg: number;
  laborHours: number;
  laborRatePerHour: number; // default 50
  otherMaterialCost: number;
  calculatedCostPrice: number;
  manualOverrideCostPrice?: number;
  notes?: string;
}

export type MaterialUnit = 'kg' | 'g' | 'grams' | 'meters' | 'pieces';

export interface RawMaterialRequirement {
  id: string;
  materialName: string;
  materialSku?: string;
  description?: string;
  quantityRequired: number;
  unit: MaterialUnit;
  costPerKg: number;
  lineCost: number;
}

export interface OtherChargeBreakdown {
  id: string;
  label: string;
  amount: number;
}

export type CostingBasis = 'per_unit' | 'per_batch';

export interface EnhancedInventoryCosting {
  enabled: boolean;
  costingBasis: CostingBasis;
  productionQuantity: number;
  rawMaterials: RawMaterialRequirement[];
  totalRawMaterialCost: number;
  labourHours: number;
  labourCostPerHour: number;
  labourCost: number;
  otherCharges: number;
  otherChargesBreakdown?: OtherChargeBreakdown[];
  totalProductionCost: number;
  unitCost: number;
  calculatedCostPrice: number;
  notes?: string;
  calculatedAt?: string;
}

export interface InventoryMovement {
  id: string;
  sku: string;
  productName?: string;
  location: 'Mumbai Atelier' | 'Bihar Craft House';
  movementType: InventoryMovementType;
  quantity: number; // Signed: positive for additions, negative for deductions
  previousBalance: number;
  newBalance: number;
  sourceEntity?: 'order' | 'work_order' | 'purchase_order' | 'damage_report' | 'marketing_event' | 'manual_audit' | 'excel_sync';
  sourceId?: string;
  idempotencyKey?: string;
  unitCost?: number;
  rate?: number;
  notes: string;
  actor: string;
  timestamp: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  categorySlug?: string;
  location: 'Mumbai Atelier' | 'Bihar Craft House';
  type: 'finished_good' | 'raw_material';
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  unitCost: number;
  retailPrice?: number;
  mrp?: number;
  supplier: string;
  vendorId?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  unit: string;
  hsnCode?: string;
  taxRate?: number;
  displayOrder?: number;
  // 7 Persistent Ledger Accumulators for mathematical integrity
  openingStock?: number;
  stockIn?: number;
  quantityMade?: number;
  quantitySold?: number;
  damaged?: number;
  marketingQty?: number;
  adjustmentQty?: number;
  // Calculated & Derived Analytics
  grossMarginPct?: number;
  stockValue?: number;
  deficit?: number;
  suggestedMake?: number;
  // Hierarchy & Variant Grouping
  isVariantGroup?: boolean;
  parentSku?: string;
  variantLabel?: string;
  variantAttributes?: Record<string, string>;
  costing?: CraftCosting;
  enhancedCosting?: EnhancedInventoryCosting;
  rawMaterials?: RawMaterialRequirement[];
  labourHours?: number;
  labourCostPerHour?: number;
  labourCost?: number;
  otherCharges?: number;
  otherChargesBreakdown?: OtherChargeBreakdown[];
  costingBasis?: CostingBasis;
  productionQuantity?: number;
  totalProductionCost?: number;
  notes?: string;
  updatedAt?: any;
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

export interface ProductBomItem {
  materialSku: string;
  materialName: string;
  quantityRequired: number; // per unit finished good
  unit: string;
}

export interface ProductBom {
  productId: string;
  productSku: string;
  materials: ProductBomItem[];
  updatedAt: string;
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
  materialsConsumed?: boolean;
  bom?: ProductBomItem[];
  notes?: string;
}

export interface AdminOrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string;
  variantLabel?: string;
  attributes?: Record<string, string>;
  leadTimeDays?: number;
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
    | 'out_for_delivery'
    | 'delivered'
    | 'delivery_attempt_failed'
    | 'rto'
    | 'cancelled';
  shippingAddress: {
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
  };
  timeline: Array<{ title: string; timestamp: string; note?: string; staffId?: string; staffName?: string; staffRole?: string }>;
  artisanNote?: string;
  shippingMethod?: 'in_house' | 'third_party_courier' | 'local_delivery' | 'other';
  courier?: string;
  courierType?: 'internal' | 'commercial';
  trackingAwb?: string;
  trackingAwbType?: 'internal' | 'commercial';
  trackingUrl?: string;
  expectedDispatchDate?: string;
  dispatchDate?: string;
  estimatedDeliveryDate?: string;
  outForDeliveryDate?: string;
  actualDeliveryDate?: string;
  customerShippingNote?: string;
  internalStaffNote?: string;
  deliveryAttemptCount?: number;
  deliveryFailureReason?: string;
  rtoReason?: string;
  podReference?: string;
  isInternalTracking?: boolean;
  userId?: string;
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

// ==========================================
// Phase 2C: Expense Book, Finance & Vendor Master
// ==========================================

export type ExpenseTreatment = 'OPEX' | 'CAPEX';
export type ExpenseStatus = 'paid' | 'pending' | 'void';
export type ExpenseType = 'expense' | 'income';

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: number; // in INR (stored with 2 decimal precision)
  currency: string; // 'INR'
  type: ExpenseType;
  status: ExpenseStatus;
  category: string;
  subcategory?: string;
  party: string; // Vendor / Supplier Name
  vendorId?: string;
  description: string;
  paymentMethod: 'Bank Transfer / NEFT' | 'Direct UPI' | 'Corporate Card' | 'Cash / Petty' | 'Cheque';
  treatment: ExpenseTreatment;
  quantity?: number;
  unitPrice?: number;
  taxAmount?: number;
  invoiceRef?: string;
  receipts: string[]; // Up to 3 bill/receipt document URLs
  notes?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  gstin?: string;
  contactPerson: string;
  phone: string;
  email: string;
  address?: string;
  category: 'raw_materials' | 'beads_glass' | 'packaging_boxes' | 'logistics_freight' | 'tools_looms' | 'services_marketing' | 'other';
  relationshipStart: string;
  contracts?: string;
  notes?: string;
  status: 'active' | 'inactive';
  totalSpend?: number;
  ordersCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CategoryBudget {
  category: string;
  monthlyBudget: number;
  spent: number;
  treatment: ExpenseTreatment;
  utilizationPct: number;
}

// ==========================================
// Phase 2D: Rural Artisan Collective Directory
// ==========================================

export type ArtisanCapacity =
  | 'Master Loom Weaver'
  | 'Wire Framework Sculptor'
  | 'Czech Glass Stringer'
  | 'Silk Lining Finisher'
  | 'Wax Seal & QC Inspector'
  | 'Loom Apprentice';

export type ArtisanMembership =
  | 'Foundational 21 Artisan'
  | 'Master Craftswoman'
  | 'Senior Artisan'
  | 'Apprentice Artisan';

export interface ArtisanProfile {
  id: string;
  memberCode: string; // e.g. KJ-ART-001
  name: string;
  capacity: ArtisanCapacity;
  membershipType: ArtisanMembership;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  villageHub: 'Bihar Craft House (Madhubani)' | 'Bihar Craft House (Darbhanga)' | 'Mumbai Finishing Atelier';
  joinDate: string;
  isActive: boolean;
  skills: string[];
  currentLoomAssignment?: string;
  portraitUrl?: string;
  monthlyCapacityUnits: number;
  unitsCraftedTotal: number;
  defectRatePct: number;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// ==========================================
// Phase 2F: Excel Bulk Management & Exchange
// ==========================================

export interface LegacyCatalogueExcelRow {
  code: string;
  name: string;
  category: string;
  currentQty: number;
  newQty: number;
  currentPrice: number;
  newPrice: number;
}

export interface ExcelImportRowResult {
  rowNumber: number;
  sku: string;
  name: string;
  category: string;
  oldQty: number;
  newQty: number;
  qtyDiff: number;
  oldPrice: number;
  newPrice: number;
  priceDiff: number;
  status: 'valid' | 'invalid' | 'unchanged' | 'not_found';
  error?: string;
}

export interface ExcelImportBatch {
  id: string;
  fileName: string;
  uploadedBy: string;
  uploadedAt: string;
  totalRows: number;
  validRows: number;
  modifiedRows: number;
  skippedRows: number;
  errorRows: number;
  status: 'preview' | 'applied' | 'rejected';
  rows: ExcelImportRowResult[];
}

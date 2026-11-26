'use client';

import React, { useState, useMemo } from 'react';
import {
  Download,
  Upload,
  Boxes,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  TrendingDown,
  Warehouse,
  X,
  Edit2,
  Trash2,
  PackageCheck,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  ClipboardList,
  Check,
  History,
  ArrowLeftRight,
  Tag,
  Percent,
  Coins,
  Hammer,
  Calculator,
  Eye,
  FileText,
  Layers,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { ProvenanceBadge } from '@/components/admin/ProvenanceBadge';
import {
  StockAdjustment,
  InventoryItem,
  InventoryMovement,
  InventoryMovementType,
  RawMaterialRequirement,
  MaterialUnit,
  MaterialRateBasis,
  CostingBasis,
  CostingHistorySnapshot,
  EnhancedInventoryCosting,
} from '@/data/adminTypes';
import {
  calculateRawMaterialLineCost,
  calculateInventoryCosting,
  getRateUnitForMaterialUnit,
  getRateBasisLabel,
  normalizeRawMaterialRequirement,
  createCostingHistorySnapshot,
  formatINR,
} from '@/lib/inventoryCosting';

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'info' | 'warning';
}

const REASON_TILES: Array<{
  id: StockAdjustment['reason'];
  label: string;
  desc: string;
}> = [
  { id: 'count_variance', label: 'Physical Count Variance', desc: 'Routine periodic cycle count disparity' },
  { id: 'craft_defect', label: 'Artisan Tension Defect', desc: 'Wire tension or glass bead defect during loom inspection' },
  { id: 'photo_sample', label: 'Studio & PR Sample', desc: 'Transferred for editorial campaign or bridal preview' },
  { id: 'damage_transit', label: 'Atelier Transit Damage', desc: 'Damaged during inter-hub transit between Bihar Hub & Mumbai' },
  { id: 'artisan_return', label: 'Artisan Loom Restock', desc: 'Master artisan completed extra pieces for batch' },
  { id: 'shrinkage', label: 'Ledger Shrinkage', desc: 'Unaccounted atelier loss requiring audit review' },
];

const MOVEMENT_TYPE_CONFIG: Record<
  InventoryMovementType,
  { label: string; sign: '+' | '-' | '±'; badgeColor: string; description: string }
> = {
  OPENING_BALANCE: { label: 'Opening Balance', sign: '+', badgeColor: 'bg-blue-50 text-blue-800 border-blue-200', description: 'Cutover opening stock' },
  PURCHASE_IN: { label: 'Purchase In (Vendor)', sign: '+', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', description: 'Components / goods received from vendor' },
  PRODUCTION_IN: { label: 'Production In (Loom Output)', sign: '+', badgeColor: 'bg-teal-50 text-teal-800 border-teal-200', description: 'Batch finished by master artisans' },
  SALE_OUT: { label: 'Sale Deduction', sign: '-', badgeColor: 'bg-purple-50 text-purple-800 border-purple-200', description: 'Fulfilled customer / studio order' },
  DAMAGE_OUT: { label: 'Damage Write-Off', sign: '-', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200', description: 'Defect or transit loss scrapped' },
  MARKETING_OUT: { label: 'Marketing / PR Sample', sign: '-', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200', description: 'Editorial loan or client gifting' },
  MANUAL_ADJUSTMENT: { label: 'Cycle Count Audit', sign: '±', badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200', description: 'Audit variance correction' },
  RETURN_IN: { label: 'Patron Return Restock', sign: '+', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200', description: 'Returned in pristine condition' },
  TRANSFER_IN: { label: 'Inter-Hub Transfer In', sign: '+', badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200', description: 'Received from Bihar / Mumbai hub' },
  TRANSFER_OUT: { label: 'Inter-Hub Transfer Out', sign: '-', badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200', description: 'Dispatched to partner hub' },
  RESERVATION: { label: 'Checkout Hold', sign: '±', badgeColor: 'bg-stone-50 text-stone-700 border-stone-200', description: 'Temporary patron cart hold' },
  RESERVATION_RELEASE: { label: 'Hold Released', sign: '±', badgeColor: 'bg-stone-50 text-stone-700 border-stone-200', description: 'Hold expired or cancelled' },
};

export default function InventoryView() {
  const {
    inventory,
    stockAdjustments,
    inventoryMovements,
    adjustStock,
    logMovement,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    can,
    activeSubPage,
    setActiveSubPage,
  } = useAdminStore();

  const activeTab: 'master' | 'low_stock' | 'adjustments' | 'raw_materials' =
    activeSubPage === 'inventory.low_stock'
      ? 'low_stock'
      : activeSubPage === 'inventory.adjustments'
      ? 'adjustments'
      : activeSubPage === 'inventory.materials'
      ? 'raw_materials'
      : 'master';

  const handleTabClick = (tabId: string) => {
    const map: Record<string, string> = {
      master: 'inventory.master',
      low_stock: 'inventory.low_stock',
      raw_materials: 'inventory.materials',
      adjustments: 'inventory.adjustments',
    };
    setActiveSubPage(map[tabId] || 'inventory.master');
  };

  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [movementViewMode, setMovementViewMode] = useState<'movements' | 'audits'>('movements');

    // Phase 2F: Excel Batch Management State
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelDiffs, setExcelDiffs] = useState<Array<{
    sku: string;
    name: string;
    category: string;
    currentQty: number;
    newQty: number | null;
    currentPrice: number;
    newPrice: number | null;
    qtyDelta: number;
    priceDelta: number;
    status: 'changed' | 'unchanged' | 'invalid' | 'unknown';
    errorMsg?: string;
  }>>([]);
  const [excelStats, setExcelStats] = useState({ total: 0, changed: 0, unchanged: 0, invalid: 0 });
  const [excelFileName, setExcelFileName] = useState('');

  // Phase 2F: Export Catalogue Template (Exact 7 columns from catalogue_excel.py)
  const handleExportExcelTemplate = () => {
    try {
      const headers = ['Product code', 'Product name', 'Category', 'Current quantity', 'New quantity', 'Current price (INR)', 'New price (INR)'];
      const rows = inventory.map(item => [
        `"${item.sku}"`,
        `"${(item.name || '').replace(/"/g, '""')}"`,
        `"${(item.category || '').replace(/"/g, '""')}"`,
        item.onHand ?? 0,
        '', // New quantity (blank = no change)
        item.retailPrice ?? 0,
        '', // New price (blank = no change)
      ].join(','));

      const csvContent = [
        '# Kalajay catalogue updates - Downloaded from ERP Master Inventory',
        '# Fill New quantity and New price columns only. Blank = no change; new quantity 0 = sold out.',
        headers.join(','),
        ...rows,
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Kalajay_Catalogue_Updates_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast('Downloaded 7-column Catalogue Excel/CSV template.', 'success');
    } catch (err: any) {
      showToast('Failed to export catalogue template: ' + err.message, 'warning');
    }
  };

  // Phase 2F: Parse Excel / CSV File and Generate Diff
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setExcelFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim() && !line.startsWith('#'));
      if (lines.length < 2) {
        showToast('Uploaded file does not contain valid data rows.', 'warning');
        return;
      }

      // Check header row
      const headerLine = lines[0];
      const dataRows = lines.slice(1);

      const existingMap = new Map(inventory.map(i => [i.sku, i]));
      const diffList: typeof excelDiffs = [];
      let changed = 0;
      let unchanged = 0;
      let invalid = 0;

      for (let i = 0; i < dataRows.length; i++) {
        const line = dataRows[i].trim();
        if (!line) continue;

        // Robust CSV splitter preserving empty cells and respecting quoted strings
        const cells = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
        if (cells.length < 3) continue;

        const code = cells[0];
        const name = cells[1] || '';
        const category = cells[2] || '';
        const rawNewQty = cells[4];
        const rawNewPrice = cells[6];

        const target = existingMap.get(code);
        if (!target) {
          invalid++;
          diffList.push({
            sku: code,
            name,
            category,
            currentQty: 0,
            newQty: null,
            currentPrice: 0,
            newPrice: null,
            qtyDelta: 0,
            priceDelta: 0,
            status: 'unknown',
            errorMsg: 'Unknown SKU not in catalogue',
          });
          continue;
        }

        let newQty: number | null = null;
        let newPrice: number | null = null;
        let hasError = false;
        let errorMsg = '';

        if (rawNewQty !== undefined && rawNewQty !== '') {
          const parsed = Number(rawNewQty);
          if (isNaN(parsed) || parsed < 0 || !Number.isInteger(parsed)) {
            hasError = true;
            errorMsg = 'Invalid quantity';
          } else {
            newQty = parsed;
          }
        }

        if (rawNewPrice !== undefined && rawNewPrice !== '') {
          const parsed = Number(rawNewPrice);
          if (isNaN(parsed) || parsed < 0) {
            hasError = true;
            errorMsg = errorMsg ? errorMsg + ', invalid price' : 'Invalid price';
          } else {
            newPrice = Math.round(parsed * 100) / 100;
          }
        }

        const currentPrice = target.retailPrice || 0;
        if (hasError) {
          invalid++;
          diffList.push({
            sku: code,
            name: target.name,
            category: target.category,
            currentQty: target.onHand,
            newQty: null,
            currentPrice,
            newPrice: null,
            qtyDelta: 0,
            priceDelta: 0,
            status: 'invalid',
            errorMsg,
          });
          continue;
        }

        const qtyDelta = newQty !== null ? newQty - target.onHand : 0;
        const priceDelta = newPrice !== null ? newPrice - currentPrice : 0;
        const isModified = (newQty !== null && newQty !== target.onHand) || (newPrice !== null && newPrice !== currentPrice);

        if (isModified) {
          changed++;
          diffList.push({
            sku: code,
            name: target.name,
            category: target.category,
            currentQty: target.onHand,
            newQty,
            currentPrice,
            newPrice,
            qtyDelta,
            priceDelta,
            status: 'changed',
          });
        } else {
          unchanged++;
          diffList.push({
            sku: code,
            name: target.name,
            category: target.category,
            currentQty: target.onHand,
            newQty,
            currentPrice,
            newPrice,
            qtyDelta: 0,
            priceDelta: 0,
            status: 'unchanged',
          });
        }
      }

      setExcelDiffs(diffList);
      setExcelStats({ total: diffList.length, changed, unchanged, invalid });
      setExcelModalOpen(true);
    };

    reader.readAsText(file);
    // Reset file input value so same file can be chosen again
    e.target.value = '';
  };

  // Phase 2F: Apply Batch Updates into Master Ledger & Catalogue
  const handleApplyBatchUpdates = () => {
    const actionable = excelDiffs.filter(d => d.status === 'changed');
    if (actionable.length === 0) {
      showToast('No modifications detected to apply.', 'info');
      setExcelModalOpen(false);
      return;
    }

    actionable.forEach(item => {
      // 1. Stock quantity update via atomic ledger movement
      if (item.newQty !== null && item.newQty !== item.currentQty) {
        adjustStock(
          item.sku,
          item.newQty,
          'count_variance',
          `Batch Excel import (${item.qtyDelta > 0 ? '+' : ''}${item.qtyDelta} pcs via ${excelFileName || 'catalogue sheet'})`
        );
      }

      // 2. Retail price update
      if (item.newPrice !== null && item.newPrice !== item.currentPrice) {
        const existing = inventory.find(i => i.sku === item.sku);
        if (existing) {
          updateInventoryItem(existing.id, {
            retailPrice: item.newPrice,
            stockValue: (existing.onHand || 0) * (existing.unitCost || 0),
            grossMarginPct: existing.unitCost > 0 ? Math.round(((item.newPrice - existing.unitCost) / item.newPrice) * 100 * 10) / 10 : 0,
          });
        }
      }
    });

    setExcelModalOpen(false);
    showToast(`Successfully applied ${actionable.length} batch updates to ERP stock ledger.`, 'success');
  };


  // Toast feedback
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', type: 'success' });
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  // 1. Stock Adjustment Modal State
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState<string>(inventory[0]?.sku || '');
  const [newQty, setNewQty] = useState<number>(inventory[0]?.onHand || 10);
  const [adjReason, setAdjReason] = useState<StockAdjustment['reason']>('count_variance');
  const [adjNotes, setAdjNotes] = useState('');

  // 2. Add New SKU / Material Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSkuData, setNewSkuData] = useState<Omit<InventoryItem, 'id'>>({
    sku: '',
    name: '',
    category: 'Organisers',
    location: 'Mumbai Atelier',
    type: 'finished_good',
    onHand: 10,
    reserved: 0,
    available: 10,
    reorderPoint: 5,
    unitCost: 1200,
    retailPrice: 2899,
    mrp: 3499,
    supplier: 'Bihar Craft House Hub',
    status: 'in_stock',
    unit: 'pcs',
    hsnCode: '7117.90',
    taxRate: 3.0,
    openingStock: 10,
    stockIn: 0,
    quantityMade: 0,
    quantitySold: 0,
    damaged: 0,
    marketingQty: 0,
    adjustmentQty: 0,
    grossMarginPct: 58.6,
    stockValue: 12000,
  });

  // 3. Edit SKU Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Enhanced Costing State for Create Modal
  const [createCostingEnabled, setCreateCostingEnabled] = useState(true);
  const [createCostingBasis, setCreateCostingBasis] = useState<CostingBasis>('per_unit');
  const [createProductionQuantity, setCreateProductionQuantity] = useState<number>(1);
  const [createRawMaterials, setCreateRawMaterials] = useState<RawMaterialRequirement[]>([
    {
      id: 'rm-init-1',
      materialName: 'Faceted Glass / Pearl Beads',
      materialSku: 'RM-BEAD-01',
      description: 'Lustrous seed and crystal beads',
      quantityRequired: 0.25,
      unit: 'kg',
      rate: 800,
      rateUnit: 'per_kg',
      costPerKg: 800,
      lineCost: 200,
    },
  ]);
  const [createLabourHours, setCreateLabourHours] = useState<number>(2.5);
  const [createLabourCostPerHour, setCreateLabourCostPerHour] = useState<number>(120);
  const [createOtherCharges, setCreateOtherCharges] = useState<number>(50);
  const [createNotes, setCreateNotes] = useState<string>('');

  // Enhanced Costing State for Edit Modal
  const [editCostingBasis, setEditCostingBasis] = useState<CostingBasis>('per_unit');
  const [editProductionQuantity, setEditProductionQuantity] = useState<number>(1);
  const [editRawMaterials, setEditRawMaterials] = useState<RawMaterialRequirement[]>([]);
  const [editLabourHours, setEditLabourHours] = useState<number>(0);
  const [editLabourCostPerHour, setEditLabourCostPerHour] = useState<number>(120);
  const [editOtherCharges, setEditOtherCharges] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

  // Item Details Modal State
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState<InventoryItem | null>(null);

  // Calculated Costing Memos
  const createCalculatedCosting = useMemo(() => {
    return calculateInventoryCosting({
      costingBasis: createCostingBasis,
      productionQuantity: createProductionQuantity,
      rawMaterials: createRawMaterials,
      labourHours: createLabourHours,
      labourCostPerHour: createLabourCostPerHour,
      otherCharges: createOtherCharges,
      notes: createNotes,
    });
  }, [createCostingBasis, createProductionQuantity, createRawMaterials, createLabourHours, createLabourCostPerHour, createOtherCharges, createNotes]);

  const editCalculatedCosting = useMemo(() => {
    return calculateInventoryCosting({
      costingBasis: editCostingBasis,
      productionQuantity: editProductionQuantity,
      rawMaterials: editRawMaterials,
      labourHours: editLabourHours,
      labourCostPerHour: editLabourCostPerHour,
      otherCharges: editOtherCharges,
      notes: editNotes,
    });
  }, [editCostingBasis, editProductionQuantity, editRawMaterials, editLabourHours, editLabourCostPerHour, editOtherCharges, editNotes]);

  // 4. Delete SKU Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  // 5. Post Inventory Movement Modal State (Phase 2A)
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementSku, setMovementSku] = useState<string>('');
  const [movementType, setMovementType] = useState<InventoryMovementType>('PURCHASE_IN');
  const [movementQuantity, setMovementQuantity] = useState<number>(5);
  const [movementNotes, setMovementNotes] = useState<string>('');
  const [movementSourceId, setMovementSourceId] = useState<string>('');

  // 6. Movement History Drawer State
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [historySku, setHistorySku] = useState<string>('');

  const canAdjustStock = can('inventory.all', 'adjust_stock');

  // Filtered Items
  const filteredItems = useMemo(() => {
    return inventory.filter(item => {
      if (activeTab === 'raw_materials') {
        if (item.type !== 'raw_material') return false;
      } else if (activeTab === 'low_stock') {
        if (item.status === 'in_stock') return false;
      } else if (activeTab === 'master') {
        if (typeFilter !== 'All' && item.type !== typeFilter) return false;
      }

      if (locationFilter !== 'All' && item.location !== locationFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        const matchHsn = (item.hsnCode || '').toLowerCase().includes(q);
        if (!matchSku && !matchName && !matchCat && !matchHsn) return false;
      }

      return true;
    });
  }, [inventory, activeTab, typeFilter, locationFilter, search]);

  // Aggregate Totals
  const totals = useMemo(() => {
    let totalOnHand = 0;
    let totalReserved = 0;
    let totalAvailable = 0;
    let totalValuation = 0;
    let totalRetailValue = 0;

    filteredItems.forEach(item => {
      const onHand = item.onHand || 0;
      const reserved = item.reserved || 0;
      const available = item.available || Math.max(0, onHand - reserved);
      const cost = item.unitCost || 0;
      const retail = item.retailPrice || 0;

      totalOnHand += onHand;
      totalReserved += reserved;
      totalAvailable += available;
      totalValuation += onHand * cost;
      totalRetailValue += onHand * retail;
    });

    const blendedMargin =
      totalRetailValue > 0
        ? Math.round(((totalRetailValue - totalValuation) / totalRetailValue) * 100 * 10) / 10
        : 0;

    return {
      totalOnHand,
      totalReserved,
      totalAvailable,
      totalValuation,
      totalRetailValue,
      blendedMargin,
      skuCount: filteredItems.length,
    };
  }, [filteredItems]);

  // SKU Movements
  const currentSkuMovements = useMemo(() => {
    if (!historySku) return [];
    return inventoryMovements.filter(m => m.sku === historySku);
  }, [inventoryMovements, historySku]);

  // Open Adjust Modal
  const handleOpenAdjust = (sku?: string) => {
    const targetSku = sku || inventory[0]?.sku || '';
    const item = inventory.find(i => i.sku === targetSku);
    setSelectedSku(targetSku);
    setNewQty(item?.onHand || 0);
    setAdjReason('count_variance');
    setAdjNotes('');
    setAdjustModalOpen(true);
  };

  // Submit Stock Adjustment
  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSku) return;
    adjustStock(selectedSku, Number(newQty), adjReason, adjNotes);
    setAdjustModalOpen(false);
    showToast(`Stock adjustment logged for SKU ${selectedSku}. Ledger balance updated.`, 'success');
  };

  // Open Log Movement Modal
  const handleOpenMovement = (sku: string) => {
    setMovementSku(sku);
    setMovementType('PURCHASE_IN');
    setMovementQuantity(5);
    setMovementNotes('');
    setMovementSourceId('');
    setMovementModalOpen(true);
  };

  // Submit Movement
  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementSku || movementQuantity <= 0) return;
    const targetItem = inventory.find(i => i.sku === movementSku);
    if (!targetItem) return;

    logMovement({
      sku: movementSku,
      productName: targetItem.name,
      location: targetItem.location,
      movementType,
      quantity: Number(movementQuantity),
      sourceEntity:
        movementType === 'PURCHASE_IN'
          ? 'purchase_order'
          : movementType === 'PRODUCTION_IN'
          ? 'work_order'
          : movementType === 'DAMAGE_OUT'
          ? 'damage_report'
          : movementType === 'MARKETING_OUT'
          ? 'marketing_event'
          : 'manual_audit',
      sourceId: movementSourceId || undefined,
      unitCost: targetItem.unitCost,
      notes: movementNotes || `Logged ${MOVEMENT_TYPE_CONFIG[movementType].label}`,
    });

    setMovementModalOpen(false);
    showToast(`Logged ${MOVEMENT_TYPE_CONFIG[movementType].label} (${movementQuantity} ${targetItem.unit}) for ${movementSku}.`, 'success');
  };

  // Open History Drawer
  const handleOpenHistory = (sku: string) => {
    setHistorySku(sku);
    setHistoryDrawerOpen(true);
  };

  // Create Item Submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuData.sku || !newSkuData.name) {
      showToast('Please fill in required SKU code and title', 'warning');
      return;
    }

    const onHand = Number(newSkuData.onHand) || 0;
    const reserved = Number(newSkuData.reserved) || 0;
    const available = Math.max(0, onHand - reserved);
    const unitCost = Number(newSkuData.unitCost) || 0;
    const retailPrice = Number(newSkuData.retailPrice) || 0;
    const mrp = Number(newSkuData.mrp) || retailPrice * 1.25;
    const grossMarginPct =
      retailPrice > 0 ? Math.round(((retailPrice - unitCost) / retailPrice) * 100 * 10) / 10 : 0;
    const stockValue = onHand * unitCost;

    const finalEnhanced = calculateInventoryCosting({
      costingBasis: createCostingBasis,
      productionQuantity: createProductionQuantity,
      rawMaterials: createRawMaterials,
      labourHours: createLabourHours,
      labourCostPerHour: createLabourCostPerHour,
      otherCharges: createOtherCharges,
      notes: createNotes,
    });

    createInventoryItem({
      ...newSkuData,
      costingBasis: createCostingBasis,
      productionQuantity: createProductionQuantity,
      rawMaterials: createRawMaterials,
      labourHours: createLabourHours,
      labourCostPerHour: createLabourCostPerHour,
      labourCost: finalEnhanced.labourCost,
      otherCharges: createOtherCharges,
      totalProductionCost: finalEnhanced.totalProductionCost,
      notes: createNotes,
      enhancedCosting: finalEnhanced.enhancedCosting,
      onHand,
      reserved,
      available,
      unitCost,
      retailPrice,
      mrp,
      grossMarginPct,
      stockValue,
      openingStock: onHand,
      stockIn: 0,
      quantityMade: 0,
      quantitySold: 0,
      damaged: 0,
      marketingQty: 0,
      adjustmentQty: 0,
      status: onHand === 0 ? 'out_of_stock' : onHand <= newSkuData.reorderPoint ? 'low_stock' : 'in_stock',
    });

    setCreateModalOpen(false);
    showToast(`Registered SKU ${newSkuData.sku} in master inventory ledger.`, 'success');
  };

  // Open Edit SKU
  const handleOpenEdit = (item: InventoryItem) => {
    setEditingItem({ ...item });
    setEditCostingBasis(item.costingBasis || item.enhancedCosting?.costingBasis || 'per_unit');
    setEditProductionQuantity(item.productionQuantity || item.enhancedCosting?.productionQuantity || 1);

    let initialMaterials: RawMaterialRequirement[] = (item.rawMaterials || item.enhancedCosting?.rawMaterials || []).map((m, idx) =>
      normalizeRawMaterialRequirement(m, `rm-edit-${idx + 1}`)
    );
    if (initialMaterials.length === 0 && item.costing?.enabled) {
      initialMaterials = [
        normalizeRawMaterialRequirement({
          id: 'rm-legacy-1',
          materialName: item.costing.beadsUsed || 'Handicraft Beads',
          quantityRequired: item.costing.beadKg || 0.25,
          unit: 'kg',
          rate: item.costing.beadCostKg || 800,
          rateUnit: 'per_kg',
        }),
      ];
    }
    setEditRawMaterials(initialMaterials);
    setEditLabourHours(item.labourHours ?? item.enhancedCosting?.labourHours ?? item.costing?.laborHours ?? 2.5);
    setEditLabourCostPerHour(item.labourCostPerHour ?? item.enhancedCosting?.labourCostPerHour ?? item.costing?.laborRatePerHour ?? 120);
    setEditOtherCharges(item.otherCharges ?? item.enhancedCosting?.otherCharges ?? item.costing?.otherMaterialCost ?? 50);
    setEditNotes(item.notes || item.enhancedCosting?.notes || item.costing?.notes || '');
    setEditModalOpen(true);
  };

  // Open Detail View
  const handleOpenDetail = (item: InventoryItem) => {
    setSelectedDetailItem(item);
    setDetailModalOpen(true);
  };

  // Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    const computedAvailable = Math.max(0, editingItem.onHand - editingItem.reserved);
    const computedStatus: InventoryItem['status'] =
      editingItem.onHand === 0
        ? 'out_of_stock'
        : editingItem.onHand <= editingItem.reorderPoint
        ? 'low_stock'
        : 'in_stock';
    const computedStockValue = editingItem.onHand * editingItem.unitCost;
    const computedMargin =
      editingItem.retailPrice && editingItem.retailPrice > 0
        ? Math.round(((editingItem.retailPrice - editingItem.unitCost) / editingItem.retailPrice) * 100 * 10) / 10
        : editingItem.grossMarginPct;

    const existingHistory: CostingHistorySnapshot[] =
      editingItem.enhancedCosting?.history || [];
    const historyWithSnapshot: CostingHistorySnapshot[] = editingItem.enhancedCosting
      ? [...existingHistory, createCostingHistorySnapshot(editingItem.enhancedCosting)]
      : existingHistory;

    const finalEnhanced = calculateInventoryCosting({
      costingBasis: editCostingBasis,
      productionQuantity: editProductionQuantity,
      rawMaterials: editRawMaterials,
      labourHours: editLabourHours,
      labourCostPerHour: editLabourCostPerHour,
      otherCharges: editOtherCharges,
      notes: editNotes,
      existingHistory: historyWithSnapshot,
    });

    updateInventoryItem(editingItem.id, {
      ...editingItem,
      costingBasis: editCostingBasis,
      productionQuantity: editProductionQuantity,
      rawMaterials: editRawMaterials,
      labourHours: editLabourHours,
      labourCostPerHour: editLabourCostPerHour,
      labourCost: finalEnhanced.labourCost,
      otherCharges: editOtherCharges,
      totalProductionCost: finalEnhanced.totalProductionCost,
      notes: editNotes,
      enhancedCosting: finalEnhanced.enhancedCosting,
      available: computedAvailable,
      status: computedStatus,
      stockValue: computedStockValue,
      grossMarginPct: computedMargin,
    });
    setEditModalOpen(false);
    showToast(`Updated specifications and costing for ${editingItem.name} (${editingItem.sku}).`, 'success');
  };

  const handleDeleteConfirm = () => {
    if (!deletingItem) return;
    deleteInventoryItem(deletingItem.id);
    setDeleteModalOpen(false);
    showToast(`Archived SKU ${deletingItem.sku} from active inventory ledger.`, 'warning');
    setDeletingItem(null);
  };

  const lowStockCount = inventory.filter(i => i.status !== 'in_stock').length;

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-2.5 bg-[#372921] text-[#F7F3EC] px-4 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Boxes className="w-3.5 h-3.5" />
            <span>Master Operations &amp; Authoritative ERP Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Master Inventory &amp; Stock Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Immutable 7-counter inventory ledger with dual-hub tracking across Mumbai Finishing Atelier and Bihar Craft House looms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          {/* Phase 2F: Excel Batch Export & Import Buttons */}
          <button
            type="button"
            onClick={handleExportExcelTemplate}
            className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#9E5430]" />
            <span>Export Catalogue Sheet (CSV)</span>
          </button>

          <label className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-[#9E5430]" />
            <span>Import Excel Updates</span>
            <input
              type="file"
              accept=".csv,.xlsx,.tsv"
              onChange={handleExcelFileUpload}
              className="hidden"
            />
          </label>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="px-3.5 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#9E5430]" />
            <span>Add New SKU / Material</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdjust()}
            disabled={!canAdjustStock}
            className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Log Physical Audit Adjustment</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'master', label: `Master Ledger (${inventory.length})` },
          {
            id: 'low_stock',
            label: `Replenishment Watchlist (${lowStockCount})`,
            badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          },
          { id: 'raw_materials', label: 'Raw Materials & Minerals' },
          { id: 'adjustments', label: `Authoritative Ledger Trail (${inventoryMovements.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-bold">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. SEARCH & HUB FILTERS */}
      {activeTab !== 'adjustments' && (
        <div className="bg-white p-3.5 rounded-xl border border-[#DED3C5] flex flex-wrap items-center gap-3 text-xs shadow-2xs">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#76695F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by SKU, item name, HSN code, materials..."
              className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#76695F] font-semibold">Location:</span>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="All">All Atelier Hubs</option>
              <option value="Mumbai Atelier">Mumbai Atelier</option>
              <option value="Bihar Craft House">Bihar Craft House</option>
            </select>
          </div>

          {activeTab === 'master' && (
            <div className="flex items-center gap-2">
              <span className="text-[#76695F] font-semibold">Classification:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
              >
                <option value="All">All Inventory Types</option>
                <option value="finished_good">Finished Heirloom Goods</option>
                <option value="raw_material">Raw Craft Materials</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* 4. MASTER LEDGER TABLE */}
      {activeTab !== 'adjustments' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[640px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10px] uppercase tracking-wider font-semibold sticky top-0 z-20 shadow-2xs">
                <tr>
                  <th className="py-3 px-3 w-8 text-center bg-[#F7F3EC]">#</th>
                  <th className="py-3 px-4 min-w-[220px] sticky left-0 z-30 bg-[#F7F3EC] shadow-r">SKU &amp; Product Details</th>
                  <th className="py-3 px-3">Hub</th>
                  <th className="py-3 px-3">HSN / Tax</th>
                  <th className="py-3 px-2 text-center text-[#685B52]" title="Initial stock baseline">Open</th>
                  <th className="py-3 px-2 text-center text-emerald-800" title="Purchases / Restock in">+ In</th>
                  <th className="py-3 px-2 text-center text-teal-800" title="Pieces woven & completed from looms">+ Made</th>
                  <th className="py-3 px-2 text-center text-purple-800" title="Total customer & offline sales">- Sold</th>
                  <th className="py-3 px-2 text-center text-rose-800" title="Tension defects & damaged in transit">- Dmg</th>
                  <th className="py-3 px-2 text-center text-indigo-800" title="Net physical audit variance">± Adj</th>
                  <th className="py-3 px-3 text-center font-bold text-[#372921] bg-[#F4EFE6]/60">On-Hand</th>
                  <th className="py-3 px-3 text-center text-[#76695F]">Reserved</th>
                  <th className="py-3 px-3 text-center font-bold text-[#9E5430] bg-[#9E5430]/5">Available</th>
                  {activeTab === 'low_stock' && (
                    <>
                      <th className="py-3 px-3 text-center text-amber-800">Reorder</th>
                      <th className="py-3 px-3 text-center text-rose-800 font-bold">Deficit</th>
                      <th className="py-3 px-3 text-center text-teal-800 font-bold">Suggest Make</th>
                    </>
                  )}
                  <th className="py-3 px-3 text-right">Cost (₹)</th>
                  <th className="py-3 px-3 text-right">Price (₹)</th>
                  <th className="py-3 px-3 text-center">Margin %</th>
                  <th className="py-3 px-3 text-right font-semibold">Valuation</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right min-w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {filteredItems.map((item, idx) => {
                  const margin = item.grossMarginPct ?? (item.retailPrice && item.unitCost ? Math.round(((item.retailPrice - item.unitCost) / item.retailPrice) * 100 * 10) / 10 : 0);
                  const deficit = Math.max(0, item.reorderPoint - item.available);
                  const suggestedMake = Math.max(0, item.reorderPoint * 2 - item.onHand);

                  return (
                    <tr key={item.id} className="hover:bg-[#FFFCF7] transition-colors">
                      <td className="py-3 px-3 text-center font-mono text-[10px] text-[#A99583]">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4 sticky left-0 z-10 bg-white hover:bg-[#FFFCF7] shadow-r">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="text-left font-semibold block text-xs text-[#372921] hover:text-[#9E5430] hover:underline cursor-pointer transition-colors"
                            title="Click to view full SKU and costing details"
                          >
                            {item.name}
                          </button>
                          <ProvenanceBadge provenance={(item as any).provenance} isDemo={(item as any).isDemo} size="xs" />
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-[#76695F] font-mono mt-0.5">
                          <span className="text-[#9E5430] font-bold">{item.sku}</span>
                          <span>·</span>
                          <span>{item.category}</span>
                          {(item.costing?.enabled || item.enhancedCosting?.enabled || item.rawMaterials?.length) && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-sans font-semibold">
                              Craft Costing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#76695F]">
                          <Warehouse className="w-3 h-3 text-[#9E5430]" />
                          <span>{item.location === 'Mumbai Atelier' ? 'Mumbai' : 'Bihar Hub'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[10px] text-[#76695F] whitespace-nowrap">
                        <span>{item.hsnCode || '7117.90'}</span>
                        <span className="text-[#A99583] block text-[9.5px]">{item.taxRate || 3}% GST</span>
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-[#685B52]">
                        {item.openingStock ?? item.onHand}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-emerald-800 font-semibold">
                        {item.stockIn ?? 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-teal-800 font-semibold">
                        {item.quantityMade ?? 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-purple-800">
                        {item.quantitySold ?? 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-rose-800 font-semibold">
                        {item.damaged ?? 0}
                      </td>
                      <td className="py-3 px-2 text-center font-mono text-indigo-800">
                        {item.adjustmentQty && item.adjustmentQty > 0
                          ? `+${item.adjustmentQty}`
                          : item.adjustmentQty ?? 0}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#372921] bg-[#F4EFE6]/40">
                        {item.onHand} <span className="text-[9px] font-normal text-[#76695F]">{item.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-center font-mono text-[#76695F]">
                        {item.reserved}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-bold text-[#9E5430] bg-[#9E5430]/5">
                        {item.available}
                      </td>
                      {activeTab === 'low_stock' && (
                        <>
                          <td className="py-3 px-3 text-center font-mono text-amber-800">
                            {item.reorderPoint}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-rose-800 bg-rose-50/50">
                            {deficit > 0 ? `-${deficit}` : '0'}
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold text-teal-800 bg-teal-50/50">
                            {suggestedMake > 0 ? `+${suggestedMake}` : '0'}
                          </td>
                        </>
                      )}
                      <td className="py-3 px-3 text-right font-mono text-[#372921]">
                        ₹{item.unitCost?.toLocaleString('en-IN') || 0}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#372921]">
                        {item.retailPrice ? `₹${item.retailPrice.toLocaleString('en-IN')}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-mono">
                        {margin > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {margin}%
                          </span>
                        ) : (
                          <span className="text-[#A99583] text-[10px]">0%</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#372921]">
                        ₹{(item.stockValue || item.onHand * item.unitCost).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                            item.status === 'in_stock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'low_stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="p-1.5 rounded-md hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                            title="View SKU & Costing Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenMovement(item.sku)}
                            disabled={!canAdjustStock}
                            className="px-2 py-1 rounded-md bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[10.5px] text-[#9E5430] font-semibold transition-colors cursor-pointer"
                            title="Post Signed Movement (Purchase, Production, Damage, PR)"
                          >
                            Post
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenHistory(item.sku)}
                            className="p-1.5 rounded-md hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                            title="View Authoritative Movement Trail"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 rounded-md hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                            title="Edit Specifications & Costing"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingItem(item);
                              setDeleteModalOpen(true);
                            }}
                            className="p-1.5 rounded-md hover:bg-rose-50 text-[#76695F] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Archive Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={19} className="py-12 text-center text-[#76695F]">
                      <Boxes className="w-8 h-8 text-[#DED3C5] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#372921]">No matching inventory items found</p>
                      <p className="text-xs text-[#76695F] mt-0.5">Try adjusting your filters or search keywords.</p>
                    </td>
                  </tr>
                )}
              </tbody>
              {/* AUTHORITATIVE FOOTER TOTALS */}
              <tfoot className="bg-[#F7F3EC] border-t-2 border-[#DED3C5] text-[#372921] font-semibold text-xs sticky bottom-0 z-20 shadow-lg">
                <tr>
                  <td colSpan={2} className="py-3 px-4 font-serif text-sm">
                    Total: {totals.skuCount} Registered SKUs
                  </td>
                  <td colSpan={8} className="py-3 px-3 text-right text-[11px] text-[#76695F] font-sans">
                    Warehouse Sum Total:
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-[#372921] bg-[#F4EFE6]">
                    {totals.totalOnHand.toLocaleString('en-IN')} units
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-[#76695F]">
                    {totals.totalReserved.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-[#9E5430] bg-[#9E5430]/10">
                    {totals.totalAvailable.toLocaleString('en-IN')}
                  </td>
                  {activeTab === 'low_stock' && <td colSpan={3}></td>}
                  <td colSpan={2} className="py-3 px-3 text-right text-[11px] text-[#76695F]">
                    Blended Margin:
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">
                    {totals.blendedMargin}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-base text-[#372921]">
                    ₹{totals.totalValuation.toLocaleString('en-IN')}
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 5. AUTHORITATIVE ADJUSTMENTS & MOVEMENTS AUDIT TRAIL */}
      {activeTab === 'adjustments' && (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Authoritative Inventory Movements Ledger &amp; Physical Audits
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Immutable ERP audit trail recording purchases, production output, sales deductions, defect scrap, and cycle variances.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#F7F3EC] p-1 rounded-xl border border-[#DED3C5]">
              <button
                type="button"
                onClick={() => setMovementViewMode('movements')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  movementViewMode === 'movements'
                    ? 'bg-white shadow-xs text-[#9E5430]'
                    : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                Movement Ledger ({inventoryMovements.length})
              </button>
              <button
                type="button"
                onClick={() => setMovementViewMode('audits')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  movementViewMode === 'audits'
                    ? 'bg-white shadow-xs text-[#9E5430]'
                    : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                Physical Audit Variances ({stockAdjustments.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {movementViewMode === 'movements' ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Movement ID</th>
                    <th className="py-3 px-4">Item SKU &amp; Name</th>
                    <th className="py-3 px-4">Hub Location</th>
                    <th className="py-3 px-4">Movement Type</th>
                    <th className="py-3 px-4 text-center">Delta</th>
                    <th className="py-3 px-4 text-center">Previous</th>
                    <th className="py-3 px-4 text-center font-bold">New Balance</th>
                    <th className="py-3 px-4">Source Ref</th>
                    <th className="py-3 px-4">Operator</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {inventoryMovements.map(mov => {
                    const cfg = MOVEMENT_TYPE_CONFIG[mov.movementType] || {
                      label: mov.movementType,
                      sign: '±',
                      badgeColor: 'bg-stone-100 text-stone-800',
                    };
                    const isPositive = mov.quantity > 0;

                    return (
                      <tr key={mov.id} className="hover:bg-[#FFFCF7] transition-colors">
                        <td className="py-3 px-4 text-[11px] text-[#76695F] font-mono whitespace-nowrap">
                          {new Date(mov.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[10.5px] text-[#372921]">
                          {mov.id}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-[#372921] block">{mov.productName || mov.sku}</strong>
                          <span className="text-[10px] font-mono text-[#76695F]">{mov.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-[#76695F] whitespace-nowrap">
                          {mov.location}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}
                          >
                            <span>{cfg.label}</span>
                          </span>
                        </td>
                        <td className={`py-3 px-4 text-center font-mono font-bold ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isPositive ? `+${mov.quantity}` : mov.quantity}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#76695F]">
                          {mov.previousBalance}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#372921] bg-[#F7F3EC]/50">
                          {mov.newBalance}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10.5px] text-[#76695F]">
                          {mov.sourceId || '—'}
                        </td>
                        <td className="py-3 px-4 text-[#372921] font-medium">
                          {mov.actor}
                        </td>
                        <td className="py-3 px-4 text-[#76695F] max-w-xs truncate" title={mov.notes}>
                          {mov.notes}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Audit ID</th>
                    <th className="py-3 px-4">SKU &amp; Product</th>
                    <th className="py-3 px-4 text-center">Previous Qty</th>
                    <th className="py-3 px-4 text-center">Adjusted Qty</th>
                    <th className="py-3 px-4 text-center">Variance (Diff)</th>
                    <th className="py-3 px-4">Audit Reason</th>
                    <th className="py-3 px-4">Logged By</th>
                    <th className="py-3 px-4">Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {stockAdjustments.map(adj => {
                    const isPositive = adj.difference > 0;
                    return (
                      <tr key={adj.id} className="hover:bg-[#FFFCF7] transition-colors">
                        <td className="py-3 px-4 text-[11px] text-[#76695F] font-mono whitespace-nowrap">
                          {new Date(adj.timestamp).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[10.5px] text-[#372921]">
                          {adj.id}
                        </td>
                        <td className="py-3 px-4">
                          <strong className="text-[#372921] block">{adj.productName}</strong>
                          <span className="text-[10px] font-mono text-[#76695F]">{adj.sku}</span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#76695F]">
                          {adj.previousQty}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                          {adj.adjustedQty}
                        </td>
                        <td className={`py-3 px-4 text-center font-mono font-bold ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {isPositive ? `+${adj.difference}` : adj.difference}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 uppercase font-mono">
                            {adj.reason.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-[#372921] font-medium">
                          {adj.loggedBy}
                        </td>
                        <td className="py-3 px-4 text-[#76695F] max-w-xs truncate" title={adj.notes}>
                          {adj.notes || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: POST INVENTORY MOVEMENT (PURCHASE, PRODUCTION, DAMAGE, PR)
          ========================================================================= */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Authoritative Ledger Posting
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Post Inventory Movement
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMovementModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Target SKU</label>
                <select
                  value={movementSku}
                  onChange={e => setMovementSku(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {inventory.map(item => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} — {item.name} (Current: {item.onHand} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Movement Classification</label>
                <select
                  value={movementType}
                  onChange={e => setMovementType(e.target.value as InventoryMovementType)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  <option value="PURCHASE_IN">+ PURCHASE_IN: Vendor / Procurement Component Inward</option>
                  <option value="PRODUCTION_IN">+ PRODUCTION_IN: Loom Output Completed &amp; QC Passed</option>
                  <option value="SALE_OUT">- SALE_OUT: Direct Storefront or Offline POS Sale</option>
                  <option value="DAMAGE_OUT">- DAMAGE_OUT: Artisan Tension Defect or Transit Damage Write-Off</option>
                  <option value="MARKETING_OUT">- MARKETING_OUT: Photoshoot Loan or VIP Editorial Sample</option>
                  <option value="RETURN_IN">+ RETURN_IN: Customer Restock Return</option>
                </select>
                <p className="text-[10.5px] text-[#76695F] mt-1">
                  {MOVEMENT_TYPE_CONFIG[movementType]?.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQuantity}
                    onChange={e => setMovementQuantity(Number(e.target.value))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Source / Reference ID</label>
                  <input
                    type="text"
                    value={movementSourceId}
                    onChange={e => setMovementSourceId(e.target.value)}
                    placeholder="e.g. PO-8921, WO-088, PR-01"
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Audit Notes / Reason</label>
                <textarea
                  rows={2}
                  value={movementNotes}
                  onChange={e => setMovementNotes(e.target.value)}
                  placeholder="State the justification, batch number, or voucher reference..."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMovementModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Commit Movement to Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: PHYSICAL AUDIT ADJUSTMENT MODAL
          ========================================================================= */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  Physical Cycle Count Variance
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Log Physical Count Audit
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Target SKU</label>
                <select
                  value={selectedSku}
                  onChange={e => {
                    setSelectedSku(e.target.value);
                    const item = inventory.find(i => i.sku === e.target.value);
                    if (item) setNewQty(item.onHand);
                  }}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                >
                  {inventory.map(item => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} — {item.name} (Current: {item.onHand} {item.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Verified Physical Count in Warehouse
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newQty}
                  onChange={e => setNewQty(Number(e.target.value))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Audit Discrepancy Reason</label>
                <div className="grid grid-cols-2 gap-2">
                  {REASON_TILES.map(tile => (
                    <button
                      key={tile.id}
                      type="button"
                      onClick={() => setAdjReason(tile.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        adjReason === tile.id
                          ? 'border-[#9E5430] bg-[#9E5430]/10 text-[#372921]'
                          : 'border-[#DED3C5] bg-white text-[#76695F] hover:border-[#9E5430]/40'
                      }`}
                    >
                      <strong className="block text-[11px] font-semibold text-[#372921]">{tile.label}</strong>
                      <span className="text-[9.5px] leading-tight block text-[#76695F] mt-0.5">{tile.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Audit Notes</label>
                <textarea
                  rows={2}
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                  placeholder="Record auditor remarks or reconciliation memo..."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Update Physical Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: MOVEMENT LEDGER HISTORY DRAWER
          ========================================================================= */}
      {historyDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl h-full bg-[#FCFAF6] shadow-2xl border-l border-[#DED3C5] flex flex-col animate-slide-left">
            <div className="px-6 py-5 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  SKU Audit History
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Ledger Trail for {historySku}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryDrawerOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentSkuMovements.map(mov => {
                const cfg = MOVEMENT_TYPE_CONFIG[mov.movementType] || {
                  label: mov.movementType,
                  badgeColor: 'bg-stone-100 text-stone-800',
                };
                const isPositive = mov.quantity > 0;

                return (
                  <div
                    key={mov.id}
                    className="p-4 rounded-xl border border-[#EAE2D8] bg-white shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badgeColor}`}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] font-mono text-[#76695F]">
                        {new Date(mov.timestamp).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-[#76695F]">
                        Balance: <span className="font-mono">{mov.previousBalance}</span> →{' '}
                        <strong className="text-[#372921] font-mono">{mov.newBalance}</strong>
                      </span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? `+${mov.quantity}` : mov.quantity}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#685B52] bg-[#F7F3EC] p-2 rounded-lg border border-[#EAE2D8]">
                      {mov.notes}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-[#A99583] font-mono pt-1">
                      <span>Operator: {mov.actor}</span>
                      <span>Ref: {mov.sourceId || mov.id}</span>
                    </div>
                  </div>
                );
              })}

              {currentSkuMovements.length === 0 && (
                <div className="text-center py-16 text-[#76695F]">
                  <History className="w-8 h-8 text-[#DED3C5] mx-auto mb-2" />
                  <p className="font-semibold text-sm text-[#372921]">No discrete movements recorded yet</p>
                  <p className="text-xs text-[#76695F] mt-1">
                    This item holds its opening baseline balance. Post movements to record live ledger transactions.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#EAE2D8] bg-[#F7F3EC]">
              <button
                type="button"
                onClick={() => {
                  setHistoryDrawerOpen(false);
                  handleOpenMovement(historySku);
                }}
                className="w-full py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Post New Movement for {historySku}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: CREATE NEW SKU / RAW MATERIAL MODAL
          ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  New Ledger Entity
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Register Master Inventory SKU
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Product SKU *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KJ-BAG-009"
                    value={newSkuData.sku}
                    onChange={e => setNewSkuData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Entity Type</label>
                  <select
                    value={newSkuData.type}
                    onChange={e =>
                      setNewSkuData(prev => ({
                        ...prev,
                        type: e.target.value as 'finished_good' | 'raw_material',
                      }))
                    }
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="finished_good">Finished Heirloom Good</option>
                    <option value="raw_material">Raw Craft Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luminous Crystal Envelope Clutch"
                  value={newSkuData.name}
                  onChange={e => setNewSkuData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Category</label>
                  <select
                    value={newSkuData.category}
                    onChange={e => setNewSkuData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Organisers">Organisers &amp; Vanity Boxes</option>
                    <option value="Purses">Purses &amp; Evening Bags</option>
                    <option value="Clutches">Luminous Clutches</option>
                    <option value="AirPod Cases">AirPod Charm Cases</option>
                    <option value="Lanterns">Tealight Lanterns</option>
                    <option value="Raw Materials">Raw Craft Materials</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Hub Location</label>
                  <select
                    value={newSkuData.location}
                    onChange={e =>
                      setNewSkuData(prev => ({
                        ...prev,
                        location: e.target.value as 'Mumbai Atelier' | 'Bihar Craft House',
                      }))
                    }
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Mumbai Atelier">Mumbai Atelier</option>
                    <option value="Bihar Craft House">Bihar Craft House</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newSkuData.hsnCode || ''}
                    onChange={e => setNewSkuData(prev => ({ ...prev, hsnCode: e.target.value }))}
                    placeholder="7117.90"
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={newSkuData.taxRate || 3}
                    onChange={e => setNewSkuData(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={newSkuData.onHand}
                    onChange={e => setNewSkuData(prev => ({ ...prev, onHand: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="1"
                    value={newSkuData.reorderPoint}
                    onChange={e => setNewSkuData(prev => ({ ...prev, reorderPoint: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Unit</label>
                  <input
                    type="text"
                    value={newSkuData.unit}
                    onChange={e => setNewSkuData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="pcs, kg, spools"
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={newSkuData.unitCost}
                    onChange={e => setNewSkuData(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newSkuData.retailPrice || 0}
                    onChange={e => setNewSkuData(prev => ({ ...prev, retailPrice: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">MRP Tag (₹)</label>
                  <input
                    type="number"
                    value={newSkuData.mrp || 0}
                    onChange={e => setNewSkuData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              {/* RAW MATERIALS & CRAFT COSTING SECTION */}
              <div className="pt-4 border-t border-[#EAE2D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#9E5430]" />
                    <span className="font-serif font-bold text-sm text-[#372921]">Craft Production &amp; Unit Costing</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F0E9DF] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCreateCostingBasis('per_unit')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        createCostingBasis === 'per_unit'
                          ? 'bg-[#9E5430] text-white'
                          : 'text-[#76695F] hover:text-[#372921]'
                      }`}
                    >
                      Per-Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setCreateCostingBasis('per_batch')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        createCostingBasis === 'per_batch'
                          ? 'bg-[#9E5430] text-white'
                          : 'text-[#76695F] hover:text-[#372921]'
                      }`}
                    >
                      Per-Batch
                    </button>
                  </div>
                </div>

                {createCostingBasis === 'per_batch' && (
                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="font-medium text-amber-950">Batch Production Run Size (Finished Units):</span>
                    <input
                      type="number"
                      min="1"
                      value={createProductionQuantity}
                      onChange={e => setCreateProductionQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-24 bg-white border border-amber-300 rounded-lg px-2.5 py-1 font-mono font-bold text-center text-[#372921]"
                    />
                  </div>
                )}

                {/* Raw Materials Requirements Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#372921]">1. Raw Material Requirements</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateRawMaterials(prev => [
                          ...prev,
                          {
                            id: `rm-${Date.now()}`,
                            materialName: '',
                            quantityRequired: 0.1,
                            unit: 'kg',
                            rate: 500,
                            rateUnit: 'per_kg',
                            costPerKg: 500,
                            lineCost: 50,
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Material</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {createRawMaterials.map((mat, idx) => {
                      const effectiveRate = mat.rate ?? mat.costPerKg ?? 0;
                      const effectiveRateUnit = mat.rateUnit || getRateUnitForMaterialUnit(mat.unit);
                      const calculatedLine = calculateRawMaterialLineCost(mat.quantityRequired, mat.unit, effectiveRate, effectiveRateUnit);
                      return (
                        <div
                          key={mat.id}
                          className="p-2.5 bg-white rounded-xl border border-[#DED3C5] grid grid-cols-12 gap-2 items-center"
                        >
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Material name (e.g. Faux Pearls)"
                              value={mat.materialName}
                              onChange={e => {
                                const val = e.target.value;
                                setCreateRawMaterials(prev =>
                                  prev.map((m, i) => (i === idx ? { ...m, materialName: val } : m))
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-2 py-1 text-xs text-[#372921]"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="Qty"
                              value={mat.quantityRequired}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                setCreateRawMaterials(prev =>
                                  prev.map((m, i) => {
                                    if (i !== idx) return m;
                                    const r = m.rate ?? m.costPerKg ?? 0;
                                    const ru = m.rateUnit || getRateUnitForMaterialUnit(m.unit);
                                    return {
                                      ...m,
                                      quantityRequired: val,
                                      lineCost: calculateRawMaterialLineCost(val, m.unit, r, ru),
                                    };
                                  })
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-2 py-1 text-xs font-mono text-center text-[#372921]"
                            />
                          </div>

                          <div className="col-span-2">
                            <select
                              value={mat.unit}
                              onChange={e => {
                                const val = e.target.value as MaterialUnit;
                                const newRateUnit = getRateUnitForMaterialUnit(val);
                                setCreateRawMaterials(prev =>
                                  prev.map((m, i) => {
                                    if (i !== idx) return m;
                                    const r = m.rate ?? m.costPerKg ?? 0;
                                    return {
                                      ...m,
                                      unit: val,
                                      rate: r,
                                      rateUnit: newRateUnit,
                                      costPerKg: newRateUnit === 'per_kg' ? r : undefined,
                                      lineCost: calculateRawMaterialLineCost(m.quantityRequired, val, r, newRateUnit),
                                    };
                                  })
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-1.5 py-1 text-xs text-[#372921]"
                            >
                              <option value="kg">kg</option>
                              <option value="grams">grams (g)</option>
                              <option value="meters">meters</option>
                              <option value="pieces">pieces</option>
                            </select>
                          </div>

                          <div className="col-span-2 relative">
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="any"
                                placeholder="Rate"
                                value={mat.rate ?? mat.costPerKg ?? ''}
                                onChange={e => {
                                  const val = Number(e.target.value) || 0;
                                  setCreateRawMaterials(prev =>
                                    prev.map((m, i) => {
                                      if (i !== idx) return m;
                                      const ru = m.rateUnit || getRateUnitForMaterialUnit(m.unit);
                                      return {
                                        ...m,
                                        rate: val,
                                        rateUnit: ru,
                                        costPerKg: ru === 'per_kg' ? val : undefined,
                                        lineCost: calculateRawMaterialLineCost(m.quantityRequired, m.unit, val, ru),
                                      };
                                    })
                                  );
                                }}
                                className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg pl-1.5 pr-8 py-1 text-xs font-mono text-right text-[#372921]"
                              />
                              <span className="absolute right-1 text-[10px] text-[#76695F] font-mono pointer-events-none">
                                {getRateBasisLabel(effectiveRateUnit)}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-2 flex items-center justify-between pl-1">
                            <span className="font-mono font-bold text-xs text-[#9E5430]">
                              ₹{calculatedLine}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setCreateRawMaterials(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Remove raw material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {createRawMaterials.length === 0 && (
                      <p className="text-center py-2 text-[#76695F] italic bg-[#F7F3EC] rounded-lg border border-dashed border-[#DED3C5]">
                        No raw materials specified. Click &ldquo;Add Material&rdquo; above.
                      </p>
                    )}
                  </div>
                </div>

                {/* Labour Costing & Other Charges Inputs */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">2. Labour Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={createLabourHours}
                      onChange={e => setCreateLabourHours(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">Weaving time</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">Labour Rate/Hr (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={createLabourCostPerHour}
                      onChange={e => setCreateLabourCostPerHour(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">₹{Math.round(createLabourHours * createLabourCostPerHour)} total labour</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">3. Other Charges (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={createOtherCharges}
                      onChange={e => setCreateOtherCharges(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">Finishing &amp; packing</span>
                  </div>
                </div>

                {/* Auto-Recalculating Costing Summary Card */}
                <div className="p-3.5 bg-gradient-to-br from-[#FAF7F2] to-[#F4EFE6] rounded-xl border border-[#DED3C5] space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-[#EAE2D8]">
                    <span className="font-semibold text-[#76695F]">Costing Breakdown:</span>
                    <span className="font-mono text-[#372921]">
                      Raw Materials: <strong>₹{createCalculatedCosting.totalRawMaterialCost}</strong> + Labour: <strong>₹{createCalculatedCosting.labourCost}</strong> + Others: <strong>₹{createCalculatedCosting.otherCharges}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-semibold block">
                        Calculated Unit Cost ({createCostingBasis === 'per_batch' ? `Batch of ${createProductionQuantity}` : 'Per Unit'})
                      </span>
                      <span className="font-serif text-xl font-bold text-[#9E5430]">
                        ₹{createCalculatedCosting.unitCost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#76695F] block">
                        Total Production Cost: ₹{createCalculatedCosting.totalProductionCost.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setNewSkuData(prev => ({ ...prev, unitCost: createCalculatedCosting.unitCost }));
                        showToast(`Applied calculated unit cost (₹${createCalculatedCosting.unitCost}) to SKU.`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sync to SKU Unit Cost</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* NOTES / REMARKS FIELD */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Notes / Artisan Production Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master loom tension calibrated for Czech crystal beads. Bihar artisan batch."
                  value={createNotes}
                  onChange={e => setCreateNotes(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Entity in Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: EDIT SKU SPECIFICATIONS MODAL
          ========================================================================= */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  SKU Specifications &amp; Craft Costing
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Edit {editingItem.sku} — {editingItem.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={e => setEditingItem(prev => (prev ? { ...prev, name: e.target.value } : null))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Hub Location</label>
                  <select
                    value={editingItem.location}
                    onChange={e =>
                      setEditingItem(prev =>
                        prev ? { ...prev, location: e.target.value as 'Mumbai Atelier' | 'Bihar Craft House' } : null
                      )
                    }
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Mumbai Atelier">Mumbai Atelier</option>
                    <option value="Bihar Craft House">Bihar Craft House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={editingItem.unitCost}
                    onChange={e => setEditingItem(prev => (prev ? { ...prev, unitCost: Number(e.target.value) } : null))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={editingItem.retailPrice || 0}
                    onChange={e => setEditingItem(prev => (prev ? { ...prev, retailPrice: Number(e.target.value) } : null))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">MRP Tag (₹)</label>
                  <input
                    type="number"
                    value={editingItem.mrp || 0}
                    onChange={e => setEditingItem(prev => (prev ? { ...prev, mrp: Number(e.target.value) } : null))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Reorder Point</label>
                  <input
                    type="number"
                    value={editingItem.reorderPoint}
                    onChange={e => setEditingItem(prev => (prev ? { ...prev, reorderPoint: Number(e.target.value) } : null))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Reserved Count</label>
                  <input
                    type="number"
                    value={editingItem.reserved}
                    onChange={e => setEditingItem(prev => (prev ? { ...prev, reserved: Number(e.target.value) } : null))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Supplier / Guild</label>
                <input
                  type="text"
                  value={editingItem.supplier || ''}
                  onChange={e => setEditingItem(prev => (prev ? { ...prev, supplier: e.target.value } : null))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              {/* RAW MATERIALS & CRAFT COSTING SECTION (EDIT) */}
              <div className="pt-4 border-t border-[#EAE2D8] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#9E5430]" />
                    <span className="font-serif font-bold text-sm text-[#372921]">Craft Production &amp; Unit Costing</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#F0E9DF] p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setEditCostingBasis('per_unit')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        editCostingBasis === 'per_unit'
                          ? 'bg-[#9E5430] text-white'
                          : 'text-[#76695F] hover:text-[#372921]'
                      }`}
                    >
                      Per-Unit
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditCostingBasis('per_batch')}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                        editCostingBasis === 'per_batch'
                          ? 'bg-[#9E5430] text-white'
                          : 'text-[#76695F] hover:text-[#372921]'
                      }`}
                    >
                      Per-Batch
                    </button>
                  </div>
                </div>

                {editCostingBasis === 'per_batch' && (
                  <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/60 flex items-center justify-between text-xs">
                    <span className="font-medium text-amber-950">Batch Production Run Size (Finished Units):</span>
                    <input
                      type="number"
                      min="1"
                      value={editProductionQuantity}
                      onChange={e => setEditProductionQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="w-24 bg-white border border-amber-300 rounded-lg px-2.5 py-1 font-mono font-bold text-center text-[#372921]"
                    />
                  </div>
                )}

                {/* Raw Materials Requirements Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#372921]">1. Raw Material Requirements</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditRawMaterials(prev => [
                          ...prev,
                          {
                            id: `rm-${Date.now()}`,
                            materialName: '',
                            quantityRequired: 0.1,
                            unit: 'kg',
                            rate: 500,
                            rateUnit: 'per_kg',
                            costPerKg: 500,
                            lineCost: 50,
                          },
                        ]);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[#9E5430]/10 hover:bg-[#9E5430]/20 text-[#9E5430] text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Material</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {editRawMaterials.map((mat, idx) => {
                      const effectiveRate = mat.rate ?? mat.costPerKg ?? 0;
                      const effectiveRateUnit = mat.rateUnit || getRateUnitForMaterialUnit(mat.unit);
                      const calculatedLine = calculateRawMaterialLineCost(mat.quantityRequired, mat.unit, effectiveRate, effectiveRateUnit);
                      return (
                        <div
                          key={mat.id}
                          className="p-2.5 bg-white rounded-xl border border-[#DED3C5] grid grid-cols-12 gap-2 items-center"
                        >
                          <div className="col-span-4">
                            <input
                              type="text"
                              placeholder="Material name"
                              value={mat.materialName}
                              onChange={e => {
                                const val = e.target.value;
                                setEditRawMaterials(prev =>
                                  prev.map((m, i) => (i === idx ? { ...m, materialName: val } : m))
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-2 py-1 text-xs text-[#372921]"
                            />
                          </div>

                          <div className="col-span-2">
                            <input
                              type="number"
                              step="any"
                              placeholder="Qty"
                              value={mat.quantityRequired}
                              onChange={e => {
                                const val = Number(e.target.value) || 0;
                                setEditRawMaterials(prev =>
                                  prev.map((m, i) => {
                                    if (i !== idx) return m;
                                    const r = m.rate ?? m.costPerKg ?? 0;
                                    const ru = m.rateUnit || getRateUnitForMaterialUnit(m.unit);
                                    return {
                                      ...m,
                                      quantityRequired: val,
                                      lineCost: calculateRawMaterialLineCost(val, m.unit, r, ru),
                                    };
                                  })
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-2 py-1 text-xs font-mono text-center text-[#372921]"
                            />
                          </div>

                          <div className="col-span-2">
                            <select
                              value={mat.unit}
                              onChange={e => {
                                const val = e.target.value as MaterialUnit;
                                const newRateUnit = getRateUnitForMaterialUnit(val);
                                setEditRawMaterials(prev =>
                                  prev.map((m, i) => {
                                    if (i !== idx) return m;
                                    const r = m.rate ?? m.costPerKg ?? 0;
                                    return {
                                      ...m,
                                      unit: val,
                                      rate: r,
                                      rateUnit: newRateUnit,
                                      costPerKg: newRateUnit === 'per_kg' ? r : undefined,
                                      lineCost: calculateRawMaterialLineCost(m.quantityRequired, val, r, newRateUnit),
                                    };
                                  })
                                );
                              }}
                              className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg px-1.5 py-1 text-xs text-[#372921]"
                            >
                              <option value="kg">kg</option>
                              <option value="grams">grams (g)</option>
                              <option value="meters">meters</option>
                              <option value="pieces">pieces</option>
                            </select>
                          </div>

                          <div className="col-span-2 relative">
                            <div className="flex items-center">
                              <input
                                type="number"
                                step="any"
                                placeholder="Rate"
                                value={mat.rate ?? mat.costPerKg ?? ''}
                                onChange={e => {
                                  const val = Number(e.target.value) || 0;
                                  setEditRawMaterials(prev =>
                                    prev.map((m, i) => {
                                      if (i !== idx) return m;
                                      const ru = m.rateUnit || getRateUnitForMaterialUnit(m.unit);
                                      return {
                                        ...m,
                                        rate: val,
                                        rateUnit: ru,
                                        costPerKg: ru === 'per_kg' ? val : undefined,
                                        lineCost: calculateRawMaterialLineCost(m.quantityRequired, m.unit, val, ru),
                                      };
                                    })
                                  );
                                }}
                                className="w-full bg-[#FAF7F2] border border-[#EAE2D8] rounded-lg pl-1.5 pr-8 py-1 text-xs font-mono text-right text-[#372921]"
                              />
                              <span className="absolute right-1 text-[10px] text-[#76695F] font-mono pointer-events-none">
                                {getRateBasisLabel(effectiveRateUnit)}
                              </span>
                            </div>
                          </div>

                          <div className="col-span-2 flex items-center justify-between pl-1">
                            <span className="font-mono font-bold text-xs text-[#9E5430]">
                              ₹{calculatedLine}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditRawMaterials(prev => prev.filter((_, i) => i !== idx));
                              }}
                              className="p-1 text-rose-500 hover:text-rose-700"
                              title="Remove raw material"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {editRawMaterials.length === 0 && (
                      <p className="text-center py-2 text-[#76695F] italic bg-[#F7F3EC] rounded-lg border border-dashed border-[#DED3C5]">
                        No raw materials specified. Click &ldquo;Add Material&rdquo; above.
                      </p>
                    )}
                  </div>
                </div>

                {/* Labour Costing & Other Charges Inputs */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">2. Labour Hours</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={editLabourHours}
                      onChange={e => setEditLabourHours(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">Weaving time</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">Labour Rate/Hr (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editLabourCostPerHour}
                      onChange={e => setEditLabourCostPerHour(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">₹{Math.round(editLabourHours * editLabourCostPerHour)} total labour</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">3. Other Charges (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={editOtherCharges}
                      onChange={e => setEditOtherCharges(Number(e.target.value) || 0)}
                      className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921]"
                    />
                    <span className="text-[10px] text-[#76695F] block mt-0.5">Finishing &amp; packing</span>
                  </div>
                </div>

                {/* Auto-Recalculating Costing Summary Card */}
                <div className="p-3.5 bg-gradient-to-br from-[#FAF7F2] to-[#F4EFE6] rounded-xl border border-[#DED3C5] space-y-2">
                  <div className="flex items-center justify-between text-xs pb-1 border-b border-[#EAE2D8]">
                    <span className="font-semibold text-[#76695F]">Costing Breakdown:</span>
                    <span className="font-mono text-[#372921]">
                      Raw Materials: <strong>₹{editCalculatedCosting.totalRawMaterialCost}</strong> + Labour: <strong>₹{editCalculatedCosting.labourCost}</strong> + Others: <strong>₹{editCalculatedCosting.otherCharges}</strong>
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-semibold block">
                        Calculated Unit Cost ({editCostingBasis === 'per_batch' ? `Batch of ${editProductionQuantity}` : 'Per Unit'})
                      </span>
                      <span className="font-serif text-xl font-bold text-[#9E5430]">
                        ₹{editCalculatedCosting.unitCost.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#76695F] block">
                        Total Production Cost: ₹{editCalculatedCosting.totalProductionCost.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(prev => (prev ? { ...prev, unitCost: editCalculatedCosting.unitCost } : null));
                        showToast(`Applied calculated unit cost (₹${editCalculatedCosting.unitCost}) to SKU.`, 'info');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Sync to SKU Unit Cost</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* NOTES / REMARKS FIELD (EDIT) */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Notes / Artisan Production Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Master loom tension calibrated for Czech crystal beads. Bihar artisan batch."
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-2.5 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: ITEM DETAILS & CRAFT COSTING MODAL
          ========================================================================= */}
      {detailModalOpen && selectedDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-[#FCFAF6] rounded-3xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                    Master SKU Dossier
                  </span>
                  <ProvenanceBadge provenance={(selectedDetailItem as any).provenance} isDemo={(selectedDetailItem as any).isDemo} size="xs" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#372921] mt-0.5">
                  {selectedDetailItem.name}
                </h3>
                <span className="font-mono text-xs text-[#76695F]">{selectedDetailItem.sku} · {selectedDetailItem.category}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 text-xs overflow-y-auto">
              {/* Top Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white rounded-xl border border-[#DED3C5]">
                  <span className="text-[10px] text-[#76695F] uppercase font-semibold block">On-Hand Stock</span>
                  <span className="font-mono text-lg font-bold text-[#372921]">
                    {selectedDetailItem.onHand} <span className="text-xs font-normal text-[#76695F]">{selectedDetailItem.unit}</span>
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-medium">Available: {selectedDetailItem.available}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#DED3C5]">
                  <span className="text-[10px] text-[#76695F] uppercase font-semibold block">Unit Cost (COGS)</span>
                  <span className="font-mono text-lg font-bold text-[#9E5430]">
                    ₹{selectedDetailItem.unitCost.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#76695F] block">Valuation: ₹{(selectedDetailItem.stockValue || selectedDetailItem.onHand * selectedDetailItem.unitCost).toLocaleString('en-IN')}</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#DED3C5]">
                  <span className="text-[10px] text-[#76695F] uppercase font-semibold block">Selling Price</span>
                  <span className="font-mono text-lg font-bold text-[#372921]">
                    {selectedDetailItem.retailPrice ? `₹${selectedDetailItem.retailPrice.toLocaleString('en-IN')}` : '—'}
                  </span>
                  <span className="text-[10px] text-emerald-700 block font-medium">Margin: {selectedDetailItem.grossMarginPct || 0}%</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#DED3C5]">
                  <span className="text-[10px] text-[#76695F] uppercase font-semibold block">Tax &amp; HSN</span>
                  <span className="font-mono text-sm font-bold text-[#372921] block mt-0.5">
                    {selectedDetailItem.hsnCode || '7117.90'}
                  </span>
                  <span className="text-[10px] text-[#76695F] block">{selectedDetailItem.taxRate || 3}% GST</span>
                </div>
              </div>

              {/* Craft Production Costing Breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-[#DED3C5] space-y-3">
                <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-2">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-[#9E5430]" />
                    <span className="font-serif font-bold text-sm text-[#372921]">Craft Production &amp; Unit Costing Breakdown</span>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold font-mono">
                    Basis: {selectedDetailItem.costingBasis === 'per_batch' ? `Batch of ${selectedDetailItem.productionQuantity || selectedDetailItem.enhancedCosting?.productionQuantity || 1} units` : 'Per-Unit Finished Good'}
                  </span>
                </div>

                {/* Raw Materials Table */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-[#76695F]">Raw Material Bill of Materials (BOM):</span>
                  {((selectedDetailItem.rawMaterials && selectedDetailItem.rawMaterials.length > 0) ||
                    (selectedDetailItem.enhancedCosting?.rawMaterials && selectedDetailItem.enhancedCosting.rawMaterials.length > 0)) ? (
                    <div className="border border-[#EAE2D8] rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#F7F3EC] text-[#76695F] text-[10px] uppercase font-semibold border-b border-[#EAE2D8]">
                          <tr>
                            <th className="py-2 px-3">Material</th>
                            <th className="py-2 px-3 text-center">Quantity</th>
                            <th className="py-2 px-3 text-center">Unit</th>
                            <th className="py-2 px-3 text-right">Rate (₹)</th>
                            <th className="py-2 px-3 text-right font-bold">Line Cost</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EAE2D8]">
                          {(selectedDetailItem.rawMaterials || selectedDetailItem.enhancedCosting?.rawMaterials || []).map((m, idx) => {
                            const effectiveRate = m.rate ?? m.costPerKg ?? 0;
                            const effectiveRateUnit = m.rateUnit || getRateUnitForMaterialUnit(m.unit);
                            return (
                              <tr key={idx} className="hover:bg-[#FFFCF7]">
                                <td className="py-2 px-3 font-medium text-[#372921]">{m.materialName}</td>
                                <td className="py-2 px-3 text-center font-mono">{m.quantityRequired}</td>
                                <td className="py-2 px-3 text-center font-mono text-[#76695F]">{m.unit}</td>
                                <td className="py-2 px-3 text-right font-mono">
                                  ₹{effectiveRate} <span className="text-[10px] text-[#76695F]">({getRateBasisLabel(effectiveRateUnit)})</span>
                                </td>
                                <td className="py-2 px-3 text-right font-mono font-bold text-[#9E5430]">₹{m.lineCost}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : selectedDetailItem.costing?.enabled ? (
                    <div className="p-3 bg-[#F7F3EC] rounded-xl text-xs space-y-1">
                      <div>Legacy Formula: <strong>{selectedDetailItem.costing.beadsUsed || 'Handcrafted Beads'}</strong></div>
                      <div>Weight: {selectedDetailItem.costing.beadKg} kg @ ₹{selectedDetailItem.costing.beadCostKg}/kg = ₹{selectedDetailItem.costing.beadKg * selectedDetailItem.costing.beadCostKg}</div>
                    </div>
                  ) : (
                    <p className="text-xs text-[#76695F] italic p-2 bg-[#F7F3EC] rounded-lg border border-dashed border-[#DED3C5]">
                      No discrete raw material breakdown registered for this SKU.
                    </p>
                  )}
                </div>

                {/* Labour & Other Charges Summary */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#EAE2D8]">
                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EAE2D8]">
                    <span className="text-[10px] text-[#76695F] block font-semibold">Labour Cost</span>
                    <span className="font-mono text-xs font-bold text-[#372921]">
                      {selectedDetailItem.labourHours ?? selectedDetailItem.enhancedCosting?.labourHours ?? selectedDetailItem.costing?.laborHours ?? 0} hrs @ ₹{selectedDetailItem.labourCostPerHour ?? selectedDetailItem.enhancedCosting?.labourCostPerHour ?? selectedDetailItem.costing?.laborRatePerHour ?? 120}/hr
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#9E5430] block mt-0.5">
                      = ₹{selectedDetailItem.labourCost ?? selectedDetailItem.enhancedCosting?.labourCost ?? (Number(selectedDetailItem.costing?.laborHours || 0) * Number(selectedDetailItem.costing?.laborRatePerHour || 120))}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#FAF7F2] rounded-xl border border-[#EAE2D8]">
                    <span className="text-[10px] text-[#76695F] block font-semibold">Other Charges</span>
                    <span className="font-mono text-xs font-bold text-[#372921]">
                      Finishing, packaging
                    </span>
                    <span className="text-[11px] font-mono font-bold text-[#9E5430] block mt-0.5">
                      = ₹{selectedDetailItem.otherCharges ?? selectedDetailItem.enhancedCosting?.otherCharges ?? selectedDetailItem.costing?.otherMaterialCost ?? 0}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#F0E9DF] rounded-xl border border-[#DED3C5] col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-[#76695F] block font-semibold uppercase">Total Unit Cost</span>
                    <span className="font-serif text-lg font-bold text-[#9E5430]">
                      ₹{selectedDetailItem.unitCost.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-[#76695F] block">
                      Total Run: ₹{(selectedDetailItem.totalProductionCost ?? selectedDetailItem.enhancedCosting?.totalProductionCost ?? selectedDetailItem.unitCost).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes / Remarks Card */}
              <div className="p-4 bg-white rounded-2xl border border-[#DED3C5] space-y-1.5">
                <span className="font-semibold text-xs text-[#372921] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#9E5430]" />
                  <span>Production Notes &amp; Remarks</span>
                </span>
                <p className="text-xs text-[#76695F] bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE2D8] whitespace-pre-wrap leading-relaxed">
                  {selectedDetailItem.notes || selectedDetailItem.enhancedCosting?.notes || selectedDetailItem.costing?.notes || 'No production notes or remarks logged for this item.'}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#EAE2D8]">
                <button
                  type="button"
                  onClick={() => setDetailModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] hover:bg-[#F0E9DF]"
                >
                  Close Dossier
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const itemToEdit = selectedDetailItem;
                    setDetailModalOpen(false);
                    handleOpenEdit(itemToEdit);
                  }}
                  className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Specifications &amp; Costing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          PHASE 2F: MODAL 7: EXCEL BATCH UPDATE & DIFF PREVIEW MODAL
          ========================================================================= */}
      {excelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-[#DED3C5] max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Catalogue Excel Parity Engine</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#372921]">
                  Batch Catalogue Update Preview
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  File: <span className="font-mono text-[#372921] font-semibold">{excelFileName}</span> — Verify detected changes before committing to master ledger.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setExcelModalOpen(false)}
                className="w-8 h-8 rounded-full border border-[#DED3C5] flex items-center justify-center text-[#76695F] hover:text-[#372921] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Batch Stats Summary Cards */}
            <div className="grid grid-cols-4 gap-3 p-6 pb-2 bg-[#FAF8F5] border-b border-[#EAE2D8]">
              <div className="p-3 bg-white rounded-xl border border-[#DED3C5] text-center">
                <span className="text-[10px] uppercase font-semibold text-[#76695F] block">Rows Scanned</span>
                <span className="font-mono text-lg font-bold text-[#372921]">{excelStats.total}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center">
                <span className="text-[10px] uppercase font-semibold text-emerald-700 block">Modifications</span>
                <span className="font-mono text-lg font-bold text-emerald-800">+{excelStats.changed}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] uppercase font-semibold text-[#76695F] block">Unchanged</span>
                <span className="font-mono text-lg font-bold text-[#76695F]">{excelStats.unchanged}</span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-rose-200 text-center">
                <span className="text-[10px] uppercase font-semibold text-rose-700 block">Errors / Unknown</span>
                <span className="font-mono text-lg font-bold text-rose-800">{excelStats.invalid}</span>
              </div>
            </div>

            {/* Diff Table */}
            <div className="flex-1 overflow-y-auto p-6">
              {excelDiffs.filter(d => d.status !== 'unchanged').length === 0 ? (
                <div className="text-center py-12 text-[#76695F]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
                  <p className="text-sm font-medium">All rows in sheet match current ledger values. No modifications found.</p>
                </div>
              ) : (
                <div className="border border-[#DED3C5] rounded-2xl overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="py-3 px-4">Product Code &amp; Name</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3 text-center">Stock Change</th>
                        <th className="py-3 px-3 text-right">Price Change</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAE2D8]">
                      {excelDiffs
                        .filter(d => d.status !== 'unchanged')
                        .map((diff, idx) => (
                          <tr key={idx} className="hover:bg-[#FFFCF7] transition-colors">
                            <td className="py-3 px-4">
                              <strong className="text-[#372921] block">{diff.name}</strong>
                              <span className="text-[10.5px] font-mono text-[#9E5430]">{diff.sku}</span>
                            </td>
                            <td className="py-3 px-3 text-[#76695F]">{diff.category}</td>
                            <td className="py-3 px-3 text-center font-mono">
                              {diff.newQty !== null ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="text-[#76695F] line-through">{diff.currentQty}</span>
                                  <ArrowRight className="w-3 h-3 text-[#9E5430]" />
                                  <span className="font-bold text-[#372921]">{diff.newQty}</span>
                                  <span
                                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                      diff.qtyDelta > 0
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : diff.qtyDelta < 0
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'text-[#76695F]'
                                    }`}
                                  >
                                    {diff.qtyDelta > 0 ? '+' : ''}{diff.qtyDelta}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[#76695F]">{diff.currentQty} pcs (Unchanged)</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono">
                              {diff.newPrice !== null ? (
                                <div className="inline-flex items-center gap-1.5 justify-end">
                                  <span className="text-[#76695F] line-through">₹{diff.currentPrice.toLocaleString('en-IN')}</span>
                                  <ArrowRight className="w-3 h-3 text-[#9E5430]" />
                                  <span className="font-bold text-[#372921]">₹{diff.newPrice.toLocaleString('en-IN')}</span>
                                </div>
                              ) : (
                                <span className="text-[#76695F]">₹{diff.currentPrice.toLocaleString('en-IN')}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {diff.status === 'changed' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  Ready to Update
                                </span>
                              ) : diff.status === 'invalid' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-rose-100 text-rose-800 border border-rose-200" title={diff.errorMsg}>
                                  {diff.errorMsg || 'Validation Error'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                                  Unknown SKU
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-4 sm:p-6 border-t border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExcelModalOpen(false)}
                className="px-5 py-2.5 rounded-full border border-[#DED3C5] text-xs font-semibold text-[#76695F] hover:text-[#372921]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApplyBatchUpdates}
                disabled={excelStats.changed === 0}
                className="px-6 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-sm disabled:opacity-40 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Apply {excelStats.changed} Updates to Master Ledger</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 6: DELETE / ARCHIVE SKU CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#372921]">Archive Inventory SKU?</h3>
              <p className="text-xs text-[#76695F]">
                Are you sure you want to archive <strong className="text-[#372921]">{deletingItem.name}</strong> ({deletingItem.sku})? It will be removed from active stock checks.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold text-[#76695F]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold"
              >
                Archive SKU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

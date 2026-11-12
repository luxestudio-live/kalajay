'use client';

import React, { useState, useMemo } from 'react';
import {
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
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { StockAdjustment, InventoryItem } from '@/data/adminTypes';

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

export default function InventoryView() {
  const {
    inventory,
    stockAdjustments,
    adjustStock,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    can,
    activeSubPage,
    setActiveSubPage,
    showModal,
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
    category: 'Vanity Boxes',
    location: 'Mumbai Atelier',
    type: 'finished_good',
    onHand: 10,
    reserved: 0,
    available: 10,
    reorderPoint: 5,
    unitCost: 1200,
    supplier: 'In-House Bihar Atelier',
    status: 'in_stock',
    unit: 'pcs',
  });

  // 3. Edit SKU Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // 4. Delete / Archive SKU Confirmation State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

  const canAdjustStock = can('inventory.master', 'adjust_stock');
  const canEdit = can('inventory.master', 'edit');

  // Target item for adjustment
  const activeAdjustItem = useMemo(() => {
    return inventory.find(i => i.sku === selectedSku) || inventory[0];
  }, [inventory, selectedSku]);

  // Filtered inventory
  const filteredItems = inventory.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    const matchesLoc = locationFilter === 'All' || item.location === locationFilter;
    const matchesType = typeFilter === 'All' || item.type === typeFilter;
    const isLowOnly = activeTab === 'low_stock' ? item.status === 'low_stock' || item.status === 'out_of_stock' : true;
    const isRawOnly = activeTab === 'raw_materials' ? item.type === 'raw_material' : true;

    return matchesSearch && matchesLoc && matchesType && isLowOnly && isRawOnly;
  });

  const handleOpenAdjust = (sku?: string) => {
    if (sku) {
      setSelectedSku(sku);
      const target = inventory.find(i => i.sku === sku);
      if (target) setNewQty(target.onHand);
    } else if (inventory[0]) {
      setSelectedSku(inventory[0].sku);
      setNewQty(inventory[0].onHand);
    }
    setAdjNotes('');
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustItem) return;
    adjustStock(selectedSku, Number(newQty), adjReason, adjNotes || 'Operational reconciliation verified by atelier coordinator.');
    setAdjustModalOpen(false);
    showToast(`Stock ledger updated for ${activeAdjustItem.name} (${selectedSku}) to ${newQty} ${activeAdjustItem.unit}.`, 'success');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkuData.sku || !newSkuData.name) {
      showModal({
        title: 'Validation Incomplete',
        message: 'Please provide both an inventory SKU code and item name before registering this master asset.',
        icon: 'warning',
      });
      return;
    }
    const computedAvailable = Math.max(0, newSkuData.onHand - newSkuData.reserved);
    const computedStatus: InventoryItem['status'] =
      newSkuData.onHand === 0
        ? 'out_of_stock'
        : newSkuData.onHand <= newSkuData.reorderPoint
        ? 'low_stock'
        : 'in_stock';

    createInventoryItem({
      ...newSkuData,
      available: computedAvailable,
      status: computedStatus,
    });
    setCreateModalOpen(false);
    showToast(`New SKU ${newSkuData.sku} (${newSkuData.name}) added to ${newSkuData.location} ledger.`, 'success');
    setNewSkuData({
      sku: '',
      name: '',
      category: 'Vanity Boxes',
      location: 'Mumbai Atelier',
      type: 'finished_good',
      onHand: 10,
      reserved: 0,
      available: 10,
      reorderPoint: 5,
      unitCost: 1200,
      supplier: 'In-House Bihar Atelier',
      status: 'in_stock',
      unit: 'pcs',
    });
  };

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

    updateInventoryItem(editingItem.id, {
      ...editingItem,
      available: computedAvailable,
      status: computedStatus,
    });
    setEditModalOpen(false);
    showToast(`Updated specifications for ${editingItem.name} (${editingItem.sku}).`, 'success');
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
    <div className="space-y-6 animate-fade-in pb-12">
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
            <span>Master Operations &amp; ERP Ledger</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Inventory &amp; Stock Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Dual-hub inventory spanning Mumbai Finishing Atelier and Bihar Craft House looms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
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
            <span>Log Stock Adjustment</span>
          </button>
        </div>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'master', label: `Master Ledger (${inventory.length})` },
          {
            id: 'low_stock',
            label: `Low Stock Alerts (${lowStockCount})`,
            badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
          },
          { id: 'raw_materials', label: 'Raw Materials & Minerals' },
          { id: 'adjustments', label: `Adjustments Audit Trail (${stockAdjustments.length})` },
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
              placeholder="Search by SKU, item name, minerals..."
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
        </div>
      )}

      {/* 4. INVENTORY TABLE OR ADJUSTMENTS LOG */}
      {activeTab !== 'adjustments' ? (
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Item SKU &amp; Name</th>
                  <th className="py-3 px-4">Hub Location</th>
                  <th className="py-3 px-4 text-center">On-Hand</th>
                  <th className="py-3 px-4 text-center">Reserved</th>
                  <th className="py-3 px-4 text-center">Available</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-semibold block">{item.name}</strong>
                      <span className="text-[10.5px] text-[#76695F] font-mono">
                        {item.sku} · {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#76695F]">
                        <Warehouse className="w-3 h-3 text-[#9E5430]" />
                        <span>{item.location}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                      {item.onHand} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-[#76695F]">
                      {item.reserved} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-[#9E5430]">
                      {item.available} {item.unit}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#372921]">
                      ₹{item.unitCost.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
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
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenAdjust(item.sku)}
                          disabled={!canAdjustStock}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F7F3EC] hover:bg-[#EAE2D8] text-[11px] text-[#9E5430] font-semibold transition-colors cursor-pointer min-h-[32px] flex items-center"
                          title="Log Stock Adjustment"
                          aria-label={`Adjust stock for ${item.name}`}
                        >
                          Adjust
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem({ ...item });
                            setEditModalOpen(true);
                          }}
                          className="p-2 min-w-[36px] min-h-[36px] rounded-lg hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer flex items-center justify-center"
                          title="Edit Item Details"
                          aria-label={`Edit ${item.name}`}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingItem(item);
                            setDeleteModalOpen(true);
                          }}
                          className="p-2 min-w-[36px] min-h-[36px] rounded-lg hover:bg-rose-50 text-[#76695F] hover:text-rose-600 transition-colors cursor-pointer flex items-center justify-center"
                          title="Archive / Remove Item"
                          aria-label={`Archive ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#76695F]">
                      <Boxes className="w-8 h-8 text-[#DED3C5] mx-auto mb-2" />
                      <p className="text-sm font-semibold text-[#372921]">No matching inventory items found</p>
                      <p className="text-xs text-[#76695F] mt-0.5">Try adjusting your filters or search keywords.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ADJUSTMENTS AUDIT TRAIL */
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Stock Variance &amp; Adjustment Audit Trail
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Immutable ERP reconciliation ledger recording count adjustments, artisan tension defect scrap, and PR loans.
              </p>
            </div>
            <span className="text-[11px] text-[#76695F] font-mono bg-[#F7F3EC] px-2.5 py-1 rounded-full border border-[#DED3C5]">
              Total Records: {stockAdjustments.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">SKU &amp; Product</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Reason Code</th>
                  <th className="py-3 px-4">Logged By</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Mandatory Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {stockAdjustments.map(adj => (
                  <tr key={adj.id} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-semibold block">{adj.productName}</strong>
                      <span className="text-[10.5px] text-[#76695F] font-mono">{adj.sku}</span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className="text-[#76695F]">{adj.previousQty} → </span>
                      <strong className="text-[#372921]">{adj.adjustedQty}</strong>
                      <span
                        className={`ml-1.5 font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          adj.difference > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : adj.difference < 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {adj.difference > 0 ? `+${adj.difference}` : adj.difference}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-[#F0E9DF] text-[#372921] px-2 py-0.5 rounded font-mono font-semibold uppercase">
                        {adj.reason.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#372921] font-medium">{adj.loggedBy}</td>
                    <td className="py-3 px-4 text-[#76695F] font-mono text-[10.5px]">
                      {new Date(adj.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#76695F] italic text-[11px] max-w-xs">
                      &ldquo;{adj.notes}&rdquo;
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: REDESIGNED LUXURY STOCK ADJUSTMENT MODAL
          ========================================================================= */}
      {adjustModalOpen && activeAdjustItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <div>
                <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  <Boxes className="w-3.5 h-3.5" />
                  Atelier &amp; Warehouse Ledger
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Log Operational Stock Adjustment
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form id="stockAdjustForm" onSubmit={handleAdjustSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* 1. Target SKU Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1.5">
                  Target Inventory SKU / Material
                </label>
                <div className="relative">
                  <select
                    value={selectedSku}
                    onChange={e => {
                      setSelectedSku(e.target.value);
                      const target = inventory.find(i => i.sku === e.target.value);
                      if (target) setNewQty(target.onHand);
                    }}
                    className="w-full max-w-full truncate text-ellipsis bg-white border border-[#DED3C5] rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-[#372921] font-medium focus:outline-none focus:border-[#9E5430] focus:ring-1 focus:ring-[#9E5430] transition-colors appearance-none cursor-pointer"
                  >
                    {inventory.map(item => (
                      <option key={item.sku} value={item.sku} className="truncate">
                        [{item.sku}] {item.name.length > 30 ? item.name.slice(0, 30) + '…' : item.name} · {item.onHand} {item.unit}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#76695F]">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Selected Item Summary Card */}
                <div className="mt-2.5 p-3.5 rounded-xl bg-white border border-[#EAE2D8] shadow-2xs flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#9E5430]/10 text-[#9E5430]">
                        {activeAdjustItem.sku}
                      </span>
                      <span className="text-[10px] text-[#76695F] font-mono">{activeAdjustItem.category}</span>
                    </div>
                    <h4 className="font-serif font-bold text-[#372921] text-xs truncate mt-1">
                      {activeAdjustItem.name}
                    </h4>
                    <span className="text-[10.5px] text-[#76695F] flex items-center gap-1 mt-0.5">
                      <Warehouse className="w-3 h-3 text-[#9E5430]" />
                      <span>{activeAdjustItem.location}</span>
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9.5px] uppercase font-mono text-[#76695F] block">Current Available</span>
                    <span className="font-serif text-base font-bold text-[#372921]">
                      {activeAdjustItem.available} {activeAdjustItem.unit}
                    </span>
                    <span className="text-[10px] text-[#76695F] block font-mono">
                      (Total On-Hand: {activeAdjustItem.onHand})
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Side-by-Side Stock Delta Calculator */}
              <div className="p-4 bg-[#F7F3EC] rounded-xl border border-[#DED3C5] space-y-3">
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <span className="text-[10.5px] uppercase font-semibold text-[#76695F] block mb-1">
                      Current Ledger Count
                    </span>
                    <div className="bg-white border border-[#DED3C5] rounded-xl px-3.5 py-2 font-mono text-sm font-bold text-[#76695F]">
                      {activeAdjustItem.onHand} {activeAdjustItem.unit}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10.5px] uppercase font-semibold text-[#372921] mb-1">
                      New Verified Count <span className="text-[#9E5430]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newQty}
                      onChange={e => setNewQty(Number(e.target.value))}
                      className="w-full bg-white border border-[#9E5430] rounded-xl px-3.5 py-2 font-mono text-sm font-bold text-[#372921] focus:outline-none focus:ring-2 focus:ring-[#9E5430]/30"
                    />
                  </div>
                </div>

                {/* Net Variance Indicator */}
                <div className="flex items-center justify-between pt-2 border-t border-[#EAE2D8] text-xs">
                  <span className="text-[#76695F] font-medium">Reconciliation Variance:</span>
                  {(() => {
                    const diff = Number(newQty) - activeAdjustItem.onHand;
                    if (diff > 0) {
                      return (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[11px]">
                          <ArrowUpRight className="w-3.5 h-3.5" />
                          <span>+{diff} {activeAdjustItem.unit} (Addition to Ledger)</span>
                        </span>
                      );
                    }
                    if (diff < 0) {
                      return (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full text-[11px]">
                          <ArrowDownRight className="w-3.5 h-3.5" />
                          <span>{diff} {activeAdjustItem.unit} (Ledger Deduction)</span>
                        </span>
                      );
                    }
                    return (
                      <span className="inline-flex items-center gap-1 font-mono text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full text-[11px]">
                        <span>0 {activeAdjustItem.unit} (No Variance)</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* 3. Reason Code Interactive Tiles */}
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-2">
                  Adjustment Reason Code <span className="text-[#9E5430]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REASON_TILES.map(tile => {
                    const isSelected = adjReason === tile.id;
                    return (
                      <button
                        key={tile.id}
                        type="button"
                        onClick={() => setAdjReason(tile.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#9E5430]/10 border-[#9E5430] shadow-2xs'
                            : 'bg-white border-[#DED3C5] hover:border-[#9E5430]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-semibold ${
                              isSelected ? 'text-[#9E5430]' : 'text-[#372921]'
                            }`}
                          >
                            {tile.label}
                          </span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#9E5430]" />}
                        </div>
                        <p className="text-[10px] text-[#76695F] mt-1 line-clamp-1">{tile.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Mandatory Audit Justification */}
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1.5">
                  Mandatory Audit Justification <span className="text-[#9E5430]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={adjNotes}
                  onChange={e => setAdjNotes(e.target.value)}
                  placeholder="e.g. Cycle count conducted by Bihar Atelier Lead verified 2 units damaged during bead stringing..."
                  className="w-full bg-white border border-[#DED3C5] rounded-xl p-3 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] focus:ring-1 focus:ring-[#9E5430]"
                />
                <span className="text-[10px] text-[#A99583] mt-1 block">
                  This note will be logged immutably under your staff signature in the Audit Trail.
                </span>
              </div>
            </form>

            {/* Pinned Modal Footer */}
            <div className="px-6 py-3.5 border-t border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setAdjustModalOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] hover:text-[#372921] text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="stockAdjustForm"
                className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Commit Stock Adjustment</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: ADD NEW INVENTORY SKU / MATERIAL MODAL
          ========================================================================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  New Ledger Entity
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Register New SKU or Raw Material
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#EAE2D8] text-[#76695F] hover:text-[#372921]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    SKU Code <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KJ-BOX-002 or RM-BEAD-01"
                    value={newSkuData.sku}
                    onChange={e => setNewSkuData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Classification
                  </label>
                  <select
                    value={newSkuData.type}
                    onChange={e => setNewSkuData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="finished_good">Finished Heirloom Good</option>
                    <option value="raw_material">Raw Craft Material</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Item / Mineral Name <span className="text-[#9E5430]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Luminous Baroque Freshwater Pearls (8mm)"
                  value={newSkuData.name}
                  onChange={e => setNewSkuData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Hub Location
                  </label>
                  <select
                    value={newSkuData.location}
                    onChange={e => setNewSkuData(prev => ({ ...prev, location: e.target.value as 'Mumbai Atelier' | 'Bihar Craft House' }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    <option value="Mumbai Atelier">Mumbai Atelier</option>
                    <option value="Bihar Craft House">Bihar Craft House</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newSkuData.category}
                    onChange={e => setNewSkuData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Vanity Boxes, Raw Materials"
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Initial On-Hand
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newSkuData.onHand}
                    onChange={e => setNewSkuData(prev => ({ ...prev, onHand: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    placeholder="pcs, kg, meters, spools"
                    value={newSkuData.unit}
                    onChange={e => setNewSkuData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newSkuData.reorderPoint}
                    onChange={e => setNewSkuData(prev => ({ ...prev, reorderPoint: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Unit Cost (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={newSkuData.unitCost}
                    onChange={e => setNewSkuData(prev => ({ ...prev, unitCost: Number(e.target.value) }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Supplier / Source Guild
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. In-House Bihar Atelier"
                    value={newSkuData.supplier || ''}
                    onChange={e => setNewSkuData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#EAE2D8] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#DED3C5] text-[#76695F] hover:bg-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
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
          MODAL 3: EDIT SKU SPECIFICATIONS MODAL
          ========================================================================= */}
      {editModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-[#FCFAF6] rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-[#EAE2D8] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9E5430] font-bold">
                  SKU Specifications
                </span>
                <h3 className="font-serif text-lg font-bold text-[#372921] mt-0.5">
                  Edit {editingItem.sku}
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

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={editingItem.name}
                  onChange={e => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Hub Location</label>
                  <select
                    value={editingItem.location}
                    onChange={e => setEditingItem(prev => prev ? { ...prev, location: e.target.value as 'Mumbai Atelier' | 'Bihar Craft House' } : null)}
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
                    onChange={e => setEditingItem(prev => prev ? { ...prev, unitCost: Number(e.target.value) } : null)}
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
                    onChange={e => setEditingItem(prev => prev ? { ...prev, reorderPoint: Number(e.target.value) } : null)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">Reserved Count</label>
                  <input
                    type="number"
                    value={editingItem.reserved}
                    onChange={e => setEditingItem(prev => prev ? { ...prev, reserved: Number(e.target.value) } : null)}
                    className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs font-mono text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">Supplier / Guild</label>
                <input
                  type="text"
                  value={editingItem.supplier || ''}
                  onChange={e => setEditingItem(prev => prev ? { ...prev, supplier: e.target.value } : null)}
                  className="w-full bg-white border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
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
          MODAL 4: DELETE / ARCHIVE SKU CONFIRMATION MODAL
          ========================================================================= */}
      {deleteModalOpen && deletingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-rose-200 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#372921]">
                Archive Inventory SKU?
              </h3>
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

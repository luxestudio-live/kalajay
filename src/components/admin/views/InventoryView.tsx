'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { StockAdjustment } from '@/data/adminTypes';

export default function InventoryView() {
  const { inventory, stockAdjustments, adjustStock, can } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'master' | 'low_stock' | 'adjustments' | 'raw_materials'>('master');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State for Stock Adjustment
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedSku, setSelectedSku] = useState(inventory[0]?.sku || '');
  const [newQty, setNewQty] = useState<number>(inventory[0]?.onHand || 10);
  const [adjReason, setAdjReason] = useState<StockAdjustment['reason']>('count_variance');
  const [adjNotes, setAdjNotes] = useState('');

  const canAdjustStock = can('inventory.master', 'adjust_stock');

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
    }
    setAdjustModalOpen(true);
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    adjustStock(selectedSku, Number(newQty), adjReason, adjNotes);
    setAdjustModalOpen(false);
    setAdjNotes('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
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

        <button
          type="button"
          onClick={() => handleOpenAdjust()}
          disabled={!canAdjustStock}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Stock Adjustment</span>
        </button>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'master', label: `Master Ledger (${inventory.length})` },
          { id: 'low_stock', label: `Low Stock Alerts (${inventory.filter(i => i.status !== 'in_stock').length})` },
          { id: 'raw_materials', label: 'Raw Materials & Minerals' },
          { id: 'adjustments', label: `Adjustments Audit Trail (${stockAdjustments.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            {tab.label}
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
              placeholder="Search by SKU, product name, minerals..."
              className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#76695F] font-semibold">Location:</span>
            <select
              value={locationFilter}
              onChange={e => setLocationFilter(e.target.value)}
              className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none"
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
              className="bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-2.5 py-1.5 text-xs text-[#372921] focus:outline-none"
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
                  <th className="py-3 px-4 text-right">Quick Action</th>
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
                      <button
                        type="button"
                        onClick={() => handleOpenAdjust(item.sku)}
                        disabled={!canAdjustStock}
                        className="text-[11px] text-[#9E5430] hover:underline font-semibold disabled:opacity-30 cursor-pointer"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ADJUSTMENTS AUDIT TRAIL */
        <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
            <h3 className="font-serif text-base font-semibold text-[#372921]">
              Stock Variance &amp; Adjustment Audit Trail
            </h3>
            <span className="text-[11px] text-[#76695F] font-mono">
              Immutable ERP Reconciliation Ledger
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
                        className={`ml-1 font-bold ${
                          adj.difference > 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        ({adj.difference > 0 ? `+${adj.difference}` : adj.difference})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] bg-[#F0E9DF] text-[#372921] px-2 py-0.5 rounded font-mono font-semibold uppercase">
                        {adj.reason.replace('_', ' ')}
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

      {/* 5. STOCK ADJUSTMENT MODAL */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setAdjustModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DED3C5] p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
                Log Operational Stock Adjustment
              </h3>

              <form onSubmit={handleAdjustSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Target SKU / Item</label>
                  <select
                    value={selectedSku}
                    onChange={e => {
                      setSelectedSku(e.target.value);
                      const target = inventory.find(i => i.sku === e.target.value);
                      if (target) setNewQty(target.onHand);
                    }}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs text-[#372921]"
                  >
                    {inventory.map(item => (
                      <option key={item.sku} value={item.sku}>
                        {item.name} ({item.sku}) · Current On-Hand: {item.onHand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">New Physical Count (On-Hand)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newQty}
                    onChange={e => setNewQty(Number(e.target.value))}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Adjustment Reason Code <span className="text-[#9E5430]">*</span></label>
                  <select
                    value={adjReason}
                    onChange={e => setAdjReason(e.target.value as any)}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs text-[#372921]"
                  >
                    <option value="count_variance">Physical Count Variance</option>
                    <option value="craft_defect">Artisan Handcraft / Tension Defect</option>
                    <option value="photo_sample">Photography / PR Studio Sample</option>
                    <option value="damage_transit">Damaged in Transit</option>
                    <option value="shrinkage">Inventory Shrinkage</option>
                    <option value="artisan_return">Artisan Finished Return</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Mandatory Audit Justification</label>
                  <textarea
                    rows={2}
                    required
                    value={adjNotes}
                    onChange={e => setAdjNotes(e.target.value)}
                    placeholder="Provide specific operational reason for this ledger change..."
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs text-[#372921]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="px-4 py-1.5 rounded-full border border-[#DED3C5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#9E5430] text-white font-semibold"
                  >
                    Commit Adjustment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


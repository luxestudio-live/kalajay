'use client';

import React, { useState } from 'react';
import {
  Hammer,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Users,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { WorkOrder } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

export default function ProductionView() {
  const { workOrders, updateWorkOrderStage, createWorkOrder, can } = useAdminStore();

  const [activeStage, setActiveStage] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [newOrderModal, setNewOrderModal] = useState(false);
  const [qcModalOrder, setQcModalOrder] = useState<WorkOrder | null>(null);

  // New Work Order Form State
  const [prodSku, setProdSku] = useState(PRODUCTS[0]?.code || '');
  const [prodQty, setProdQty] = useState(10);
  const [artisanName, setArtisanName] = useState('Renu Devi');
  const [artisanLocation, setArtisanLocation] = useState('Bihar Hub · Loom A2');
  const [priority, setPriority] = useState<WorkOrder['priority']>('normal');
  const [targetDate, setTargetDate] = useState('2026-11-20');

  // QC Checklist State
  const [qcTension, setQcTension] = useState(true);
  const [qcKnots, setQcKnots] = useState(true);
  const [qcAlignment, setQcAlignment] = useState(true);
  const [qcLining, setQcLining] = useState(true);

  const canApproveQc = can('production.qc', 'approve');

  const filteredOrders = workOrders.filter(w => {
    const matchesSearch =
      w.productName.toLowerCase().includes(search.toLowerCase()) ||
      w.artisanName.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase());
    const matchesStage = activeStage === 'all' || w.stage === activeStage;
    return matchesSearch && matchesStage;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = PRODUCTS.find(p => p.code === prodSku) || PRODUCTS[0];
    createWorkOrder({
      productName: prod.name,
      sku: prod.code,
      quantity: prodQty,
      artisanName,
      artisanLocation,
      loomId: `LM-BH-0${Math.floor(1 + Math.random() * 8)}`,
      stage: 'loom_threading',
      targetDate,
      priority,
      qcPassed: false,
      materialAllocated: true,
      notes: 'Issued from Unified Admin Console.',
    });
    setNewOrderModal(false);
  };

  const handleQcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qcModalOrder) return;
    const allChecked = qcTension && qcKnots && qcAlignment && qcLining;
    updateWorkOrderStage(qcModalOrder.id, 'wax_sealed', allChecked);
    setQcModalOrder(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Hammer className="w-3.5 h-3.5" />
            <span>Atelier &amp; Loom Operations</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Production &amp; Handcraft Work Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Oversee hand-loom runs, artisan assignments in Bihar, tension calibration, and final QC inspection.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setNewOrderModal(true)}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Issue New Work Order</span>
        </button>
      </div>

      {/* 2. SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
              Active Handcraft Looms
            </span>
            <span className="font-serif text-2xl font-bold text-[#372921] mt-1 block">
              {workOrders.length} Looms Running
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0E9DF] flex items-center justify-center text-[#9E5430]">
            <Hammer className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
              21 Bihar Women Artisans
            </span>
            <span className="font-serif text-2xl font-bold text-emerald-800 mt-1 block">
              100% Living Wage Hub
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#DED3C5] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10.5px] uppercase tracking-wider text-[#76695F] font-bold block">
              QC Inspection Queue
            </span>
            <span className="font-serif text-2xl font-bold text-[#9E5430] mt-1 block">
              {workOrders.filter(w => w.stage === 'quality_inspection').length} Pending QC
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#9E5430]/10 flex items-center justify-center text-[#9E5430]">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. STAGE TABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Work Orders (${workOrders.length})` },
          { id: 'loom_threading', label: '1. Loom Threading' },
          { id: 'bead_weaving', label: '2. Bead Weaving' },
          { id: 'mirror_fitting', label: '3. Frame & Mirror Fitting' },
          { id: 'quality_inspection', label: '4. Quality Inspection (QC)' },
          { id: 'wax_sealed', label: '5. Wax-Sealed (Complete)' },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveStage(tab.id)}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeStage === tab.id
                ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
                : 'text-[#76695F] hover:text-[#372921] hover:bg-[#F0E9DF]/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4. WORK ORDERS LIST */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Work Order &amp; Product</th>
                <th className="py-3 px-4">Master Artisan &amp; Loom</th>
                <th className="py-3 px-4 text-center">Batch Qty</th>
                <th className="py-3 px-4">Current Craft Stage</th>
                <th className="py-3 px-4">Target Finish</th>
                <th className="py-3 px-4">QC Status</th>
                <th className="py-3 px-4 text-right">Stage Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {filteredOrders.map(wo => (
                <tr key={wo.id} className="hover:bg-[#FFFCF7] transition-colors">
                  <td className="py-3 px-4">
                    <strong className="text-[#372921] font-semibold block">{wo.productName}</strong>
                    <span className="text-[10.5px] text-[#76695F] font-mono">
                      {wo.id} · {wo.sku}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-[#372921] block">{wo.artisanName}</span>
                    <span className="text-[11px] text-[#76695F]">{wo.artisanLocation}</span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-bold text-[#372921]">
                    {wo.quantity} pcs
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-[10px] bg-[#F0E9DF] text-[#9E5430] font-mono font-bold px-2 py-0.5 rounded uppercase">
                      {wo.stage.replace('_', ' ')}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                    {wo.targetDate}
                  </td>

                  <td className="py-3 px-4">
                    {wo.qcPassed ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>QC Certified</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>Pending QC</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {wo.stage === 'quality_inspection' ? (
                        <button
                          type="button"
                          onClick={() => setQcModalOrder(wo)}
                          disabled={!canApproveQc}
                          className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-[11px] transition-colors cursor-pointer"
                        >
                          Run QC Inspection
                        </button>
                      ) : wo.stage !== 'wax_sealed' ? (
                        <select
                          value={wo.stage}
                          onChange={e => updateWorkOrderStage(wo.id, e.target.value as any)}
                          className="bg-[#F7F3EC] border border-[#DED3C5] rounded px-2 py-1 text-[11px] font-semibold text-[#372921] focus:outline-none"
                        >
                          <option value="loom_threading">Loom Threading</option>
                          <option value="bead_weaving">Bead Weaving</option>
                          <option value="mirror_fitting">Mirror Fitting</option>
                          <option value="quality_inspection">Submit for QC</option>
                          <option value="wax_sealed">Wax Sealed</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">Finished</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ISSUE WORK ORDER MODAL */}
      {newOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setNewOrderModal(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DED3C5] p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
                Issue Handcraft Work Order (Bihar Atelier)
              </h3>

              <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-[#372921]">Heirloom Creation</label>
                  <select
                    value={prodSku}
                    onChange={e => setProdSku(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs text-[#372921]"
                  >
                    {PRODUCTS.map(p => (
                      <option key={p.code} value={p.code}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">Batch Quantity</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={prodQty}
                      onChange={e => setProdQty(Number(e.target.value))}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">Target Completion</label>
                    <input
                      type="date"
                      required
                      value={targetDate}
                      onChange={e => setTargetDate(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">Assigned Master Maker</label>
                    <select
                      value={artisanName}
                      onChange={e => setArtisanName(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    >
                      <option value="Renu Devi">Renu Devi (Master Weaving)</option>
                      <option value="Sunita Kumari">Sunita Kumari (Loom Lead)</option>
                      <option value="Rekha Kumari">Rekha Kumari (Frame & Mirror)</option>
                      <option value="Anita Devi">Anita Devi (AirPod Cases)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1 text-[#372921]">Loom Hub Allocation</label>
                    <input
                      type="text"
                      value={artisanLocation}
                      onChange={e => setArtisanLocation(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setNewOrderModal(false)}
                    className="px-4 py-1.5 rounded-full border border-[#DED3C5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-[#9E5430] text-white font-semibold"
                  >
                    Issue to Loom
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. QC INSPECTION MODAL */}
      {qcModalOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setQcModalOrder(null)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DED3C5] p-5 space-y-4">
              <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
                Master Quality Control Sign-Off
              </h3>
              <p className="text-xs text-[#76695F]">
                Inspecting batch: <strong>{qcModalOrder.productName}</strong> ({qcModalOrder.quantity} pcs) crafted by {qcModalOrder.artisanName}.
              </p>

              <form onSubmit={handleQcSubmit} className="space-y-3 text-xs">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcTension}
                    onChange={e => setQcTension(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4"
                  />
                  <span>1. Bead Tension: No warping or loose slack along the 90° corners</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcKnots}
                    onChange={e => setQcKnots(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4"
                  />
                  <span>2. Concealed Wire Knots: All steel termination loops tucked internally</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcAlignment}
                    onChange={e => setQcAlignment(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4"
                  />
                  <span>3. Optical Facet Luster: Glass and pearl beads wiped free of dust</span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={qcLining}
                    onChange={e => setQcLining(e.target.checked)}
                    className="accent-[#9E5430] w-4 h-4"
                  />
                  <span>4. Velvet Lining &amp; Hinges: Clean closure tension and smooth alignment</span>
                </label>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setQcModalOrder(null)}
                    className="px-4 py-1.5 rounded-full border border-[#DED3C5]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full bg-emerald-700 text-white font-semibold"
                  >
                    Certify QC &amp; Advance to Wax-Sealing
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


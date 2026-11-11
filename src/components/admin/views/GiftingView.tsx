'use client';

import React, { useState } from 'react';
import {
  Gift,
  Plus,
  Search,
  Download,
  Calendar,
  Building2,
  Mail,
  Phone,
  Clock,
  Sparkles,
  CheckCircle2,
  Truck,
  Calculator,
  ChevronRight,
  X,
  FileCheck,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { CorporateEnquiry } from '@/data/adminTypes';

export default function GiftingView() {
  const { corporateEnquiries, updateCorporateStatus, logAction } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<CorporateEnquiry | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Volume calculator states
  const [calcQty, setCalcQty] = useState<number>(100);
  const [calcBasePrice, setCalcBasePrice] = useState<number>(2499);
  const [calcPackagingTier, setCalcPackagingTier] = useState<'standard' | 'luxury_trunk' | 'velvet_pouch'>('luxury_trunk');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredEnquiries = corporateEnquiries.filter(e => {
    const matchesSearch =
      e.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate volume discount
  const getDiscountPercent = (qty: number) => {
    if (qty >= 500) return 25;
    if (qty >= 200) return 20;
    if (qty >= 100) return 15;
    if (qty >= 50) return 10;
    return 0;
  };

  const discountPercent = getDiscountPercent(calcQty);
  const packagingCost =
    calcPackagingTier === 'luxury_trunk' ? 350 : calcPackagingTier === 'velvet_pouch' ? 120 : 180;
  const unitDiscountedBase = Math.round(calcBasePrice * (1 - discountPercent / 100));
  const effectiveUnitPrice = unitDiscountedBase + packagingCost;
  const subtotal = effectiveUnitPrice * calcQty;
  const gstAmount = Math.round(subtotal * 0.03); // 3% handicraft GST
  const estimatedGrandTotal = subtotal + gstAmount;

  const handleUpdateStatus = (id: string, status: CorporateEnquiry['status']) => {
    updateCorporateStatus(id, status);
    logAction('UPDATE_CORPORATE_GIFTING_STATUS', 'gifting', `Updated lead ${id} status to ${status}`);
    showToast(`Lead status updated to ${status.replace('_', ' ').toUpperCase()}`);
    if (selectedLead?.id === id) {
      setSelectedLead(prev => (prev ? { ...prev, status } : null));
    }
  };

  const getStatusBadge = (status: CorporateEnquiry['status']) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-semibold">New Enquiry</span>;
      case 'quote_prepared':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-semibold">Quote Prepared</span>;
      case 'sample_dispatched':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10.5px] font-semibold">Sample Dispatched</span>;
      case 'confirmed':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">Confirmed / In Production</span>;
      case 'closed':
        return <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10.5px] font-semibold">Completed</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Gift className="w-3.5 h-3.5" />
            <span>Corporate &amp; Wedding Hamper Logistics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Gifting &amp; Bulk Enquiries
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage luxury wedding favours, corporate milestone gift suites, bespoke wax-sealed packaging, and tiered volume price models.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsCalculatorOpen(true)}
            className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-[#9E5430]" />
            <span>Volume Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logAction('EXPORT_GIFTING_LEADS', 'gifting', 'Exported corporate gifting leads');
              showToast('Exported corporate and wedding gifting leads');
            }}
            className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#76695F]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Active Bulk Inquiries</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">{corporateEnquiries.length}</div>
          <span className="text-[10px] text-[#76695F]">Hospitality &amp; Weddings</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Pipeline Volume</span>
          <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">370 Units</div>
          <span className="text-[10px] text-emerald-600 font-medium">Loom capacity allocated</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Pipeline Value</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">₹7.50 L</div>
          <span className="text-[10px] text-[#76695F]">Target Q4 / Q1 2027</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Sample Dispatch Rate</span>
          <div className="font-serif text-2xl text-emerald-600 font-bold mt-1">100%</div>
          <span className="text-[10px] text-[#76695F]">Within 72 hrs of inquiry</span>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#76695F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by company, client, event, or ID..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] placeholder-[#76695F]/70 focus:outline-none focus:border-[#9E5430]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#76695F]">Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer"
          >
            <option value="all">All Stages ({corporateEnquiries.length})</option>
            <option value="new">New Enquiry</option>
            <option value="quote_prepared">Quote Prepared</option>
            <option value="sample_dispatched">Sample Dispatched</option>
            <option value="confirmed">Confirmed</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* 4. ENQUIRIES TABLE */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client / Organisation</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4 text-right">Target Budget</th>
                <th className="py-3 px-4">Target Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {filteredEnquiries.map(item => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedLead(item)}
                  className="hover:bg-[#FFFCF7] transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#9E5430]/10 text-[#9E5430] flex items-center justify-center font-bold">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <strong className="text-[#372921] font-semibold block group-hover:text-[#9E5430] transition-colors">
                          {item.companyName}
                        </strong>
                        <span className="text-[11px] text-[#76695F] block">{item.contactPerson}</span>
                        <span className="text-[10px] text-[#76695F] font-mono">{item.email} • {item.phone}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-[#372921] font-medium">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3EC] text-[#372921] text-[11px] border border-[#DED3C5]">
                      {item.eventType}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-serif font-bold text-[#372921] text-sm">
                    {item.quantity} pcs
                  </td>

                  <td className="py-3 px-4 text-right font-serif text-[#372921]">
                    <span className="font-bold">₹{(item.quantity * item.budgetPerPiece).toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-[#76695F] block">@ ₹{item.budgetPerPiece}/pc</span>
                  </td>

                  <td className="py-3 px-4 text-[#76695F]">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#9E5430]" />
                      <span>{item.targetDate}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {getStatusBadge(item.status)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(item);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#9E5430] transition-colors inline-flex items-center gap-1 text-xs"
                    >
                      <span>Manage</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. VOLUME CALCULATOR MODAL */}
      {isCalculatorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#9E5430]" />
                  <span>Tiered Volume Discount Formulator</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Calculate unit margins, artisan packaging tier additions, and bulk tax reconciliation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                    Order Quantity (Pieces)
                  </label>
                  <input
                    type="number"
                    value={calcQty}
                    onChange={e => setCalcQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs font-mono font-bold text-[#372921]"
                  />
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Volume Tier: {discountPercent}% Discount Applied
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                    Standard Retail Price (₹)
                  </label>
                  <input
                    type="number"
                    value={calcBasePrice}
                    onChange={e => setCalcBasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs font-mono font-bold text-[#372921]"
                  />
                  <span className="text-[10px] text-[#76695F] mt-1 block">
                    e.g. Signature Vanity Box ₹2,499
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Packaging &amp; Presentation Tier
                </label>
                <select
                  value={calcPackagingTier}
                  onChange={e => setCalcPackagingTier(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
                >
                  <option value="luxury_trunk">Rigid Wax-Sealed Silk Trunk (+ ₹350/pc)</option>
                  <option value="standard">Handcrafted Ivory Box with Gold Foil (+ ₹180/pc)</option>
                  <option value="velvet_pouch">Embroidered Velvet Drawstring Pouch (+ ₹120/pc)</option>
                </select>
              </div>

              {/* Formulator Output Summary */}
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#DED3C5] space-y-2">
                <div className="flex justify-between text-[#76695F]">
                  <span>Discounted Piece Rate:</span>
                  <span className="font-mono text-[#372921]">₹{unitDiscountedBase}</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Packaging Addition:</span>
                  <span className="font-mono text-[#372921]">+ ₹{packagingCost}</span>
                </div>
                <div className="flex justify-between font-semibold text-[#372921] border-t border-[#EAE2D8] pt-2">
                  <span>Effective Unit Price:</span>
                  <span className="font-serif font-bold text-[#9E5430] text-sm">₹{effectiveUnitPrice} / piece</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Subtotal ({calcQty} pieces):</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Handicraft GST (3%):</span>
                  <span className="font-mono">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[#DED3C5] pt-2 flex justify-between font-bold text-[#372921] text-base">
                  <span>Estimated Total Quote:</span>
                  <span className="font-serif text-[#9E5430]">₹{estimatedGrandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Copied formal estimate: ₹${effectiveUnitPrice}/pc, Grand Total ₹${estimatedGrandTotal.toLocaleString('en-IN')}`);
                  setIsCalculatorOpen(false);
                }}
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Copy Quotation Figures
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. LEAD MANAGE DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold">
                  {selectedLead.companyName}
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Lead Ref #{selectedLead.id} • {selectedLead.eventType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <div>
                  <span className="text-[10.5px] text-[#76695F] block">Contact Coordinator</span>
                  <strong className="text-[#372921] font-semibold text-xs block">{selectedLead.contactPerson}</strong>
                  <span className="text-[11px] text-[#76695F]">{selectedLead.email}</span>
                </div>
                <div>
                  <span className="text-[10.5px] text-[#76695F] block">Order Volume &amp; Budget</span>
                  <strong className="text-[#372921] font-semibold text-xs block">{selectedLead.quantity} Pieces</strong>
                  <span className="text-[11px] text-[#9E5430] font-semibold">Target Budget: ₹{selectedLead.budgetPerPiece}/pc</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1.5 uppercase tracking-wider">
                  Transition Lead Pipeline Stage
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, 'quote_prepared')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      selectedLead.status === 'quote_prepared'
                        ? 'border-[#9E5430] bg-[#9E5430]/10 text-[#9E5430] font-semibold'
                        : 'border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921]'
                    }`}
                  >
                    1. Quote Prepared
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, 'sample_dispatched')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      selectedLead.status === 'sample_dispatched'
                        ? 'border-[#9E5430] bg-[#9E5430]/10 text-[#9E5430] font-semibold'
                        : 'border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921]'
                    }`}
                  >
                    2. Sample Dispatched (AWB)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, 'confirmed')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      selectedLead.status === 'confirmed'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-semibold'
                        : 'border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921]'
                    }`}
                  >
                    3. Confirmed / Loom Scheduled
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedLead.id, 'closed')}
                    className={`p-2.5 rounded-lg border text-xs text-left cursor-pointer transition-colors ${
                      selectedLead.status === 'closed'
                        ? 'border-stone-500 bg-stone-100 text-stone-800 font-semibold'
                        : 'border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921]'
                    }`}
                  >
                    4. Order Completed
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 rounded-full bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


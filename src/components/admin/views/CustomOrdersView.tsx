'use client';

import React, { useState } from 'react';
import {
  Palette,
  Search,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Calculator,
  Send,
  Hammer,
  Eye,
  FileText,
  X,
  Camera,
  Check,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { CustomOrderRequest } from '@/data/adminTypes';

export default function CustomOrdersView() {
  const { customRequests, updateCustomRequestStatus, createWorkOrder, logAction } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<CustomOrderRequest | null>(null);
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quoteInput, setQuoteInput] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredRequests = customRequests.filter(req => {
    const matchesSearch =
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.silhouette.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenQuotation = (req: CustomOrderRequest) => {
    setSelectedRequest(req);
    setQuoteInput(req.finalQuotedPrice || req.estimatedPrice || 3500);
    setIsQuoting(true);
  };

  const handleSaveQuotation = () => {
    if (!selectedRequest) return;
    updateCustomRequestStatus(selectedRequest.id, 'quote_sent', quoteInput);
    logAction('CUSTOM_QUOTE_DISPATCHED', 'custom-orders', `Formulated bespoke quote ₹${quoteInput} for ${selectedRequest.customerName} (${selectedRequest.id})`);
    showToast(`Bespoke quotation ₹${quoteInput.toLocaleString('en-IN')} formulated & dispatched to ${selectedRequest.email}`);
    setIsQuoting(false);
    setSelectedRequest(null);
  };

  const handleMarkProofApproved = (req: CustomOrderRequest) => {
    updateCustomRequestStatus(req.id, 'proof_approved', req.finalQuotedPrice);
    logAction('CUSTOM_PROOF_APPROVED', 'custom-orders', `Marked bespoke proof approved for ${req.id}`);
    showToast(`Proof approval verified for ${req.customerName}. Ready for Bihar loom allocation.`);
  };

  const handleScheduleLoomRun = (req: CustomOrderRequest) => {
    createWorkOrder({
      productName: `Bespoke ${req.silhouette} (${req.monogram ? 'Monogram ' + req.monogram : 'Custom'})`,
      sku: `BESPOKE-${req.id.replace('CUST-', '')}`,
      quantity: 1,
      artisanName: 'Renu Devi',
      artisanLocation: 'Bihar Hub · Loom Master',
      loomId: 'LM-BH-00',
      stage: 'bead_weaving',
      targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'bridal_express',
      qcPassed: false,
      materialAllocated: true,
      notes: `Bespoke commission for ${req.customerName}. Occasion: ${req.occasion}. Palette: ${req.palette}. Monogram: ${req.monogram}. Specifics: ${req.notes}`,
    });

    updateCustomRequestStatus(req.id, 'in_loom', req.finalQuotedPrice);
    logAction('BESPOKE_LOOM_SCHEDULED', 'custom-orders', `Scheduled bespoke loom run for ${req.id} with Master Artisan Renu Devi`);
    showToast(`Loom scheduled: Allocated Master Loom in Bihar for bespoke order #${req.id}`);
  };

  const getStatusBadge = (status: CustomOrderRequest['status']) => {
    switch (status) {
      case 'inquiry_received':
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10.5px] font-semibold">New Inquiry</span>;
      case 'quote_sent':
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10.5px] font-semibold">Quote Sent</span>;
      case 'proof_approved':
        return <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10.5px] font-semibold">Proof Approved</span>;
      case 'in_loom':
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">On Loom (Bihar)</span>;
      case 'dispatched':
        return <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10.5px] font-semibold">Dispatched</span>;
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
            <Palette className="w-3.5 h-3.5" />
            <span>Bespoke Studio &amp; Custom Commissions</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Custom Orders &amp; Studio Requests
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Review custom requests submitted via `/customise`, calculate bespoke quotes, verify photo proofs, and allocate Bihar looms.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            const name = prompt('Enter patron name for bespoke consultation:');
            if (name) {
              showToast(`Logged new bespoke consultation for ${name}`);
            }
          }}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Bespoke Consultation</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Active Requests</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">{customRequests.length}</div>
          <span className="text-[10px] text-[#76695F]">Submitted via /customise</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Pending Quotation</span>
          <div className="font-serif text-2xl text-amber-600 font-bold mt-1">
            {customRequests.filter(r => r.status === 'inquiry_received').length}
          </div>
          <span className="text-[10px] text-amber-700">Requires price formula</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Proof Approved</span>
          <div className="font-serif text-2xl text-purple-600 font-bold mt-1">
            {customRequests.filter(r => r.status === 'proof_approved').length}
          </div>
          <span className="text-[10px] text-purple-700">Ready for loom run</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Avg Bespoke Realization</span>
          <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">₹3,850</div>
          <span className="text-[10px] text-[#76695F]">High margin bridal commissions</span>
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
            placeholder="Search by patron, silhouette, or request ID..."
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
            <option value="all">All Stages ({customRequests.length})</option>
            <option value="inquiry_received">New Inquiry</option>
            <option value="quote_sent">Quote Sent</option>
            <option value="proof_approved">Proof Approved</option>
            <option value="in_loom">In Loom</option>
            <option value="dispatched">Dispatched</option>
          </select>
        </div>
      </div>

      {/* 4. REQUESTS CARDS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map(req => (
          <div
            key={req.id}
            className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs hover:border-[#9E5430]/60 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top Row */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#EAE2D8]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#9E5430]">{req.id}</span>
                    {getStatusBadge(req.status)}
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-[#372921] mt-1">
                    {req.customerName}
                  </h3>
                  <span className="text-xs text-[#76695F] block">{req.email} • {req.phone}</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#76695F] block uppercase tracking-wider">Quote</span>
                  <span className="font-serif text-lg font-bold text-[#372921] block">
                    ₹{(req.finalQuotedPrice || req.estimatedPrice).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Specifics Grid */}
              <div className="grid grid-cols-2 gap-2.5 py-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8]">
                  <span className="text-[10px] text-[#76695F] block uppercase tracking-wider font-semibold">Silhouette</span>
                  <span className="font-medium text-[#372921]">{req.silhouette}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8]">
                  <span className="text-[10px] text-[#76695F] block uppercase tracking-wider font-semibold">Palette</span>
                  <span className="font-medium text-[#372921]">{req.palette}</span>
                </div>
                {req.monogram && (
                  <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8]">
                    <span className="text-[10px] text-[#76695F] block uppercase tracking-wider font-semibold">Monogram Tag</span>
                    <span className="font-mono font-bold text-[#9E5430]">{req.monogram}</span>
                  </div>
                )}
                <div className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE2D8]">
                  <span className="text-[10px] text-[#76695F] block uppercase tracking-wider font-semibold">Occasion</span>
                  <span className="font-medium text-[#372921]">{req.occasion}</span>
                </div>
              </div>

              {/* Accents Tags */}
              {req.accents && req.accents.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pb-3">
                  {req.accents.map((acc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-[#F7F3EC] text-[#76695F] text-[10.5px]">
                      + {acc}
                    </span>
                  ))}
                </div>
              )}

              {/* Notes */}
              <div className="p-3 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] text-xs text-[#372921] italic mb-4">
                "{req.notes}"
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-[#EAE2D8] flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10.5px] text-[#76695F]">
                Submitted: {req.submittedAt.split('T')[0]}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenQuotation(req)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5 text-[#9E5430]" />
                  <span>Formulate Quote</span>
                </button>

                {req.status === 'quote_sent' && (
                  <button
                    type="button"
                    onClick={() => handleMarkProofApproved(req)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve Proof</span>
                  </button>
                )}

                {req.status === 'proof_approved' && (
                  <button
                    type="button"
                    onClick={() => handleScheduleLoomRun(req)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Hammer className="w-3.5 h-3.5" />
                    <span>Schedule Bihar Loom</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. QUOTATION FORMULATOR MODAL */}
      {isQuoting && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#9E5430]" />
                  <span>Bespoke Price Formulator</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Request #{selectedRequest.id} for {selectedRequest.customerName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoting(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
                <div className="flex justify-between text-[#76695F]">
                  <span>Base Silhouette ({selectedRequest.silhouette})</span>
                  <span>₹2,499</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Estimated Master Artisan Hours (12 hrs @ ₹75/hr)</span>
                  <span>₹900</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Special Beads &amp; Brass Monogram Casting</span>
                  <span>₹450</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Rigid Velvet Box &amp; Calligraphy Packaging</span>
                  <span>₹250</span>
                </div>
                <div className="flex justify-between text-[#76695F]">
                  <span>Handicraft GST (3% on HSN 5609)</span>
                  <span>₹123</span>
                </div>
                <div className="border-t border-[#DED3C5] pt-2 flex justify-between font-bold text-[#372921] text-sm">
                  <span>Suggested Retail Benchmark</span>
                  <span className="font-serif">₹4,222</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1.5">
                  Final Official Quote to Patron (₹ INR)
                </label>
                <input
                  type="number"
                  value={quoteInput}
                  onChange={e => setQuoteInput(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-sm font-serif font-bold text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
                <span className="text-[11px] text-[#76695F] mt-1 block">
                  This quotation will be recorded and communicated to {selectedRequest.email} via WhatsApp Concierge and email.
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsQuoting(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuotation}
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm &amp; Dispatch Quote</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


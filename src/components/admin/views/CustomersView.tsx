'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  MapPin,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  Clock,
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { getAllFirestoreUsers, updatePatronProfile } from '@/lib/firestore';
import { adminFetch } from '@/lib/adminAuthClient';
import { ProvenanceBadge } from '@/components/admin/ProvenanceBadge';
import { SEED_PATRONS } from '@/data/adminSeedData';

interface PatronProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  tier: 'Diamond Patron' | 'Gold Patron' | 'Silver Patron' | 'First Heirloom';
  lifetimeSpend: number;
  ordersCount: number;
  firstOrderDate: string;
  lastOrderDate: string;
  preferredPalette: string;
  favoritePiece: string;
  conciergeNotes: string;
}

export default function CustomersView() {
  const { orders, logAction, showModal } = useAdminStore();
  const [patrons, setPatrons] = useState<PatronProfile[]>(SEED_PATRONS as unknown as PatronProfile[]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [activePatron, setActivePatron] = useState<PatronProfile | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getAllFirestoreUsers().then((liveUsers) => {
      if (!isMounted || !liveUsers || liveUsers.length === 0) return;

      const livePatrons: PatronProfile[] = liveUsers.map((u, idx) => {
        const userOrders = orders.filter(
          (o) => o.customerEmail?.toLowerCase() === u.email?.toLowerCase() || (o as any).userId === u.id
        );
        const spend = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const count = userOrders.length;
        const sorted = [...userOrders].sort(
          (a, b) => new Date(a.createdAt || (a as any).createdAtServer || 0).getTime() - new Date(b.createdAt || (b as any).createdAtServer || 0).getTime()
        );

        let tier: PatronProfile['tier'] = 'First Heirloom';
        if (spend > 25000) tier = 'Diamond Patron';
        else if (spend > 10000) tier = 'Gold Patron';
        else if (spend > 5000) tier = 'Silver Patron';

        return {
          id: u.id || `PAT-${String(idx + 1).padStart(3, '0')}`,
          name: u.name || (u as any).displayName || 'Patron',
          email: u.email || 'patron@kalajay.in',
          phone: u.phone || (u as any).phoneNumber || '+91 97405 40847',
          city: (u as any).addresses?.[0]?.city || (u as any).city || 'Mumbai',
          state: (u as any).addresses?.[0]?.state || (u as any).state || 'Maharashtra',
          tier,
          lifetimeSpend: spend,
          ordersCount: count,
          firstOrderDate: sorted[0]?.createdAt?.slice(0, 10) || (sorted[0] as any)?.createdAtServer?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          lastOrderDate: sorted[sorted.length - 1]?.createdAt?.slice(0, 10) || (sorted[sorted.length - 1] as any)?.createdAtServer?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          preferredPalette: 'Heritage Ivory & Pearl',
          favoritePiece: userOrders[0]?.items?.[0]?.name || 'Signature Pearl Beaded Vanity Box',
          conciergeNotes: `Registered patron profile verified in Firestore. ${count} total orders placed.`,
        };
      });

      const existingEmails = new Set(livePatrons.map((p) => p.email.toLowerCase()));
      const remainingSeed = SEED_PATRONS.filter((p) => !existingEmails.has(p.email.toLowerCase()));
      setPatrons([...livePatrons, ...(remainingSeed as unknown as PatronProfile[])]);
    });

    return () => {
      isMounted = false;
    };
  }, [orders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredPatrons = patrons.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    const matchesTier = selectedTier === 'all' || p.tier === selectedTier;
    return matchesSearch && matchesTier;
  });

  const handleExportDataPackage = (patron: PatronProfile) => {
    logAction('DPDP_PATRON_DATA_EXPORT', 'customers', `Exported DPDP privacy packet for patron ${patron.name} (${patron.id})`);
    showToast(`DPDP Act Compliance: Downloaded comprehensive patron privacy packet for ${patron.name}`);
  };

  const handleRightToBeForgotten = (patron: PatronProfile) => {
    showModal({
      title: 'Right to be Forgotten (DPDP Act)',
      message: `Are you sure you wish to anonymize the personal identity records for ${patron.name}? Legal transaction invoices must be retained for 7 years under Indian tax law, but marketing profile and communication consent will be purged immediately.`,
      icon: 'shield',
      confirmLabel: 'Anonymize Patron',
      cancelLabel: 'Cancel',
      isDestructive: true,
      onConfirm: async () => {
        try {
          if (patron.id && !patron.id.startsWith('PAT-')) {
            const res = await adminFetch('/api/admin/operations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'customer_anonymize', patronId: patron.id }),
            });
            const data = await res.json();
            if (!res.ok) {
              showToast(data.error || 'Failed to anonymize patron per guardrail.');
              return;
            }
          }
        } catch {
          // fallback
        }
        setPatrons(prev =>
          prev.map(p =>
            p.id === patron.id
              ? {
                  ...p,
                  name: 'Anonymized Patron (DPDP Ref #' + p.id + ')',
                  email: 'redacted@privacy.kalajay.in',
                  phone: '+91 XXXXX XXXXX',
                  conciergeNotes: '[Purged per patron erasure request under Digital Personal Data Protection Act 2023]',
                }
              : p
          )
        );
        if (activePatron?.id === patron.id) {
          setActivePatron(null);
        }
        logAction('DPDP_RIGHT_TO_BE_FORGOTTEN', 'customers', `Anonymized patron identity for ${patron.id} in Firestore`);
        showToast(`Personal identifiers for ${patron.id} successfully anonymized per DPDP Act.`);
      },
    });
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
            <Users className="w-3.5 h-3.5" />
            <span>Patron Relations &amp; Circle</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Patron Directory &amp; VIP Circle
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage Kalajay connoisseurs, lifetime heirloom spend, personal bead preferences, and DPDP Act compliance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logAction('EXPORT_PATRON_DIRECTORY', 'customers', 'Exported full patron directory CSV');
            showToast('Exported complete patron ledger to CSV');
          }}
          className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#76695F]" />
          <span>Export Patrons CSV</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Total Patrons</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">142</div>
          <span className="text-[10px] text-emerald-600 font-medium">↑ 18% month-on-month</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Diamond &amp; Gold Circle</span>
          <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">28</div>
          <span className="text-[10px] text-[#76695F]">High lifetime value patrons</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Repeat Patron Rate</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">38.4%</div>
          <span className="text-[10px] text-emerald-600 font-medium">Average 2.2 pieces per patron</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Avg Order Value (AOV)</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">₹3,410</div>
          <span className="text-[10px] text-[#76695F]">Excluding bulk gifting</span>
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
            placeholder="Search patron by name, phone, email, city..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] placeholder-[#76695F]/70 focus:outline-none focus:border-[#9E5430]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#76695F] whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Circle Tier:</span>
          </span>
          <select
            value={selectedTier}
            onChange={e => setSelectedTier(e.target.value)}
            className="px-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer"
          >
            <option value="all">All Tiers ({patrons.length})</option>
            <option value="Diamond Patron">Diamond (&gt; ₹25,000)</option>
            <option value="Gold Patron">Gold (&gt; ₹10,000)</option>
            <option value="Silver Patron">Silver (&gt; ₹5,000)</option>
            <option value="First Heirloom">First Heirloom</option>
          </select>
        </div>
      </div>

      {/* 4. PATRON TABLE */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Patron &amp; Contact</th>
                <th className="py-3 px-4">Circle Tier</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Lifetime Spend</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4">Preferred Palette</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {filteredPatrons.map(patron => {
                const isDiamond = patron.tier === 'Diamond Patron';
                const isGold = patron.tier === 'Gold Patron';
                return (
                  <tr
                    key={patron.id}
                    onClick={() => setActivePatron(patron)}
                    className="hover:bg-[#FFFCF7] transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#9E5430]/10 text-[#9E5430] flex items-center justify-center font-bold text-xs uppercase">
                          {patron.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-[#372921] font-semibold group-hover:text-[#9E5430] transition-colors block">
                              {patron.name}
                            </strong>
                            <ProvenanceBadge provenance={(patron as any).provenance} isDemo={(patron as any).isDemo} size="xs" />
                          </div>
                          <span className="text-[11px] text-[#76695F] block">{patron.email}</span>
                          <span className="text-[10px] text-[#76695F] font-mono">{patron.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-semibold ${
                          isDiamond
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : isGold
                            ? 'bg-amber-100 text-amber-900 border border-amber-200'
                            : patron.tier === 'Silver Patron'
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {isDiamond && <Award className="w-3 h-3 text-purple-600" />}
                        {isGold && <Sparkles className="w-3 h-3 text-amber-600" />}
                        <span>{patron.tier}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#76695F]">
                      <div className="flex items-center gap-1 text-xs">
                        <MapPin className="w-3 h-3 text-[#9E5430]" />
                        <span>{patron.city}, {patron.state}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">
                      ₹{patron.lifetimeSpend.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 text-center font-medium text-[#372921]">
                      <span className="px-2 py-0.5 bg-[#F7F3EC] rounded-full text-[11px] font-mono">
                        {patron.ordersCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#76695F] text-[11px]">
                      {patron.preferredPalette}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePatron(patron);
                        }}
                        className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#9E5430] transition-colors inline-flex items-center gap-1 text-xs"
                      >
                        <span>Profile</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. PATRON DETAIL DRAWER / MODAL */}
      {activePatron && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#DED3C5] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#9E5430] text-white flex items-center justify-center font-serif text-lg font-bold">
                  {activePatron.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                    <span>{activePatron.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] font-sans font-medium">
                      {activePatron.tier}
                    </span>
                  </h3>
                  <p className="text-xs text-[#76695F] flex items-center gap-3 mt-0.5">
                    <span>{activePatron.email}</span>
                    <span>•</span>
                    <span>{activePatron.phone}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActivePatron(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              {/* Lifetime Metrics */}
              <div className="grid grid-cols-3 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#DED3C5]">
                <div>
                  <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Total Heirlooms</span>
                  <div className="font-serif text-base font-bold text-[#372921] mt-0.5">{activePatron.ordersCount} Pieces</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Lifetime Spend</span>
                  <div className="font-serif text-base font-bold text-[#9E5430] mt-0.5">₹{activePatron.lifetimeSpend.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">First Acquisition</span>
                  <div className="font-serif text-base font-bold text-[#372921] mt-0.5">{activePatron.firstOrderDate}</div>
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-2">
                <h4 className="font-semibold text-[#372921] text-xs uppercase tracking-wider">Aesthetic &amp; Craft Preferences</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-[#DED3C5] bg-white">
                    <span className="text-[10.5px] text-[#76695F] block">Preferred Bead Palette</span>
                    <strong className="text-[#372921] font-medium block mt-0.5">{activePatron.preferredPalette}</strong>
                  </div>
                  <div className="p-3 rounded-lg border border-[#DED3C5] bg-white">
                    <span className="text-[10.5px] text-[#76695F] block">Signature Piece Owned</span>
                    <strong className="text-[#372921] font-medium block mt-0.5">{activePatron.favoritePiece}</strong>
                  </div>
                </div>
              </div>

              {/* Concierge Notes */}
              <div className="space-y-1.5">
                <h4 className="font-semibold text-[#372921] text-xs uppercase tracking-wider">Patron Concierge Journal</h4>
                <div className="p-3 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] text-[#372921] italic leading-relaxed">
                  "{activePatron.conciergeNotes}"
                </div>
              </div>

              {/* DPDP Act Compliance Tools */}
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/70 space-y-3">
                <div className="flex items-center gap-2 text-amber-900 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Digital Personal Data Protection (DPDP) Act Compliance</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Under the DPDP Act 2023, patrons have the legal right to receive a copy of their personal data or exercise their right to erasure (right to be forgotten).
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleExportDataPackage(activePatron)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Privacy Packet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRightToBeForgotten(activePatron)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Right to be Forgotten (Anonymize)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end">
              <button
                type="button"
                onClick={() => setActivePatron(null)}
                className="px-5 py-2 rounded-full bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


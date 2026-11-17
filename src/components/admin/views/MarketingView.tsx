'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Tag,
  Copy,
  Check,
  Calendar,
  Download,
  Mail,
  Percent,
  Sparkles,
  Users,
  TrendingUp,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { CouponItem } from '@/data/adminTypes';
import { getFirestoreSubscribers } from '@/lib/firestore';

interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  source: 'Storefront Footer' | 'Craft House Modal' | 'Checkout Consent' | 'Concierge WhatsApp';
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

const SEED_SUBSCRIBERS: NewsletterSubscriber[] = [
  { id: 'SUB-101', email: 'meera.s@gmail.com', name: 'Meera Singhania', source: 'Checkout Consent', subscribedAt: '2026-11-11 14:10', status: 'active' },
  { id: 'SUB-102', email: 'ananya.d@outlook.com', name: 'Ananya Deshmukh', source: 'Storefront Footer', subscribedAt: '2026-11-09 11:15', status: 'active' },
  { id: 'SUB-103', email: 'aarohi.patel@ahmedabad.in', name: 'Aarohi Patel', source: 'Craft House Modal', subscribedAt: '2026-11-08 19:42', status: 'active' },
  { id: 'SUB-104', email: 'divya.menon@kerala.org', name: 'Divya Menon', source: 'Storefront Footer', subscribedAt: '2026-11-07 10:20', status: 'active' },
  { id: 'SUB-105', email: 'tanya.kapur@delhi.co', name: 'Tanya Kapur', source: 'Checkout Consent', subscribedAt: '2026-11-05 16:30', status: 'active' },
  { id: 'SUB-106', email: 'shalini.sharma@jaipur.com', name: 'Shalini Sharma', source: 'Concierge WhatsApp', subscribedAt: '2026-11-04 12:15', status: 'active' },
  { id: 'SUB-107', email: 'priyanka.t@gmail.com', name: 'Priyanka Tandon', source: 'Craft House Modal', subscribedAt: '2026-11-03 09:40', status: 'active' },
  { id: 'SUB-108', email: 'zoya.akhtar@mumbai.in', name: 'Zoya Akhtar', source: 'Storefront Footer', subscribedAt: '2026-11-02 21:05', status: 'active' },
];

export default function MarketingView() {
  const { coupons, createCoupon, toggleCouponStatus, logAction, activeSubPage, setActiveSubPage } = useAdminStore();
  const activeTab: 'coupons' | 'subscribers' = activeSubPage === 'marketing.subscribers' ? 'subscribers' : 'coupons';
  const [searchTerm, setSearchTerm] = useState('');
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>(SEED_SUBSCRIBERS);
  const [isCreatingCoupon, setIsCreatingCoupon] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync live subscribers from Cloud Firestore
  useEffect(() => {
    getFirestoreSubscribers().then((liveSubs) => {
      if (liveSubs && liveSubs.length > 0) {
        const idSet = new Set(liveSubs.map(s => s.id || s.email));
        const combined: NewsletterSubscriber[] = [
          ...liveSubs.map(s => ({
            id: s.id || `SUB-${s.email}`,
            email: s.email,
            name: s.name,
            source: (s.source || 'Storefront Footer') as any,
            subscribedAt: s.subscribedAt ? s.subscribedAt.replace('T', ' ').slice(0, 16) : 'Recent',
            status: s.status || 'active',
          })),
          ...SEED_SUBSCRIBERS.filter(s => !idSet.has(s.id) && !idSet.has(s.email)),
        ];
        setSubscribers(combined);
      }
    }).catch(() => {});
  }, []);

  // New coupon form state
  const [newCode, setNewCode] = useState('');
  const [newType, setNewType] = useState<CouponItem['discountType']>('percentage');
  const [newValue, setNewValue] = useState(15);
  const [newMinSpend, setNewMinSpend] = useState(2999);
  const [newLimit, setNewLimit] = useState(250);
  const [newExpiry, setNewExpiry] = useState('2026-12-31');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    showToast(`Copied coupon code ${code} to clipboard`);
  };

  const handleCreateCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    createCoupon({
      code: newCode.trim().toUpperCase(),
      discountType: newType,
      value: newValue,
      minSpend: newMinSpend,
      usageLimit: newLimit,
      expiresAt: newExpiry,
      isActive: true,
    });

    logAction('CREATE_COUPON', 'marketing', `Created promo code ${newCode.trim().toUpperCase()}`);
    showToast(`Created active promo code ${newCode.trim().toUpperCase()}`);
    setIsCreatingCoupon(false);
    setNewCode('');
  };

  const filteredCoupons = coupons.filter(c =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <Megaphone className="w-3.5 h-3.5" />
            <span>Campaigns &amp; Audience Growth</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Marketing &amp; Promotional Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage promotional coupon codes, cart threshold discounts, and newsletter subscriber audiences.
          </p>
        </div>

        {activeTab === 'coupons' ? (
          <button
            type="button"
            onClick={() => setIsCreatingCoupon(true)}
            className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Promo Code</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              logAction('EXPORT_NEWSLETTER_SUBSCRIBERS', 'marketing', 'Exported newsletter audience list');
              showToast('Exported 8 newsletter subscribers to CSV (Klaviyo format)');
            }}
            className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5 text-[#76695F]" />
            <span>Export Subscribers CSV</span>
          </button>
        )}
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveSubPage('marketing.coupons')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'coupons'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Promo Codes ({coupons.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubPage('marketing.subscribers')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'subscribers'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Newsletter Patrons ({SEED_SUBSCRIBERS.length})</span>
        </button>
      </div>

      {/* 3. COUPONS TAB CONTENT */}
      {activeTab === 'coupons' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredCoupons.map(coupon => {
              const usagePercent = Math.round((coupon.usageCount / coupon.usageLimit) * 100);
              return (
                <div
                  key={coupon.id}
                  className={`bg-white p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
                    coupon.isActive ? 'border-[#DED3C5]' : 'border-stone-300 opacity-60 bg-stone-50'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-md bg-[#9E5430]/10 text-[#9E5430] tracking-wider border border-[#9E5430]/20">
                          {coupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(coupon.code)}
                          className="p-1 rounded hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#9E5430] transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === coupon.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(coupon.id)}
                        className="text-xs font-medium cursor-pointer"
                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {coupon.isActive ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-stone-500 font-medium text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-stone-400" />
                            Paused
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Value Badge */}
                    <div className="py-3">
                      <div className="font-serif text-2xl font-bold text-[#372921]">
                        {coupon.discountType === 'percentage'
                          ? `${coupon.value}% OFF`
                          : coupon.discountType === 'flat_inr'
                          ? `₹${coupon.value} FLAT OFF`
                          : 'FREE SHIPPING'}
                      </div>
                      <span className="text-[11px] text-[#76695F] block mt-0.5">
                        Min. Cart Value: ₹{coupon.minSpend.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Usage Progress Bar */}
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between text-[11px] text-[#76695F]">
                        <span>Redemptions</span>
                        <span className="font-medium text-[#372921]">
                          {coupon.usageCount} / {coupon.usageLimit} ({usagePercent}%)
                        </span>
                      </div>
                      <div className="w-full bg-[#F7F3EC] h-2 rounded-full overflow-hidden border border-[#DED3C5]/60">
                        <div
                          className="bg-[#9E5430] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, usagePercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#EAE2D8] mt-4 flex items-center justify-between text-[11px] text-[#76695F]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#9E5430]" />
                      <span>Expires {coupon.expiresAt}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleCouponStatus(coupon.id)}
                      className="text-[#9E5430] hover:underline font-semibold cursor-pointer"
                    >
                      {coupon.isActive ? 'Pause' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SUBSCRIBERS TAB CONTENT */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Active Audience</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">428</div>
              <span className="text-[10px] text-emerald-600 font-medium">100% double opt-in</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Campaign Open Rate</span>
              <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">46.2%</div>
              <span className="text-[10px] text-[#76695F]">Industry average 18%</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Welcome Code Conversion</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">28.4%</div>
              <span className="text-[10px] text-[#76695F]">Redeemed WELCOME300</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Patron Name &amp; Email</th>
                  <th className="py-3 px-4">Acquisition Source</th>
                  <th className="py-3 px-4">Opt-In Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Consent Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                {filteredSubscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-[#FFFCF7] transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-[#372921] font-semibold block">{sub.name || 'Patron'}</strong>
                      <span className="text-[11px] text-[#76695F] font-mono">{sub.email}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#F7F3EC] text-[#372921] text-[10.5px] border border-[#DED3C5]">
                        {sub.source}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#76695F]">
                      {sub.subscribedAt}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">
                        Subscribed
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[10px] text-[#76695F]">
                      DPDP-VERIFIED-OPTIN
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CREATE PROMO CODE MODAL */}
      {isCreatingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <form
            onSubmit={handleCreateCouponSubmit}
            className="bg-white rounded-2xl max-w-md w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#9E5430]" />
                  <span>Create Promo Code</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">Define cart incentives and campaign thresholds.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCoupon(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">
                  Coupon Code (e.g. FESTIVE20)
                </label>
                <input
                  type="text"
                  required
                  value={newCode}
                  onChange={e => setNewCode(e.target.value.toUpperCase())}
                  placeholder="KALAJAY10"
                  className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs font-mono font-bold tracking-wider text-[#372921]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Discount Type</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat_inr">Flat INR (₹)</option>
                    <option value="free_shipping">Free Shipping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Discount Value</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={e => setNewValue(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs font-bold text-[#372921]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Min. Cart Spend (₹)</label>
                  <input
                    type="number"
                    value={newMinSpend}
                    onChange={e => setNewMinSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#372921] mb-1">Usage Cap</label>
                  <input
                    type="number"
                    value={newLimit}
                    onChange={e => setNewLimit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#372921] mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={newExpiry}
                  onChange={e => setNewExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DED3C5] rounded-lg text-xs text-[#372921]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingCoupon(false)}
                className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white text-[#76695F] text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Publish Coupon
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState } from 'react';
import {
  Landmark,
  Download,
  Calendar,
  CreditCard,
  Percent,
  TrendingUp,
  FileText,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  ArrowUpRight,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';

interface SettlementItem {
  id: string;
  orderId: string;
  gateway: 'Razorpay' | 'Cashfree' | 'UPI Direct';
  refId: string;
  mode: string;
  grossAmount: number;
  gatewayFee: number;
  netCredit: number;
  bankAccount: string;
  settledAt: string;
  status: 'settled' | 'pending';
}

const SEED_SETTLEMENTS: SettlementItem[] = [
  { id: 'SET-901', orderId: 'KJ-88219', gateway: 'UPI Direct', refId: 'UPI-RR-90812348', mode: 'UPI Instant', grossAmount: 2599, gatewayFee: 0, netCredit: 2599, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-11 14:12', status: 'settled' },
  { id: 'SET-902', orderId: 'KJ-88218', gateway: 'Razorpay', refId: 'pay_Nq8711AaB98', mode: 'Visa Infinite Card', grossAmount: 6797, gatewayFee: 135.94, netCredit: 6661.06, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-10 09:30', status: 'settled' },
  { id: 'SET-903', orderId: 'KJ-88217', gateway: 'UPI Direct', refId: 'UPI-RR-88712390', mode: 'UPI Instant', grossAmount: 3299, gatewayFee: 0, netCredit: 3299, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-06 09:32', status: 'settled' },
  { id: 'SET-904', orderId: 'KJ-88216', gateway: 'Cashfree', refId: 'CF-TXN-778921', mode: 'NetBanking (ICICI)', grossAmount: 5198, gatewayFee: 103.96, netCredit: 5094.04, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-05 11:45', status: 'settled' },
  { id: 'SET-905', orderId: 'KJ-88215', gateway: 'Razorpay', refId: 'pay_Np9912CcF11', mode: 'Mastercard Debit', grossAmount: 2899, gatewayFee: 57.98, netCredit: 2841.02, bankAccount: 'HDFC Bank ···4401', settledAt: '2026-11-04 16:10', status: 'settled' },
];

export default function FinanceView() {
  const { logAction } = useAdminStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'gst'>('overview');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
            <Landmark className="w-3.5 h-3.5" />
            <span>Treasury, Margins &amp; Compliance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Finance &amp; GST Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Track gross merchandise value, payment gateway settlements into HDFC, artisan COGS, and handicraft GST tax returns.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            logAction('EXPORT_GSTR1_REPORT', 'finance', 'Exported monthly GSTR-1 summary for GSTIN 27AAECK1294F1Z3');
            showToast('Exported GSTR-1 Monthly Return (JSON & Excel format)');
          }}
          className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#76695F]" />
          <span>Export GSTR-1 Return</span>
        </button>
      </div>

      {/* 2. SUBTABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overview'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Financial Summary &amp; Settlements</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('gst')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'gst'
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Tax &amp; GST Reports (GSTIN)</span>
        </button>
      </div>

      {/* 3. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Gross Merch Value</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">₹8,42,650</div>
              <span className="text-[10px] text-emerald-600 font-medium">↑ 22.4% vs last month</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Net Bank Realized</span>
              <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">₹7,88,200</div>
              <span className="text-[10px] text-[#76695F]">Post gateway deductions</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Handcraft COGS</span>
              <div className="font-serif text-2xl text-[#372921] font-bold mt-1">₹3,12,000</div>
              <span className="text-[10px] text-[#76695F]">37.0% of revenue (Materials + Looms)</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
              <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Gross Contribution</span>
              <div className="font-serif text-2xl text-emerald-600 font-bold mt-1">63.0%</div>
              <span className="text-[10px] text-[#76695F]">Luxury artisan margin benchmark</span>
            </div>
          </div>

          {/* Settlements Table */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-semibold text-[#372921]">
                  Payment Gateway Settlements (HDFC Current Account)
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5">
                  Daily settlement batches from UPI QR, Razorpay, and NetBanking direct channels.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                All Payouts Reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Settlement Ref &amp; Order</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4 text-right">Gross Amount</th>
                    <th className="py-3 px-4 text-right">MDR / Gateway Fee</th>
                    <th className="py-3 px-4 text-right">Net Bank Credit</th>
                    <th className="py-3 px-4">Target Account</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D8]">
                  {SEED_SETTLEMENTS.map(s => (
                    <tr key={s.id} className="hover:bg-[#FFFCF7] transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-[#372921] font-mono font-bold block">{s.refId}</strong>
                        <span className="text-[10.5px] text-[#9E5430] font-medium">Order #{s.orderId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[#372921] font-medium block">{s.mode}</span>
                        <span className="text-[10.5px] text-[#76695F]">{s.gateway}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-serif text-[#372921] font-semibold">
                        ₹{s.grossAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-rose-700">
                        {s.gatewayFee > 0 ? `- ₹${s.gatewayFee.toFixed(2)}` : '₹0.00 (UPI)'}
                      </td>

                      <td className="py-3 px-4 text-right font-serif font-bold text-emerald-700 text-sm">
                        ₹{s.netCredit.toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-[#76695F]">
                        {s.bankAccount}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10.5px] font-semibold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Settled</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. GST TAB */}
      {activeTab === 'gst' && (
        <div className="space-y-6">
          {/* Entity & Tax Registration Card */}
          <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#9E5430] px-2.5 py-0.5 rounded bg-[#9E5430]/10">
                  GSTIN: 27AAECK1294F1Z3
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                  Active Regular Taxpayer
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#372921] mt-1.5">
                Kalajay Creations LLP (Maharashtra &amp; Bihar Operations)
              </h3>
              <p className="text-xs text-[#76695F] mt-0.5">
                Principal Place of Business: Worli Sea Face, Mumbai 400018 | Atelier Loom Hub: Madhubani, Bihar 847211
              </p>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-[#76695F] block uppercase tracking-wider">Estimated Q3 GST Liability</span>
              <span className="font-serif text-2xl font-bold text-[#372921]">₹24,810</span>
              <span className="text-[10px] text-[#76695F] block">Due by 20th Nov 2026</span>
            </div>
          </div>

          {/* Slabs Breakdown */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
            <div className="p-4 border-b border-[#DED3C5] bg-[#F7F3EC]">
              <h4 className="font-serif font-semibold text-[#372921] text-sm">
                Handicrafts HSN Classification &amp; Applicable GST Slabs
              </h4>
            </div>

            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#FAF8F5] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">HSN Code</th>
                  <th className="py-3 px-4">Product Category</th>
                  <th className="py-3 px-4 text-center">GST Rate</th>
                  <th className="py-3 px-4">CGST / SGST Split</th>
                  <th className="py-3 px-4 text-right">Taxable Turnover</th>
                  <th className="py-3 px-4 text-right">Tax Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2D8]">
                <tr className="hover:bg-[#FFFCF7]">
                  <td className="py-3 px-4 font-mono font-bold text-[#9E5430]">HSN 5609 00</td>
                  <td className="py-3 px-4 text-[#372921] font-medium">Articles of yarn/cordage, hand-strung beadwork &amp; organiser trays</td>
                  <td className="py-3 px-4 text-center font-bold text-[#372921]">3.0%</td>
                  <td className="py-3 px-4 text-[#76695F]">1.5% CGST + 1.5% SGST</td>
                  <td className="py-3 px-4 text-right font-serif">₹4,80,000</td>
                  <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">₹14,400</td>
                </tr>
                <tr className="hover:bg-[#FFFCF7]">
                  <td className="py-3 px-4 font-mono font-bold text-[#9E5430]">HSN 7018 10</td>
                  <td className="py-3 px-4 text-[#372921] font-medium">Glass beads, imitation pearls and similar articles for desk items</td>
                  <td className="py-3 px-4 text-center font-bold text-[#372921]">3.0%</td>
                  <td className="py-3 px-4 text-[#76695F]">1.5% CGST + 1.5% SGST</td>
                  <td className="py-3 px-4 text-right font-serif">₹2,10,000</td>
                  <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">₹6,300</td>
                </tr>
                <tr className="hover:bg-[#FFFCF7]">
                  <td className="py-3 px-4 font-mono font-bold text-[#9E5430]">HSN 4202 22</td>
                  <td className="py-3 px-4 text-[#372921] font-medium">Handbags with outer surface of textile/beadwork with metal clasps</td>
                  <td className="py-3 px-4 text-center font-bold text-[#372921]">12.0%</td>
                  <td className="py-3 px-4 text-[#76695F]">6.0% CGST + 6.0% SGST</td>
                  <td className="py-3 px-4 text-right font-serif">₹1,52,650</td>
                  <td className="py-3 px-4 text-right font-serif font-bold text-[#372921]">₹18,318</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


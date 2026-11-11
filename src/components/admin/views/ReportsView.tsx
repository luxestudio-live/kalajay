'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Package,
  Hammer,
  ShieldCheck,
  Users,
  ChevronDown,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';

export default function ReportsView() {
  const { logAction } = useAdminStore();
  const [dateRange, setDateRange] = useState<'30days' | 'q3' | 'ytd'>('30days');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExport = () => {
    logAction('EXPORT_EXECUTIVE_REPORTS', 'reports', `Exported full operational report (${dateRange})`);
    showToast(`Exported Comprehensive Executive Report (${dateRange.toUpperCase()}) to Excel`);
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
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Operational Velocity &amp; Analytics</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Executive Insights &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Four-dimensional audit: Product Commerce Velocity, Bihar Loom Productivity, Quality Control, and Patron Retention.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-white border border-[#DED3C5] rounded-full text-xs text-[#372921] font-medium focus:outline-none focus:border-[#9E5430] cursor-pointer shadow-xs"
          >
            <option value="30days">Last 30 Days (Oct-Nov 2026)</option>
            <option value="q3">Q3 2026 (Jul - Sep)</option>
            <option value="ytd">Year-to-Date 2026</option>
          </select>

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report (XLSX)</span>
          </button>
        </div>
      </div>

      {/* 2. FOUR LUXURY REPORT PILLARS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PILLAR 1: COMMERCE VELOCITY */}
        <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#9E5430]" />
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Commerce &amp; Product Velocity
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#76695F]">Conversion: 3.2%</span>
          </div>

          <div className="space-y-3">
            {[
              { name: 'Signature Pearl Beaded Vanity Box', sku: 'KJ-DESK-001', units: 84, revenue: '₹2,43,516', share: 29 },
              { name: 'Vintage Pearl Beaded Evening Bag', sku: 'KJ-BAG-001', units: 58, revenue: '₹2,02,942', share: 24 },
              { name: 'Luminous Pearl Envelope Clutch', sku: 'KJ-CLUTCH-001', units: 46, revenue: '₹1,51,754', share: 18 },
              { name: 'Radiant Crystal Beaded Tealight Lantern', sku: 'KJ-LANTERN-001', units: 62, revenue: '₹1,17,738', share: 14 },
              { name: 'Pastel Blossoms Beaded Crossbody Sling', sku: 'KJ-SLING-001', units: 35, revenue: '₹1,04,650', share: 12 },
            ].map((p, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#372921] truncate max-w-[240px]">{p.name}</span>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-[#76695F]">{p.units} pcs</span>
                    <strong className="text-[#372921] font-serif">{p.revenue}</strong>
                  </div>
                </div>
                <div className="w-full bg-[#F7F3EC] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#9E5430] h-full rounded-full transition-all"
                    style={{ width: `${p.share * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PILLAR 2: ATELIER & ARTISAN HOURS */}
        <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-[#9E5430]" />
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Atelier Productivity &amp; Loom Hours
              </h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold">92% Loom Utilization</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
              <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Total Handcraft Hours</span>
              <div className="font-serif text-2xl font-bold text-[#372921] mt-0.5">1,480 hrs</div>
              <span className="text-[10px] text-emerald-700">Logged by 21 Bihar artisans</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5]">
              <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Avg Craft Cycle</span>
              <div className="font-serif text-2xl font-bold text-[#9E5430] mt-0.5">14.2 hrs</div>
              <span className="text-[10px] text-[#76695F]">Per signature vanity box</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-[#372921] text-[11px] uppercase tracking-wider">Top Artisan Output (October-November)</h4>
            <div className="divide-y divide-[#EAE2D8]">
              <div className="py-2 flex justify-between">
                <span>Renu Devi (Master Loom A2)</span>
                <span className="font-medium text-[#372921]">34 Heirlooms • 100% QC Pass</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Rekha Kumari (Evening Clutches)</span>
                <span className="font-medium text-[#372921]">28 Heirlooms • 98% QC Pass</span>
              </div>
              <div className="py-2 flex justify-between">
                <span>Anita Devi (Accessories &amp; Cases)</span>
                <span className="font-medium text-[#372921]">42 Pieces • 99% QC Pass</span>
              </div>
            </div>
          </div>
        </div>

        {/* PILLAR 3: QUALITY CONTROL & LOGISTICS */}
        <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Quality &amp; Logistics Assurance
              </h3>
            </div>
            <span className="text-[10.5px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              Industry Top 1%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5] text-center">
              <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Defect Rate</span>
              <div className="font-serif text-xl font-bold text-emerald-700 mt-0.5">0.4%</div>
              <span className="text-[9.5px] text-[#76695F]">Benchmark: 3.2%</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5] text-center">
              <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">RTO Return Rate</span>
              <div className="font-serif text-xl font-bold text-emerald-700 mt-0.5">1.1%</div>
              <span className="text-[9.5px] text-[#76695F]">WhatsApp verified</span>
            </div>
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#DED3C5] text-center">
              <span className="text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">Transit Damage</span>
              <div className="font-serif text-xl font-bold text-emerald-700 mt-0.5">0.1%</div>
              <span className="text-[9.5px] text-[#76695F]">Wax-sealed boxes</span>
            </div>
          </div>

          <p className="text-xs text-[#76695F] leading-relaxed">
            Every Kalajay order undergoes double-knot tensile testing and frame corner squaring before Mumbai wax seal sign-off.
          </p>
        </div>

        {/* PILLAR 4: PATRON RETENTION & COHORTS */}
        <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#9E5430]" />
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Patron Lifetime Retention
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#76695F]">Repeat: 38.4%</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#EAE2D8]">
              <span className="text-[#76695F]">Average Patron Acquisition Cost (CAC)</span>
              <span className="font-mono font-semibold text-[#372921]">₹410</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EAE2D8]">
              <span className="text-[#76695F]">60-Day Re-Order Rate</span>
              <span className="font-mono font-semibold text-emerald-700">24.2%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#EAE2D8]">
              <span className="text-[#76695F]">Top Patron City: Mumbai</span>
              <span className="font-mono font-semibold text-[#372921]">42% of orders</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-[#76695F]">Top Patron City: Bengaluru</span>
              <span className="font-mono font-semibold text-[#372921]">24% of orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


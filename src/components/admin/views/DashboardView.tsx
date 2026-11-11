'use client';

import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Boxes,
  Hammer,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';

export default function DashboardView() {
  const { orders, inventory, workOrders, setActiveModule, setActiveSubPage } = useAdminStore();

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const lowStockCount = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const inLoomCount = orders.filter(o => o.fulfillmentStatus === 'in_loom').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. TOP OPERATIONAL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
              Gross Revenue (MTD)
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#9E5430]/10 flex items-center justify-center text-[#9E5430]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-[#372921]">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs last calendar month</span>
            </span>
          </div>
        </div>

        {/* Customer Orders */}
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
              Customer Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#372921]/10 flex items-center justify-center text-[#372921]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-[#372921]">
              {orders.length} Orders
            </h3>
            <span className="text-[11px] text-[#76695F] block mt-1">
              Average Order Value: ₹2,463
            </span>
          </div>
        </div>

        {/* Active Loom Runs */}
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
              Active Handcraft Looms
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Hammer className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-[#372921]">
              {workOrders.length} Looms
            </h3>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
              21 Master Artisans Active in Bihar
            </span>
          </div>
        </div>

        {/* Inventory Health */}
        <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
              Stock Reorder Alerts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-serif text-3xl font-bold text-amber-900">
              {lowStockCount} SKUs Low
            </h3>
            <span className="text-[11px] text-amber-700 font-medium block mt-1">
              Finished goods &amp; wire spools
            </span>
          </div>
        </div>
      </div>

      {/* 2. RECENT ORDERS & WORK ORDERS SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Customer Orders (Span 7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div>
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Recent Flagship Orders
              </h3>
              <p className="text-[11px] text-[#76695F]">
                Real-time transactions from website checkout
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModule('orders');
                setActiveSubPage('orders.all');
              }}
              className="text-xs font-semibold text-[#9E5430] hover:underline cursor-pointer"
            >
              View All Orders →
            </button>
          </div>

          <div className="space-y-3">
            {orders.map(order => (
              <div
                key={order.id}
                className="p-3 rounded-xl border border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between gap-3 hover:border-[#9E5430]/60 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-[#372921]">
                      Order #{order.id}
                    </strong>
                    <span className="text-[10px] bg-[#F0E9DF] text-[#372921] px-2 py-0.2 rounded font-mono font-semibold">
                      {order.paymentMethod}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#76695F] block truncate mt-0.5">
                    {order.customerName} · {order.items.length} item(s) · {order.shippingAddress.city}
                  </span>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-serif text-xs font-bold text-[#372921] block">
                    ₹{order.total.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full uppercase font-mono ${
                      order.fulfillmentStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.fulfillmentStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.fulfillmentStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Atelier Loom Status & Artisan Presence (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE2D8]">
            <div className="flex items-center gap-2">
              <Hammer className="w-4 h-4 text-[#9E5430]" />
              <h3 className="font-serif text-base font-semibold text-[#372921]">
                Atelier Looms (Bihar Hub)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveModule('production');
                setActiveSubPage('production.work_orders');
              }}
              className="text-xs font-semibold text-[#9E5430] hover:underline cursor-pointer"
            >
              Looms →
            </button>
          </div>

          <div className="space-y-3">
            {workOrders.map(wo => (
              <div
                key={wo.id}
                className="p-3 rounded-xl border border-[#EAE2D8] bg-[#F7F3EC] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <strong className="text-xs font-semibold text-[#372921]">
                    {wo.productName}
                  </strong>
                  <span className="text-[10px] font-mono text-[#9E5430] font-bold">
                    Qty: {wo.quantity} pcs
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#76695F]">
                  <span>Artisan: <strong>{wo.artisanName}</strong></span>
                  <span className="font-mono">{wo.artisanLocation}</span>
                </div>

                {/* Stage Progress Bar */}
                <div className="pt-1">
                  <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-[#DED3C5]">
                    <div
                      className="bg-[#9E5430] h-full rounded-full"
                      style={{
                        width:
                          wo.stage === 'wax_sealed'
                            ? '100%'
                            : wo.stage === 'quality_inspection'
                            ? '80%'
                            : wo.stage === 'mirror_fitting'
                            ? '60%'
                            : wo.stage === 'bead_weaving'
                            ? '40%'
                            : '20%',
                      }}
                    />
                  </div>
                  <span className="text-[9.5px] uppercase tracking-wider text-[#9E5430] font-mono font-semibold block text-right mt-1">
                    {wo.stage.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


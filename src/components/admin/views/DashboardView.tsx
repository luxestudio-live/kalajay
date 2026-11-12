'use client';

import React, { useState } from 'react';
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
  Bell,
  Activity,
  Filter,
  Check,
  ChevronRight,
  Truck,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';

interface ActivityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  category: 'inventory' | 'orders' | 'loom' | 'shipping' | 'support';
  title: string;
  description: string;
  timestamp: string;
  actionLabel?: string;
  actionModule?: string;
  actionPage?: string;
}

const SEED_ACTIVITY_ALERTS: ActivityAlert[] = [
  {
    id: 'alt-001',
    type: 'critical',
    category: 'inventory',
    title: 'Low Stock Alert: High-Tensile Coated Steel Wire',
    description: 'SKU RM-WIRE-STEEL-01 is at 3 spools (reorder threshold: 10 spools). Reorder required immediately for Bihar Loom Cluster 4.',
    timestamp: '10 mins ago',
    actionLabel: 'Reorder Material',
    actionModule: 'inventory',
    actionPage: 'inventory.materials',
  },
  {
    id: 'alt-002',
    type: 'warning',
    category: 'inventory',
    title: 'Finished Good Depleted: Luminous Pearl Envelope Clutch',
    description: 'SKU KJ-CLUTCH-001 has 0 available inventory in Mumbai Atelier with 1 reserved unit.',
    timestamp: '25 mins ago',
    actionLabel: 'Schedule Loom Run',
    actionModule: 'production',
    actionPage: 'production.work_orders',
  },
  {
    id: 'alt-003',
    type: 'info',
    category: 'orders',
    title: 'New Flagship Order #KJ-88219 (₹2,599)',
    description: 'Meera Singhania placed an order for Signature Pearl Beaded Vanity Box via UPI Instant.',
    timestamp: '42 mins ago',
    actionLabel: 'View Order',
    actionModule: 'orders',
    actionPage: 'orders.all',
  },
  {
    id: 'alt-004',
    type: 'info',
    category: 'loom',
    title: 'Loom Milestone: Bead Weaving Started',
    description: 'Master Artisan Renu Devi threaded the foundation perimeter for Work Order #WO-2026-101 on Loom A2.',
    timestamp: '1 hour ago',
    actionLabel: 'View Loom Status',
    actionModule: 'production',
    actionPage: 'production.work_orders',
  },
  {
    id: 'alt-005',
    type: 'success',
    category: 'loom',
    title: 'QC Passed: Radiant Crystal Beaded Tealight Lantern',
    description: 'Work Order #WO-2026-104 (12 pcs) passed structural tension and knot concealment test by Sunita Kumari.',
    timestamp: '2 hours ago',
    actionLabel: 'View QC Ledger',
    actionModule: 'production',
    actionPage: 'production.qc',
  },
  {
    id: 'alt-006',
    type: 'info',
    category: 'shipping',
    title: 'Shipment Dispatched: Order #KJ-88218',
    description: 'Kalajay in-house dispatch team processed package KJ-DISP-78902144 at Mumbai Atelier for Bengaluru delivery.',
    timestamp: '3 hours ago',
    actionLabel: 'Track Shipment',
    actionModule: 'shipping',
    actionPage: 'shipping.shipments',
  },
  {
    id: 'alt-007',
    type: 'warning',
    category: 'support',
    title: 'Support Concierge: Urgent Delivery Address Change',
    description: 'Radhika Kothari requested Pune address update on Ticket #KJ-TCK-9021 before dispatch.',
    timestamp: '4 hours ago',
    actionLabel: 'Respond to Patron',
    actionModule: 'support',
    actionPage: 'support.tickets',
  },
];

export default function DashboardView() {
  const {
    orders,
    inventory,
    workOrders,
    activeSubPage,
    setActiveSubPage,
    setActiveModule,
  } = useAdminStore();

  const [alertFilter, setAlertFilter] = useState<'all' | 'critical' | 'loom' | 'orders'>('all');
  const [resolvedAlerts, setResolvedAlerts] = useState<string[]>([]);

  const totalRevenue = orders.reduce((acc, o) => acc + o.total, 0);
  const lowStockCount = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const inLoomCount = orders.filter(o => o.fulfillmentStatus === 'in_loom').length;

  const filteredAlerts = SEED_ACTIVITY_ALERTS.filter(alt => {
    if (resolvedAlerts.includes(alt.id)) return false;
    if (alertFilter === 'all') return true;
    if (alertFilter === 'critical') return alt.type === 'critical' || alt.type === 'warning';
    if (alertFilter === 'loom') return alt.category === 'loom';
    if (alertFilter === 'orders') return alt.category === 'orders' || alt.category === 'shipping';
    return true;
  });

  const isActivityView = activeSubPage === 'dashboard.activity';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 0. SUBPAGE NAVIGATION TABS */}
      <div className="flex items-center gap-1 border-b border-[#DED3C5] text-xs pb-1">
        <button
          type="button"
          onClick={() => setActiveSubPage('dashboard.overview')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            !isActivityView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Executive Dashboard</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubPage('dashboard.activity')}
          className={`px-3.5 py-2 rounded-t-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
            isActivityView
              ? 'bg-white border-t-2 border-t-[#9E5430] border-x border-[#DED3C5] text-[#9E5430] font-semibold'
              : 'text-[#76695F] hover:text-[#372921]'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live Activity &amp; Alerts</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[9.5px] font-bold">
              {lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: EXECUTIVE DASHBOARD */}
      {!isActivityView && (
        <div className="space-y-6">
          {/* TOP OPERATIONAL KPIS */}
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
                <span className="text-[11px] text-[#76695F] mt-1 block">
                  Average Order Value: ₹{orders.length ? Math.round(totalRevenue / orders.length).toLocaleString('en-IN') : 0}
                </span>
              </div>
            </div>

            {/* Active Looms */}
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
                  Active Handcraft Looms
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Hammer className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-3xl font-bold text-[#372921]">
                  {workOrders.length} Looms
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
                  21 Master Artisans Active in Bihar
                </span>
              </div>
            </div>

            {/* Stock Alerts */}
            <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-sans uppercase tracking-wider text-[#76695F] font-semibold">
                  Stock Reorder Alerts
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-serif text-3xl font-bold text-[#9E5430]">
                  {lowStockCount} SKUs Low
                </h3>
                <span className="text-[11px] text-[#76695F] mt-1 block">
                  Finished goods &amp; wire spools
                </span>
              </div>
            </div>
          </div>

          {/* LOWER SECTION: RECENT ORDERS & ATELIER LOOMS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Orders Feed */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DED3C5] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8]">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#372921]">
                    Recent Flagship Orders
                  </h3>
                  <p className="text-xs text-[#76695F] mt-0.5">
                    Real-time transactions from website checkout
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('orders');
                    setActiveSubPage('orders.all');
                  }}
                  className="text-xs font-semibold text-[#9E5430] hover:text-[#874427] cursor-pointer"
                >
                  View All Orders →
                </button>
              </div>

              <div className="divide-y divide-[#EAE2D8] mt-3">
                {orders.slice(0, 3).map(order => (
                  <div key={order.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#372921]">
                          Order #{order.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F7F3EC] text-[#76695F] border border-[#DED3C5]">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-[#76695F] mt-1">
                        {order.customerName} · {order.items.length} item(s) · {order.shippingAddress.city}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-sm font-bold text-[#372921] block">
                        ₹{order.total.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                          order.fulfillmentStatus === 'in_loom'
                            ? 'bg-amber-100 text-amber-800'
                            : order.fulfillmentStatus === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {order.fulfillmentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bihar Atelier Looms */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DED3C5] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#EAE2D8]">
                <div className="flex items-center gap-2">
                  <Hammer className="w-4 h-4 text-[#9E5430]" />
                  <h3 className="font-serif text-lg font-semibold text-[#372921]">
                    Atelier Looms (Bihar Hub)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('production');
                    setActiveSubPage('production.work_orders');
                  }}
                  className="text-xs font-semibold text-[#9E5430] hover:text-[#874427] cursor-pointer"
                >
                  Looms →
                </button>
              </div>

              <div className="space-y-4 mt-4">
                {workOrders.map(wo => {
                  const stagePercent =
                    wo.stage === 'loom_threading' ? 25 :
                    wo.stage === 'bead_weaving' ? 50 :
                    wo.stage === 'mirror_fitting' ? 75 :
                    wo.stage === 'quality_inspection' ? 90 : 100;
                  return (
                    <div key={wo.id} className="p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE2D8] space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <strong className="text-[#372921] font-serif font-semibold">{wo.productName}</strong>
                        <span className="text-[11px] font-mono text-[#76695F]">Qty: {wo.quantity} pcs</span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#76695F]">
                        <span>Artisan: <strong className="text-[#372921]">{wo.artisanName}</strong></span>
                        <span className="font-mono text-[10px]">{wo.artisanLocation}</span>
                      </div>

                      <div className="space-y-1">
                        <div className="w-full bg-[#EAE2D8] h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#9E5430] h-full rounded-full transition-all"
                            style={{ width: `${stagePercent}%` }}
                          />
                        </div>
                        <div className="flex justify-end text-[9.5px] uppercase font-bold tracking-wider text-[#9E5430]">
                          {wo.stage.replace('_', ' ')}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LIVE ACTIVITY & ALERTS STREAM */}
      {isActivityView && (
        <div className="space-y-6">
          {/* Header & Filter Controls */}
          <div className="bg-white p-5 rounded-2xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="font-serif text-xl font-bold text-[#372921]">
                  Live Operational Stream &amp; Priority Alerts
                </h2>
              </div>
              <p className="text-xs text-[#76695F] mt-1">
                Real-time operational event feed across storefront checkouts, Bihar loom runs, quality inspections, and in-house atelier dispatches.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#F7F3EC] p-1 rounded-xl border border-[#DED3C5] text-xs">
              <button
                type="button"
                onClick={() => setAlertFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  alertFilter === 'all' ? 'bg-[#9E5430] text-white font-semibold' : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                All Events ({filteredAlerts.length})
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('critical')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  alertFilter === 'critical' ? 'bg-[#9E5430] text-white font-semibold' : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                Critical &amp; Warnings
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('loom')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  alertFilter === 'loom' ? 'bg-[#9E5430] text-white font-semibold' : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                Bihar Looms
              </button>
              <button
                type="button"
                onClick={() => setAlertFilter('orders')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  alertFilter === 'orders' ? 'bg-[#9E5430] text-white font-semibold' : 'text-[#76695F] hover:text-[#372921]'
                }`}
              >
                Orders &amp; Logistics
              </button>
            </div>
          </div>

          {/* Activity Feed Cards */}
          <div className="space-y-3">
            {filteredAlerts.map(alert => {
              const isCrit = alert.type === 'critical';
              const isWarn = alert.type === 'warning';
              const isSuccess = alert.type === 'success';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isCrit
                      ? 'bg-rose-50/80 border-rose-200'
                      : isWarn
                      ? 'bg-amber-50/80 border-amber-200'
                      : isSuccess
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : 'bg-white border-[#DED3C5]'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isCrit
                          ? 'bg-rose-100 text-rose-700'
                          : isWarn
                          ? 'bg-amber-100 text-amber-800'
                          : isSuccess
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#9E5430]/10 text-[#9E5430]'
                      }`}
                    >
                      {alert.category === 'inventory' && <Boxes className="w-5 h-5" />}
                      {alert.category === 'orders' && <ShoppingBag className="w-5 h-5" />}
                      {alert.category === 'loom' && <Hammer className="w-5 h-5" />}
                      {alert.category === 'shipping' && <Truck className="w-5 h-5" />}
                      {alert.category === 'support' && <MessageSquare className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            isCrit
                              ? 'bg-rose-200 text-rose-900'
                              : isWarn
                              ? 'bg-amber-200 text-amber-900'
                              : isSuccess
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-stone-200 text-stone-800'
                          }`}
                        >
                          {alert.category}
                        </span>
                        <span className="text-[11px] text-[#76695F] font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{alert.timestamp}</span>
                        </span>
                      </div>

                      <h4 className="font-serif text-base font-semibold text-[#372921] mt-1">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-[#76695F] mt-0.5 max-w-3xl leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                    {alert.actionLabel && alert.actionModule && alert.actionPage && (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveModule(alert.actionModule as any);
                          setActiveSubPage(alert.actionPage!);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>{alert.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setResolvedAlerts(prev => [...prev, alert.id])}
                      className="p-1.5 rounded-full hover:bg-stone-200 text-[#76695F] hover:text-[#372921] transition-colors cursor-pointer"
                      title="Dismiss Alert"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredAlerts.length === 0 && (
              <div className="bg-white rounded-2xl border border-[#DED3C5] p-12 text-center text-[#76695F]">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-serif text-lg text-[#372921] font-semibold">All Clear</h4>
                <p className="text-xs mt-1">No active operational alerts in this view filter.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

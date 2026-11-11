'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Package,
  Boxes,
  ShoppingBag,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { ADMIN_MODULE_DEFINITIONS } from '@/data/adminPermissions';

interface AdminHeaderProps {
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
}

export default function AdminHeader({
  onOpenMobileMenu,
  onOpenSearch,
}: AdminHeaderProps) {
  const {
    activeRole,
    allRoles,
    switchRole,
    currentUser,
    activeModule,
    activeSubPage,
    resetDemoData,
    inventory,
    orders,
    workOrders,
  } = useAdminStore();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Compute live operational notification counts
  const lowStockCount = inventory.filter(i => i.status === 'low_stock' || i.status === 'out_of_stock').length;
  const inLoomOrdersCount = orders.filter(o => o.fulfillmentStatus === 'in_loom').length;
  const activeWorkOrdersCount = workOrders.filter(w => !w.qcPassed).length;
  const totalAlerts = lowStockCount + inLoomOrdersCount;

  // Resolve current module and subpage names for breadcrumbs
  const currentModuleDef = ADMIN_MODULE_DEFINITIONS.find(m => m.moduleId === activeModule);
  const currentSubPageDef = currentModuleDef?.pages.find(p => p.id === activeSubPage);

  return (
    <header className="sticky top-0 z-30 bg-[#FFFCF7] border-b border-[#DED3C5] shadow-xs">
      {/* 1. TOP OPERATIONAL DEMO DISCLAIMER BANNER */}
      <div className="bg-[#372921] text-[#F7F3EC] text-[11px] px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#503A2E] select-none">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="font-semibold tracking-wider uppercase text-[10px] text-[#C5A880]">
            Operational Prototype:
          </span>
          <span className="text-[#F7F3EC]/90 font-light hidden sm:inline">
            Interactive UI with typed repository layer. All mock edits reflect immediately in memory &amp; local storage.
          </span>
          <span className="text-[#F7F3EC]/90 font-light sm:hidden">
            Interactive UI prototype with mock store.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#503A2E] hover:bg-[#874427] text-white text-[10.5px] font-medium transition-colors cursor-pointer"
            title="Reset all modified demo data back to pristine seed defaults"
          >
            <RefreshCw className="w-3 h-3 text-[#C5A880]" />
            <span>Reset Demo Data</span>
          </button>
          <span className="text-[#A99583] hidden md:inline">|</span>
          <span className="text-[#C5A880] text-[10px] font-mono uppercase hidden md:inline">
            PROPOSED · SUBJECT TO FUNCTIONAL REVIEW
          </span>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="Open sidebar menu"
            className="lg:hidden p-1.5 rounded-md text-[#372921] hover:bg-[#F0E9DF] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <nav className="flex items-center gap-1.5 text-xs text-[#76695F] font-sans truncate">
            <span className="font-semibold text-[#9E5430] uppercase tracking-wider text-[10px]">
              Kalajay Ops
            </span>
            <span className="text-[#DED3C5]">/</span>
            <span className="font-medium text-[#372921] truncate">
              {currentModuleDef?.name || activeModule}
            </span>
            {currentSubPageDef && (
              <>
                <span className="text-[#DED3C5]">/</span>
                <span className="font-semibold text-[#9E5430] truncate">
                  {currentSubPageDef.name}
                </span>
              </>
            )}
          </nav>
        </div>

        {/* Right: Quick Search, Role Simulation Dropdown, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0E9DF]/80 hover:bg-[#EAE2D8] text-xs text-[#76695F] border border-[#DED3C5] transition-all cursor-pointer shadow-2xs"
            title="Quick search (Ctrl + K)"
          >
            <Search className="w-3.5 h-3.5 text-[#9E5430]" />
            <span className="text-[11.5px]">Search catalogue, orders, SKU...</span>
            <kbd className="text-[10px] bg-white border border-[#DED3C5] rounded px-1.5 py-0.2 font-mono text-[#76695F]">
              Ctrl+K
            </kbd>
          </button>

          {/* CRITICAL: "View as Role" Simulation Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DED3C5] bg-[#FFFCF7] hover:bg-[#F0E9DF] text-xs font-sans transition-colors cursor-pointer"
              title="Switch simulated access role to preview console under different permissions"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#9E5430]" />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[9px] uppercase tracking-wider text-[#76695F] leading-none font-semibold">
                  View As Role:
                </span>
                <span className="font-bold text-[#372921] text-[11px] leading-tight truncate max-w-[130px]">
                  {activeRole.name}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-[#76695F]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white rounded-xl shadow-xl border border-[#DED3C5] p-2 z-50 animate-fade-in">
                <div className="p-2 border-b border-[#EAE2D8] mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-[#9E5430] font-sans font-bold block">
                    Role Simulation Switcher
                  </span>
                  <p className="text-[11px] text-[#76695F] leading-tight mt-0.5">
                    Preview the admin menu and view restrictions under specific department roles.
                  </p>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {allRoles.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        switchRole(r.id);
                        setRoleDropdownOpen(false);
                      }}
                      className={`w-full flex items-start justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        r.id === activeRole.id
                          ? 'bg-[#F0E9DF] text-[#9E5430] font-bold border border-[#9E5430]/30'
                          : 'text-[#372921] hover:bg-[#F7F3EC]'
                      }`}
                    >
                      <div>
                        <span className="block text-[11.5px] leading-tight">{r.name}</span>
                        <span className="text-[10px] text-[#76695F] font-normal leading-tight line-clamp-1">
                          {r.description}
                        </span>
                      </div>
                      {r.id === activeRole.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#9E5430] shrink-0 mt-0.5 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setNotificationsOpen(prev => !prev)}
              aria-label="View notifications and operational alerts"
              className="relative p-2 rounded-full hover:bg-[#F0E9DF] text-[#372921] transition-colors cursor-pointer"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#9E5430] ring-2 ring-white" />
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-80 bg-white rounded-xl shadow-xl border border-[#DED3C5] p-3 z-50 animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-[#EAE2D8] mb-2">
                  <span className="font-serif text-sm font-semibold text-[#372921]">
                    Operational Alerts
                  </span>
                  <span className="text-[10px] bg-[#9E5430] text-white px-2 py-0.5 rounded-full font-bold">
                    {totalAlerts} Attention
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {lowStockCount > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">
                          {lowStockCount} SKUs at or below reorder point
                        </strong>
                        <span className="text-[11px] text-amber-700">
                          AirPod cases and steel wire require procurement / loom allocation.
                        </span>
                      </div>
                    </div>
                  )}

                  {inLoomOrdersCount > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-2 text-emerald-900">
                      <Boxes className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-semibold">
                          {inLoomOrdersCount} Customer Orders in Active Loom
                        </strong>
                        <span className="text-[11px] text-emerald-700">
                          Master artisans in Bihar currently hand-threading pieces.
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#EAE2D8] text-center">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-[11px] text-[#9E5430] font-semibold hover:underline"
                    >
                      Dismiss Alerts
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* View Live Customer Storefront */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#372921] hover:bg-[#503A2E] text-white text-xs font-semibold tracking-wide transition-all shadow-xs"
            title="Open customer-facing website in new tab"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3 text-[#C5A880]" />
          </Link>
        </div>
      </div>
    </header>
  );
}


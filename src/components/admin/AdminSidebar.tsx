'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  LayoutTemplate,
  Star,
  Package,
  Boxes,
  ShoppingBag,
  Hammer,
  Truck,
  Users,
  Palette,
  Gift,
  Megaphone,
  Landmark,
  Headphones,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminModuleId } from '@/data/adminTypes';

interface NavGroup {
  id: AdminModuleId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
  items?: Array<{ id: string; label: string; badge?: string }>;
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'dashboard',
    label: 'Overview & Alerts',
    icon: LayoutDashboard,
    items: [
      { id: 'dashboard.overview', label: 'Executive Dashboard' },
      { id: 'dashboard.activity', label: 'Live Activity & Alerts' },
    ],
  },
  {
    id: 'cms',
    label: 'Website & Content (CMS)',
    icon: LayoutTemplate,
    items: [
      { id: 'cms.homepage', label: 'Homepage Builder' },
      { id: 'cms.banners', label: 'Banners & Marquee' },
      { id: 'cms.media', label: 'Media Library' },
      { id: 'cms.story', label: 'Our Story & Artisans' },
      { id: 'cms.navigation', label: 'Navigation & Menus' },
      { id: 'cms.policies', label: 'FAQ & Policies' },
      { id: 'cms.seo', label: 'SEO & Metadata' },
    ],
  },
  {
    id: 'featured-products',
    label: 'Featured Products Studio',
    icon: Star,
    badge: 'Curator',
    badgeColor: 'bg-[#9E5430] text-white',
    items: [
      { id: 'featured.curator', label: 'Curate Storefront Rail' },
    ],
  },
  {
    id: 'catalogue',
    label: 'Catalogue & Products',
    icon: Package,
    items: [
      { id: 'catalogue.products', label: 'All Products (69)' },
      { id: 'catalogue.collections', label: 'Collections (9)' },
      { id: 'catalogue.reviews', label: 'Review Moderation' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory & ERP Ledger',
    icon: Boxes,
    badge: '3 Low',
    badgeColor: 'bg-amber-600 text-white',
    items: [
      { id: 'inventory.master', label: 'Master Stock Ledger' },
      { id: 'inventory.low_stock', label: 'Low Stock Alerts', badge: '3' },
      { id: 'inventory.adjustments', label: 'Adjustments Audit' },
      { id: 'inventory.materials', label: 'Raw Materials & BOM' },
    ],
  },
  {
    id: 'orders',
    label: 'Orders & Sales',
    icon: ShoppingBag,
    badge: '1 New',
    badgeColor: 'bg-[#9E5430] text-white',
    items: [
      { id: 'orders.all', label: 'All Customer Orders' },
      { id: 'orders.manual', label: 'Create Manual Order' },
      { id: 'orders.invoices', label: 'Invoices & Receipts' },
    ],
  },
  {
    id: 'production',
    label: 'Production & Looms (Bihar)',
    icon: Hammer,
    badge: '4 Active',
    badgeColor: 'bg-emerald-600 text-white',
    items: [
      { id: 'production.work_orders', label: 'Work Orders & Looms' },
      { id: 'production.qc', label: 'Quality Control (QC)' },
      { id: 'production.stages', label: 'Craft Pipeline Stages' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping & Fulfilment',
    icon: Truck,
    items: [
      { id: 'shipping.shipments', label: 'Shipments & Tracking' },
      { id: 'shipping.rules', label: 'Shipping Rules & Zones' },
    ],
  },
  {
    id: 'customers',
    label: 'Customers & Patrons',
    icon: Users,
    items: [
      { id: 'customers.directory', label: 'Patron Directory' },
    ],
  },
  {
    id: 'custom-orders',
    label: 'Custom Orders & Studio',
    icon: Palette,
    badge: '2 Quotes',
    badgeColor: 'bg-purple-600 text-white',
    items: [
      { id: 'custom.requests', label: 'Custom Requests & Proofs' },
    ],
  },
  {
    id: 'gifting',
    label: 'Gifting & Bulk Enquiries',
    icon: Gift,
    badge: '2 Leads',
    badgeColor: 'bg-blue-600 text-white',
    items: [
      { id: 'gifting.corporate', label: 'Corporate & Wedding Leads' },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing & Offers',
    icon: Megaphone,
    items: [
      { id: 'marketing.coupons', label: 'Coupons & Promo Codes' },
      { id: 'marketing.subscribers', label: 'Newsletter Patrons' },
    ],
  },
  {
    id: 'finance',
    label: 'Finance & GST Ledger',
    icon: Landmark,
    items: [
      { id: 'finance.overview', label: 'Financial Summary' },
      { id: 'finance.offline', label: 'Offline & Studio Sales' },
      { id: 'finance.gst', label: 'Tax & GST Slabs (HSN)' },
    ],
  },
  {
    id: 'support',
    label: 'Support & Concierge',
    icon: Headphones,
    badge: '1 Open',
    badgeColor: 'bg-rose-600 text-white',
    items: [
      { id: 'support.tickets', label: 'Support Tickets Queue' },
    ],
  },
  {
    id: 'reports',
    label: 'Insights & Analytics',
    icon: BarChart3,
    items: [
      { id: 'reports.analytics', label: 'Performance Reports' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings & Administration',
    icon: Settings,
    items: [
      { id: 'settings.users', label: 'Staff Users (Crypto ID)' },
      { id: 'settings.roles', label: 'Roles & Permission Matrix' },
      { id: 'settings.audit', label: 'Audit Trail Logs' },
      { id: 'settings.store', label: 'Store Identity & Seams' },
    ],
  },
];

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const {
    activeModule,
    activeSubPage,
    setActiveModule,
    setActiveSubPage,
    isModuleAccessible,
    isPageAccessible,
    currentUser,
    activeRole,
  } = useAdminStore();

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    dashboard: true,
    cms: true,
    'featured-products': true,
    catalogue: true,
    inventory: true,
    orders: true,
    settings: true,
  });

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const handleSelectPage = (moduleId: AdminModuleId, subPageId: string) => {
    setActiveModule(moduleId);
    setActiveSubPage(subPageId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-[#241F1B] text-[#F7F3EC] flex flex-col border-r border-[#372921]/60 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#372921]/80 shrink-0 bg-[#1D1916]">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 overflow-hidden group select-none"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#9E5430] to-[#874427] flex items-center justify-center shrink-0 shadow-md border border-[#C5A880]/30 p-1">
              <img
                src="/icon.png"
                alt="Kalajay"
                className="w-full h-full object-contain filter brightness-110"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-wider font-medium text-white leading-tight">
                  KALAJAY
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#C5A880] font-sans font-semibold">
                  Management Console
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'}
            className="hidden lg:flex p-1.5 rounded-md text-[#A99583] hover:text-white hover:bg-[#372921] transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Operational Context Tag */}
        {!isCollapsed && (
          <div className="px-4 py-2 bg-[#2D2622] border-b border-[#372921]/60 flex items-center justify-between text-[11px] text-[#A99583]">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Unified Commerce &amp; ERP</span>
            </span>
            <span className="font-mono text-[10px] bg-[#1D1916] px-1.5 py-0.5 rounded text-[#C5A880]">
              v2.4
            </span>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-3 px-2 space-y-1 scrollbar-thin scrollbar-thumb-[#372921]"
          data-lenis-prevent="true"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {NAV_GROUPS.map(group => {
            const hasAccess = isModuleAccessible(group.id);
            // Hide navigation link entirely if role lacks permission
            if (!hasAccess) return null;

            const isGroupActive = activeModule === group.id;
            const isExpanded = expandedGroups[group.id] || false;
            const Icon = group.icon;

            return (
              <div key={group.id} className="mb-0.5">
                {/* Group Header Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isCollapsed) {
                      handleSelectPage(group.id, group.items?.[0]?.id || `${group.id}.overview`);
                    } else {
                      toggleGroup(group.id);
                      if (!isGroupActive && group.items?.[0]) {
                        handleSelectPage(group.id, group.items[0].id);
                      }
                    }
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-sans font-medium transition-all cursor-pointer group ${
                    isGroupActive
                      ? 'bg-[#9E5430] text-white shadow-sm font-semibold'
                      : 'text-[#DED3C5] hover:bg-[#322A25] hover:text-white'
                  } ${!hasAccess ? 'opacity-40 hover:opacity-60' : ''}`}
                  title={group.label}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                        isGroupActive ? 'text-white' : 'text-[#C5A880]'
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="truncate text-left text-[12.5px] tracking-wide">
                        {group.label}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0 ml-1">
                      {group.badge && (
                        <span
                          className={`text-[9.5px] px-1.5 py-0.5 rounded-full font-semibold font-mono uppercase tracking-wider ${
                            group.badgeColor || 'bg-[#372921] text-white'
                          }`}
                        >
                          {group.badge}
                        </span>
                      )}
                      {group.items && (
                        <span className="text-[#A99583] group-hover:text-white transition-transform">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  )}
                </button>

                {/* Sub-items (expanded state) */}
                {!isCollapsed && isExpanded && group.items && (
                  <div className="ml-5 pl-3 border-l border-[#372921] mt-1 space-y-0.5">
                    {group.items.map(subItem => {
                      const isSubActive = activeSubPage === subItem.id;
                      const isSubAccessible = isPageAccessible(subItem.id);
                      if (!isSubAccessible) return null;

                      return (
                        <button
                          key={subItem.id}
                          type="button"
                          onClick={() => handleSelectPage(group.id, subItem.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-[11.5px] transition-colors cursor-pointer text-left ${
                            isSubActive
                              ? 'bg-[#372921] text-[#C5A880] font-semibold'
                              : 'text-[#A99583] hover:text-[#F7F3EC] hover:bg-[#2A231F]'
                          } ${!isSubAccessible ? 'opacity-40 italic' : ''}`}
                        >
                          <span className="truncate">{subItem.label}</span>
                          {subItem.badge && (
                            <span className="text-[9px] bg-[#9E5430] text-white px-1.5 py-0.2 rounded font-mono font-bold">
                              {subItem.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer: Active Role Simulation Badge & Current User */}
        <div className="p-3 bg-[#1D1916] border-t border-[#372921]/80 shrink-0">
          {!isCollapsed ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] bg-[#2A231F] p-2 rounded-md border border-[#372921]">
                <div className="flex items-center gap-2 min-w-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-[#A99583] block">
                      Active Role
                    </span>
                    <span className="font-semibold text-white truncate block text-[11px]">
                      {activeRole.name}
                    </span>
                  </div>
                </div>
                {activeRole.isSystem && (
                  <span className="text-[9px] bg-[#372921] text-[#C5A880] px-1 py-0.5 rounded font-mono">
                    SYS
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#9E5430] flex items-center justify-center font-serif text-white text-xs font-bold shrink-0">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium text-white truncate block">
                      {currentUser.name}
                    </span>
                    <span className="text-[9.5px] text-[#A99583] truncate block font-mono">
                      {currentUser.id}
                    </span>
                  </div>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="text-[10.5px] text-[#C5A880] hover:text-white flex items-center gap-1 transition-colors"
                  title="Open live customer storefront in new tab"
                >
                  <span>Store ↗</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 rounded-full bg-[#9E5430] flex items-center justify-center font-serif text-white text-xs font-bold shadow"
                title={`${currentUser.name} (${activeRole.name})`}
              >
                {currentUser.name.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}


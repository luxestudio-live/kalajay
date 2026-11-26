'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Package, ShoppingBag, Hammer, LayoutTemplate, ShieldCheck, Users } from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminModuleId } from '@/data/adminTypes';
import { PRODUCTS } from '@/data/catalogue';

interface AdminSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminSearchModal({ isOpen, onClose }: AdminSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { setActiveModule, setActiveSubPage, orders, workOrders, allUsers, allRoles } = useAdminStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Global keydown handler for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle if already open or open
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search Results Filtering
  const matchedProducts = q
    ? PRODUCTS.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedOrders = q
    ? orders.filter(
        o =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerEmail.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedWorkOrders = q
    ? workOrders.filter(
        w =>
          w.id.toLowerCase().includes(q) ||
          w.artisanName.toLowerCase().includes(q) ||
          w.productName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const matchedUsers = q
    ? allUsers.filter(
        u =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.roleName.toLowerCase().includes(q)
      ).slice(0, 3)
    : [];

  const navigateTo = (mod: AdminModuleId, sub: string) => {
    setActiveModule(mod);
    setActiveSubPage(sub);
    onClose();
  };

  const hasAnyResults =
    matchedProducts.length > 0 ||
    matchedOrders.length > 0 ||
    matchedWorkOrders.length > 0 ||
    matchedUsers.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Global Admin Quick Search">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="min-h-full flex items-start justify-center p-4 sm:p-6 sm:pt-16">
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden animate-fade-in">
          {/* Search Input Bar */}
          <div className="p-4 border-b border-[#EAE2D8] flex items-center gap-3 bg-[#FFFCF7]">
            <Search className="w-5 h-5 text-[#9E5430] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              aria-label="Search products by SKU, orders, work orders, staff, sections"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products by SKU, orders, work orders, staff, sections..."
              className="w-full bg-transparent text-sm text-[#372921] placeholder-[#A99583] focus:outline-none font-sans"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search query"
                className="p-1 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#76695F] hover:text-[#372921] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="text-[10px] bg-[#F0E9DF] border border-[#DED3C5] px-1.5 py-0.5 rounded text-[#76695F] font-mono">
                ESC
              </kbd>
            )}
          </div>

          {/* Quick Actions Shortcuts (when query is empty) */}
          {!q && (
            <div className="p-4 space-y-4">
              <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-sans font-bold block">
                Quick Navigation Shortcuts
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => navigateTo('featured-products', 'featured.curator')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <Package className="w-4 h-4 text-[#9E5430]" />
                  <span>Featured Curator</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('cms', 'cms.homepage')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <LayoutTemplate className="w-4 h-4 text-[#9E5430]" />
                  <span>Homepage Builder</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('inventory', 'inventory.master')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <Package className="w-4 h-4 text-[#9E5430]" />
                  <span>Inventory Ledger</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('production', 'production.work_orders')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <Hammer className="w-4 h-4 text-[#9E5430]" />
                  <span>Loom Work Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('settings', 'settings.roles')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <ShieldCheck className="w-4 h-4 text-[#9E5430]" />
                  <span>Roles &amp; Perms</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('settings', 'settings.users')}
                  className="p-2.5 rounded-xl border border-[#DED3C5] bg-[#F7F3EC] hover:bg-[#F0E9DF] text-left transition-colors flex items-center gap-2 text-xs font-medium text-[#372921]"
                >
                  <Users className="w-4 h-4 text-[#9E5430]" />
                  <span>Staff Users</span>
                </button>
              </div>
            </div>
          )}

          {/* Results List */}
          {q && (
            <div
              className="max-h-[60vh] overflow-y-auto overscroll-contain p-4 space-y-4"
              data-lenis-prevent="true"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {!hasAnyResults ? (
                <div className="py-12 text-center space-y-2">
                  <p className="font-serif text-lg text-[#372921]">No matching records found</p>
                  <p className="text-xs text-[#76695F]">
                    We couldn&apos;t find any products, orders, or staff matching &ldquo;{query}&rdquo;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Products */}
                  {matchedProducts.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-sans font-bold block mb-1.5">
                        Products ({matchedProducts.length})
                      </span>
                      <div className="space-y-1">
                        {matchedProducts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => navigateTo('catalogue', 'catalogue.products')}
                            className="p-2 rounded-lg hover:bg-[#F7F3EC] border border-transparent hover:border-[#DED3C5] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={p.coverImage}
                                alt={p.name}
                                className="w-9 h-9 rounded object-cover border border-[#EAE2D8]"
                              />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-[#372921] block truncate group-hover:text-[#9E5430]">
                                  {p.name}
                                </span>
                                <span className="text-[10.5px] text-[#76695F] font-mono">
                                  {p.code} · {p.category} · ₹{p.price.toLocaleString('en-IN')}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#A99583] group-hover:text-[#9E5430] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders */}
                  {matchedOrders.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-sans font-bold block mb-1.5">
                        Customer Orders ({matchedOrders.length})
                      </span>
                      <div className="space-y-1">
                        {matchedOrders.map(o => (
                          <div
                            key={o.id}
                            onClick={() => navigateTo('orders', 'orders.all')}
                            className="p-2 rounded-lg hover:bg-[#F7F3EC] border border-transparent hover:border-[#DED3C5] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <ShoppingBag className="w-4 h-4 text-[#9E5430] shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-[#372921] block truncate group-hover:text-[#9E5430]">
                                  Order #{o.id} · {o.customerName}
                                </span>
                                <span className="text-[10.5px] text-[#76695F]">
                                  {o.fulfillmentStatus.toUpperCase()} · ₹{o.total.toLocaleString('en-IN')} ({o.paymentStatus})
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#A99583] group-hover:text-[#9E5430] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Work Orders */}
                  {matchedWorkOrders.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-sans font-bold block mb-1.5">
                        Loom Work Orders ({matchedWorkOrders.length})
                      </span>
                      <div className="space-y-1">
                        {matchedWorkOrders.map(w => (
                          <div
                            key={w.id}
                            onClick={() => navigateTo('production', 'production.work_orders')}
                            className="p-2 rounded-lg hover:bg-[#F7F3EC] border border-transparent hover:border-[#DED3C5] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Hammer className="w-4 h-4 text-[#9E5430] shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-[#372921] block truncate group-hover:text-[#9E5430]">
                                  {w.id} · {w.productName} ({w.quantity} pcs)
                                </span>
                                <span className="text-[10.5px] text-[#76695F]">
                                  Artisan: {w.artisanName} · Stage: {w.stage.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#A99583] group-hover:text-[#9E5430] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Users */}
                  {matchedUsers.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#A99583] font-sans font-bold block mb-1.5">
                        Staff &amp; Admin Accounts ({matchedUsers.length})
                      </span>
                      <div className="space-y-1">
                        {matchedUsers.map(u => (
                          <div
                            key={u.id}
                            onClick={() => navigateTo('settings', 'settings.users')}
                            className="p-2 rounded-lg hover:bg-[#F7F3EC] border border-transparent hover:border-[#DED3C5] transition-colors flex items-center justify-between cursor-pointer group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Users className="w-4 h-4 text-[#9E5430] shrink-0" />
                              <div className="min-w-0">
                                <span className="text-xs font-semibold text-[#372921] block truncate group-hover:text-[#9E5430]">
                                  {u.name} ({u.id})
                                </span>
                                <span className="text-[10.5px] text-[#76695F]">
                                  {u.email} · {u.roleName} ({u.status})
                                </span>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#A99583] group-hover:text-[#9E5430] group-hover:translate-x-0.5 transition-transform shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Footer Bar */}
          <div className="p-3 bg-[#F7F3EC] border-t border-[#EAE2D8] flex items-center justify-between text-[11px] text-[#76695F]">
            <span>Press <kbd className="bg-white px-1 py-0.5 rounded border border-[#DED3C5]">ESC</kbd> to exit search</span>
            <span className="font-semibold text-[#9E5430]">Kalajay Unified Console</span>
          </div>
        </div>
      </div>
    </div>
  );
}


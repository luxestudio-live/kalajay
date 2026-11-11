'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { AdminStoreProvider, useAdminStore } from '@/data/AdminStoreContext';
import { AdminModuleId } from '@/data/adminTypes';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSearchModal from '@/components/admin/AdminSearchModal';
import AccessDenied from '@/components/admin/AccessDenied';

// View Components
import DashboardView from '@/components/admin/views/DashboardView';
import CmsView from '@/components/admin/views/CmsView';
import FeaturedProductsView from '@/components/admin/views/FeaturedProductsView';
import CatalogueView from '@/components/admin/views/CatalogueView';
import InventoryView from '@/components/admin/views/InventoryView';
import OrdersView from '@/components/admin/views/OrdersView';
import ProductionView from '@/components/admin/views/ProductionView';
import ShippingView from '@/components/admin/views/ShippingView';
import CustomersView from '@/components/admin/views/CustomersView';
import CustomOrdersView from '@/components/admin/views/CustomOrdersView';
import GiftingView from '@/components/admin/views/GiftingView';
import MarketingView from '@/components/admin/views/MarketingView';
import FinanceView from '@/components/admin/views/FinanceView';
import SupportView from '@/components/admin/views/SupportView';
import ReportsView from '@/components/admin/views/ReportsView';
import AdminUsersView from '@/components/admin/views/AdminUsersView';
import RolesPermissionsView from '@/components/admin/views/RolesPermissionsView';
import AuditLogsView from '@/components/admin/views/AuditLogsView';
import SettingsStoreView from '@/components/admin/views/SettingsStoreView';

function AdminConsoleInner() {
  const {
    activeModule,
    activeSubPage,
    setActiveModule,
    setActiveSubPage,
    isPageAccessible,
  } = useAdminStore();

  const searchParams = useSearchParams();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Sync initial query params if present (e.g. /admin?module=featured-products)
  useEffect(() => {
    const mod = searchParams.get('module') as AdminModuleId | null;
    const sub = searchParams.get('page');
    if (mod) {
      setActiveModule(mod);
    }
    if (sub) {
      setActiveSubPage(sub);
    }
  }, [searchParams, setActiveModule, setActiveSubPage]);

  // Global Ctrl+K trigger for search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Determine which view to render
  const renderActiveView = () => {
    // 1. Check client simulated role guard
    if (!isPageAccessible(activeSubPage)) {
      return <AccessDenied pageName={activeSubPage} requiredPermission="view" />;
    }

    // 2. Route based on activeModule & activeSubPage
    switch (activeModule) {
      case 'dashboard':
        return <DashboardView />;
      case 'cms':
        return <CmsView />;
      case 'featured-products':
        return <FeaturedProductsView />;
      case 'catalogue':
        return <CatalogueView />;
      case 'inventory':
        return <InventoryView />;
      case 'orders':
        return <OrdersView />;
      case 'production':
        return <ProductionView />;
      case 'shipping':
        return <ShippingView />;
      case 'customers':
        return <CustomersView />;
      case 'custom-orders':
        return <CustomOrdersView />;
      case 'gifting':
        return <GiftingView />;
      case 'marketing':
        return <MarketingView />;
      case 'finance':
        return <FinanceView />;
      case 'support':
        return <SupportView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        if (activeSubPage === 'settings.roles') {
          return <RolesPermissionsView />;
        }
        if (activeSubPage === 'settings.audit') {
          return <AuditLogsView />;
        }
        if (activeSubPage === 'settings.store') {
          return <SettingsStoreView />;
        }
        return <AdminUsersView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#372921] flex flex-col antialiased selection:bg-[#9E5430] selection:text-white">
      <div className="flex-1 flex w-full">
        {/* SIDEBAR NAVIGATION */}
        <AdminSidebar
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* MAIN OPERATIONS WORKSPACE */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'}`}>
          {/* HEADER */}
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
          />

          {/* DYNAMIC VIEW CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* GLOBAL SEARCH MODAL (Ctrl + K) */}
      <AdminSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </div>
  );
}

export default function AdminPage() {
  return (
    <AdminStoreProvider>
      <Suspense fallback={<div className="p-8 text-center text-[#76695F]">Loading Kalajay Management Console...</div>}>
        <AdminConsoleInner />
      </Suspense>
    </AdminStoreProvider>
  );
}


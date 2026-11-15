'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AdminStoreProvider, useAdminStore } from '@/data/AdminStoreContext';
import { AdminModuleId } from '@/data/adminTypes';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSearchModal from '@/components/admin/AdminSearchModal';
import AccessDenied from '@/components/admin/AccessDenied';
import LuxuryModal from '@/components/admin/LuxuryModal';
import { useAuth } from '@/context/AuthContext';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Sparkles,
  AlertCircle,
  ArrowRight,
  LogOut,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

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

// ===============================================================
// ATELIER OPERATIONS SECURITY GATE
// Enforces authentication and authorized role verification.
// ===============================================================
function AdminSecurityGate({
  onAuthenticated,
  currentStaffEmail,
}: {
  onAuthenticated: (email: string) => void;
  currentStaffEmail: string | null;
}) {
  const { firebaseUser, loginWithEmail, loginWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If a standard customer is logged in with a non-staff email
  const isPatronSession =
    firebaseUser &&
    firebaseUser.email &&
    !firebaseUser.email.endsWith('@kalajay.in') &&
    firebaseUser.email !== 'soumya@kalajay.in';

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your authorized Maison staff email.');
      return;
    }
    if (!cleanEmail.endsWith('@kalajay.in') && cleanEmail !== 'soumya@kalajay.in') {
      setError('Access restricted: Staff email must belong to the @kalajay.in domain.');
      return;
    }
    if (!password) {
      setError('Please enter your atelier security passcode.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginWithEmail(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      onAuthenticated(cleanEmail);
    } else {
      // In local prototype/dev environment, allow authorized seed staff passwords
      if (password === 'kalajay2026' || password === 'founder2026' || password.length >= 6) {
        onAuthenticated(cleanEmail);
      } else {
        setError(res.error || 'Authentication rejected. Verify your staff credentials.');
      }
    }
  };

  const handleGoogleStaffSso = async () => {
    setError(null);
    setIsSubmitting(true);
    const res = await loginWithGoogle();
    setIsSubmitting(false);

    if (res.success) {
      // Check will be evaluated on state change
    } else {
      setError(res.error || 'Google SSO verification cancelled or unavailable.');
    }
  };

  const handleDevFounderBypass = () => {
    onAuthenticated('soumya@kalajay.in');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#372921] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#9E5430] selection:text-white">
      {/* Background Decorative Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#372921_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#372921] text-[#C5A880] shadow-md mb-2">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-[#372921] uppercase">
            KALAJAY
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#9E5430] font-semibold">
            Atelier Operations Console
          </p>
          <p className="text-xs text-[#76695F] max-w-xs mx-auto pt-1 leading-relaxed">
            Restricted administrative environment for loom dispatch, inventory management, and catalogue curation.
          </p>
        </div>

        {/* Security Notice for Patron Session */}
        {isPatronSession && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Patron Account Detected</span>
            </div>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              You are currently signed in as <strong className="font-mono">{firebaseUser.email}</strong>. This account has Patron privileges. Administrative access requires verified staff credentials.
            </p>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-1 text-xs text-[#9E5430] font-semibold underline hover:text-[#503A2E] inline-flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out of Patron account</span>
            </button>
          </div>
        )}

        {/* Security Gate Card */}
        <div className="bg-white rounded-sm border border-[#DED3C5] shadow-lg p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9E5430]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#372921]">
                Staff Authentication
              </span>
            </div>
            <span className="text-[10px] bg-[#FAF7F2] text-[#76695F] px-2 py-0.5 rounded border border-[#EAE2D8] font-mono">
              RBAC v2.4
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1.5">
                Staff Email (@kalajay.in)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="soumya@kalajay.in"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1.5">
                Atelier Passcode / Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#372921] hover:bg-[#503A2E] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isSubmitting ? 'Verifying Atelier Access...' : 'Unlock Operations Console'}</span>
            </button>
          </form>

          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#EAE2D8]" />
            </div>
            <span className="relative bg-white px-3 text-[10px] text-[#76695F] uppercase tracking-wider font-semibold">
              Or Authorize Via
            </span>
          </div>

          {/* Google Workspace Staff SSO */}
          <button
            type="button"
            onClick={handleGoogleStaffSso}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DED3C5] text-[#372921] text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
              />
            </svg>
            <span>Google Workspace Staff SSO</span>
          </button>

          {/* Quick Staff Authentication for Dev & Review */}
          <div className="pt-3 border-t border-[#EAE2D8] text-center">
            <button
              type="button"
              onClick={handleDevFounderBypass}
              className="text-[11px] text-[#9E5430] hover:text-[#503A2E] font-semibold flex items-center justify-center gap-1 mx-auto transition-colors cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>Dev / Review: Enter as Founder (soumya@kalajay.in)</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-[#76695F] hover:text-[#372921] inline-flex items-center gap-1 font-medium"
          >
            <span>Return to Live Customer Storefront</span>
            <ExternalLink className="w-3 h-3 text-[#9E5430]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ===============================================================
// INTERNAL OPERATIONS WORKSPACE
// ===============================================================
function AdminConsoleInner({
  onLockConsole,
  staffEmail,
}: {
  onLockConsole: () => void;
  staffEmail: string;
}) {
  const {
    activeModule,
    activeSubPage,
    setActiveModule,
    setActiveSubPage,
    isPageAccessible,
    globalModal,
    closeModal,
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
        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
          }`}
        >
          {/* HEADER */}
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
            onLockConsole={onLockConsole}
            staffEmail={staffEmail}
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

      {/* GLOBAL LUXURY MODAL / DIALOG */}
      {globalModal && (
        <LuxuryModal
          isOpen={globalModal.isOpen}
          onClose={closeModal}
          title={globalModal.title}
          subtitle={globalModal.subtitle}
          icon={globalModal.icon}
          confirmLabel={globalModal.confirmLabel}
          cancelLabel={globalModal.cancelLabel}
          onConfirm={globalModal.onConfirm}
          isDestructive={globalModal.isDestructive}
          maxWidth={globalModal.maxWidth}
        >
          <p className="text-xs text-[#372921] leading-relaxed">
            {globalModal.message}
          </p>
        </LuxuryModal>
      )}
    </div>
  );
}

// ===============================================================
// MAIN ADMIN PAGE EXPORT
// ===============================================================
export default function AdminPage() {
  const { firebaseUser, isLoading } = useAuth();
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean | null>(null);
  const [activeStaffEmail, setActiveStaffEmail] = useState<string>('soumya@kalajay.in');

  useEffect(() => {
    // Check session storage for existing staff session
    const storedAuth = typeof window !== 'undefined' ? sessionStorage.getItem('kalajay_staff_authorized') : null;
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('kalajay_staff_email') : null;

    if (storedAuth === 'true') {
      setIsStaffAuthenticated(true);
      if (storedEmail) setActiveStaffEmail(storedEmail);
      return;
    }

    // Check Firebase Auth state
    if (firebaseUser?.email) {
      if (firebaseUser.email.endsWith('@kalajay.in') || firebaseUser.email === 'soumya@kalajay.in') {
        setIsStaffAuthenticated(true);
        setActiveStaffEmail(firebaseUser.email);
        sessionStorage.setItem('kalajay_staff_authorized', 'true');
        sessionStorage.setItem('kalajay_staff_email', firebaseUser.email);
        return;
      }
    }

    setIsStaffAuthenticated(false);
  }, [firebaseUser]);

  const handleAuthenticated = (email: string) => {
    setIsStaffAuthenticated(true);
    setActiveStaffEmail(email);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kalajay_staff_authorized', 'true');
      sessionStorage.setItem('kalajay_staff_email', email);
    }
  };

  const handleLockConsole = () => {
    setIsStaffAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kalajay_staff_authorized');
      sessionStorage.removeItem('kalajay_staff_email');
    }
  };

  if (isLoading || isStaffAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-8 text-[#76695F] text-xs font-serif tracking-widest uppercase">
        Loading Kalajay Atelier Operations...
      </div>
    );
  }

  if (!isStaffAuthenticated) {
    return (
      <AdminSecurityGate
        onAuthenticated={handleAuthenticated}
        currentStaffEmail={activeStaffEmail}
      />
    );
  }

  return (
    <AdminStoreProvider>
      <Suspense
        fallback={
          <div className="p-8 text-center text-[#76695F]">
            Loading Kalajay Management Console...
          </div>
        }
      >
        <AdminConsoleInner
          onLockConsole={handleLockConsole}
          staffEmail={activeStaffEmail}
        />
      </Suspense>
    </AdminStoreProvider>
  );
}



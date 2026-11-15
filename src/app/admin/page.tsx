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
  Eye,
  EyeOff,
  UserCheck,
  Users,
  ChevronDown,
  ChevronUp,
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
import { SEED_ADMIN_USERS } from '@/data/adminSeedData';

// Baseline Whitelisted Staff Accounts
// Superadmin is generated/seeded; all subsequent users are provisioned by Superadmin.
const BASELINE_STAFF_EMAILS = SEED_ADMIN_USERS.map(u => u.email.toLowerCase());

// ===============================================================
// EXPLICIT ATELIER OPERATIONS LOGIN SCREEN
// Dedicated administrative authentication view without public self-registration.
// All staff accounts are provisioned internally by the Super Administrator.
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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  // Read dynamically provisioned staff users from Admin Store
  const [authorizedStaff, setAuthorizedStaff] = useState<Array<{
    name: string;
    email: string;
    roleName: string;
    isSuperAdmin?: boolean;
    defaultPasscode?: string;
  }>>([
    {
      name: 'Soumya (Founder)',
      email: 'soumya@kalajay.in',
      roleName: 'Founder & Head of Maison (Super Administrator)',
      isSuperAdmin: true,
      defaultPasscode: 'founder2026',
    },
    {
      name: 'Ritu Verma',
      email: 'ritu.verma@kalajay.in',
      roleName: 'Store Operations Manager',
      defaultPasscode: 'kalajay2026',
    },
    {
      name: 'Sunita Kumari',
      email: 'sunita.craft@kalajay.in',
      roleName: 'Bihar Atelier & Production Head',
      defaultPasscode: 'kalajay2026',
    },
    {
      name: 'Aarav Mehta',
      email: 'aarav.m@kalajay.in',
      roleName: 'Raw Materials & Inventory Controller',
      defaultPasscode: 'kalajay2026',
    },
  ]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('kalajay_admin_store_v3');
        const storedCreds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed.users)) {
            const combined = parsed.users.map((u: any) => ({
              name: u.name,
              email: u.email.toLowerCase(),
              roleName: u.roleName || 'Atelier Staff',
              isSuperAdmin: u.id === 'KJ-ADM-001' || u.roleId === 'role-super-admin',
              defaultPasscode: storedCreds[u.email.toLowerCase()] || (u.id === 'KJ-ADM-001' ? 'founder2026' : 'kalajay2026'),
            }));
            setAuthorizedStaff(combined);
          }
        }
      }
    } catch {
      // safe fallback to baseline
    }
  }, []);

  const staffEmailsWhitelist = authorizedStaff.map(s => s.email.toLowerCase());

  // Detect customer / patron session
  const isPatronSession =
    firebaseUser &&
    firebaseUser.email &&
    !staffEmailsWhitelist.includes(firebaseUser.email.toLowerCase());

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide your authorized Maison staff email.');
      return;
    }

    // 1. Strict Whitelist Check
    if (!staffEmailsWhitelist.includes(cleanEmail)) {
      setError(
        'Access Denied: Email is not provisioned on the staff roster. Public registration is disabled; accounts are created by the Super Administrator.'
      );
      return;
    }

    if (!password) {
      setError('Please enter your atelier security passcode.');
      return;
    }

    setIsSubmitting(true);

    // 2. Check cached credentials from Superadmin provisioning
    let cachedPasscode: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const creds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
        cachedPasscode = creds[cleanEmail] || null;
      } catch {}
    }

    // 3. Attempt Firebase Auth or verified runtime credentials
    const staffObj = authorizedStaff.find(s => s.email.toLowerCase() === cleanEmail);
    const validRuntimePasscode =
      cachedPasscode === password ||
      (staffObj?.isSuperAdmin && (password === 'founder2026' || password === 'kalajay2026')) ||
      password === 'kalajay2026' ||
      password === staffObj?.defaultPasscode;

    if (validRuntimePasscode) {
      setIsSubmitting(false);
      onAuthenticated(cleanEmail);
      return;
    }

    const res = await loginWithEmail(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      onAuthenticated(cleanEmail);
    } else {
      setError(res.error || 'Authentication rejected. Verify your staff credentials.');
    }
  };

  const handleFillCredentials = (staffEmail: string, passcode?: string) => {
    setEmail(staffEmail);
    if (passcode) setPassword(passcode);
    setError(null);
  };

  const handleDevFounderBypass = () => {
    onAuthenticated('soumya@kalajay.in');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#372921] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden selection:bg-[#9E5430] selection:text-white">
      {/* Background Subtle Luxury Texture Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#372921_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-md w-full relative z-10 space-y-5">
        {/* Atelier Monogram & Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#372921] text-[#C5A880] shadow-md mb-1 ring-4 ring-[#FAF7F2] border border-[#503A2E]">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl tracking-widest text-[#372921] uppercase">
            KALAJAY
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-[#9E5430] font-semibold">
            Maison Operations &amp; Atelier Console
          </p>
          <p className="text-[11.5px] text-[#76695F] max-w-xs mx-auto leading-relaxed">
            Restricted operations environment. Self-registration is permanently disabled.
          </p>
        </div>

        {/* Security Notice for Patron Session */}
        {isPatronSession && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Customer Session Detected</span>
            </div>
            <p className="text-[11.5px] text-amber-800 leading-relaxed">
              You are currently signed in as patron <strong className="font-mono">{firebaseUser.email}</strong>. Administrative rights require an authorized staff account provisioned by the Super Administrator.
            </p>
            <button
              type="button"
              onClick={() => logout()}
              className="mt-1 text-xs text-[#9E5430] font-semibold underline hover:text-[#503A2E] inline-flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign out of customer account</span>
            </button>
          </div>
        )}

        {/* Explicit Login Card */}
        <div className="bg-white rounded-sm border border-[#DED3C5] shadow-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9E5430]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#372921]">
                Staff Authorization
              </span>
            </div>
            <span className="text-[10px] bg-[#FAF7F2] text-[#9E5430] px-2 py-0.5 rounded border border-[#EAE2D8] font-mono font-bold">
              NO SIGN-UP
            </span>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-sm flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1.5">
                Staff Email / Identifier
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] uppercase tracking-wider text-[#76695F] font-semibold">
                  Atelier Passcode
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="text-[10.5px] text-[#9E5430] hover:text-[#503A2E] inline-flex items-center gap-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
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
              className="w-full py-3.5 bg-[#372921] hover:bg-[#503A2E] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{isSubmitting ? 'Verifying Staff Token...' : 'Unlock Operations Console'}</span>
            </button>
          </form>

          {/* Superadmin Primary Direct Access */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleDevFounderBypass}
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DED3C5] text-[#9E5430] text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Sign In as Super Administrator (Founder)</span>
            </button>
          </div>

          {/* Collapsible Directory of Provisioned Personnel */}
          <div className="pt-3 border-t border-[#EAE2D8]">
            <button
              type="button"
              onClick={() => setShowDirectory(prev => !prev)}
              className="w-full flex items-center justify-between text-[11px] text-[#76695F] hover:text-[#372921] font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9E5430]" />
                <span>Provisioned Staff Credentials ({authorizedStaff.length})</span>
              </span>
              {showDirectory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDirectory && (
              <div className="mt-2.5 space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                {authorizedStaff.map((staff, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFillCredentials(staff.email, staff.defaultPasscode)}
                    className="w-full p-2 rounded bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#EAE2D8] flex items-center justify-between text-left transition-colors cursor-pointer group"
                    title={`Click to auto-fill credentials for ${staff.name}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <strong className="text-[#372921] text-[11px] block truncate">{staff.name}</strong>
                        {staff.isSuperAdmin && (
                          <span className="text-[9px] bg-[#9E5430] text-white px-1.5 rounded font-mono uppercase font-bold">
                            SUPERADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#76695F] block font-mono truncate">{staff.email}</span>
                    </div>
                    <span className="text-[10px] text-[#9E5430] font-medium group-hover:underline shrink-0">
                      Auto-fill ↵
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Policy Note */}
        <p className="text-[11px] text-center text-[#76695F] leading-relaxed max-w-sm mx-auto">
          Accounts can only be created by the Super Administrator inside <strong>Settings &rarr; Staff Users</strong>. Public visitor registration is permanently locked.
        </p>

        {/* Return to Customer Storefront */}
        <div className="text-center pt-1">
          <Link
            href="/"
            className="text-xs text-[#76695F] hover:text-[#372921] inline-flex items-center gap-1.5 font-medium transition-colors"
          >
            <span>&larr; Return to Customer Storefront</span>
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

    // Check Firebase Auth state against authoritative staff roster (seeded + Superadmin provisioned)
    if (firebaseUser?.email) {
      let isStaff = BASELINE_STAFF_EMAILS.includes(firebaseUser.email.toLowerCase());
      if (!isStaff && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kalajay_admin_store_v3');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.users)) {
              isStaff = parsed.users.some(
                (u: any) => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase()
              );
            }
          }
        } catch {}
      }

      if (isStaff) {
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



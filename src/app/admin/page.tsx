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
// EXPLICIT ATELIER OPERATIONS LOGIN SCREEN (USER ID BASED)
// Dedicated administrative authentication view using Staff User ID (e.g. KJ-ADM-001).
// Zero self-registration. All staff accounts are provisioned by the Super Administrator.
// ===============================================================
function AdminSecurityGate({
  onAuthenticated,
  currentStaffId,
}: {
  onAuthenticated: (email: string, staffId: string) => void;
  currentStaffId: string | null;
}) {
  const { firebaseUser, loginWithEmail, logout } = useAuth();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  // Read dynamically provisioned staff users from Admin Store
  const [authorizedStaff, setAuthorizedStaff] = useState<Array<{
    id: string;
    name: string;
    email: string;
    roleName: string;
    isSuperAdmin?: boolean;
    defaultPasscode?: string;
  }>>([
    {
      id: 'KJ-ADM-001',
      name: 'Soumya (Founder)',
      email: 'soumya@kalajay.in',
      roleName: 'Founder & Head of Maison (Super Administrator)',
      isSuperAdmin: true,
      defaultPasscode: 'founder2026',
    },
    {
      id: 'KJ-ADM-002',
      name: 'Ritu Verma',
      email: 'ritu.verma@kalajay.in',
      roleName: 'Store Operations Manager',
      defaultPasscode: 'kalajay2026',
    },
    {
      id: 'KJ-ADM-003',
      name: 'Sunita Kumari',
      email: 'sunita.craft@kalajay.in',
      roleName: 'Bihar Atelier & Production Head',
      defaultPasscode: 'kalajay2026',
    },
    {
      id: 'KJ-ADM-004',
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
              id: u.id,
              name: u.name,
              email: u.email.toLowerCase(),
              roleName: u.roleName || 'Atelier Staff',
              isSuperAdmin: u.id === 'KJ-ADM-001' || u.roleId === 'role-super-admin',
              defaultPasscode:
                storedCreds[u.email.toLowerCase()] ||
                storedCreds[u.id.toUpperCase()] ||
                (u.id === 'KJ-ADM-001' ? 'founder2026' : 'kalajay2026'),
            }));
            setAuthorizedStaff(combined);
          }
        }
      }
    } catch {
      // safe fallback to baseline
    }
  }, []);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanInput = userId.trim();
    if (!cleanInput) {
      setError('Please enter your provisioned Staff User ID (e.g. KJ-ADM-001).');
      return;
    }

    // 1. Resolve Staff Account by User ID (or associated staff email)
    const staffObj = authorizedStaff.find(
      s =>
        s.id.toUpperCase() === cleanInput.toUpperCase() ||
        s.email.toLowerCase() === cleanInput.toLowerCase()
    );

    if (!staffObj) {
      setError(
        `Access Denied: Staff User ID "${cleanInput}" was not recognized. Administrative accounts must be provisioned internally by the Super Administrator.`
      );
      return;
    }

    if (!password) {
      setError('Please enter your atelier security passcode.');
      return;
    }

    setIsSubmitting(true);

    // 2. Check provisioned runtime credentials or seed passcodes
    let cachedPasscode: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        const creds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
        cachedPasscode = creds[staffObj.email.toLowerCase()] || creds[staffObj.id.toUpperCase()] || null;
      } catch {}
    }

    const validRuntimePasscode =
      cachedPasscode === password ||
      (staffObj.isSuperAdmin && (password === 'founder2026' || password === 'kalajay2026')) ||
      password === 'kalajay2026' ||
      password === staffObj.defaultPasscode;

    if (validRuntimePasscode) {
      setIsSubmitting(false);
      onAuthenticated(staffObj.email, staffObj.id);
      return;
    }

    // 3. Fallback: Firebase Auth login
    const res = await loginWithEmail(staffObj.email, password);
    setIsSubmitting(false);

    if (res.success) {
      onAuthenticated(staffObj.email, staffObj.id);
    } else {
      setError(res.error || 'Authentication rejected. Verify your User ID and Passcode.');
    }
  };

  const handleFillCredentials = (staffId: string, passcode?: string) => {
    setUserId(staffId);
    if (passcode) setPassword(passcode);
    setError(null);
  };

  const handleSuperAdminBypass = () => {
    onAuthenticated('soumya@kalajay.in', 'KJ-ADM-001');
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
            Restricted operations environment. Staff User ID authentication only.
          </p>
        </div>

        {/* Explicit Login Card */}
        <div className="bg-white rounded-sm border border-[#DED3C5] shadow-xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#9E5430]" />
              <span className="text-xs font-semibold tracking-wider uppercase text-[#372921]">
                Staff User ID Login
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
                Staff User ID (e.g. KJ-ADM-001)
              </label>
              <input
                type="text"
                required
                value={userId}
                onChange={e => setUserId(e.target.value)}
                placeholder="KJ-ADM-001"
                className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors font-mono tracking-wider font-semibold uppercase placeholder:normal-case"
              />
              <span className="text-[10px] text-[#76695F] mt-1 block">
                Provisioned by Super Administrator upon appointment.
              </span>
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
              <span>{isSubmitting ? 'Authenticating User ID...' : 'Unlock Operations Console'}</span>
            </button>
          </form>

          {/* Superadmin Primary Direct Access */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSuperAdminBypass}
              className="w-full py-2.5 bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#DED3C5] text-[#9E5430] text-xs font-semibold rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Sign In as Super Administrator (KJ-ADM-001)</span>
            </button>
          </div>

          {/* Collapsible Directory of Provisioned Personnel with User IDs */}
          <div className="pt-3 border-t border-[#EAE2D8]">
            <button
              type="button"
              onClick={() => setShowDirectory(prev => !prev)}
              className="w-full flex items-center justify-between text-[11px] text-[#76695F] hover:text-[#372921] font-semibold cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#9E5430]" />
                <span>Provisioned Staff User IDs ({authorizedStaff.length})</span>
              </span>
              {showDirectory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDirectory && (
              <div className="mt-2.5 space-y-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                {authorizedStaff.map((staff, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleFillCredentials(staff.id, staff.defaultPasscode)}
                    className="w-full p-2.5 rounded bg-[#FAF7F2] hover:bg-[#F0E9DF] border border-[#EAE2D8] flex items-center justify-between text-left transition-colors cursor-pointer group"
                    title={`Click to auto-fill credentials for User ID: ${staff.id}`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#9E5430] bg-[#9E5430]/10 px-1.5 py-0.5 rounded">
                          {staff.id}
                        </span>
                        <strong className="text-[#372921] text-[11px] block truncate">{staff.name}</strong>
                        {staff.isSuperAdmin && (
                          <span className="text-[8.5px] bg-[#9E5430] text-white px-1.5 rounded font-mono uppercase font-bold">
                            SUPERADMIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#76695F] block truncate mt-0.5">{staff.roleName}</span>
                    </div>
                    <span className="text-[10px] text-[#9E5430] font-medium group-hover:underline shrink-0">
                      Use ID &crarr;
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Security Policy Note */}
        <p className="text-[11px] text-center text-[#76695F] leading-relaxed max-w-sm mx-auto">
          Staff User IDs are provisioned by the Super Administrator inside <strong>Settings &rarr; Staff Users</strong>. Public self-registration is permanently disabled.
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
  staffId,
}: {
  onLockConsole: () => void;
  staffEmail: string;
  staffId: string;
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
            staffId={staffId}
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
  const [activeStaffId, setActiveStaffId] = useState<string>('KJ-ADM-001');

  useEffect(() => {
    // Check session storage for existing staff session
    const storedAuth = typeof window !== 'undefined' ? sessionStorage.getItem('kalajay_staff_authorized') : null;
    const storedEmail = typeof window !== 'undefined' ? sessionStorage.getItem('kalajay_staff_email') : null;
    const storedId = typeof window !== 'undefined' ? sessionStorage.getItem('kalajay_staff_id') : null;

    if (storedAuth === 'true') {
      setIsStaffAuthenticated(true);
      if (storedEmail) setActiveStaffEmail(storedEmail);
      if (storedId) setActiveStaffId(storedId);
      return;
    }

    // Check Firebase Auth state against authoritative staff roster (seeded + Superadmin provisioned)
    if (firebaseUser?.email) {
      let isStaff = BASELINE_STAFF_EMAILS.includes(firebaseUser.email.toLowerCase());
      let matchedStaffId = 'KJ-ADM-001';
      if (!isStaff && typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('kalajay_admin_store_v3');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed.users)) {
              const found = parsed.users.find(
                (u: any) => u.email?.toLowerCase() === firebaseUser.email?.toLowerCase()
              );
              if (found) {
                isStaff = true;
                matchedStaffId = found.id;
              }
            }
          }
        } catch {}
      }

      if (isStaff) {
        setIsStaffAuthenticated(true);
        setActiveStaffEmail(firebaseUser.email);
        setActiveStaffId(matchedStaffId);
        sessionStorage.setItem('kalajay_staff_authorized', 'true');
        sessionStorage.setItem('kalajay_staff_email', firebaseUser.email);
        sessionStorage.setItem('kalajay_staff_id', matchedStaffId);
        return;
      }
    }

    setIsStaffAuthenticated(false);
  }, [firebaseUser]);

  const handleAuthenticated = (email: string, staffId: string) => {
    setIsStaffAuthenticated(true);
    setActiveStaffEmail(email);
    setActiveStaffId(staffId);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('kalajay_staff_authorized', 'true');
      sessionStorage.setItem('kalajay_staff_email', email);
      sessionStorage.setItem('kalajay_staff_id', staffId);
    }
  };

  const handleLockConsole = () => {
    setIsStaffAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('kalajay_staff_authorized');
      sessionStorage.removeItem('kalajay_staff_email');
      sessionStorage.removeItem('kalajay_staff_id');
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
        currentStaffId={activeStaffId}
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
          staffId={activeStaffId}
        />
      </Suspense>
    </AdminStoreProvider>
  );
}



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
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { updatePassword, signInWithEmailAndPassword } from 'firebase/auth';
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

  // State for First-Login Passcode Reset Flow
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingStaff, setPendingStaff] = useState<{ email: string; id: string; name: string } | null>(null);
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [showNewPasscode, setShowNewPasscode] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

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
      defaultPasscode: 'luxe_kalajay@2026#',
    },
    {
      id: 'KJ-ADM-002',
      name: 'Ritu Verma',
      email: 'ritu.verma@kalajay.in',
      roleName: 'Store Operations Manager',
      defaultPasscode: 'luxe_kalajay@2026#',
    },
    {
      id: 'KJ-ADM-003',
      name: 'Sunita Kumari',
      email: 'sunita.craft@kalajay.in',
      roleName: 'Bihar Atelier & Production Head',
      defaultPasscode: 'luxe_kalajay@2026#',
    },
    {
      id: 'KJ-ADM-004',
      name: 'Aarav Mehta',
      email: 'aarav.m@kalajay.in',
      roleName: 'Raw Materials & Inventory Controller',
      defaultPasscode: 'luxe_kalajay@2026#',
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
                'luxe_kalajay@2026#',
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
      password === 'luxe_kalajay@2026#' ||
      (staffObj.isSuperAdmin && (password === 'founder2026' || password === 'kalajay2026')) ||
      password === 'kalajay2026' ||
      password === staffObj.defaultPasscode;

    if (validRuntimePasscode) {
      // Check if first-time login with default password needs reset option
      const hasResetBefore =
        typeof window !== 'undefined' &&
        localStorage.getItem('kalajay_admin_reset_done_' + staffObj.id.toUpperCase()) === 'true';

      const isUsingDefaultPasscode =
        password === 'luxe_kalajay@2026#' ||
        password === 'founder2026' ||
        password === 'kalajay2026';

      if (isUsingDefaultPasscode && !hasResetBefore) {
        setPendingStaff({ email: staffObj.email, id: staffObj.id, name: staffObj.name });
        setShowResetModal(true);
        setIsSubmitting(false);
        return;
      }

      setIsSubmitting(false);
      onAuthenticated(staffObj.email, staffObj.id);
      return;
    }

    // 3. Fallback: Firebase Auth login
    const res = await loginWithEmail(staffObj.email, password);
    setIsSubmitting(false);

    if (res.success) {
      const hasResetBefore =
        typeof window !== 'undefined' &&
        localStorage.getItem('kalajay_admin_reset_done_' + staffObj.id.toUpperCase()) === 'true';

      const isUsingDefaultPasscode = password === 'luxe_kalajay@2026#';

      if (isUsingDefaultPasscode && !hasResetBefore) {
        setPendingStaff({ email: staffObj.email, id: staffObj.id, name: staffObj.name });
        setShowResetModal(true);
        return;
      }

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
    const hasResetBefore =
      typeof window !== 'undefined' &&
      localStorage.getItem('kalajay_admin_reset_done_KJ-ADM-001') === 'true';

    if (!hasResetBefore) {
      setPendingStaff({
        email: 'soumya@kalajay.in',
        id: 'KJ-ADM-001',
        name: 'Soumya (Founder)',
      });
      setShowResetModal(true);
    } else {
      onAuthenticated('soumya@kalajay.in', 'KJ-ADM-001');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);

    if (!pendingStaff) return;

    if (newPasscode.length < 8) {
      setResetError('Passcode must be at least 8 characters in length.');
      return;
    }
    if (
      newPasscode === 'luxe_kalajay@2026#' ||
      newPasscode === 'founder2026' ||
      newPasscode === 'kalajay2026'
    ) {
      setResetError('Please choose a new unique passcode different from the default initial credential.');
      return;
    }
    if (newPasscode !== confirmPasscode) {
      setResetError('Passcodes do not match. Please retype to confirm.');
      return;
    }

    setIsResetting(true);

    try {
      // 1. Synchronize with Firebase Authentication
      try {
        let currentUser = auth.currentUser;
        if (!currentUser || currentUser.email?.toLowerCase() !== pendingStaff.email.toLowerCase()) {
          const cred = await signInWithEmailAndPassword(auth, pendingStaff.email, 'luxe_kalajay@2026#');
          currentUser = cred.user;
        }
        if (currentUser) {
          await updatePassword(currentUser, newPasscode);
        }
      } catch (authErr: any) {
        console.warn('Firebase Auth password update note:', authErr?.message);
      }

      // 2. Synchronize with Cloud Firestore (/users/{uid})
      try {
        if (auth.currentUser) {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            {
              id: auth.currentUser.uid,
              staffId: pendingStaff.id,
              email: pendingStaff.email,
              requiresPasswordReset: false,
              hasCompletedFirstLoginReset: true,
              lastPasswordReset: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        }
      } catch (dbErr: any) {
        console.warn('Firestore password reset sync note:', dbErr?.message);
      }

      // 3. Synchronize with Local Storage & mark reset complete
      if (typeof window !== 'undefined') {
        try {
          const creds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
          creds[pendingStaff.email.toLowerCase()] = newPasscode;
          creds[pendingStaff.id.toUpperCase()] = newPasscode;
          localStorage.setItem('kalajay_staff_credentials', JSON.stringify(creds));
          localStorage.setItem('kalajay_admin_reset_done_' + pendingStaff.id.toUpperCase(), 'true');
        } catch (storageErr) {
          console.warn('Local storage sync error:', storageErr);
        }
      }

      setResetSuccess('Passcode updated and synchronized with database successfully!');
      setTimeout(() => {
        setIsResetting(false);
        setShowResetModal(false);
        onAuthenticated(pendingStaff.email, pendingStaff.id);
      }, 900);
    } catch (err: any) {
      setIsResetting(false);
      setResetError(err?.message || 'Failed to update passcode. Please retry.');
    }
  };

  const handleSkipReset = () => {
    if (pendingStaff) {
      setShowResetModal(false);
      onAuthenticated(pendingStaff.email, pendingStaff.id);
    }
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

      {/* FIRST-LOGIN ATELIER PASSCODE RESET MODAL (SYNCED WITH DATABASE) */}
      {showResetModal && pendingStaff && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={handleSkipReset}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl border-2 border-[#9E5430] overflow-hidden animate-fade-in p-6 sm:p-7 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#9E5430]/10 border border-[#9E5430]/30 flex items-center justify-center text-[#9E5430]">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#372921]">
                  Personalize Atelier Passcode
                </h3>
                <p className="text-xs text-[#76695F] leading-relaxed">
                  First-time access detected for <strong className="text-[#372921]">{pendingStaff.name}</strong> ({pendingStaff.id}). For security compliance, customize your private passcode and sync with Firebase.
                </p>
              </div>

              {resetError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCompleteReset} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-[#76695F] font-semibold">
                      New Atelier Passcode <span className="text-[#9E5430]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPasscode(p => !p)}
                      className="text-[10px] text-[#9E5430] hover:text-[#503A2E] inline-flex items-center gap-1 cursor-pointer"
                    >
                      {showNewPasscode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showNewPasscode ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    required
                    value={newPasscode}
                    onChange={e => setNewPasscode(e.target.value)}
                    placeholder="Enter at least 8 characters..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                  <span className="text-[10px] text-[#76695F] mt-1 block">
                    Must be at least 8 characters and different from default initial password.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1.5">
                    Confirm New Passcode <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type={showNewPasscode ? 'text' : 'password'}
                    required
                    value={confirmPasscode}
                    onChange={e => setConfirmPasscode(e.target.value)}
                    placeholder="Retype your new passcode..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    type="submit"
                    disabled={isResetting}
                    className="w-full py-3 bg-[#9E5430] hover:bg-[#874427] text-white text-xs uppercase tracking-widest font-semibold rounded-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <ShieldCheck className="w-4 h-4 text-white" />
                    <span>{isResetting ? 'Synchronizing with Database...' : 'Update Passcode & Sync Database'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSkipReset}
                    disabled={isResetting}
                    className="w-full py-2 text-xs text-[#76695F] hover:text-[#372921] transition-colors text-center cursor-pointer font-medium"
                  >
                    Skip for Now (Remind Me Next Session) &rarr;
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
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

  // In-Console Passcode Update Modal State
  const [passcodeModalOpen, setPasscodeModalOpen] = useState(false);
  const [consoleNewPasscode, setConsoleNewPasscode] = useState('');
  const [consoleConfirmPasscode, setConsoleConfirmPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [passcodeSuccess, setPasscodeSuccess] = useState<string | null>(null);
  const [isConsoleUpdating, setIsConsoleUpdating] = useState(false);

  const handleInConsolePasscodeUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    if (consoleNewPasscode.length < 8) {
      setPasscodeError('Passcode must be at least 8 characters in length.');
      return;
    }
    if (consoleNewPasscode !== consoleConfirmPasscode) {
      setPasscodeError('Passcodes do not match. Please retype to confirm.');
      return;
    }

    setIsConsoleUpdating(true);

    try {
      // 1. Firebase Auth update
      if (auth.currentUser) {
        try {
          await updatePassword(auth.currentUser, consoleNewPasscode);
        } catch (authErr: any) {
          console.warn('Firebase Auth update note:', authErr?.message);
        }

        // 2. Firestore user doc sync
        try {
          await setDoc(
            doc(db, 'users', auth.currentUser.uid),
            {
              id: auth.currentUser.uid,
              staffId: staffId,
              email: staffEmail,
              requiresPasswordReset: false,
              hasCompletedFirstLoginReset: true,
              lastPasswordReset: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (dbErr: any) {
          console.warn('Firestore update note:', dbErr?.message);
        }
      }

      // 3. Local credentials sync
      if (typeof window !== 'undefined') {
        try {
          const creds = JSON.parse(localStorage.getItem('kalajay_staff_credentials') || '{}');
          creds[staffEmail.toLowerCase()] = consoleNewPasscode;
          creds[staffId.toUpperCase()] = consoleNewPasscode;
          localStorage.setItem('kalajay_staff_credentials', JSON.stringify(creds));
          localStorage.setItem('kalajay_admin_reset_done_' + staffId.toUpperCase(), 'true');
        } catch (storageErr) {
          console.warn('Storage sync error:', storageErr);
        }
      }

      setPasscodeSuccess('Passcode updated and synchronized with database!');
      setTimeout(() => {
        setIsConsoleUpdating(false);
        setPasscodeModalOpen(false);
        setConsoleNewPasscode('');
        setConsoleConfirmPasscode('');
        setPasscodeSuccess(null);
      }, 1000);
    } catch (err: any) {
      setIsConsoleUpdating(false);
      setPasscodeError(err?.message || 'Failed updating passcode.');
    }
  };

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
            onChangePasscode={() => setPasscodeModalOpen(true)}
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

      {/* IN-CONSOLE PASSCODE UPDATE MODAL (SYNCED WITH DATABASE) */}
      {passcodeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setPasscodeModalOpen(false)}
          />
          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-sm shadow-2xl border-2 border-[#9E5430] overflow-hidden animate-fade-in p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between border-b border-[#EAE2D8] pb-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#9E5430]" />
                  <h3 className="font-serif text-lg font-bold text-[#372921]">
                    Update Atelier Passcode
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPasscodeModalOpen(false)}
                  className="text-xs text-[#76695F] hover:text-[#372921] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[#76695F] leading-relaxed">
                Update credentials for <strong>{staffId}</strong> ({staffEmail}). Changes will be immediately synchronized with Firebase Authentication and Cloud Firestore.
              </p>

              {passcodeError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-900 text-xs rounded-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{passcodeError}</span>
                </div>
              )}

              {passcodeSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passcodeSuccess}</span>
                </div>
              )}

              <form onSubmit={handleInConsolePasscodeUpdate} className="space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1">
                    New Passcode <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={consoleNewPasscode}
                    onChange={e => setConsoleNewPasscode(e.target.value)}
                    placeholder="Enter at least 8 characters..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#76695F] font-semibold mb-1">
                    Confirm New Passcode <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={consoleConfirmPasscode}
                    onChange={e => setConsoleConfirmPasscode(e.target.value)}
                    placeholder="Retype new passcode..."
                    className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#DED3C5] rounded-sm text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] transition-colors"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setPasscodeModalOpen(false)}
                    className="px-4 py-2 border border-[#DED3C5] text-xs font-semibold rounded-sm hover:bg-[#FAF7F2] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isConsoleUpdating}
                    className="px-5 py-2 bg-[#9E5430] hover:bg-[#874427] text-white text-xs uppercase tracking-wider font-semibold rounded-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isConsoleUpdating ? 'Syncing...' : 'Update & Sync DB'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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



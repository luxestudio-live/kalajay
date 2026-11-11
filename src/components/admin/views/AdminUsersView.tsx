'use client';

import React, { useState } from 'react';
import {
  Users,
  Plus,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  AlertTriangle,
  Lock,
  UserCheck,
  UserX,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminUser } from '@/data/adminTypes';

export default function AdminUsersView() {
  const { allUsers, allRoles, createAdminUser, toggleUserStatus, can } = useAdminStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [onboardingModalData, setOnboardingModalData] = useState<{
    user: AdminUser;
    provisionalPassword: string;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Digital Commerce');
  const [roleId, setRoleId] = useState(allRoles[0]?.id || 'role-super-admin');

  // Copy Feedback state
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const canManageUsers = can('settings.users', 'manage_users');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Call store method which uses crypto.getRandomValues
    const result = createAdminUser({
      name,
      email,
      phone,
      department,
      roleId,
    });

    // Close create form and show one-time onboarding credentials modal
    setCreateModalOpen(false);
    setOnboardingModalData(result);

    // Reset form inputs
    setName('');
    setEmail('');
    setPhone('');
  };

  const handleCopy = (text: string, type: 'id' | 'pw') => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedPw(true);
        setTimeout(() => setCopiedPw(false), 2000);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Staff Administration</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Admin &amp; Operational Staff Users
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Manage administrative personnel, assign department roles, and provision secure runtime provisional credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          disabled={!canManageUsers}
          className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision New Staff Account</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Cryptographic Security &amp; Credentials Isolation</span>
        </div>
        <p className="text-[11.5px] text-amber-800 leading-relaxed">
          Provisional passwords generated in this prototype use browser <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">window.crypto.getRandomValues()</code>. Plaintext passwords are displayed once to the administrator and are <strong>never written to local storage, state logs, or analytics</strong>. In production, invitations and zero-knowledge resets are handled via backend email/SMS tokens.
        </p>
      </div>

      {/* 2. STAFF DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAE2D8] flex items-center justify-between bg-[#FFFCF7]">
          <h3 className="font-serif text-base font-semibold text-[#372921]">
            Active Staff Accounts ({allUsers.length})
          </h3>
          <span className="text-[11px] text-[#76695F] font-mono">
            All accounts monitored under Kalajay Security Audit
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Staff Member &amp; ID</th>
                <th className="py-3 px-4">Assigned Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {allUsers.map(user => {
                const isSuper = user.id === 'KJ-ADM-001';

                return (
                  <tr key={user.id} className="hover:bg-[#FFFCF7] transition-colors">
                    {/* User Info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#9E5430] flex items-center justify-center font-serif text-white text-xs font-bold shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <strong className="font-semibold text-[#372921] block">
                            {user.name}
                          </strong>
                          <span className="text-[10.5px] text-[#76695F] block font-mono">
                            {user.email} · {user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F0E9DF] border border-[#DED3C5] text-[11px] font-semibold text-[#372921]">
                        <ShieldCheck className="w-3 h-3 text-[#9E5430]" />
                        <span>{user.roleName}</span>
                      </span>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 text-[#76695F]">
                      {user.department}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono uppercase tracking-wider ${
                          user.status === 'active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            user.status === 'active' ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <span>{user.status}</span>
                      </span>
                    </td>

                    {/* Last Login */}
                    <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never logged in'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      {!isSuper ? (
                        <button
                          type="button"
                          onClick={() => toggleUserStatus(user.id)}
                          disabled={!canManageUsers}
                          className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                            user.status === 'active'
                              ? 'text-rose-700 hover:bg-rose-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#A99583] italic">Primary Root</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. PROVISION USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setCreateModalOpen(false)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-[#9E5430]" />
                  <h3 className="font-serif text-lg font-semibold text-[#372921]">
                    Provision Staff Account
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 text-[#76695F] hover:text-[#372921]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Full Name <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Radhika Sharma"
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Official Work Email <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. radhika@kalajay.in"
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Phone (Optional)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={e => setDepartment(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    >
                      <option value="Digital Commerce">Digital Commerce</option>
                      <option value="Bihar Craft House Hub">Bihar Craft House Hub</option>
                      <option value="Mumbai Atelier">Mumbai Atelier</option>
                      <option value="Brand & Creative">Brand &amp; Creative</option>
                      <option value="Accounts & Compliance">Accounts &amp; Compliance</option>
                      <option value="Executive Operations">Executive Operations</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Assign Operational Role <span className="text-[#9E5430]">*</span>
                  </label>
                  <select
                    value={roleId}
                    onChange={e => setRoleId(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  >
                    {allRoles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.isSystem ? 'System' : 'Custom'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#DED3C5] text-[11px] text-[#76695F]">
                  Clicking <strong>&ldquo;Generate Runtime Credentials&rdquo;</strong> will generate a cryptographically strong provisional password and display it on-screen once.
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold hover:bg-[#F0E9DF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Generate Runtime Credentials</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 4. CRITICAL: ONE-TIME ONBOARDING CREDENTIALS MODAL */}
      {onboardingModalData && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setOnboardingModalData(null)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border-2 border-[#9E5430] overflow-hidden animate-fade-in p-6 space-y-5">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#372921]">
                  Staff Account Created
                </h3>
                <p className="text-xs text-[#76695F]">
                  Runtime credentials provisioned for <strong>{onboardingModalData.user.name}</strong> ({onboardingModalData.user.roleName}).
                </p>
              </div>

              {/* One-Time Security Alert */}
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-1">
                <strong className="block font-semibold">Important Security Instructions:</strong>
                <p className="text-[11px] leading-relaxed">
                  This provisional password was generated at runtime using <code className="bg-amber-100 font-bold px-1 rounded">crypto.getRandomValues</code>. To protect patron and store integrity, <strong>this password is NOT persisted in plaintext</strong> and will leave memory once you close this modal. Copy it now and deliver securely to the team member.
                </p>
              </div>

              {/* Credentials Copy Box */}
              <div className="space-y-3 bg-[#F7F3EC] p-4 rounded-xl border border-[#DED3C5]">
                {/* Staff User ID */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-bold block mb-1">
                    System User ID:
                  </span>
                  <div className="flex items-center justify-between bg-white border border-[#DED3C5] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#372921]">
                    <span>{onboardingModalData.user.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(onboardingModalData.user.id, 'id')}
                      className="text-[11px] text-[#9E5430] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedId ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Provisional Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-bold block">
                      Provisional Password:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="text-[10px] text-[#76695F] hover:text-[#372921] flex items-center gap-1"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-[#DED3C5] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#9E5430]">
                    <span>
                      {showPassword ? onboardingModalData.provisionalPassword : '••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(onboardingModalData.provisionalPassword, 'pw')}
                      className="text-[11px] text-[#9E5430] hover:underline flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedPw ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setOnboardingModalData(null)}
                  className="w-full py-2.5 rounded-full bg-[#372921] hover:bg-[#503A2E] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  I have securely saved these credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


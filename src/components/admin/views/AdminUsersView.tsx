'use client';

import React, { useState, useMemo } from 'react';
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
  Search,
  Filter,
  Edit,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AdminUser } from '@/data/adminTypes';

export default function AdminUsersView() {
  const {
    allUsers,
    allRoles,
    createAdminUser,
    updateAdminUser,
    toggleUserStatus,
    resetUserCredentials,
    can,
    showModal,
  } = useAdminStore();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalUser, setEditModalUser] = useState<AdminUser | null>(null);
  const [onboardingModalData, setOnboardingModalData] = useState<{
    user: AdminUser;
    provisionalPassword: string;
  } | null>(null);

  // Form Fields for Create
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('Digital Commerce');
  const [roleId, setRoleId] = useState(allRoles[0]?.id || 'role-super-admin');
  const [isCreating, setIsCreating] = useState(false);

  // Form Fields for Edit
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editRoleId, setEditRoleId] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'deactivated'>('ALL');

  // Copy Feedback state
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPw, setCopiedPw] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [actionFeedback, setActionFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const canManageUsers = can('settings.users', 'manage_users');

  // Filtered staff list
  const filteredUsers = useMemo(() => {
    return allUsers.filter(user => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = user.name.toLowerCase().includes(q);
        const matchEmail = user.email.toLowerCase().includes(q);
        const matchId = (user.staffId || user.id).toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchId) return false;
      }
      // Department filter
      if (departmentFilter !== 'ALL' && user.department !== departmentFilter) {
        return false;
      }
      // Role filter
      if (roleFilter !== 'ALL' && user.roleId !== roleFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'ALL' && user.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [allUsers, searchQuery, departmentFilter, roleFilter, statusFilter]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsCreating(true);
    setActionFeedback(null);

    try {
      const result = await createAdminUser({
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
      setActionFeedback({ text: `Staff user ${result.user.id} provisioned successfully!`, type: 'success' });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err: any) {
      setActionFeedback({ text: err?.message || 'Failed to provision staff user.', type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartEdit = (user: AdminUser) => {
    setEditModalUser(user);
    setEditName(user.name);
    setEditPhone(user.phone || '');
    setEditDepartment(user.department);
    setEditRoleId(user.roleId);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalUser || !editName.trim()) return;

    setIsUpdating(true);
    const assignedRole = allRoles.find(r => r.id === editRoleId);

    try {
      const success = await updateAdminUser(editModalUser.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        department: editDepartment,
        roleId: editRoleId,
        roleName: assignedRole?.name || editModalUser.roleName,
      });

      if (success) {
        setActionFeedback({ text: `Updated staff profile for ${editModalUser.id}`, type: 'success' });
        setEditModalUser(null);
        setTimeout(() => setActionFeedback(null), 3000);
      }
    } catch (err: any) {
      setActionFeedback({ text: err?.message || 'Failed to update staff user.', type: 'error' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    showModal({
      title: 'Force Staff Passcode Reset',
      subtitle: `Target: ${user.name} (${user.id})`,
      icon: 'warning',
      message: `Enforcing a mandatory passcode reset will require ${user.name} to establish a new cryptographically verified passcode upon their next atelier login. Proceed?`,
      confirmLabel: 'Enforce Reset',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        try {
          await resetUserCredentials(user.id);
          setActionFeedback({ text: `Mandatory reset flag set for ${user.id}. Next login will require new passcode.`, type: 'success' });
          setTimeout(() => setActionFeedback(null), 3500);
        } catch (err: any) {
          setActionFeedback({ text: err?.message || 'Failed to enforce password reset.', type: 'error' });
        }
      },
    });
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
            <span>Staff Administration &amp; Identity</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Operational Staff Directory &amp; RBAC
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Provision sequential Staff IDs (KJ-ADM-xxx), assign granular dynamic roles, and manage credentials.
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

      {/* Action feedback toast banner */}
      {actionFeedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{actionFeedback.text}</span>
        </div>
      )}

      {/* Security Notice */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
        <div className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Cryptographic Security &amp; Zero-Plaintext Storage Policy</span>
        </div>
        <p className="text-[11.5px] text-amber-800 leading-relaxed">
          Provisional passcodes are generated at runtime via cryptographically secure random entropy. Plaintext passcodes are displayed <strong>strictly once</strong> in the secure modal and leave server memory upon delivery. All newly provisioned staff must change their password on first login.
        </p>
      </div>

      {/* 2. SEARCH & FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-2xl border border-[#DED3C5] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Text search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76695F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Staff ID, Email..."
              className="w-full bg-[#FAF7F2] border border-[#DED3C5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            />
          </div>

          {/* Department filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="ALL">All Departments</option>
              <option value="Founders Office & Creative Direction">Founders Office &amp; Creative</option>
              <option value="Digital Commerce">Digital Commerce</option>
              <option value="Bihar Craft House Hub">Bihar Craft House Hub</option>
              <option value="Mumbai Atelier & Logistics">Mumbai Atelier &amp; Logistics</option>
              <option value="Brand & Creative">Brand &amp; Creative</option>
              <option value="Accounts & Compliance">Accounts &amp; Compliance</option>
            </select>
          </div>

          {/* Role filter */}
          <div>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="ALL">All Roles ({allRoles.length})</option>
              {allRoles.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="w-full bg-[#FAF7F2] border border-[#DED3C5] rounded-xl px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="deactivated">Deactivated Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#76695F] pt-1">
          <span>
            Showing <strong>{filteredUsers.length}</strong> of <strong>{allUsers.length}</strong> staff accounts
          </span>
          {(searchQuery || departmentFilter !== 'ALL' || roleFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setDepartmentFilter('ALL');
                setRoleFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-[#9E5430] hover:underline cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. STAFF DIRECTORY TABLE */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#EAE2D8] flex items-center justify-between bg-[#FFFCF7]">
          <h3 className="font-serif text-base font-semibold text-[#372921]">
            Active Staff Directory ({filteredUsers.length})
          </h3>
          <span className="text-[11px] text-[#76695F] font-mono">
            Directly synced with Firestore /admin_users &amp; Auth Index
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
                <th className="py-3 px-4">First-Login Reset</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#76695F] text-xs">
                    No staff accounts match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isSuper = user.id === 'KJ-ADM-001' || user.roleId === 'role-super-admin';
                  const isRootSuper = user.id === 'KJ-ADM-001';

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
                              {user.email} · <span className="font-bold text-[#9E5430]">{user.staffId || user.id}</span>
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

                      {/* Reset Status */}
                      <td className="py-3 px-4 text-[#76695F] font-mono text-[11px]">
                        {user.requiresPasswordReset ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-sans text-[10.5px]">
                            <KeyRound className="w-3 h-3" />
                            <span>Reset Pending</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-sans text-[10.5px]">
                            <Check className="w-3 h-3" />
                            <span>Verified</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(user)}
                            disabled={!canManageUsers}
                            title="Edit Staff Member"
                            className="p-1 text-[#76695F] hover:text-[#9E5430] hover:bg-[#F0E9DF] rounded transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Passcode */}
                          <button
                            type="button"
                            onClick={() => handleResetPassword(user)}
                            disabled={!canManageUsers}
                            title="Force Password Reset on Next Login"
                            className="p-1 text-[#76695F] hover:text-amber-700 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>

                          {/* Toggle Active / Deactivate */}
                          {!isRootSuper ? (
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(user.id)}
                              disabled={!canManageUsers}
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                                user.status === 'active'
                                  ? 'text-rose-700 hover:bg-rose-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              {user.status === 'active' ? 'Deactivate' : 'Reactivate'}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#A99583] italic px-1">Primary Root</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PROVISION USER MODAL */}
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
                    Provision New Staff Account
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
                  <p className="text-[10.5px] text-[#76695F] mt-1">
                    Used for automated account recovery and internal security alerts.
                  </p>
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
                      <option value="Mumbai Atelier & Logistics">Mumbai Atelier &amp; Logistics</option>
                      <option value="Brand & Creative">Brand &amp; Creative</option>
                      <option value="Accounts & Compliance">Accounts &amp; Compliance</option>
                      <option value="Founders Office & Creative Direction">Founders Office &amp; Creative</option>
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
                  Submitting will automatically allocate the next sequential <strong>Staff ID (e.g. KJ-ADM-xxx)</strong>, create the user in Firebase Authentication, and generate a 16-character cryptographic temporary passcode.
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
                    disabled={isCreating}
                    className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isCreating ? 'Provisioning...' : 'Provision Staff Account'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. EDIT STAFF MODAL */}
      {editModalUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditModalUser(null)}
          />

          <div className="min-h-full flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#DED3C5] overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-[#EAE2D8] bg-[#FFFCF7] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#9E5430]" />
                  <h3 className="font-serif text-lg font-semibold text-[#372921]">
                    Edit Staff Profile: {editModalUser.id}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="p-1 text-[#76695F] hover:text-[#372921]"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Full Name <span className="text-[#9E5430]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Official Email (Immutable Identity)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={editModalUser.email}
                    className="w-full bg-[#EAE2D8]/50 border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#76695F] cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={e => setEditPhone(e.target.value)}
                      placeholder="+91 98..."
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#372921] mb-1">
                      Department
                    </label>
                    <select
                      value={editDepartment}
                      onChange={e => setEditDepartment(e.target.value)}
                      className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                    >
                      <option value="Digital Commerce">Digital Commerce</option>
                      <option value="Bihar Craft House Hub">Bihar Craft House Hub</option>
                      <option value="Mumbai Atelier & Logistics">Mumbai Atelier &amp; Logistics</option>
                      <option value="Brand & Creative">Brand &amp; Creative</option>
                      <option value="Accounts & Compliance">Accounts &amp; Compliance</option>
                      <option value="Founders Office & Creative Direction">Founders Office &amp; Creative</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#372921] mb-1">
                    Role Assignment <span className="text-[#9E5430]">*</span>
                  </label>
                  <select
                    value={editRoleId}
                    onChange={e => setEditRoleId(e.target.value)}
                    disabled={editModalUser.id === 'KJ-ADM-001'}
                    className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] disabled:opacity-50"
                  >
                    {allRoles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.isSystem ? 'System' : 'Custom'})
                      </option>
                    ))}
                  </select>
                  {editModalUser.id === 'KJ-ADM-001' && (
                    <p className="text-[10px] text-amber-700 mt-1">
                      Root Super Administrator role is immutable.
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE2D8]">
                  <button
                    type="button"
                    onClick={() => setEditModalUser(null)}
                    className="px-4 py-2 rounded-full border border-[#DED3C5] text-xs font-semibold hover:bg-[#F0E9DF]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 6. ONE-TIME ONBOARDING CREDENTIALS MODAL */}
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
                <strong className="block font-semibold">Important Security Handover Instructions:</strong>
                <p className="text-[11px] leading-relaxed">
                  This temporary passcode was cryptographically generated and will <strong>leave memory once you close this modal</strong>. To maintain zero-knowledge protection, it is never stored in plaintext in the database. Copy and deliver it securely to the staff member.
                </p>
              </div>

              {/* Credentials Copy Box */}
              <div className="space-y-3 bg-[#F7F3EC] p-4 rounded-xl border border-[#DED3C5]">
                {/* Staff User ID */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#76695F] font-bold block mb-1">
                    Staff User ID:
                  </span>
                  <div className="flex items-center justify-between bg-white border border-[#DED3C5] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#372921]">
                    <span>{onboardingModalData.user.id}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(onboardingModalData.user.id, 'id')}
                      className="text-[11px] text-[#9E5430] hover:underline flex items-center gap-1 cursor-pointer"
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
                      Temporary Passcode:
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(p => !p)}
                      className="text-[10px] text-[#76695F] hover:text-[#372921] flex items-center gap-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showPassword ? 'Hide' : 'Reveal'}</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between bg-white border border-[#DED3C5] rounded-lg px-3 py-2 font-mono text-xs font-bold text-[#9E5430]">
                    <span>
                      {showPassword ? onboardingModalData.provisionalPassword : '••••••••••••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(onboardingModalData.provisionalPassword, 'pw')}
                      className="text-[11px] text-[#9E5430] hover:underline flex items-center gap-1 cursor-pointer"
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
                  I have securely delivered these credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

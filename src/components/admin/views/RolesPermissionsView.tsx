'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Search,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Eye,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { ADMIN_MODULE_DEFINITIONS } from '@/data/adminPermissions';
import { AdminRole, PermissionAction } from '@/data/adminTypes';

export default function RolesPermissionsView() {
  const { allRoles, createRole, updateRole, deleteRole, switchRole, can, showModal } = useAdminStore();

  const [activeTab, setActiveTab] = useState<'directory' | 'editor'>('directory');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  // Form State for Role Editor
  const [roleName, setRoleName] = useState('');
  const [roleDescription, setRoleDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [permissionsState, setPermissionsState] = useState<Record<string, PermissionAction[]>>({});
  const [treeSearch, setTreeSearch] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Record<string, boolean>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const canManageRoles = can('settings.roles', 'manage_roles');

  const startCreateNew = () => {
    setEditingRoleId(null);
    setRoleName('New Custom Operations Role');
    setRoleDescription('Scoped operational role customized for team responsibilities.');
    setPermissionsState({
      'dashboard.overview': ['view'],
      'orders.all': ['view'],
    });
    setActiveTab('editor');
  };

  const startEditRole = (role: AdminRole) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setPermissionsState(JSON.parse(JSON.stringify(role.permissions || {})));
    setActiveTab('editor');
  };

  const handleCloneRole = (role: AdminRole) => {
    const cloned = createRole({
      name: `${role.name} (Copy)`,
      description: `Cloned from ${role.name}. Scoped operational rights.`,
      isSystem: false,
      userCount: 0,
      permissions: JSON.parse(JSON.stringify(role.permissions || {})),
    });
    setStatusMessage({ type: 'success', text: `Cloned role as "${cloned.name}".` });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDelete = (role: AdminRole) => {
    const res = deleteRole(role.id);
    if (!res.success) {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to delete role.' });
    } else {
      setStatusMessage({ type: 'success', text: `Deleted role "${role.name}".` });
    }
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Toggle specific action on a page
  const togglePageAction = (pageId: string, action: PermissionAction) => {
    setPermissionsState(prev => {
      const currentActions = prev[pageId] || [];
      let nextActions: PermissionAction[];

      if (currentActions.includes(action)) {
        // If unchecking 'view', uncheck all actions for this page since actions require view
        if (action === 'view') {
          nextActions = [];
        } else {
          nextActions = currentActions.filter(a => a !== action);
        }
      } else {
        // If checking any action, automatically ensure 'view' is also granted
        if (!currentActions.includes('view')) {
          nextActions = [...currentActions, 'view', action];
        } else {
          nextActions = [...currentActions, action];
        }
      }

      const next = { ...prev };
      if (nextActions.length === 0) {
        delete next[pageId];
      } else {
        next[pageId] = nextActions;
      }
      return next;
    });
  };

  // Toggle full module (select all / clear all in module)
  const toggleModuleAll = (moduleId: string, selectAll: boolean) => {
    const mod = ADMIN_MODULE_DEFINITIONS.find(m => m.moduleId === moduleId);
    if (!mod) return;

    setPermissionsState(prev => {
      const next = { ...prev };
      mod.pages.forEach(pg => {
        if (selectAll) {
          next[pg.id] = [...pg.supportedActions];
        } else {
          delete next[pg.id];
        }
      });
      return next;
    });
  };

  // Global Select All / Clear All
  const handleGlobalSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      const all: Record<string, PermissionAction[]> = {};
      ADMIN_MODULE_DEFINITIONS.forEach(m => {
        m.pages.forEach(pg => {
          all[pg.id] = [...pg.supportedActions];
        });
      });
      setPermissionsState(all);
    } else {
      setPermissionsState({});
    }
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      showModal({
        title: 'Validation Incomplete',
        message: 'Please enter a valid role name for this access policy specification.',
        icon: 'warning',
      });
      return;
    }

    if (editingRoleId) {
      updateRole(editingRoleId, {
        name: roleName,
        description: roleDescription,
        permissions: permissionsState,
      });
      setStatusMessage({ type: 'success', text: `Saved updates to "${roleName}".` });
    } else {
      createRole({
        name: roleName,
        description: roleDescription,
        isSystem: false,
        userCount: 0,
        permissions: permissionsState,
      });
      setStatusMessage({ type: 'success', text: `Created new custom role "${roleName}".` });
    }

    setActiveTab('directory');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Compute total granted modules, pages, actions
  const grantedPagesCount = Object.keys(permissionsState).length;
  let totalGrantedActions = 0;
  Object.values(permissionsState).forEach(acts => {
    totalGrantedActions += acts.length;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security &amp; Access Controls</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Roles &amp; Permission Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Define fine-grained operational roles, assign Module-to-Page rights, and simulate departmental access.
          </p>
        </div>

        {/* Tab Toggle & Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {activeTab === 'editor' ? (
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F0E9DF] text-[#372921] text-xs font-semibold transition-colors"
            >
              ← Back to Roles Directory
            </button>
          ) : (
            <button
              type="button"
              onClick={startCreateNew}
              disabled={!canManageRoles}
              className="px-4 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Custom Role</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center gap-2 animate-fade-in ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* 2. DIRECTORY VIEW */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allRoles.map(role => {
              const pagesCount = Object.keys(role.permissions || {}).length;
              let actionCount = 0;
              Object.values(role.permissions || {}).forEach(a => (actionCount += a.length));

              return (
                <div
                  key={role.id}
                  className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs hover:border-[#9E5430]/60 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#F7F3EC] border border-[#DED3C5] flex items-center justify-center text-[#9E5430]">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-serif text-base font-semibold text-[#372921] group-hover:text-[#9E5430] transition-colors">
                            {role.name}
                          </h3>
                          <span className="text-[10px] text-[#76695F] font-mono">
                            {role.isSystem ? 'System Template' : 'Custom Defined'}
                          </span>
                        </div>
                      </div>

                      {role.isSystem && (
                        <span className="text-[9.5px] bg-[#372921] text-[#C5A880] px-2 py-0.5 rounded font-mono font-bold">
                          SYSTEM
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#76695F] leading-relaxed line-clamp-2">
                      {role.description}
                    </p>

                    {/* Permission Scope Metrics */}
                    <div className="p-2.5 rounded-xl bg-[#F7F3EC] border border-[#EAE2D8] grid grid-cols-2 gap-2 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#76695F] block uppercase tracking-wider">
                          Accessible Pages
                        </span>
                        <strong className="font-serif text-sm text-[#372921]">
                          {role.id === 'role-super-admin' ? 'All (Unrestricted)' : `${pagesCount} Pages`}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#76695F] block uppercase tracking-wider">
                          Assigned Users
                        </span>
                        <strong className="font-serif text-sm text-[#372921]">
                          {role.userCount} Staff
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-[#EAE2D8] mt-4 flex items-center justify-between gap-2">
                    {/* View As Role Simulation Button */}
                    <button
                      type="button"
                      onClick={() => switchRole(role.id)}
                      className="px-2.5 py-1 rounded-md bg-[#F0E9DF] hover:bg-[#EAE2D8] text-[11px] font-semibold text-[#372921] flex items-center gap-1 transition-colors cursor-pointer"
                      title="Simulate the console perspective of this role"
                    >
                      <Eye className="w-3 h-3 text-[#9E5430]" />
                      <span>Simulate View</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCloneRole(role)}
                        aria-label="Clone this role template"
                        className="p-1.5 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] cursor-pointer"
                        title="Clone role"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditRole(role)}
                        disabled={!canManageRoles}
                        aria-label="Edit role permissions"
                        className="p-1.5 rounded hover:bg-[#F0E9DF] text-[#76695F] hover:text-[#372921] disabled:opacity-40 cursor-pointer"
                        title="Edit role permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {!role.isSystem && (
                        <button
                          type="button"
                          onClick={() => handleDelete(role)}
                          disabled={!canManageRoles}
                          aria-label="Delete custom role"
                          className="p-1.5 rounded hover:bg-rose-50 text-[#76695F] hover:text-rose-600 disabled:opacity-40 cursor-pointer"
                          title="Delete role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ROLE EDITOR VIEW (HIERARCHICAL PERMISSION MATRIX) */}
      {activeTab === 'editor' && (
        <form onSubmit={handleSaveRole} className="space-y-6">
          {/* Role Meta Information Card */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
            <h3 className="font-serif text-lg font-semibold text-[#372921] pb-2 border-b border-[#EAE2D8]">
              {editingRoleId ? 'Edit Role Definition' : 'Create New Custom Operations Role'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Role Title <span className="text-[#9E5430]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={e => setRoleName(e.target.value)}
                  placeholder="e.g. Master Atelier Coordinator"
                  className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#372921] mb-1">
                  Description / Department Responsibility
                </label>
                <input
                  type="text"
                  value={roleDescription}
                  onChange={e => setRoleDescription(e.target.value)}
                  placeholder="Brief description of operations scope"
                  className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg px-3 py-2 text-xs text-[#372921] focus:outline-none focus:border-[#9E5430]"
                />
              </div>
            </div>

            {/* Scope Summary Banner */}
            <div className="p-3 rounded-xl bg-[#F7F3EC] border border-[#DED3C5] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <span>
                  Granted Pages: <strong className="text-[#9E5430] font-bold">{grantedPagesCount}</strong>
                </span>
                <span>
                  Action Rights: <strong className="text-[#372921] font-bold">{totalGrantedActions}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleGlobalSelectAll(true)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#EAE2D8] border border-[#DED3C5] text-[11px] font-semibold text-[#372921] transition-colors cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => handleGlobalSelectAll(false)}
                  className="px-2.5 py-1 rounded bg-white hover:bg-[#EAE2D8] border border-[#DED3C5] text-[11px] font-semibold text-[#76695F] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>

          {/* Search Filter for Permission Tree */}
          <div className="bg-white rounded-2xl border border-[#DED3C5] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE2D8]">
              <div>
                <h4 className="font-serif text-base font-semibold text-[#372921]">
                  Module &amp; Page Permission Tree
                </h4>
                <p className="text-[11px] text-[#76695F]">
                  Select accessible pages and check granular action rights. Checking an action automatically enables &ldquo;View&rdquo;.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-[#76695F] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={treeSearch}
                  onChange={e => setTreeSearch(e.target.value)}
                  placeholder="Filter permissions..."
                  className="w-full bg-[#F7F3EC] border border-[#DED3C5] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[#372921] focus:outline-none"
                />
              </div>
            </div>

            {/* Hierarchical Tree */}
            <div className="space-y-4">
              {ADMIN_MODULE_DEFINITIONS.map(moduleDef => {
                const isCollapsed = collapsedModules[moduleDef.moduleId] || false;
                const filteredPages = treeSearch
                  ? moduleDef.pages.filter(
                      p =>
                        p.name.toLowerCase().includes(treeSearch.toLowerCase()) ||
                        p.description.toLowerCase().includes(treeSearch.toLowerCase())
                    )
                  : moduleDef.pages;

                if (treeSearch && filteredPages.length === 0) return null;

                // Check how many pages in this module are granted
                const grantedInModule = moduleDef.pages.filter(pg => permissionsState[pg.id]?.length > 0).length;
                const isModuleFullySelected = grantedInModule === moduleDef.pages.length;

                return (
                  <div
                    key={moduleDef.moduleId}
                    className="rounded-xl border border-[#DED3C5] overflow-hidden bg-[#FFFCF7]"
                  >
                    {/* Module Bar */}
                    <div className="p-3 bg-[#F0E9DF] border-b border-[#DED3C5] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setCollapsedModules(prev => ({
                              ...prev,
                              [moduleDef.moduleId]: !prev[moduleDef.moduleId],
                            }))
                          }
                          aria-label={`Toggle module ${moduleDef.name}`}
                          className="p-1 rounded text-[#76695F] hover:text-[#372921] cursor-pointer"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <span className="font-serif text-sm font-semibold text-[#372921]">
                          {moduleDef.name}
                        </span>
                        <span className="text-[10.5px] text-[#76695F] font-mono">
                          ({grantedInModule}/{moduleDef.pages.length} pages enabled)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleModuleAll(moduleDef.moduleId, !isModuleFullySelected)}
                          className="text-[11px] font-semibold text-[#9E5430] hover:underline cursor-pointer"
                        >
                          {isModuleFullySelected ? 'Deselect Module' : 'Select All in Module'}
                        </button>
                      </div>
                    </div>

                    {/* Pages & Actions (expanded) */}
                    {!isCollapsed && (
                      <div className="divide-y divide-[#EAE2D8]">
                        {filteredPages.map(page => {
                          const currentActions = permissionsState[page.id] || [];
                          const isPageGranted = currentActions.includes('view');

                          return (
                            <div
                              key={page.id}
                              className={`p-3 sm:px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                                isPageGranted ? 'bg-white' : 'bg-[#F7F3EC]/50 opacity-70'
                              }`}
                            >
                              <div className="min-w-0 md:max-w-xs">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={isPageGranted}
                                    onChange={() => togglePageAction(page.id, 'view')}
                                    className="accent-[#9E5430] w-4 h-4 rounded"
                                  />
                                  <span className="text-xs font-semibold text-[#372921]">
                                    {page.name}
                                  </span>
                                </label>
                                <span className="text-[11px] text-[#76695F] block ml-6 leading-tight mt-0.5">
                                  {page.description}
                                </span>
                              </div>

                              {/* Action Checkboxes */}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-6 md:ml-0">
                                {page.supportedActions.map(action => {
                                  const isActionChecked = currentActions.includes(action);

                                  return (
                                    <label
                                      key={action}
                                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-sans border transition-all cursor-pointer select-none ${
                                        isActionChecked
                                          ? 'bg-[#9E5430]/10 border-[#9E5430]/40 text-[#9E5430] font-semibold'
                                          : 'bg-white border-[#DED3C5] text-[#76695F] hover:border-[#A99583]'
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isActionChecked}
                                        onChange={() => togglePageAction(page.id, action)}
                                        className="accent-[#9E5430] w-3 h-3 rounded"
                                      />
                                      <span className="capitalize">{action.replace('_', ' ')}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DED3C5]">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="px-5 py-2.5 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F0E9DF] text-[#372921] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              Save Role Definition
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


'use client';

import React from 'react';
import { ShieldAlert, ArrowLeft, RefreshCw } from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';

interface AccessDeniedProps {
  pageName?: string;
  requiredPermission?: string;
}

export default function AccessDenied({
  pageName = 'this operations screen',
  requiredPermission = 'view',
}: AccessDeniedProps) {
  const { activeRole, switchRole, setActiveModule, setActiveSubPage } = useAdminStore();

  return (
    <div className="py-20 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl border border-[#DED3C5] p-8 text-center shadow-lg space-y-5 animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div>
          <span className="text-[11px] uppercase tracking-wider font-mono font-bold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            Simulated Role Guard: Access Denied
          </span>
          <h2 className="font-serif text-2xl text-[#372921] font-semibold mt-3">
            Permission Restricted
          </h2>
          <p className="text-xs text-[#76695F] leading-relaxed mt-2">
            Your current simulated role <strong className="text-[#372921] font-semibold">&ldquo;{activeRole.name}&rdquo;</strong> does not have <code className="bg-[#F0E9DF] px-1 py-0.5 rounded font-mono text-[#9E5430]">{requiredPermission}</code> rights for {pageName}.
          </p>
        </div>

        <div className="p-3 bg-[#F7F3EC] rounded-xl border border-[#EAE2D8] text-[11.5px] text-[#76695F] text-left space-y-1">
          <span className="font-semibold text-[#372921] block">Why am I seeing this?</span>
          <span>
            You are currently using the <strong>View as Role</strong> simulation to test access controls. In production, this route would be enforced by server-side RBAC and middleware.
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveModule('dashboard');
              setActiveSubPage('dashboard.overview');
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-full border border-[#DED3C5] text-[#372921] text-xs font-semibold hover:bg-[#F0E9DF] transition-colors"
          >
            ← Return to Dashboard
          </button>
          <button
            type="button"
            onClick={() => switchRole('role-super-admin')}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-[#9E5430] hover:bg-[#874427] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Switch to Super Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}


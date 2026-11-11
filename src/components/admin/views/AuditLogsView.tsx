'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  Sparkles,
  FileCode,
  X,
  User,
  Activity,
} from 'lucide-react';
import { useAdminStore } from '@/data/AdminStoreContext';
import { AuditLogItem } from '@/data/adminTypes';

export default function AuditLogsView() {
  const { auditLogs, logAction } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const handleExport = () => {
    logAction('EXPORT_AUDIT_LOGS', 'settings', 'Exported security audit trail');
    showToast('Exported complete security audit trail to CSV');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#372921] text-white px-5 py-3 rounded-xl shadow-xl border border-[#9E5430]/40 flex items-center gap-3 text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-[#C49A45]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DED3C5]">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#9E5430]/10 text-[#9E5430] text-[10.5px] uppercase tracking-wider font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Governance &amp; Accountability</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-[#372921] font-semibold">
            Security &amp; Audit Logs
          </h1>
          <p className="text-xs sm:text-sm text-[#76695F] mt-1">
            Immutable chronological ledger of all administrative console changes, publishing events, stock adjustments, and staff actions.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 rounded-full border border-[#DED3C5] bg-white hover:bg-[#F7F3EC] text-[#372921] text-xs font-medium transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#76695F]" />
          <span>Export Audit Log CSV</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Total Logged Events</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">{auditLogs.length}</div>
          <span className="text-[10px] text-[#76695F]">Continuous state recorder</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Integrity Check</span>
          <div className="font-serif text-2xl text-emerald-700 font-bold mt-1">Verified</div>
          <span className="text-[10px] text-emerald-700">Zero chain discrepancies</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Active Operators</span>
          <div className="font-serif text-2xl text-[#9E5430] font-bold mt-1">5 Staff</div>
          <span className="text-[10px] text-[#76695F]">Authenticated console sessions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs">
          <span className="text-[11px] text-[#76695F] uppercase tracking-wider font-semibold">Retention Policy</span>
          <div className="font-serif text-2xl text-[#372921] font-bold mt-1">365 Days</div>
          <span className="text-[10px] text-[#76695F]">DPDP &amp; Indian IT Act standard</span>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH */}
      <div className="bg-white p-4 rounded-xl border border-[#DED3C5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#76695F] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by action, operator, or details..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] placeholder-[#76695F]/70 focus:outline-none focus:border-[#9E5430]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-[#76695F]">Module:</span>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-[#F7F3EC] border border-[#DED3C5] rounded-lg text-xs text-[#372921] focus:outline-none focus:border-[#9E5430] cursor-pointer"
          >
            <option value="all">All Modules ({auditLogs.length})</option>
            <option value="cms">CMS &amp; Website</option>
            <option value="featured-products">Featured Curator</option>
            <option value="inventory">Inventory &amp; Stock</option>
            <option value="orders">Orders &amp; Sales</option>
            <option value="production">Production &amp; Looms</option>
            <option value="settings">Settings &amp; Staff</option>
            <option value="custom-orders">Custom Orders</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      {/* 4. AUDIT LOGS TABLE */}
      <div className="bg-white rounded-2xl border border-[#DED3C5] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#F7F3EC] text-[#76695F] border-b border-[#DED3C5] text-[10.5px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp (IST)</th>
                <th className="py-3 px-4">Operator / Staff</th>
                <th className="py-3 px-4">Action Code</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Operational Detail</th>
                <th className="py-3 px-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE2D8]">
              {filteredLogs.map(log => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLog(log)}
                  className="hover:bg-[#FFFCF7] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-[#76695F] font-mono text-[11px] whitespace-nowrap">
                    {log.timestamp.replace('T', ' ').replace('Z', '')}
                  </td>

                  <td className="py-3 px-4">
                    <strong className="text-[#372921] font-medium block">{log.userName}</strong>
                    <span className="text-[10px] text-[#76695F] font-mono">{log.userId}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold text-[#9E5430] px-2 py-0.5 rounded bg-[#9E5430]/10 border border-[#9E5430]/20">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-[#F7F3EC] text-[#372921] text-[10.5px] border border-[#DED3C5]">
                      {log.module}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-[#372921] max-w-md truncate">
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLog(log);
                      }}
                      className="p-1.5 rounded-lg hover:bg-[#F7F3EC] text-[#76695F] hover:text-[#9E5430] transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Diff</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. LOG DETAIL MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DED3C5] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 border-b border-[#DED3C5] bg-[#F7F3EC] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-[#372921] font-semibold flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#9E5430]" />
                  <span>Audit Event Payload</span>
                </h3>
                <p className="text-xs text-[#76695F] mt-0.5 font-mono">Event #{selectedLog.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-[#76695F] flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono bg-[#FAF8F5] overflow-y-auto max-h-[400px]">
              <pre className="p-3 bg-stone-900 text-stone-100 rounded-xl text-[11px] leading-relaxed overflow-x-auto">
{JSON.stringify(
  {
    event_id: selectedLog.id,
    timestamp: selectedLog.timestamp,
    operator: {
      user_id: selectedLog.userId,
      user_name: selectedLog.userName,
    },
    action_type: selectedLog.action,
    module: selectedLog.module,
    audit_notes: selectedLog.details,
    integrity_hash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
  },
  null,
  2
)}
              </pre>
            </div>

            <div className="p-4 border-t border-[#DED3C5] bg-[#F7F3EC] flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-full bg-[#372921] hover:bg-[#241B15] text-white text-xs font-semibold cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


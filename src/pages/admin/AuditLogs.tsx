/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, Download, Code } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectingLog, setInspectingLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    api.getAuditLogs()
      .then(setLogs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = logs.filter(l => {
    const matchesCat = categoryFilter === 'ALL' || l.category === categoryFilter;
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      l.action.toLowerCase().includes(q) ||
      l.performedByName.toLowerCase().includes(q) ||
      JSON.stringify(l.details).toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Administration Console', href: '/admin/dashboard' }, { label: 'System Audit Logs' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            Immutable Security & Governance Audit Trail
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Cryptographically sealed operational audit records for compliance and regulatory accountability
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search action name, actor, target ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'AUTH', 'USER_MGMT', 'COMPLAINT', 'ASSIGNMENT', 'MATCHING'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#5267E8] text-white font-medium shadow-xs'
                  : 'bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] hover:text-[#20232D] dark:hover:text-white hover:bg-[#EEF1FD]/50'
              }`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No audit records match the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Timestamp</th>
                  <th className="px-6 py-3 font-semibold">Action & Category</th>
                  <th className="px-6 py-3 font-semibold">Actor Identity</th>
                  <th className="px-6 py-3 font-semibold">Target Record</th>
                  <th className="px-6 py-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-[11px] text-[#747B8C] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-mono font-semibold text-[#5267E8]">{log.action}</p>
                      <span className="text-[10px] font-mono text-[#747B8C]">{log.category}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-[#20232D] dark:text-white">{log.performedByName}</p>
                      <p className="text-[10px] text-[#747B8C]">({log.performedByRole})</p>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-[11px] text-[#747B8C]">
                      {log.targetType ? `${log.targetType}: ${log.targetId}` : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#5267E8] hover:bg-[#EEF1FD] dark:hover:bg-[#5267E8]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect Payload
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* JSON Payload Inspection Modal */}
      {inspectingLog && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingLog(null)}
          title={`Audit Payload: ${inspectingLog.action}`}
          subtitle={`Logged on ${new Date(inspectingLog.timestamp).toLocaleString()} by ${inspectingLog.performedByName}`}
          maxWidth="lg"
        >
          <div className="space-y-3 text-xs">
            <div className="p-3.5 bg-[#171A23] text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-[#232736]">
              <pre>{JSON.stringify(inspectingLog.details, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, ShieldCheck, ArrowRight, Building2, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function RbCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    api.getComplaints({ bureau: 'REGULATION_BUREAU' })
      .then(setComplaints)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      c.trackingId.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.aictePermanentId.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Regulation Bureau', href: '/rb/dashboard' }, { label: 'Assigned Cases' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            Regulation Bureau Case Repository
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Active and resolved cases regarding statutory norms and institutional compliance
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Institution, Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'ASSIGNED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED', 'ESCALATED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#5267E8] text-white font-medium shadow-xs'
                  : 'bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] hover:text-[#20232D] dark:hover:text-white hover:bg-[#EEF1FD]/50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={4} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No cases match the selected filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tracking ID</th>
                  <th className="px-6 py-3 font-semibold">Institution & Permanent ID</th>
                  <th className="px-6 py-3 font-semibold">Subject & Category</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">SLA Deadline</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-6 py-3.5 max-w-xs">
                      <p className="font-semibold text-[#20232D] dark:text-white truncate">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-6 py-3.5 max-w-xs">
                      <p className="font-semibold text-[#20232D] dark:text-white truncate">{c.subject}</p>
                      <p className="text-[10px] text-[#747B8C]">{c.category}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3.5">
                      <SlaBadge deadline={c.slaDeadline} isClosed={['RESOLVED', 'CLOSED'].includes(c.status)} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/student/complaints/${c.id}`)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5267E8] hover:bg-[#EEF1FD] dark:hover:bg-[#5267E8]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        View Full Dossier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

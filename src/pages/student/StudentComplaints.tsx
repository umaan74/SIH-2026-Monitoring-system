/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, FilePlus2, FileText, ArrowRight, Building2 } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, ComplaintStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export function StudentComplaints() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState(querySearch);

  useEffect(() => {
    api.getComplaints()
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
    <DashboardLayout breadcrumbs={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'My Complaints' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            My Submitted Complaints
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Official cases registered under your authenticated student profile
          </p>
        </div>

        <button
          onClick={() => navigate('/student/complaints/new')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] active:bg-[#3846B8] rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
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

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'SUBMITTED', 'UNDER_REVIEW', 'ACTION_TAKEN', 'RESOLVED'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#5267E8] text-white shadow-xs'
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
          <div className="p-6">
            <LoadingSkeleton count={4} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No complaints match your filters"
            description="Try modifying your search keywords or resetting status filters."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter('ALL'); setSearchTerm(''); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tracking ID</th>
                  <th className="px-6 py-3 font-semibold">Subject & Institution</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">SLA Countdown</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-6 py-3.5 max-w-sm">
                      <p className="font-semibold text-[#20232D] dark:text-white truncate">{c.subject}</p>
                      <p className="text-[11px] text-[#747B8C] truncate flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-[#747B8C] shrink-0" />
                        <span>{c.institutionName}</span>
                        <span className="font-mono text-[#747B8C]">({c.aictePermanentId})</span>
                      </p>
                    </td>
                    <td className="px-6 py-3.5 text-[#747B8C]">
                      {c.category}
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
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        Track Status
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

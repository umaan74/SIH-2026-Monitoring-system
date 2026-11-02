/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Layers, ArrowRight, Building2, User, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, BureauCell, ComplaintStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function MasterCases() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [bureauFilter, setBureauFilter] = useState(searchParams.get('bureau') || 'ALL');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [priorityFilter, setPriorityFilter] = useState(searchParams.get('priority') || 'ALL');

  const loadComplaints = () => {
    setLoading(true);
    api.getComplaints()
      .then(setComplaints)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filtered = complaints.filter(c => {
    const matchesBureau = bureauFilter === 'ALL' || c.assignedBureau === bureauFilter || (!c.assignedBureau && bureauFilter === 'CENTRAL_INTAKE');
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      c.trackingId.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.aictePermanentId.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q);

    return matchesBureau && matchesStatus && matchesPriority && matchesQuery;
  });

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Executive Governance', href: '/authority/dashboard' }, { label: 'Master Case Registry' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            AICTE Master Case Repository
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Comprehensive national repository across all bureaus, cells, and jurisdictions
          </p>
        </div>

        <button
          onClick={loadComplaints}
          className="px-3.5 py-1.5 text-xs font-medium text-[#20232D] dark:text-slate-200 bg-white dark:bg-[#1A1D27] border border-[#E8EAF0] dark:border-[#262A38] rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#202433] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Multi-Dimensional Filter Bar */}
      <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search AICTE Permanent ID, Case Tracking ID, Student Name, Institution, Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Bureau Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#747B8C] font-medium">Bureau:</span>
            <select
              value={bureauFilter}
              onChange={(e) => setBureauFilter(e.target.value)}
              className="p-1.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
            >
              <option value="ALL">All Bureaus / Cells</option>
              <option value="CENTRAL_INTAKE">Central Intake</option>
              <option value="REGULATION_BUREAU">Regulation Bureau (RB)</option>
              <option value="PUBLIC_GRIEVANCE_REDRESSAL_CELL">Grievance Cell (PGRC)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#747B8C] font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_VERIFICATION">UNDER_VERIFICATION</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="UNDER_REVIEW">UNDER_REVIEW</option>
              <option value="ACTION_TAKEN">ACTION_TAKEN</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="ESCALATED">ESCALATED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-[#747B8C] font-medium">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="p-1.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <span className="ml-auto text-[11px] font-mono text-[#747B8C]">
            {filtered.length} of {complaints.length} cases
          </span>
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No complaints found matching the combined filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tracking ID</th>
                  <th className="px-6 py-3 font-semibold">Institution & Permanent ID</th>
                  <th className="px-6 py-3 font-semibold">Allegations</th>
                  <th className="px-6 py-3 font-semibold">Bureau</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">SLA</th>
                  <th className="px-6 py-3 font-semibold text-right">Inspect</th>
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
                    <td className="px-6 py-3.5 max-w-sm">
                      <p className="font-medium text-[#20232D] dark:text-white truncate">{c.subject}</p>
                      <p className="text-[10px] text-[#747B8C]">{c.category}</p>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-[#20232D] dark:text-slate-200">
                      {c.assignedBureau ? c.assignedBureau.replace(/_/g, ' ') : 'Central Intake'}
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
                        Dossier
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

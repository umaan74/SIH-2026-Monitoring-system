/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  FolderSync, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats, Institution, Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { SeniorAuthorityCharts } from '../../components/charts/SeniorAuthorityCharts';
import { StatusBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function SeniorAuthorityDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [escalatedComplaints, setEscalatedComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getDashboardStats(),
      api.getInstitutions(),
      api.getComplaints()
    ])
      .then(([statsRes, instList, cList]) => {
        setStats(statsRes);
        setInstitutions(instList);
        setEscalatedComplaints(cList.filter(c => c.isEscalated || c.status === 'ESCALATED' || c.priority === 'CRITICAL'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Executive Governance' }, { label: 'Consolidated Dashboard' }]}>
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-lg font-bold text-[#20232D]">
              AICTE Apex Governance & Cross-Bureau Oversight
            </h1>
            <span className="text-[10px] bg-[#EEF1FD] text-[#5267E8] font-mono font-semibold px-2 py-0.5 rounded border border-[#D2D9FA]">
              Executive View
            </span>
          </div>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Real-time cross-department monitoring, regulatory risk analysis, and SLA enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/authority/coordination')}
            className="px-3.5 py-2 text-xs font-semibold text-[#5267E8] bg-[#EEF1FD] hover:bg-[#E4E9FB] rounded-lg border border-[#D2D9FA] transition-colors flex items-center gap-1.5"
          >
            <FolderSync className="w-3.5 h-3.5" />
            <span>Coordination Hub</span>
          </button>
          <button
            onClick={() => navigate('/authority/cases')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Case Registry</span>
          </button>
        </div>
      </div>

      {/* Senior Authority Interactive Charts */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : stats ? (
        <SeniorAuthorityCharts stats={stats} institutions={institutions} />
      ) : null}

      {/* Escalated & Critical Grievances Priority Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8EAF0] flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#DC2626]" />
              <span>Escalated & High-Priority Grievance Watchlist</span>
            </h3>
            <p className="text-[11px] text-[#747B8C]">Cases requiring executive secretariat intervention or joint committee inquiry</p>
          </div>
          <button
            onClick={() => navigate('/authority/cases?priority=CRITICAL')}
            className="text-xs text-[#5267E8] hover:text-[#4354D0] flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {escalatedComplaints.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#747B8C]">
            No critical escalations currently pending executive action.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] text-[#747B8C] uppercase tracking-wider text-[10px] border-b border-[#E8EAF0]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-5 py-3 font-semibold">Institution & AICTE ID</th>
                  <th className="px-5 py-3 font-semibold">Allegation / Subject</th>
                  <th className="px-5 py-3 font-semibold">Bureau</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] text-[#20232D]">
                {escalatedComplaints.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB]/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#DC2626]">
                      {c.trackingId}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-semibold text-[#20232D] truncate">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-semibold text-[#20232D] truncate">{c.subject}</p>
                      <p className="text-[10px] text-[#747B8C] truncate">{c.category}</p>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-[#20232D]">
                      {c.assignedBureau ? c.assignedBureau.replace(/_/g, ' ') : 'Central Intake'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/student/complaints/${c.id}`)}
                        className="px-3 py-1 text-xs font-semibold text-[#5267E8] hover:text-[#4354D0] hover:bg-[#EEF1FD] rounded transition-colors"
                      >
                        Inspect Dossier
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

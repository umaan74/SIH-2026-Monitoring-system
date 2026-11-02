/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Inbox, 
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, ComplaintMatch } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { IntakeCharts } from '../../components/charts/IntakeCharts';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function IntakeDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [matches, setMatches] = useState<ComplaintMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getComplaints(),
      api.getMatches()
    ])
      .then(([cList, mList]) => {
        setComplaints(cList);
        setMatches(mList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const unverified = complaints.filter(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status));
  const assigned = complaints.filter(c => c.status === 'ASSIGNED');
  const critical = complaints.filter(c => c.priority === 'CRITICAL' && !['RESOLVED', 'CLOSED'].includes(c.status));
  const highOverlaps = matches.filter(m => m.similarityLevel === 'HIGH');

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Intake Officer Desk' }, { label: 'Dashboard' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <h1 className="font-heading text-lg font-bold text-[#20232D]">
            Centralized Intake & Verification Desk
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Initial scrutiny, institution accreditation check, and intelligent routing to AICTE Bureaus
          </p>
        </div>

        <button
          onClick={() => navigate('/intake/complaints')}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Inbox className="w-4 h-4" />
          <span>Open Verification Queue ({unverified.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Awaiting Verification</p>
          <p className="font-heading text-2xl font-bold text-[#D97706] mt-1 tabular-nums">{unverified.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Incoming fresh complaints</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Routed to Bureaus</p>
          <p className="font-heading text-2xl font-bold text-[#6366F1] mt-1 tabular-nums">{assigned.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Assigned to RB or PGRC</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Critical Urgency</p>
          <p className="font-heading text-2xl font-bold text-[#DC2626] mt-1 tabular-nums">{critical.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Severe capitation / safety risks</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Potential Overlaps</p>
          <p className="font-heading text-2xl font-bold text-[#5267E8] mt-1 tabular-nums">{highOverlaps.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">High cross-bureau candidates</p>
        </div>
      </div>

      {/* Intake Charts with Recharts */}
      {!loading && <IntakeCharts complaints={complaints} />}

      {/* Immediate Verification Action Queue */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8EAF0] flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Immediate Verification Queue
            </h3>
            <p className="text-[11px] text-[#747B8C]">Unverified cases pending accreditation validation and routing</p>
          </div>
          <button
            onClick={() => navigate('/intake/complaints')}
            className="text-xs text-[#5267E8] hover:text-[#4354D0] flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5"><LoadingSkeleton count={3} /></div>
        ) : unverified.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#747B8C]">
            Intake verification queue is currently clear!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] text-[#747B8C] uppercase tracking-wider text-[10px] border-b border-[#E8EAF0]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-5 py-3 font-semibold">Institution & AICTE ID</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Priority</th>
                  <th className="px-5 py-3 font-semibold">SLA Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] text-[#20232D]">
                {unverified.map(c => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB]/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-[#20232D]">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#747B8C]">
                      {c.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SlaBadge deadline={c.slaDeadline} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate('/intake/complaints')}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded transition-colors shadow-xs"
                      >
                        Verify & Assign
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

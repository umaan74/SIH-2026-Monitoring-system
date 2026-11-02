/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { DashboardStats, Institution } from '../../types';

interface SeniorAuthorityChartsProps {
  stats: DashboardStats;
  institutions: Institution[];
}

const customTooltipStyle = {
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  border: '1px solid #E8EAF0',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  color: '#20232D',
  fontSize: '11px',
  fontFamily: 'Inter, sans-serif',
  padding: '8px 12px'
};

export function SeniorAuthorityCharts({ stats, institutions }: SeniorAuthorityChartsProps) {
  // Format bureau names
  const bureauData = (stats.bureauDistribution || []).map(b => ({
    bureau: b.bureau.replace(/_/g, ' ').replace('CELL', '').replace('BUREAU', '').trim(),
    fullName: b.bureau,
    cases: b.count
  }));

  // Ageing data
  const ageingData = (stats.ageingDistribution || []).map(a => ({
    range: a.range,
    count: a.count,
    isCritical: a.range === '30+ Days'
  }));

  // Institutions hotspot ranking
  const institutionHotspots = [...institutions]
    .filter(i => (i.activeComplaintsCount || 0) > 0)
    .sort((a, b) => (b.activeComplaintsCount || 0) - (a.activeComplaintsCount || 0))
    .slice(0, 5)
    .map(inst => ({
      name: inst.name.length > 20 ? inst.name.substring(0, 18) + '...' : inst.name,
      fullName: inst.name,
      active: inst.activeComplaintsCount || 0,
      total: inst.totalComplaintsCount || 0,
      id: inst.aictePermanentId
    }));

  return (
    <div className="space-y-5">
      {/* Top Level Apex KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Total AICTE Complaints</p>
          <p className="font-heading text-2xl font-bold text-[#20232D] mt-1 tabular-nums">
            {stats.summary.totalComplaints}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-[#747B8C] mt-0.5">
            <span className="text-[#059669] font-medium">{stats.summary.resolvedComplaints} resolved</span>
            <span>·</span>
            <span className="text-[#5267E8] font-medium">{stats.summary.pendingComplaints} pending</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Institutions Under Scrutiny</p>
          <p className="font-heading text-2xl font-bold text-[#20232D] mt-1 tabular-nums">
            {stats.summary.activeInstitutionsInvolved}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">
            Across {stats.summary.totalInstitutions} verified AICTE institutes
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">SLA Overdue Escalations</p>
          <p className={`font-heading text-2xl font-bold mt-1 tabular-nums ${stats.summary.overdueComplaints > 0 ? 'text-[#DC2626]' : 'text-[#20232D]'}`}>
            {stats.summary.overdueComplaints}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">
            {stats.summary.escalatedComplaints} cases formally escalated to Apex
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Intelligent Overlaps</p>
          <p className="font-heading text-2xl font-bold text-[#5267E8] mt-1 tabular-nums">
            {stats.summary.potentialOverlapsCount}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">
            {stats.summary.highOverlapAlertsCount} cross-department conflicts flagged
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Bureau-wise Case Distribution */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Bureau-wise Case Load Distribution
              </h4>
              <p className="text-[11px] text-[#747B8C]">Cross-department case allocation and routing</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bureauData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="bureau" tick={{ fontSize: 10, fill: '#747B8C' }} angle={-15} textAnchor="end" stroke="#D8DCE4" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="cases" fill="#5267E8" radius={[4, 4, 0, 0]} name="Active Cases" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Case Ageing Analysis */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Complaint Ageing Report (Days in Queue)
              </h4>
              <p className="text-[11px] text-[#747B8C]">Tracking stale or delayed institutional complaints</p>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]">
              SLA Cutoff: 30 Days
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageingData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Complaints">
                  {ageingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.range === '30+ Days' ? '#EF4444' : entry.range === '16-30 Days' ? '#F59E0B' : '#5267E8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Top Grievance Hotspots */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Institutional Grievance Concentration Hotspots
            </h4>
            <p className="text-[11px] text-[#747B8C]">Institutions with highest frequency of active and cumulative complaints</p>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={institutionHotspots} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#747B8C' }} width={140} stroke="#D8DCE4" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar dataKey="active" fill="#EF4444" name="Active Open Cases" radius={[0, 4, 4, 0]} />
              <Bar dataKey="total" fill="#94A3B8" name="Total Lifetime Complaints" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

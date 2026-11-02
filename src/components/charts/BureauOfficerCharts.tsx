/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { Complaint, ComplaintMatch, BureauCell } from '../../types';

interface BureauOfficerChartsProps {
  complaints: Complaint[];
  matches: ComplaintMatch[];
  bureauName: BureauCell;
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

export function BureauOfficerCharts({ complaints, matches, bureauName }: BureauOfficerChartsProps) {
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | 'HIGH_CRITICAL' | 'MEDIUM_LOW'>('ALL');

  let filtered = complaints;
  if (priorityFilter === 'HIGH_CRITICAL') {
    filtered = complaints.filter(c => ['HIGH', 'CRITICAL'].includes(c.priority));
  } else if (priorityFilter === 'MEDIUM_LOW') {
    filtered = complaints.filter(c => ['MEDIUM', 'LOW'].includes(c.priority));
  }

  const now = Date.now();
  let assignedCount = 0;
  let underReviewCount = 0;
  let actionTakenCount = 0;
  let resolvedCount = 0;
  let overdueCount = 0;

  filtered.forEach(c => {
    if (['RESOLVED', 'CLOSED'].includes(c.status)) {
      resolvedCount++;
    } else {
      if (new Date(c.slaDeadline).getTime() < now) {
        overdueCount++;
      }
      if (c.status === 'ASSIGNED') assignedCount++;
      else if (c.status === 'UNDER_REVIEW') underReviewCount++;
      else if (c.status === 'ACTION_TAKEN') actionTakenCount++;
    }
  });

  const totalCases = filtered.length;
  const resolutionRate = totalCases > 0 ? Math.round((resolvedCount / totalCases) * 100) : 0;

  const workloadData = [
    { stage: 'Newly Assigned', count: assignedCount, fill: '#5267E8' },
    { stage: 'Under Inquiry', count: underReviewCount, fill: '#F59E0B' },
    { stage: 'Action Taken', count: actionTakenCount, fill: '#38BDF8' },
    { stage: 'Resolved', count: resolvedCount, fill: '#10B981' },
    { stage: 'SLA Overdue', count: overdueCount, fill: '#EF4444' }
  ];

  // Overlap Alert Breakdown
  const highOverlaps = matches.filter(m => m.similarityLevel === 'HIGH').length;
  const moderateOverlaps = matches.filter(m => m.similarityLevel === 'MODERATE').length;
  const lowOverlaps = matches.filter(m => m.similarityLevel === 'LOW').length;

  const overlapData = [
    { name: 'High Overlap (≥70%)', value: highOverlaps, color: '#EF4444' },
    { name: 'Moderate (45-69%)', value: moderateOverlaps, color: '#F59E0B' },
    { name: 'Low (<45%)', value: lowOverlaps, color: '#64748B' }
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-5">
      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Active Bureau Caseload</p>
          <p className="font-heading text-2xl font-bold text-[#20232D] mt-1 tabular-nums">
            {assignedCount + underReviewCount + actionTakenCount}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Assigned to this bureau</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Resolution Rate</p>
          <p className="font-heading text-2xl font-bold text-[#059669] mt-1 tabular-nums">
            {resolutionRate}%
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">{resolvedCount} cases closed successfully</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">SLA Overdue Risk</p>
          <p className={`font-heading text-2xl font-bold mt-1 tabular-nums ${overdueCount > 0 ? 'text-[#DC2626]' : 'text-[#20232D]'}`}>
            {overdueCount}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Cases past designated deadline</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Cross-Bureau Overlaps</p>
          <p className="font-heading text-2xl font-bold text-[#5267E8] mt-1 tabular-nums">
            {matches.length}
          </p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">{highOverlaps} critical overlaps flagged</p>
        </div>
      </div>

      {/* Filter and Charts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
          Workload Progression & Overlap Analytics
        </h3>
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E8EAF0] rounded-lg text-xs self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setPriorityFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${priorityFilter === 'ALL' ? 'bg-[#EEF1FD] text-[#5267E8] font-semibold' : 'text-[#747B8C] hover:text-[#20232D]'}`}
          >
            All Priorities
          </button>
          <button
            onClick={() => setPriorityFilter('HIGH_CRITICAL')}
            className={`px-3 py-1 rounded-md transition-colors ${priorityFilter === 'HIGH_CRITICAL' ? 'bg-[#EEF1FD] text-[#5267E8] font-semibold' : 'text-[#747B8C] hover:text-[#20232D]'}`}
          >
            High & Critical Only
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Workload Stages */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Pending Workload by Case Phase
              </h4>
              <p className="text-[11px] text-[#747B8C]">Live operational bottleneck identification</p>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workloadData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Cases">
                  {workloadData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overlap Alert Severity Distribution */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Cross-Bureau Overlap Alert Severity
              </h4>
              <p className="text-[11px] text-[#747B8C]">Hybrid similarity clustering across departments</p>
            </div>
            <span className="text-xs font-mono font-medium text-[#5267E8] bg-[#EEF1FD] border border-[#D2D9FA] px-2 py-0.5 rounded">
              {matches.length} Detected
            </span>
          </div>

          <div className="h-60">
            {overlapData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#747B8C]">
                No active cross-bureau overlaps detected
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overlapData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {overlapData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

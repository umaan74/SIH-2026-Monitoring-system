/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  AreaChart, 
  Area 
} from 'recharts';
import { Complaint } from '../../types';

interface StudentChartsProps {
  complaints: Complaint[];
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#38BDF8',
  UNDER_VERIFICATION: '#F59E0B',
  VERIFIED: '#6366F1',
  ASSIGNED: '#5267E8',
  UNDER_REVIEW: '#F59E0B',
  ACTION_TAKEN: '#3B82F6',
  RESOLVED: '#10B981',
  CLOSED: '#059669',
  REJECTED: '#EF4444',
  NEEDS_INFORMATION: '#EA580C'
};

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

export function StudentCharts({ complaints }: StudentChartsProps) {
  const statusMap: Record<string, number> = {};
  complaints.forEach(c => {
    statusMap[c.status] = (statusMap[c.status] || 0) + 1;
  });

  const pieData = Object.entries(statusMap).map(([name, value]) => ({
    name: name.replace(/_/g, ' '),
    rawStatus: name,
    value
  }));

  const trendData = [
    { period: 'Week 1', count: complaints.filter(c => c.createdAt < '2026-01-10').length },
    { period: 'Week 2', count: complaints.filter(c => c.createdAt >= '2026-01-10' && c.createdAt < '2026-01-18').length },
    { period: 'Week 3', count: complaints.filter(c => c.createdAt >= '2026-01-18' && c.createdAt < '2026-01-25').length },
    { period: 'Week 4', count: complaints.filter(c => c.createdAt >= '2026-01-25').length }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Chart 1: Status Distribution */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Complaint Status Overview
            </h4>
            <p className="text-[11px] text-[#747B8C]">Distribution of your submitted grievances</p>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-[#F7F8FA] border border-[#E8EAF0] text-[#747B8C]">
            {complaints.length} Total
          </span>
        </div>

        {pieData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-xs text-[#747B8C]">
            No complaints submitted yet
          </div>
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.rawStatus] || '#94A3B8'} 
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 justify-center pt-2 border-t border-[#E8EAF0]">
          {pieData.map(d => (
            <div key={d.name} className="flex items-center gap-1.5 text-[11px] text-[#747B8C]">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: STATUS_COLORS[d.rawStatus] || '#94A3B8' }} 
              />
              <span className="font-medium text-[#20232D]">{d.name}</span>
              <span className="text-[#9AA1B2]">({d.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Submission Progression */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Submission Progression Trend
            </h4>
            <p className="text-[11px] text-[#747B8C]">Activity timeline across recent evaluation periods</p>
          </div>
        </div>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="studentGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5267E8" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#5267E8" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
              <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="count" stroke="#5267E8" strokeWidth={2} fillOpacity={1} fill="url(#studentGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

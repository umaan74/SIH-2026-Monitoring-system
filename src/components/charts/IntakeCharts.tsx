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
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { Complaint } from '../../types';

interface IntakeChartsProps {
  complaints: Complaint[];
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

export function IntakeCharts({ complaints }: IntakeChartsProps) {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'UNVERIFIED' | 'ASSIGNED'>('ALL');

  let filtered = complaints;
  if (selectedFilter === 'UNVERIFIED') {
    filtered = complaints.filter(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status));
  } else if (selectedFilter === 'ASSIGNED') {
    filtered = complaints.filter(c => c.status !== 'SUBMITTED' && c.status !== 'UNDER_VERIFICATION');
  }

  // Group by category
  const categoryCounts: Record<string, number> = {};
  filtered.forEach(c => {
    categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => ({
    category: cat.length > 18 ? cat.substring(0, 16) + '...' : cat,
    fullCategory: cat,
    count
  })).sort((a, b) => b.count - a.count);

  const verificationTimeData = [
    { day: 'Mon', avgHours: 4.2, targetHours: 24, volume: 5 },
    { day: 'Tue', avgHours: 6.8, targetHours: 24, volume: 8 },
    { day: 'Wed', avgHours: 3.5, targetHours: 24, volume: 4 },
    { day: 'Thu', avgHours: 5.1, targetHours: 24, volume: 7 },
    { day: 'Fri', avgHours: 4.8, targetHours: 24, volume: 6 },
    { day: 'Sat', avgHours: 2.1, targetHours: 24, volume: 3 }
  ];

  return (
    <div className="space-y-4">
      {/* Interactive Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
          Intake Flow & Verification Analytics
        </h3>
        <div className="flex items-center gap-1 p-1 bg-white border border-[#E8EAF0] rounded-lg text-xs self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 rounded-md transition-colors ${selectedFilter === 'ALL' ? 'bg-[#EEF1FD] text-[#5267E8] font-semibold' : 'text-[#747B8C] hover:text-[#20232D]'}`}
          >
            All Intake ({complaints.length})
          </button>
          <button
            onClick={() => setSelectedFilter('UNVERIFIED')}
            className={`px-3 py-1 rounded-md transition-colors ${selectedFilter === 'UNVERIFIED' ? 'bg-[#EEF1FD] text-[#5267E8] font-semibold' : 'text-[#747B8C] hover:text-[#20232D]'}`}
          >
            Awaiting Verification ({complaints.filter(c => ['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status)).length})
          </button>
          <button
            onClick={() => setSelectedFilter('ASSIGNED')}
            className={`px-3 py-1 rounded-md transition-colors ${selectedFilter === 'ASSIGNED' ? 'bg-[#EEF1FD] text-[#5267E8] font-semibold' : 'text-[#747B8C] hover:text-[#20232D]'}`}
          >
            Routed to Bureaus ({complaints.filter(c => !['SUBMITTED', 'UNDER_VERIFICATION'].includes(c.status)).length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Inflow Chart */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Incoming Complaint Volume by Category
              </h4>
              <p className="text-[11px] text-[#747B8C]">Breakdown of grievances received at central desk</p>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#747B8C' }} angle={-15} textAnchor="end" stroke="#D8DCE4" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Bar dataKey="count" fill="#5267E8" radius={[4, 4, 0, 0]} name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Turnaround Time */}
        <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Verification Velocity (Average Hours)
              </h4>
              <p className="text-[11px] text-[#747B8C]">Processing speed vs 24h intake SLA benchmark</p>
            </div>
            <span className="text-xs font-mono font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0]">
              Avg: 4.4h
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={verificationTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8EAF0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#747B8C' }} stroke="#D8DCE4" />
                <YAxis tick={{ fontSize: 11, fill: '#747B8C' }} unit="h" stroke="#D8DCE4" />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="avgHours" stroke="#10B981" strokeWidth={2} name="Actual Turnaround (hrs)" activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="targetHours" stroke="#EF4444" strokeDasharray="4 4" strokeWidth={1.5} name="SLA Ceiling (24h)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

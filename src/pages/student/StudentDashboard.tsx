/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FilePlus2, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, SlaBadge } from '../../components/common/Badge';
import { StudentCharts } from '../../components/charts/StudentCharts';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getComplaints()
      .then(setComplaints)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = complaints.length;
  const pending = complaints.filter(c => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status)).length;
  const resolved = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Student Portal' }, { label: 'Dashboard' }]}>
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <h1 className="font-heading text-lg font-bold text-[#20232D]">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            AICTE Student Grievance Redressal Portal · Tracking and monitoring official case status
          </p>
        </div>

        <button
          onClick={() => navigate('/student/complaints/new')}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>File New Complaint</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Total Complaints Filed</p>
          <p className="font-heading text-2xl font-bold text-[#20232D] mt-1 tabular-nums">{total}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Official grievances under tracking</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Under Active Review</p>
          <p className="font-heading text-2xl font-bold text-[#D97706] mt-1 tabular-nums">{pending}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Inquiry & verification in progress</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
          <p className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider">Successfully Resolved</p>
          <p className="font-heading text-2xl font-bold text-[#059669] mt-1 tabular-nums">{resolved}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Official resolution delivered</p>
        </div>
      </div>

      {/* Interactive Recharts Analytics for Student */}
      {!loading && <StudentCharts complaints={complaints} />}

      {/* Recent Complaints Table */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8EAF0] flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Recent Complaints
            </h3>
            <p className="text-[11px] text-[#747B8C]">Your submitted cases and latest status transitions</p>
          </div>
          <button
            onClick={() => navigate('/student/complaints')}
            className="text-xs text-[#5267E8] hover:text-[#4354D0] flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5">
            <LoadingSkeleton count={3} />
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#747B8C]">
            You haven't submitted any complaints yet.{' '}
            <button 
              onClick={() => navigate('/student/complaints/new')} 
              className="text-[#5267E8] font-semibold hover:underline"
            >
              Submit your first grievance
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] text-[#747B8C] uppercase tracking-wider text-[10px] border-b border-[#E8EAF0]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-5 py-3 font-semibold">Institution</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">SLA Deadline</th>
                  <th className="px-5 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] text-[#20232D]">
                {complaints.slice(0, 5).map(c => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB]/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-semibold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-[#20232D] truncate max-w-xs">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-5 py-3.5 text-[#747B8C]">
                      {c.category}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SlaBadge deadline={c.slaDeadline} isClosed={['RESOLVED', 'CLOSED'].includes(c.status)} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/student/complaints/${c.id}`)}
                        className="px-2.5 py-1 text-xs text-[#5267E8] hover:text-[#4354D0] font-semibold hover:bg-[#EEF1FD] rounded-md transition-colors"
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

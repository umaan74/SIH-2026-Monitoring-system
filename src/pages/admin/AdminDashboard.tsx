/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  History, 
  Settings, 
  Activity, 
  FileText,
  ArrowRight,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { User, Institution, AuditLog, DashboardStats } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getUsers(),
      api.getInstitutions(),
      api.getAuditLogs(),
      api.getDashboardStats()
    ])
      .then(([uList, iList, aList, sData]) => {
        setUsers(uList);
        setInstitutions(iList);
        setAuditLogs(aList);
        setStats(sData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const officerCount = users.filter(u => ['INTAKE_OFFICER', 'RB_OFFICER', 'PGRC_OFFICER', 'SENIOR_AUTHORITY'].includes(u.role)).length;
  const adminCount = users.filter(u => ['ADMIN', 'SUPER_ADMIN'].includes(u.role)).length;

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Administration Console' }, { label: 'System Overview' }]}>
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white flex items-center gap-2.5 tracking-tight">
            <span>IN-Sight System Administration Console</span>
            <span className="text-[10px] bg-[#EEF1FD] text-[#5267E8] font-mono font-semibold px-2 py-0.5 rounded border border-[#5267E8]/20">
              RBAC Controller
            </span>
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            User access control, AICTE institution directory, security audit log, and system parameters
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/users')}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Manage Users & Roles ({users.length})</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
          <p className="text-[11px] font-semibold text-[#747B8C] uppercase tracking-wider">Registered Users</p>
          <p className="text-2xl font-heading font-bold text-[#20232D] dark:text-white mt-1 tabular-nums">{users.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">{studentCount} Students · {officerCount} Officers</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
          <p className="text-[11px] font-semibold text-[#747B8C] uppercase tracking-wider">AICTE Institutions</p>
          <p className="text-2xl font-heading font-bold text-[#20232D] dark:text-white mt-1 tabular-nums">{institutions.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Directory records indexed</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
          <p className="text-[11px] font-semibold text-[#747B8C] uppercase tracking-wider">Audit Log Trail</p>
          <p className="text-2xl font-heading font-bold text-[#5267E8] mt-1 tabular-nums">{auditLogs.length}</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Immutable governance actions</p>
        </div>

        <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
          <p className="text-[11px] font-semibold text-[#747B8C] uppercase tracking-wider">Platform Health</p>
          <p className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 mt-1">100%</p>
          <p className="text-[11px] text-[#747B8C] mt-0.5">Operational · Node/Express API</p>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => navigate('/admin/users')}
          className="p-5 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs hover:border-[#5267E8] transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EEF1FD] dark:bg-[#5267E8]/10 text-[#5267E8] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-heading font-semibold text-[#20232D] dark:text-white group-hover:text-[#5267E8] transition-colors">
            User Management & RBAC
          </h3>
          <p className="text-xs text-[#747B8C] leading-relaxed">
            View registered students, assign Bureau roles (RB, PGRC, Intake, Senior Authority), and activate/deactivate accounts.
          </p>
        </div>

        <div 
          onClick={() => navigate('/admin/institutions')}
          className="p-5 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs hover:border-[#5267E8] transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EEF1FD] dark:bg-[#5267E8]/10 text-[#5267E8] flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-heading font-semibold text-[#20232D] dark:text-white group-hover:text-[#5267E8] transition-colors">
            AICTE Institution Directory
          </h3>
          <p className="text-xs text-[#747B8C] leading-relaxed">
            Manage verified AICTE Permanent IDs, address details, accreditation statuses, and view institution complaint history.
          </p>
        </div>

        <div 
          onClick={() => navigate('/admin/audit-logs')}
          className="p-5 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs hover:border-[#5267E8] transition-all cursor-pointer space-y-2 group"
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-heading font-semibold text-[#20232D] dark:text-white group-hover:text-emerald-600 transition-colors">
            Immutable Audit Logs
          </h3>
          <p className="text-xs text-[#747B8C] leading-relaxed">
            Inspect timestamps, actor identities, previous vs new states for role changes, case reassignments, and matching decisions.
          </p>
        </div>
      </div>

      {/* Recent Audit Trail Preview */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8EAF0] dark:border-[#262A38] flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#20232D] dark:text-white">
              Recent System Audit Activity
            </h3>
            <p className="text-[11px] text-[#747B8C]">Live operational ledger of critical security & administrative events</p>
          </div>
          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="text-xs text-[#5267E8] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <span>View Full Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-6"><LoadingSkeleton count={3} /></div>
        ) : (
          <div className="divide-y divide-[#E8EAF0] dark:divide-[#262A38]">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-[#F7F8FA]/60 dark:hover:bg-[#202433]/40">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-[#5267E8]">{log.action}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] font-medium border border-[#E8EAF0] dark:border-[#2C3244]">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#747B8C]">
                    By <strong className="font-medium text-[#20232D] dark:text-white">{log.performedByName}</strong> ({log.performedByRole})
                  </p>
                </div>
                <span className="text-[11px] font-mono text-[#747B8C]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

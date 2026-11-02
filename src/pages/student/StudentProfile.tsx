/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Mail, Phone, ShieldCheck, Building2, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

export function StudentProfile() {
  const { user } = useAuth();

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Student Portal', href: '/student/dashboard' }, { label: 'My Profile' }]}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            Student Complainant Profile
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Verified institutional credential registry
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-[#E8EAF0] dark:border-[#262A38]">
            <div className="w-14 h-14 rounded-full bg-[#5267E8] text-white flex items-center justify-center text-lg font-heading font-bold shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-[#20232D] dark:text-white">{user?.name}</h2>
              <p className="text-xs text-[#747B8C]">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono bg-[#EEF1FD] text-[#5267E8] border border-[#5267E8]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Role: {user?.role}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
              <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Contact Phone</span>
              <p className="font-semibold text-[#20232D] dark:text-white">{user?.phone || 'Not provided'}</p>
            </div>

            <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
              <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Account Status</span>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">Active & Registered</p>
            </div>

            <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
              <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Registered On</span>
              <p className="font-semibold text-[#20232D] dark:text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
              <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Jurisdiction</span>
              <p className="font-semibold text-[#20232D] dark:text-white">AICTE National Redressal</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

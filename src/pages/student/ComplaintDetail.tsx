/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  FileText, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Layers,
  Paperclip,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { Timeline } from '../../components/complaints/Timeline';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function ComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isOfficer } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    api.getComplaintById(id)
      .then(setComplaint)
      .catch((err) => setErrorMsg(err.message || 'Failed to load case details.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Complaints', href: '/student/complaints' }, { label: 'Loading...' }]}>
        <LoadingSkeleton count={4} />
      </DashboardLayout>
    );
  }

  if (errorMsg || !complaint) {
    return (
      <DashboardLayout breadcrumbs={[{ label: 'Complaints', href: '/student/complaints' }, { label: 'Error' }]}>
        <div className="p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unable to View Case</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">{errorMsg || 'Complaint record not found.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      breadcrumbs={[
        { label: 'Complaints', href: user?.role === 'STUDENT' ? '/student/complaints' : '/authority/cases' },
        { label: complaint.trackingId }
      ]}
    >
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-xs text-[#747B8C] hover:text-[#20232D] dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Complaints List</span>
        </button>

        <div className="flex items-center gap-2">
          <SlaBadge deadline={complaint.slaDeadline} isClosed={['RESOLVED', 'CLOSED'].includes(complaint.status)} />
          <PriorityBadge priority={complaint.priority} />
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      {/* Case Overview Card */}
      <div className="p-6 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#E8EAF0] dark:border-[#262A38]">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#5267E8]">
                {complaint.trackingId}
              </span>
              <span className="text-[#E8EAF0] dark:text-[#262A38]">·</span>
              <span className="text-xs text-[#747B8C]">Submitted {new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            <h1 className="text-lg font-heading font-bold text-[#20232D] dark:text-white mt-1 tracking-tight">
              {complaint.subject}
            </h1>
          </div>

          {complaint.assignedBureau && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-semibold text-[#747B8C] block">Assigned Bureau</span>
              <span className="text-xs font-semibold text-[#20232D] dark:text-white">
                {complaint.assignedBureau.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Institution Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
            <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Institution</span>
            <p className="font-semibold text-[#20232D] dark:text-white">{complaint.institutionName}</p>
            <p className="text-[11px] font-mono text-[#747B8C]">AICTE ID: {complaint.aictePermanentId}</p>
          </div>

          <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
            <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Complaint Category</span>
            <p className="font-semibold text-[#20232D] dark:text-white">{complaint.category}</p>
            <p className="text-[11px] text-[#747B8C]">Priority: {complaint.priority}</p>
          </div>

          <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
            <span className="text-[10px] uppercase font-semibold text-[#747B8C] block mb-0.5">Complainant Reference</span>
            <p className="font-semibold text-[#20232D] dark:text-white">{complaint.studentName}</p>
            <p className="text-[11px] text-[#747B8C]">{complaint.studentEmail}</p>
          </div>
        </div>

        {/* Detailed Narrative */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-[#20232D] dark:text-white">
            Formal Allegations & Description
          </span>
          <div className="p-4 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg text-xs text-[#20232D] dark:text-slate-200 leading-relaxed border border-[#E8EAF0] dark:border-[#2C3244] whitespace-pre-line">
            {complaint.description}
          </div>
        </div>

        {/* Supporting Documents */}
        {complaint.supportingDocuments && complaint.supportingDocuments.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-semibold text-[#20232D] dark:text-white">
              Evidentiary Documents Attached ({complaint.supportingDocuments.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {complaint.supportingDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244] text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-[#5267E8] shrink-0" />
                    <span className="font-medium text-[#20232D] dark:text-slate-200 truncate">{doc.name}</span>
                  </div>
                  <span className="text-[10px] text-[#747B8C] font-mono shrink-0">
                    {Math.round(doc.size / 1024)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Visual Lifecycle Stepper and Chronological History */}
      <Timeline complaint={complaint} isOfficer={isOfficer} />
    </DashboardLayout>
  );
}

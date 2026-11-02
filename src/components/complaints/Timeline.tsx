/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldAlert,
  Lock
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { StatusBadge } from '../common/Badge';

interface TimelineProps {
  complaint: Complaint;
  isOfficer?: boolean;
}

const MILESTONES: ComplaintStatus[] = [
  'SUBMITTED',
  'UNDER_VERIFICATION',
  'VERIFIED',
  'ASSIGNED',
  'UNDER_REVIEW',
  'ACTION_TAKEN',
  'RESOLVED'
];

export function Timeline({ complaint, isOfficer = false }: TimelineProps) {
  const currentIdx = MILESTONES.indexOf(complaint.status);
  const isRejected = complaint.status === 'REJECTED';
  const isNeedsInfo = complaint.status === 'NEEDS_INFORMATION';
  const isEscalated = complaint.status === 'ESCALATED' || complaint.isEscalated;

  return (
    <div className="space-y-6">
      {/* Milestone Progress Bar */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <h4 className="font-heading text-xs font-semibold text-[#20232D] uppercase tracking-wider mb-6">
          Official Lifecycle Progress
        </h4>

        {/* Stepper Grid */}
        <div className="relative">
          {/* Background Connector Bar */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E8EAF0] -z-0 hidden md:block" />

          <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
            {MILESTONES.map((step, index) => {
              const isPast = currentIdx >= index && !isRejected;
              const isCurrent = complaint.status === step;

              let icon = <Clock className="w-3.5 h-3.5" />;
              let dotClass = 'bg-[#F7F8FA] text-[#747B8C] border-[#E8EAF0]';

              if (isPast && !isCurrent) {
                icon = <CheckCircle2 className="w-4 h-4 text-white" />;
                dotClass = 'bg-[#5267E8] text-white border-[#5267E8] shadow-xs';
              } else if (isCurrent) {
                icon = <span className="w-2 h-2 rounded-full bg-white animate-ping" />;
                dotClass = 'bg-[#5267E8] text-white border-[#5267E8] ring-4 ring-[#5267E8]/20 shadow-xs';
              }

              return (
                <div key={step} className="flex flex-col items-center text-center relative z-10">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${dotClass}`}>
                    {icon}
                  </div>
                  <span className={`text-[11px] font-medium mt-2 leading-tight ${
                    isCurrent ? 'text-[#5267E8] font-bold' : isPast ? 'text-[#20232D]' : 'text-[#747B8C]'
                  }`}>
                    {step.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Exceptional Status Callouts */}
        {isRejected && (
          <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center gap-2 text-xs text-[#B91C1C]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>Complaint was rejected after intake verification. See official remarks below.</span>
          </div>
        )}

        {isNeedsInfo && (
          <div className="mt-4 p-3 bg-[#FFF7ED] border border-[#FFEDD5] rounded-lg flex items-center gap-2 text-xs text-[#C2410C]">
            <AlertCircle className="w-4 h-4 text-[#EA580C] shrink-0" />
            <span>Additional information has been requested from complainant before proceeding.</span>
          </div>
        )}

        {isEscalated && (
          <div className="mt-4 p-3 bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg flex items-center gap-2 text-xs text-[#B91C1C] font-medium">
            <ShieldAlert className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>Case escalated to AICTE Apex Governance / Senior Authority for urgent cross-bureau intervention.</span>
          </div>
        )}
      </div>

      {/* Audit Action History */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs space-y-4">
        <h4 className="font-heading text-xs font-semibold text-[#20232D] uppercase tracking-wider">
          Case Action History & Remarks
        </h4>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E8EAF0]">
          {complaint.actionsHistory && complaint.actionsHistory.map((action, i) => (
            <div key={action.id || i} className="relative group">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-[#5267E8] ring-4 ring-white" />

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#20232D]">
                    {action.changedByName}
                  </span>
                  <span className="text-[#747B8C]">({action.changedByRole.replace(/_/g, ' ')})</span>
                  <span className="text-[#D8DCE4]">·</span>
                  <StatusBadge status={action.newStatus} />
                  <span className="text-[#D8DCE4]">·</span>
                  <span className="text-[11px] font-mono text-[#747B8C]">
                    {new Date(action.timestamp).toLocaleString([], { 
                      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                    })}
                  </span>
                </div>

                {/* Public Official Remarks */}
                <div className="p-3 bg-[#F7F8FA] rounded-lg text-xs text-[#20232D] leading-relaxed border border-[#E8EAF0]">
                  <p className="font-medium text-[11px] text-[#747B8C] mb-0.5">Official Public Remark:</p>
                  <p>{action.remarks}</p>
                </div>

                {/* Internal Officer Notes (Officer-only visibility) */}
                {isOfficer && action.internalNotes && (
                  <div className="p-2.5 bg-[#FFFBEB] rounded-lg text-xs text-[#B45309] border border-[#FDE68A] flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-[#D97706] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold text-[11px] text-[#B45309]">Internal Officer Note (Confidential): </span>
                      <span>{action.internalNotes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

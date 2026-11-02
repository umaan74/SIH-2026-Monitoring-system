/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ComplaintStatus } from '../../types';

interface StatusBadgeProps {
  status: ComplaintStatus | string;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className = '', showDot = true }: StatusBadgeProps) {
  let bg = 'bg-[#F4F5F7] text-[#4A5568] border-[#E2E8F0]';
  let dot = 'bg-[#94A3B8]';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'SUBMITTED':
      bg = 'bg-[#F0F4FE] text-[#3B66D4] border-[#D4E0FB]';
      dot = 'bg-[#5267E8]';
      break;
    case 'UNDER_VERIFICATION':
    case 'UNDER_REVIEW':
      bg = 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]';
      dot = 'bg-[#F59E0B]';
      break;
    case 'VERIFIED':
    case 'ASSIGNED':
      bg = 'bg-[#EEF2FF] text-[#4F46E5] border-[#DDD6FE]';
      dot = 'bg-[#6366F1]';
      break;
    case 'ACTION_TAKEN':
      bg = 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      dot = 'bg-[#3B82F6]';
      break;
    case 'RESOLVED':
    case 'CLOSED':
      bg = 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
      dot = 'bg-[#10B981]';
      break;
    case 'NEEDS_INFORMATION':
      bg = 'bg-[#FFF7ED] text-[#C2410C] border-[#FFEDD5]';
      dot = 'bg-[#F97316]';
      break;
    case 'REJECTED':
      bg = 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]';
      dot = 'bg-[#EF4444]';
      break;
    case 'ESCALATED':
      bg = 'bg-[#FEF2F2] text-[#B91C1C] border-[#FCA5A5] font-semibold';
      dot = 'bg-[#DC2626]';
      break;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border ${bg} ${className}`}>
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} aria-hidden="true" />}
      <span className="tracking-wide uppercase font-semibold text-[10px]">{label}</span>
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' }) {
  const map: Record<string, { bg: string; dot: string }> = {
    LOW: { bg: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]', dot: 'bg-[#94A3B8]' },
    MEDIUM: { bg: 'bg-[#EEF1FD] text-[#5267E8] border-[#D5DCFB]', dot: 'bg-[#5267E8]' },
    HIGH: { bg: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]', dot: 'bg-[#F59E0B]' },
    CRITICAL: { bg: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA] font-semibold', dot: 'bg-[#EF4444]' }
  };

  const current = map[priority] || map.MEDIUM;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} aria-hidden="true" />
      {priority}
    </span>
  );
}

export function SlaBadge({ deadline, isClosed = false }: { deadline: string; isClosed?: boolean }) {
  if (isClosed) {
    return (
      <span className="inline-flex items-center text-[11px] text-[#747B8C] font-mono">
        SLA Concluded
      </span>
    );
  }

  const deadlineMs = new Date(deadline).getTime();
  const nowMs = Date.now();
  const diffDays = Math.ceil((deadlineMs - nowMs) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA] tabular-nums">
        Overdue by {Math.abs(diffDays)}d
      </span>
    );
  }

  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A] tabular-nums">
        {diffDays}d remaining
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-[#4A5568] bg-[#F8FAFC] border border-[#E2E8F0] font-mono tabular-nums">
      {diffDays}d remaining
    </span>
  );
}

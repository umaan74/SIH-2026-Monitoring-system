/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-dashed border-[#E8EAF0]">
      <div className="w-11 h-11 rounded-xl bg-[#F7F8FA] border border-[#E8EAF0] flex items-center justify-center text-[#747B8C] mb-3.5">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-heading text-sm font-semibold text-[#20232D] tracking-tight">{title}</h3>
      <p className="text-xs text-[#747B8C] max-w-sm mt-1 mb-5 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

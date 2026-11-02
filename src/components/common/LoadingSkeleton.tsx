/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export function LoadingSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="h-12 bg-white rounded-xl border border-[#E8EAF0] w-full flex items-center px-4 gap-4"
        >
          <div className="w-16 h-3 bg-[#E8EAF0] rounded-sm" />
          <div className="flex-1 h-3 bg-[#F2F4F8] rounded-sm" />
          <div className="w-20 h-3 bg-[#E8EAF0] rounded-sm" />
        </div>
      ))}
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GitCompare, Filter, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintMatch } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MatchingResultCard } from '../../components/matching/MatchingResultCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function RbOverlaps() {
  const [matches, setMatches] = useState<ComplaintMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState('ALL');
  const [isScanning, setIsScanning] = useState(false);

  const loadMatches = () => {
    setLoading(true);
    api.getMatches()
      .then(setMatches)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleScan = async () => {
    try {
      setIsScanning(true);
      await api.triggerMatchingScan();
      loadMatches();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const filtered = matches.filter(m => {
    return levelFilter === 'ALL' || m.similarityLevel === levelFilter;
  });

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Regulation Bureau', href: '/rb/dashboard' }, { label: 'Intelligent Overlaps' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white flex items-center gap-2.5 tracking-tight">
            <span>Intelligent Case Overlap Alerts</span>
            <span className="text-[10px] bg-[#EEF1FD] text-[#5267E8] font-mono font-medium px-2 py-0.5 rounded border border-[#5267E8]/20">
              Hybrid Transformer Engine
            </span>
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Cross-bureau correlation between Regulation Bureau (RB) and Public Grievance Cell (PGRC)
          </p>
        </div>

        <button
          onClick={handleScan}
          disabled={isScanning}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>Re-run Hybrid Matching Engine</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg self-start text-xs">
        {['ALL', 'HIGH', 'MODERATE', 'LOW'].map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(lvl)}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
              levelFilter === lvl
                ? 'bg-white dark:bg-[#1A1D27] text-[#5267E8] shadow-xs'
                : 'text-[#747B8C] hover:text-[#20232D] dark:hover:text-white'
            }`}
          >
            {lvl === 'ALL' ? `All Alerts (${matches.length})` : `${lvl} Similarity (${matches.filter(m => m.similarityLevel === lvl).length})`}
          </button>
        ))}
      </div>

      {/* Results List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-xs text-[#747B8C] bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38]">
          No overlap candidates found matching "{levelFilter}".
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(match => (
            <MatchingResultCard
              key={match.id}
              match={match}
              onDecisionUpdated={(updated) => {
                setMatches(prev => prev.map(m => m.id === updated.id ? updated : m));
              }}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

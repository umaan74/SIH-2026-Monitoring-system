/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Sparkles, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../../services/api';
import { ComplaintMatch, Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MatchingResultCard } from '../../components/matching/MatchingResultCard';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

export function CrossBureauCoordination() {
  const [matches, setMatches] = useState<ComplaintMatch[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Embedding model control panel state
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [activeModel, setActiveModel] = useState<any>(null);
  const [isSwitchingModel, setIsSwitchingModel] = useState(false);
  const [modelChangeSuccess, setModelChangeSuccess] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getMatches(),
      api.getComplaints(),
      fetch('/api/matches/models', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('insight_jwt_token')}` }
      }).then(r => r.json()).catch(() => ({}))
    ])
      .then(([mList, cList, modelData]) => {
        setMatches(mList);
        setComplaints(cList);
        if (modelData.models) setAvailableModels(modelData.models);
        if (modelData.activeModel) setActiveModel(modelData.activeModel);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectModel = async (modelName: string) => {
    try {
      setIsSwitchingModel(true);
      setModelChangeSuccess('');
      const res = await fetch('/api/matches/models/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('insight_jwt_token')}`
        },
        body: JSON.stringify({ modelName })
      });
      const data = await res.json();
      if (res.ok) {
        setActiveModel(data.activeModel);
        setModelChangeSuccess(`Embedding model updated to "${data.activeModel.name}". Recalculated ${data.recalculatedMatchesCount} candidate pairs.`);
        const updatedMatches = await api.getMatches();
        setMatches(updatedMatches);
      } else {
        alert(data.error || 'Failed to switch model.');
      }
    } catch (err: any) {
      alert(err.message || 'Error updating model.');
    } finally {
      setIsSwitchingModel(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Executive Governance', href: '/authority/dashboard' }, { label: 'Cross-Bureau Coordination' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-lg font-bold text-[#20232D] flex items-center gap-2">
            <span>Cross-Bureau Case Coordination & Matching Hub</span>
            <span className="text-[10px] bg-[#EEF1FD] text-[#5267E8] font-mono px-2 py-0.5 rounded border border-[#D2D9FA]">
              SIH '26 Core Innovation
            </span>
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Synchronizing investigations between Regulation Bureau (RB) and Grievance Cell (PGRC) to eliminate duplicated efforts
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3 py-1.5 text-xs text-[#20232D] bg-white border border-[#E8EAF0] rounded-lg hover:bg-[#F7F8FA] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#747B8C]" />
          <span>Refresh Coordination Index</span>
        </button>
      </div>

      {/* Embedding Model Selection & Fine-Tuning Control Panel */}
      <div className="p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8EAF0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EEF1FD] text-[#5267E8] border border-[#D2D9FA] flex items-center justify-center shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
                Sentence-Transformer Embedding Model Architecture
              </h3>
              <p className="text-[11px] text-[#747B8C]">
                Select and deploy specialized semantic encoders based on grievance domain complexity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#747B8C]">Active Model:</span>
            <span className="text-xs font-mono font-bold text-[#5267E8] bg-[#EEF1FD] px-2.5 py-1 rounded border border-[#D2D9FA]">
              {activeModel?.name || 'aicte-grievance-domain-bert'}
            </span>
          </div>
        </div>

        {modelChangeSuccess && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg text-xs text-[#047857] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>{modelChangeSuccess}</span>
          </div>
        )}

        {/* Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {availableModels.map(model => {
            const isCurrent = activeModel?.name === model.name;
            return (
              <div
                key={model.name}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-[#EEF1FD]/40 border-[#5267E8] shadow-xs ring-1 ring-[#5267E8]/20'
                    : 'bg-[#F7F8FA] border-[#E8EAF0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#20232D] truncate">
                    {model.name}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-1.5 py-0.5 rounded">
                      ACTIVE
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#747B8C] leading-relaxed mb-3">
                  {model.description}
                </p>

                <div className="text-[10px] text-[#747B8C] font-mono space-y-1 mb-4 pt-2 border-t border-[#E8EAF0]">
                  <p>Dimensionality: {model.dimension} Coordinates</p>
                  <p className="truncate">Specialization: {model.fineTunedFor}</p>
                </div>

                <button
                  onClick={() => handleSelectModel(model.name)}
                  disabled={isCurrent || isSwitchingModel}
                  className={`w-full py-1.5 px-3 text-xs font-semibold rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-[#E8EAF0] text-[#747B8C] cursor-default'
                      : 'bg-[#5267E8] hover:bg-[#4354D0] text-white shadow-xs'
                  }`}
                >
                  {isCurrent ? 'Currently Deployed' : isSwitchingModel ? 'Re-indexing...' : 'Deploy & Re-score'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Overlaps Feed */}
      <div className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
            Detected Cross-Bureau Overlaps ({matches.length})
          </h3>
          <span className="text-xs text-[#747B8C]">
            Ranked by composite AICTE Permanent ID + Category + Embedding score
          </span>
        </div>

        {loading ? (
          <LoadingSkeleton count={3} />
        ) : matches.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C] bg-white rounded-xl border border-[#E8EAF0]">
            No overlapping cases detected across bureaus.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map(m => (
              <MatchingResultCard
                key={m.id}
                match={m}
                onDecisionUpdated={(updated) => {
                  setMatches(prev => prev.map(item => item.id === updated.id ? updated : item));
                }}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

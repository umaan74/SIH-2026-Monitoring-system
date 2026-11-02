/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  GitCompare, 
  CheckCircle, 
  XCircle, 
  Link as LinkIcon, 
  Building2, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ComplaintMatch } from '../../types';
import { api } from '../../services/api';

interface MatchingResultCardProps {
  match: ComplaintMatch;
  onDecisionUpdated?: (updated: ComplaintMatch) => void;
  canManage?: boolean;
}

export function MatchingResultCard({ match, onDecisionUpdated, canManage = true }: MatchingResultCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [pendingDecision, setPendingDecision] = useState<'CONFIRMED_RELATED' | 'NOT_RELATED' | 'LINKED' | null>(null);

  const handleAction = async (decision: 'CONFIRMED_RELATED' | 'NOT_RELATED' | 'LINKED') => {
    setPendingDecision(decision);
    setShowNotesModal(true);
  };

  const submitDecision = async () => {
    if (!pendingDecision) return;
    try {
      setIsUpdating(true);
      const updated = await api.recordMatchDecision(match.id, pendingDecision, decisionNotes || `Marked as ${pendingDecision}`);
      setShowNotesModal(false);
      setDecisionNotes('');
      if (onDecisionUpdated) onDecisionUpdated(updated);
    } catch (err) {
      console.error('Failed to submit match decision:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const levelStyles = {
    HIGH: {
      badge: 'bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]',
      bar: 'bg-[#EF4444]'
    },
    MODERATE: {
      badge: 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]',
      bar: 'bg-[#F59E0B]'
    },
    LOW: {
      badge: 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]',
      bar: 'bg-[#94A3B8]'
    }
  };

  const currentLevel = levelStyles[match.similarityLevel] || levelStyles.LOW;

  return (
    <div className="p-5 rounded-xl border border-[#E8EAF0] bg-white shadow-xs space-y-4">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E8EAF0]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#EEF1FD] text-[#5267E8] border border-[#D2D9FA] flex items-center justify-center shadow-2xs shrink-0">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-semibold text-[#20232D]">
                Intelligent Overlap Candidate
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${currentLevel.badge}`}>
                {match.similarityLevel} SIMILARITY ({match.overallScore}%)
              </span>
            </div>
            <p className="text-[11px] text-[#747B8C] flex items-center gap-1.5 mt-0.5">
              <Building2 className="w-3 h-3 text-[#9AA1B2]" />
              <span className="font-medium text-[#20232D]">{match.institutionName}</span>
              <span className="font-mono text-[#747B8C]">({match.aictePermanentId})</span>
            </p>
          </div>
        </div>

        {/* Review Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
            match.reviewStatus === 'CONFIRMED_RELATED'
              ? 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'
              : match.reviewStatus === 'LINKED'
              ? 'bg-[#EEF1FD] text-[#5267E8] border-[#D2D9FA]'
              : match.reviewStatus === 'NOT_RELATED'
              ? 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
              : 'bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]'
          }`}>
            {match.reviewStatus.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Cross-case comparison cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Source Complaint */}
        <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E8EAF0] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold text-[#5267E8]">{match.sourceTrackingId}</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E8EAF0] text-[#747B8C]">
              {match.sourceBureau ? match.sourceBureau.replace(/_/g, ' ') : 'Central Intake'}
            </span>
          </div>
          <p className="text-xs text-[#20232D] font-medium line-clamp-2">
            Case primary inquiry under investigation
          </p>
        </div>

        {/* Target Complaint */}
        <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E8EAF0] space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-mono font-bold text-[#6366F1]">{match.targetTrackingId}</span>
            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-white border border-[#E8EAF0] text-[#747B8C]">
              {match.targetBureau ? match.targetBureau.replace(/_/g, ' ') : 'Central Intake'}
            </span>
          </div>
          <p className="text-xs text-[#20232D] font-medium line-clamp-2">
            Related case record with overlapping allegations
          </p>
        </div>
      </div>

      {/* Explainable Matching Breakdown */}
      <div className="p-3.5 bg-[#F7F8FA] rounded-lg border border-[#E8EAF0] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#20232D]">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#5267E8]" />
            <span className="font-heading">Hybrid Match Factor Decomposition</span>
          </div>
          <span className="font-mono text-xs text-[#5267E8] font-bold">{match.overallScore}/100</span>
        </div>

        {/* Progress bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
          <div>
            <div className="flex justify-between text-[#747B8C] mb-1">
              <span>Institution ID Match (40%)</span>
              <span className="font-mono tabular-nums text-[#20232D] font-medium">{match.matchFactors.institutionScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#E8EAF0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#5267E8] rounded-full" 
                style={{ width: `${match.matchFactors.institutionScore}%` }} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#747B8C] mb-1">
              <span>Rules & Category (25%)</span>
              <span className="font-mono tabular-nums text-[#20232D] font-medium">{match.matchFactors.categoryScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#E8EAF0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#6366F1] rounded-full" 
                style={{ width: `${match.matchFactors.categoryScore}%` }} 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[#747B8C] mb-1">
              <span>TF-IDF Text Similarity (35%)</span>
              <span className="font-mono tabular-nums text-[#20232D] font-medium">{match.matchFactors.textSimilarityScore}%</span>
            </div>
            <div className="h-1.5 w-full bg-[#E8EAF0] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#059669] rounded-full" 
                style={{ width: `${match.matchFactors.textSimilarityScore}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Matched Keywords Tags */}
        {match.matchFactors.matchedKeywords && match.matchFactors.matchedKeywords.length > 0 && (
          <div className="pt-2 border-t border-[#E8EAF0] flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-[#747B8C] font-medium">Overlapping Terms:</span>
            {match.matchFactors.matchedKeywords.map((kw, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#E8EAF0] text-[#20232D]">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* Explainability bullets */}
        <div className="space-y-1 pt-1 text-[11px] text-[#747B8C]">
          {match.matchFactors.explanation.map((exp, idx) => (
            <p key={idx} className="flex items-start gap-1.5">
              <span className="text-[#5267E8] font-bold mt-0.5">·</span>
              <span>{exp}</span>
            </p>
          ))}
        </div>
      </div>

      {/* Decision metadata if already reviewed */}
      {match.reviewedByName && (
        <div className="text-[11px] text-[#747B8C] bg-[#F7F8FA] p-2.5 rounded-lg border border-[#E8EAF0]">
          <span className="font-semibold text-[#20232D]">Reviewed by {match.reviewedByName}</span>
          <span className="mx-1">·</span>
          <span>{match.reviewedAt ? new Date(match.reviewedAt).toLocaleDateString() : ''}</span>
          {match.reviewDecisionNotes && (
            <p className="mt-1 text-[#20232D] italic">
              "{match.reviewDecisionNotes}"
            </p>
          )}
        </div>
      )}

      {/* Action Buttons for Authorized Officers */}
      {canManage && (
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-[#E8EAF0]">
          <button
            onClick={() => handleAction('CONFIRMED_RELATED')}
            disabled={isUpdating || match.reviewStatus === 'CONFIRMED_RELATED'}
            className="px-3 py-1.5 text-xs font-medium text-[#047857] bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#A7F3D0] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Mark as Related</span>
          </button>

          <button
            onClick={() => handleAction('LINKED')}
            disabled={isUpdating || match.reviewStatus === 'LINKED'}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Link Cross-Bureau Cases</span>
          </button>

          <button
            onClick={() => handleAction('NOT_RELATED')}
            disabled={isUpdating || match.reviewStatus === 'NOT_RELATED'}
            className="px-3 py-1.5 text-xs font-medium text-[#747B8C] bg-white hover:bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Dismiss (Not Related)</span>
          </button>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-[#E8EAF0] p-6 space-y-4">
            <h4 className="font-heading text-sm font-semibold text-[#20232D]">
              Confirm Overlap Decision: {pendingDecision?.replace(/_/g, ' ')}
            </h4>
            <p className="text-xs text-[#747B8C]">
              Provide justification or official coordination notes for cross-bureau case linkage.
            </p>
            <textarea
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="e.g., Cross-verified with PGRC Ombudsman hearing notes. Case files unified for joint inspection."
              rows={3}
              className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg text-[#20232D] focus:outline-hidden focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8]"
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8EAF0]">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#747B8C] hover:bg-[#F7F8FA] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={isUpdating}
                className="px-4 py-1.5 text-xs font-medium text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                {isUpdating && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Confirm Decision
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

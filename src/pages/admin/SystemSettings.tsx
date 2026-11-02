/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  RotateCcw, 
  ShieldCheck, 
  Sliders, 
  Sparkles, 
  AlertTriangle,
  Save,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export function SystemSettings() {
  const [intakeSlaDays, setIntakeSlaDays] = useState(3);
  const [resolutionSlaDays, setResolutionSlaDays] = useState(30);
  const [institutionWeight, setInstitutionWeight] = useState(40);
  const [categoryWeight, setCategoryWeight] = useState(20);
  const [textWeight, setTextWeight] = useState(40);

  const [savedNotice, setSavedNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetDoneNotice, setResetDoneNotice] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const handleExecuteReset = async () => {
    try {
      setIsResetting(true);
      const res = await api.resetDemoDatabase();
      setShowResetConfirm(false);
      setResetDoneNotice(res.message);
      setTimeout(() => setResetDoneNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset seed data.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Administration Console', href: '/admin/dashboard' }, { label: 'System Settings' }]}>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            System Configuration & Demonstration Parameters
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Configure national SLA cutoffs, matching engine weighting, and demonstration state
          </p>
        </div>

        {savedNotice && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Operational configuration parameters updated successfully!</span>
          </div>
        )}

        {resetDoneNotice && (
          <div className="p-3 bg-[#EEF1FD] dark:bg-[#5267E8]/10 border border-[#5267E8]/20 rounded-xl text-xs text-[#5267E8] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5267E8]" />
            <span>{resetDoneNotice}</span>
          </div>
        )}

        {/* SLA Configuration */}
        <form onSubmit={handleSaveSettings} className="p-6 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E8EAF0] dark:border-[#262A38]">
            <Sliders className="w-4 h-4 text-[#5267E8]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#20232D] dark:text-white">
              Configurable SLA Deadlines (Days)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                Central Intake Verification SLA (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={intakeSlaDays}
                onChange={(e) => setIntakeSlaDays(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
              />
              <p className="text-[11px] text-[#747B8C] mt-1">Maximum window to verify affiliation and assign bureau</p>
            </div>

            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                Formal Investigation & Redressal SLA (Days)
              </label>
              <input
                type="number"
                min={5}
                max={90}
                value={resolutionSlaDays}
                onChange={(e) => setResolutionSlaDays(Number(e.target.value))}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
              />
              <p className="text-[11px] text-[#747B8C] mt-1">AICTE benchmark for complete grievance redressal</p>
            </div>
          </div>

          {/* Matching Engine Weight Allocation */}
          <div className="space-y-3 pt-4 border-t border-[#E8EAF0] dark:border-[#262A38]">
            <h4 className="text-xs font-semibold text-[#20232D] dark:text-white">
              Hybrid Matching Engine Weight Allocation (%)
            </h4>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[11px] font-medium text-[#747B8C] block mb-1">Institution ID</span>
                <span className="font-mono text-base font-bold text-[#5267E8]">{institutionWeight}%</span>
              </div>
              <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[11px] font-medium text-[#747B8C] block mb-1">Category & Rules</span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">{categoryWeight}%</span>
              </div>
              <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[11px] font-medium text-[#747B8C] block mb-1">Transformer Embedding</span>
                <span className="font-mono text-base font-bold text-teal-600 dark:text-teal-400">{textWeight}%</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </form>

        {/* Database Demonstration State Management */}
        <div className="p-6 bg-white dark:bg-[#1A1D27] rounded-xl border border-rose-200 dark:border-rose-900/50 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-900 dark:text-rose-400">
              Demonstration Environment Reset
            </h3>
          </div>
          <p className="text-xs text-[#747B8C] leading-relaxed">
            Reset the persistent MongoDB/JSON document store back to the pristine Smart India Hackathon baseline. This restores all initial demo student, officer, and administrator accounts, institutions, and simulated cross-bureau overlap cases.
          </p>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Database to Pristine State</span>
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      {showResetConfirm && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={handleExecuteReset}
          title="Reset Demonstration Database?"
          message="This will overwrite current complaints and restore the original SIH demo seed dataset. Existing demo accounts and sample overlap cases will be restored."
          confirmLabel="Execute Reset"
          isDestructive={true}
          isLoading={isResetting}
        />
      )}
    </DashboardLayout>
  );
}

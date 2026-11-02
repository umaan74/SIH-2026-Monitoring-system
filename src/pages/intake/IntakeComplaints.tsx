/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  ArrowRight, 
  Building2, 
  Layers, 
  AlertTriangle, 
  Send, 
  X, 
  FileText,
  GitCompare,
  Paperclip
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, ComplaintMatch, BureauCell, ComplaintStatus } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, PriorityBadge, SlaBadge } from '../../components/common/Badge';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export function IntakeComplaints() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [matches, setMatches] = useState<ComplaintMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Verification modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<'ASSIGN_RB' | 'ASSIGN_PGRC' | 'NEEDS_INFO' | 'REJECT'>('ASSIGN_RB');
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([api.getComplaints(), api.getMatches()])
      .then(([cList, mList]) => {
        setComplaints(cList);
        setMatches(mList);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const openActionModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setRemarks('');
    setInternalNotes('');
    setSuccessNotice('');
    // Suggest default routing based on category
    if (['Faculty and Teaching', 'Infrastructure', 'Capitation Fee & Exploitation'].includes(complaint.category)) {
      setActionType('ASSIGN_RB');
      setRemarks(`Verified institutional identity. Regulatory compliance issue routed to Regulation Bureau for surprise inquiry.`);
    } else {
      setActionType('ASSIGN_PGRC');
      setRemarks(`Student welfare issue routed to Public Grievance Redressal Cell for ombudsman hearing.`);
    }
  };

  const handleExecuteAction = async () => {
    if (!selectedComplaint) return;
    if (!remarks.trim()) {
      alert('Official remarks are required.');
      return;
    }

    try {
      setIsProcessing(true);

      if (actionType === 'ASSIGN_RB') {
        await api.assignComplaint(selectedComplaint.id, {
          assignedBureau: 'REGULATION_BUREAU',
          assignedOfficerId: 'usr-rb',
          assignedOfficerName: 'Virendra Kashyap',
          remarks
        });
      } else if (actionType === 'ASSIGN_PGRC') {
        await api.assignComplaint(selectedComplaint.id, {
          assignedBureau: 'PUBLIC_GRIEVANCE_REDRESSAL_CELL',
          assignedOfficerId: 'usr-pgrc',
          assignedOfficerName: 'Dr. Meenakshi Sundaram',
          remarks
        });
      } else if (actionType === 'NEEDS_INFO') {
        await api.updateComplaintStatus(selectedComplaint.id, {
          newStatus: 'NEEDS_INFORMATION',
          remarks,
          internalNotes
        });
      } else if (actionType === 'REJECT') {
        await api.updateComplaintStatus(selectedComplaint.id, {
          newStatus: 'REJECTED',
          remarks,
          internalNotes
        });
      }

      setSuccessNotice('Intake routing recorded successfully!');
      setTimeout(() => {
        setSelectedComplaint(null);
        loadData();
      }, 900);
    } catch (err: any) {
      alert(err.message || 'Failed to update complaint.');
    } finally {
      setIsProcessing(false);
    }
  };

  const filtered = complaints.filter(c => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      c.trackingId.toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.institutionName.toLowerCase().includes(q) ||
      c.aictePermanentId.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  // Find matches related to the modal complaint
  const relatedMatches = selectedComplaint 
    ? matches.filter(m => m.sourceComplaintId === selectedComplaint.id || m.targetComplaintId === selectedComplaint.id)
    : [];

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Intake Officer Desk', href: '/intake/dashboard' }, { label: 'Verification Queue' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            Grievance Intake & Verification Queue
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Validate institutional affiliation and route to Regulation Bureau (RB) or Grievance Cell (PGRC)
          </p>
        </div>

        <button
          onClick={loadData}
          className="px-3.5 py-1.5 text-xs font-medium text-[#20232D] dark:text-slate-200 bg-white dark:bg-[#1A1D27] border border-[#E8EAF0] dark:border-[#262A38] rounded-lg hover:bg-[#F7F8FA] dark:hover:bg-[#202433] transition-colors self-start sm:self-auto cursor-pointer"
        >
          Refresh Queue
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search AICTE Permanent ID, Case, Subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          {['ALL', 'SUBMITTED', 'UNDER_VERIFICATION', 'ASSIGNED', 'NEEDS_INFORMATION'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#5267E8] text-white font-medium shadow-xs'
                  : 'bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] hover:text-[#20232D] dark:hover:text-white hover:bg-[#EEF1FD]/50'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No complaints found matching current criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">Tracking ID</th>
                  <th className="px-6 py-3 font-semibold">Institution & Permanent ID</th>
                  <th className="px-6 py-3 font-semibold">Category</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Assigned Bureau</th>
                  <th className="px-6 py-3 font-semibold text-right">Intake Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-6 py-3.5 max-w-xs">
                      <p className="font-semibold text-[#20232D] dark:text-white truncate">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-6 py-3.5 text-[#747B8C]">
                      {c.category}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3.5 font-medium text-[#20232D] dark:text-slate-200">
                      {c.assignedBureau ? c.assignedBureau.replace(/_/g, ' ') : 'Unassigned'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => openActionModal(c)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg transition-colors shadow-xs cursor-pointer"
                      >
                        Verify & Route
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification & Routing Action Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedComplaint(null)}
          title={`Intake Verification & Routing: ${selectedComplaint.trackingId}`}
          subtitle={`${selectedComplaint.institutionName} (${selectedComplaint.aictePermanentId})`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            {successNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-medium">
                {successNotice}
              </div>
            )}

            {/* AICTE Overlap Alert Warning */}
            {relatedMatches.length > 0 && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/60 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Matching Engine Alert: {relatedMatches.length} Potential Cross-Case Overlap(s) Detected!</span>
                </div>
                {relatedMatches.map(m => (
                  <p key={m.id} className="text-[11px] text-amber-800 dark:text-amber-400 pl-6">
                    · Candidate match with <strong className="font-mono">{m.sourceTrackingId === selectedComplaint.id ? m.targetTrackingId : m.sourceTrackingId}</strong> ({m.overallScore}% score, {m.similarityLevel} similarity)
                  </p>
                ))}
              </div>
            )}

            {/* Allegations & Evidence */}
            <div className="p-3.5 bg-[#F7F8FA] dark:bg-[#202433] rounded-xl border border-[#E8EAF0] dark:border-[#2C3244] space-y-1.5">
              <span className="font-semibold text-[#20232D] dark:text-white block">Complaint Subject:</span>
              <p className="font-medium text-[#20232D] dark:text-white">{selectedComplaint.subject}</p>
              <span className="font-semibold text-[#20232D] dark:text-white block pt-1">Description:</span>
              <p className="text-[#747B8C] leading-relaxed">{selectedComplaint.description}</p>
            </div>

            {/* Routing Action Selection */}
            <div className="space-y-2">
              <label className="font-semibold text-[#20232D] dark:text-white block">
                Determine Administrative Action *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActionType('ASSIGN_RB');
                    setRemarks('Institution affiliated. Regulatory compliance violation routed to Regulation Bureau for surprise audit.');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    actionType === 'ASSIGN_RB'
                      ? 'bg-[#EEF1FD] border-[#5267E8] text-[#5267E8] font-semibold'
                      : 'bg-white dark:bg-[#202433] border-[#E8EAF0] dark:border-[#2C3244] hover:border-[#5267E8]/40 text-[#20232D] dark:text-white'
                  }`}
                >
                  <p className="font-bold">Route to RB</p>
                  <p className="text-[10px] text-[#747B8C]">Regulation Bureau</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionType('ASSIGN_PGRC');
                    setRemarks('Grievance authenticated. Forwarded to Public Grievance Redressal Cell for student hearing.');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    actionType === 'ASSIGN_PGRC'
                      ? 'bg-[#EEF1FD] border-[#5267E8] text-[#5267E8] font-semibold'
                      : 'bg-white dark:bg-[#202433] border-[#E8EAF0] dark:border-[#2C3244] hover:border-[#5267E8]/40 text-[#20232D] dark:text-white'
                  }`}
                >
                  <p className="font-bold">Route to PGRC</p>
                  <p className="text-[10px] text-[#747B8C]">Grievance Cell</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionType('NEEDS_INFO');
                    setRemarks('Complainant requested to furnish additional fee receipts and enrollment proof within 7 days.');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    actionType === 'NEEDS_INFO'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 text-amber-900 dark:text-amber-300 font-semibold'
                      : 'bg-white dark:bg-[#202433] border-[#E8EAF0] dark:border-[#2C3244] hover:border-amber-400 text-[#20232D] dark:text-white'
                  }`}
                >
                  <p className="font-bold">Request Info</p>
                  <p className="text-[10px] text-[#747B8C]">Complainant RFI</p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActionType('REJECT');
                    setRemarks('Complaint rejected: Institutional dispute does not fall within AICTE statutory mandate.');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    actionType === 'REJECT'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-300 font-semibold'
                      : 'bg-white dark:bg-[#202433] border-[#E8EAF0] dark:border-[#2C3244] hover:border-rose-400 text-[#20232D] dark:text-white'
                  }`}
                >
                  <p className="font-bold">Reject Case</p>
                  <p className="text-[10px] text-[#747B8C]">Record Justification</p>
                </button>
              </div>
            </div>

            {/* Official Remarks */}
            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                Official Public Remarks (Visible on Student Timeline) *
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15"
              />
            </div>

            {/* Confidential Internal Notes */}
            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                Confidential Officer Notes (Restricted to AICTE Officials only)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Cross-checked state fee portal. Flagged for coordination with Regional Office."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAF0] dark:border-[#262A38]">
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                className="px-4 py-2 text-xs text-[#747B8C] hover:text-[#20232D] hover:bg-[#F7F8FA] dark:hover:bg-[#202433] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                <span>Confirm & Execute Routing</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

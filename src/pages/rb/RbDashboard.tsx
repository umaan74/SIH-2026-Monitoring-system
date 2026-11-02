/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GitCompare, 
  ArrowRight,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { Complaint, ComplaintMatch } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge, SlaBadge } from '../../components/common/Badge';
import { BureauOfficerCharts } from '../../components/charts/BureauOfficerCharts';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export function RbDashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [matches, setMatches] = useState<ComplaintMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [selectedCase, setSelectedCase] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<any>('UNDER_REVIEW');
  const [remarks, setRemarks] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getComplaints({ bureau: 'REGULATION_BUREAU' }),
      api.getMatches({ bureau: 'REGULATION_BUREAU' })
    ])
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

  const handleUpdateStatus = async () => {
    if (!selectedCase) return;
    if (!remarks.trim()) {
      alert('Official remarks are required.');
      return;
    }

    try {
      setIsUpdating(true);
      await api.updateComplaintStatus(selectedCase.id, {
        newStatus,
        remarks,
        internalNotes
      });
      setSelectedCase(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update case status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Regulation Bureau' }, { label: 'Dashboard' }]}>
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-[#E8EAF0] shadow-xs">
        <div>
          <h1 className="font-heading text-lg font-bold text-[#20232D]">
            Regulation Bureau (RB) Operational Console
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Institutional regulatory compliance, faculty cadre audits, and surprise inspection enforcement
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/rb/overlaps')}
            className="px-3.5 py-2 text-xs font-semibold text-[#5267E8] bg-[#EEF1FD] hover:bg-[#E4E9FB] rounded-lg border border-[#D2D9FA] transition-colors flex items-center gap-1.5"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Overlap Alerts ({matches.length})</span>
          </button>
          <button
            onClick={() => navigate('/rb/cases')}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Cases ({complaints.length})</span>
          </button>
        </div>
      </div>

      {/* Interactive Charts */}
      {!loading && (
        <BureauOfficerCharts
          complaints={complaints}
          matches={matches}
          bureauName="REGULATION_BUREAU"
        />
      )}

      {/* Active Cases Priority Queue */}
      <div className="bg-white rounded-xl border border-[#E8EAF0] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E8EAF0] flex items-center justify-between">
          <div>
            <h3 className="font-heading text-xs font-semibold uppercase tracking-wider text-[#20232D]">
              Assigned Regulatory Cases
            </h3>
            <p className="text-[11px] text-[#747B8C]">Live cases assigned for investigation and resolution</p>
          </div>
          <button
            onClick={() => navigate('/rb/cases')}
            className="text-xs text-[#5267E8] hover:text-[#4354D0] flex items-center gap-1 font-semibold transition-colors"
          >
            <span>View All Cases</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="p-5"><LoadingSkeleton count={3} /></div>
        ) : complaints.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#747B8C]">
            No regulatory cases currently assigned to Regulation Bureau.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9FAFB] text-[#747B8C] uppercase tracking-wider text-[10px] border-b border-[#E8EAF0]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tracking ID</th>
                  <th className="px-5 py-3 font-semibold">Institution & Permanent ID</th>
                  <th className="px-5 py-3 font-semibold">Allegations</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">SLA Deadline</th>
                  <th className="px-5 py-3 font-semibold text-right">Officer Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] text-[#20232D]">
                {complaints.slice(0, 6).map(c => (
                  <tr key={c.id} className="hover:bg-[#F9FAFB]/75 transition-colors">
                    <td className="px-5 py-3.5 font-mono font-bold text-[#5267E8]">
                      {c.trackingId}
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-semibold text-[#20232D] truncate">{c.institutionName}</p>
                      <p className="text-[10px] font-mono text-[#747B8C]">{c.aictePermanentId}</p>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <p className="font-medium text-[#20232D] truncate">{c.subject}</p>
                      <p className="text-[10px] text-[#747B8C]">{c.category}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-5 py-3.5">
                      <SlaBadge deadline={c.slaDeadline} isClosed={['RESOLVED', 'CLOSED'].includes(c.status)} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedCase(c);
                          setNewStatus(c.status === 'ASSIGNED' ? 'UNDER_REVIEW' : 'ACTION_TAKEN');
                          setRemarks('');
                          setInternalNotes('');
                        }}
                        className="px-3 py-1 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded transition-colors shadow-xs"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Case Status Update Modal */}
      {selectedCase && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedCase(null)}
          title={`Update Case Status: ${selectedCase.trackingId}`}
          subtitle={`${selectedCase.institutionName}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-heading font-semibold text-[#20232D] block mb-1">
                Select Lifecycle Transition *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg text-[#20232D] focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8]"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW (Inquiry underway)</option>
                <option value="ACTION_TAKEN">ACTION_TAKEN (Directives / Show cause issued)</option>
                <option value="RESOLVED">RESOLVED (Compliance established / Penalty imposed)</option>
                <option value="NEEDS_INFORMATION">NEEDS_INFORMATION (Request additional evidence)</option>
                <option value="ESCALATED">ESCALATED (Refer to Apex Governance / Senior Authority)</option>
                <option value="CLOSED">CLOSED (Final archival)</option>
              </select>
            </div>

            <div>
              <label className="font-heading font-semibold text-[#20232D] block mb-1">
                Official Public Remarks (Complainant can read this) *
              </label>
              <textarea
                rows={3}
                placeholder="Detail official inspection findings, committee constitution, or regulatory directives issued..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg text-[#20232D] focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8]"
              />
            </div>

            <div>
              <label className="font-heading font-semibold text-[#20232D] block mb-1">
                Confidential Officer Notes (Visible only to authorized AICTE personnel)
              </label>
              <textarea
                rows={2}
                placeholder="Internal case coordination notes or cross-bureau overlap cross-references..."
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg text-[#20232D] focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8]"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8EAF0]">
              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-[#747B8C] hover:bg-[#F7F8FA] rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Apply Transition'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

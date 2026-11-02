/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  FileText,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { api } from '../../services/api';
import { Institution, Complaint } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';

export function InstitutionManagement() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stateFilter, setStateFilter] = useState('ALL');

  // Add Institution Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [aictePermanentId, setAictePermanentId] = useState('');
  const [state, setState] = useState('Delhi');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [institutionType, setInstitutionType] = useState<any>('Private-Unaided');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Institution Profile Drawer / Modal
  const [inspectingInst, setInspectingInst] = useState<Institution | null>(null);
  const [instComplaints, setInstComplaints] = useState<Complaint[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadInstitutions = () => {
    setLoading(true);
    api.getInstitutions()
      .then(setInstitutions)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  const handleInspect = async (inst: Institution) => {
    setInspectingInst(inst);
    setLoadingHistory(true);
    try {
      const data = await api.getInstitutionById(inst.id);
      setInstComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCreateInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await api.createInstitution({
        name: name.trim(),
        aictePermanentId: aictePermanentId.trim(),
        state: state.trim(),
        city: city.trim(),
        address: address.trim(),
        institutionType,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim()
      });
      setShowAddModal(false);
      setName('');
      setAictePermanentId('');
      setCity('');
      setAddress('');
      loadInstitutions();
    } catch (err: any) {
      alert(err.message || 'Failed to add institution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = institutions.filter(i => {
    const matchesState = stateFilter === 'ALL' || i.state.toLowerCase() === stateFilter.toLowerCase();
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      i.name.toLowerCase().includes(q) ||
      i.aictePermanentId.toLowerCase().includes(q) ||
      i.city.toLowerCase().includes(q);
    return matchesState && matchesQuery;
  });

  const availableStates = Array.from(new Set(institutions.map(i => i.state)));

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Administration Console', href: '/admin/dashboard' }, { label: 'Institution Registry' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            Centralized AICTE Institution Directory
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Verified institutional repository, permanent IDs, and cross-bureau complaint histories
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Institution</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search by Institution Name, AICTE Permanent ID, City..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
            className="p-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
          >
            <option value="ALL">All States / UTs</option>
            {availableStates.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No institutions match the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">AICTE Permanent ID</th>
                  <th className="px-6 py-3 font-semibold">Institution Name</th>
                  <th className="px-6 py-3 font-semibold">Location</th>
                  <th className="px-6 py-3 font-semibold">Type</th>
                  <th className="px-6 py-3 font-semibold">Active Grievances</th>
                  <th className="px-6 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(inst => (
                  <tr key={inst.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-semibold text-[#5267E8]">
                      {inst.aictePermanentId}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-[#20232D] dark:text-white max-w-sm truncate">
                      {inst.name}
                    </td>
                    <td className="px-6 py-3.5 text-[#747B8C]">
                      {inst.city}, {inst.state}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-[11px] px-2 py-0.5 rounded bg-[#F7F8FA] dark:bg-[#202433] text-[#20232D] dark:text-slate-200 font-medium border border-[#E8EAF0] dark:border-[#2C3244]">
                        {inst.institutionType}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-mono">
                      <span className={`font-semibold ${inst.activeComplaintsCount && inst.activeComplaintsCount > 0 ? 'text-rose-600' : 'text-[#747B8C]'}`}>
                        {inst.activeComplaintsCount || 0} Open
                      </span>
                      <span className="text-[#747B8C] text-[10px] ml-1">({inst.totalComplaintsCount || 0} Total)</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleInspect(inst)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#5267E8] hover:bg-[#EEF1FD] dark:hover:bg-[#5267E8]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Inspect History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Institution Modal */}
      {showAddModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowAddModal(false)}
          title="Add AICTE Verified Institution"
          subtitle="Register new institution into the central directory"
          maxWidth="lg"
        >
          <form onSubmit={handleCreateInstitution} className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">Institution Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. National Institute of Technology & Research"
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">AICTE Permanent ID *</label>
                <input
                  type="text"
                  required
                  value={aictePermanentId}
                  onChange={(e) => setAictePermanentId(e.target.value)}
                  placeholder="e.g. 1-89234101"
                  className="w-full p-2.5 text-xs font-mono bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">Institution Type *</label>
                <select
                  value={institutionType}
                  onChange={(e) => setInstitutionType(e.target.value as any)}
                  className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                >
                  <option value="Government">Government</option>
                  <option value="Govt-Aided">Govt-Aided</option>
                  <option value="Private-Unaided">Private-Unaided</option>
                  <option value="Autonomous">Autonomous</option>
                  <option value="Deemed-University">Deemed-University</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">Campus Full Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Sector / Road / Pin Code"
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">Official Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="registrar@institute.ac.in"
                  className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#20232D] dark:text-white block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+91-..."
                  className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAF0] dark:border-[#262A38]">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs text-[#747B8C] hover:text-[#20232D] hover:bg-[#F7F8FA] dark:hover:bg-[#202433] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Registering...' : 'Add Institution'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect History Modal */}
      {inspectingInst && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingInst(null)}
          title={inspectingInst.name}
          subtitle={`AICTE Permanent ID: ${inspectingInst.aictePermanentId} · ${inspectingInst.city}, ${inspectingInst.state}`}
          maxWidth="xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[10px] text-[#747B8C] block font-semibold uppercase">Category</span>
                <span className="font-semibold text-[#20232D] dark:text-white">{inspectingInst.institutionType}</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[10px] text-[#747B8C] block font-semibold uppercase">Total Complaints</span>
                <span className="font-semibold text-[#20232D] dark:text-white">{inspectingInst.totalComplaintsCount || instComplaints.length}</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[10px] text-[#747B8C] block font-semibold uppercase">Active Cases</span>
                <span className="font-semibold text-rose-600">{inspectingInst.activeComplaintsCount || 0} Open</span>
              </div>
              <div className="p-3 bg-[#F7F8FA] dark:bg-[#202433] rounded-lg border border-[#E8EAF0] dark:border-[#2C3244]">
                <span className="text-[10px] text-[#747B8C] block font-semibold uppercase">Official Contact</span>
                <span className="font-mono text-[11px] text-[#20232D] dark:text-slate-200 truncate block">
                  {inspectingInst.contactEmail || 'N/A'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-[#20232D] dark:text-white uppercase tracking-wider text-[11px]">
                Historical Grievance Log for this Institution ({instComplaints.length})
              </h4>

              {loadingHistory ? (
                <LoadingSkeleton count={2} />
              ) : instComplaints.length === 0 ? (
                <p className="text-[#747B8C] py-4 text-center">No complaints recorded against this institution.</p>
              ) : (
                <div className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] border border-[#E8EAF0] dark:border-[#262A38] rounded-lg overflow-hidden">
                  {instComplaints.map(c => (
                    <div key={c.id} className="p-3 bg-white dark:bg-[#1A1D27] flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#5267E8]">{c.trackingId}</span>
                          <span className="text-[#747B8C]">·</span>
                          <span className="font-medium text-[#20232D] dark:text-white">{c.subject}</span>
                        </div>
                        <p className="text-[11px] text-[#747B8C]">
                          {c.category} · Bureau: {c.assignedBureau || 'Central Intake'}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-[#20232D] dark:text-slate-200">
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  Send,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Institution, ComplaintCategory } from '../../types';

const CATEGORIES: ComplaintCategory[] = [
  'Faculty and Teaching',
  'Infrastructure',
  'Admission Irregularities',
  'Scholarship Issues',
  'Examination Issues',
  'Academic Facilities',
  'Capitation Fee & Exploitation',
  'Other'
];

export function ComplaintForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [aictePermanentId, setAictePermanentId] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Faculty and Teaching');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [documents, setDocuments] = useState<{ name: string; size: number; type: string }[]>([]);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successComplaintId, setSuccessComplaintId] = useState<string | null>(null);

  useEffect(() => {
    api.getInstitutions().then(setInstitutions).catch(console.error);
  }, []);

  const handleInstitutionSelect = (id: string) => {
    setSelectedInstId(id);
    const inst = institutions.find(i => i.id === id);
    if (inst) {
      setInstitutionName(inst.name);
      setAictePermanentId(inst.aictePermanentId);
    }
  };

  const handleMockFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(f => ({
        name: f.name,
        size: f.size,
        type: f.type || 'application/pdf'
      }));
      setDocuments(prev => [...prev, ...newFiles]);
    }
  };

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!institutionName.trim() || !aictePermanentId.trim()) {
      setErrorMsg('Please select or specify an AICTE Institution and Permanent ID.');
      return;
    }
    if (!subject.trim()) {
      setErrorMsg('Please provide a concise complaint subject.');
      return;
    }
    if (!description.trim() || description.trim().length < 20) {
      setErrorMsg('Please provide a detailed complaint description (at least 20 characters).');
      return;
    }
    if (!consentAccepted) {
      setErrorMsg('You must declare and consent that the information provided is truthful.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.submitComplaint({
        institutionName: institutionName.trim(),
        aictePermanentId: aictePermanentId.trim(),
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        supportingDocuments: documents
      });

      setSuccessComplaintId(res.id);
      setTimeout(() => {
        navigate(`/student/complaints/${res.id}`);
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-[#E8EAF0] shadow-xs overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 border-b border-[#E8EAF0] bg-[#F7F8FA]">
        <h2 className="font-heading text-base font-bold text-[#20232D]">
          Formal Grievance Submission Portal
        </h2>
        <p className="text-xs text-[#747B8C] mt-1">
          Complaints submitted here are routed directly to the Central Intake Cell and evaluated by the Intelligent Matching Engine for cross-bureau coordination.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {errorMsg && (
          <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center gap-2 text-xs text-[#B91C1C]">
            <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successComplaintId && (
          <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg flex items-center gap-2 text-xs text-[#047857]">
            <Sparkles className="w-4 h-4 text-[#10B981] shrink-0" />
            <span>Grievance filed successfully! Generating unique AICTE tracking ID...</span>
          </div>
        )}

        {/* Complainant Identity Notice */}
        <div className="p-3 bg-[#EEF1FD] border border-[#D2D9FA] rounded-lg text-xs text-[#20232D] flex items-center justify-between">
          <div>
            <span className="font-semibold text-[#20232D]">Complainant: </span>
            <span className="text-[#5267E8] font-medium">{user?.name}</span>
            <span className="text-[#747B8C]"> ({user?.email})</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#5267E8] border border-[#D2D9FA] font-medium">
            Authenticated Student
          </span>
        </div>

        {/* Institution Selection */}
        <div className="space-y-3">
          <label className="block font-heading text-xs font-semibold text-[#20232D]">
            Select Verified AICTE Institution *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <select
                value={selectedInstId}
                onChange={(e) => handleInstitutionSelect(e.target.value)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              >
                <option value="">-- Choose from AICTE Directory --</option>
                {institutions.map(inst => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name} ({inst.city}, {inst.state})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="text"
                placeholder="AICTE Permanent ID (e.g. 1-45678901)"
                value={aictePermanentId}
                onChange={(e) => setAictePermanentId(e.target.value)}
                required
                className="w-full p-2.5 text-xs font-mono bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Or type full Institution Name manually..."
            value={institutionName}
            onChange={(e) => setInstitutionName(e.target.value)}
            required
            className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
          />
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1.5">
              Grievance Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1.5">
              Urgency / Impact Level
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
            >
              <option value="LOW">Low (Standard inquiry)</option>
              <option value="MEDIUM">Medium (Academic disruption)</option>
              <option value="HIGH">High (Immediate exam/fee crisis)</option>
              <option value="CRITICAL">Critical (Severe safety/extortion violation)</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1.5">
            Complaint Subject *
          </label>
          <input
            type="text"
            placeholder="e.g. Unapproved fee hike and non-refund of security caution deposit"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full p-2.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
          />
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="font-heading text-xs font-semibold text-[#20232D]">
              Detailed Complaint Description *
            </label>
            <span className="text-[10px] text-[#747B8C] font-mono">
              {description.length} chars (min 20)
            </span>
          </div>
          <textarea
            rows={5}
            placeholder="Provide specific dates, affected department, names of officials if relevant, and chronological sequence of events..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full p-3 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D] leading-relaxed"
          />
        </div>

        {/* Supporting Documents */}
        <div>
          <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1.5">
            Supporting Evidentiary Documents
          </label>
          <div className="border border-dashed border-[#E8EAF0] rounded-lg p-5 text-center hover:bg-[#F7F8FA] transition-colors">
            <Upload className="w-5 h-5 text-[#747B8C] mx-auto mb-1.5" />
            <p className="text-xs text-[#20232D] font-medium">
              Upload fee receipts, notices, circulars, or correspondences
            </p>
            <p className="text-[10px] text-[#747B8C] mt-0.5">PDF, PNG, JPG up to 10MB</p>
            <input
              type="file"
              multiple
              onChange={handleMockFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="mt-2.5 inline-block px-3 py-1.5 text-xs font-medium text-[#5267E8] bg-[#EEF1FD] hover:bg-[#E4E9FB] border border-[#D2D9FA] rounded-md cursor-pointer transition-colors"
            >
              Browse Files
            </label>
          </div>

          {/* Attached Files List */}
          {documents.length > 0 && (
            <div className="mt-2.5 space-y-1">
              {documents.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-[#F7F8FA] border border-[#E8EAF0] rounded-md text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-3.5 h-3.5 text-[#5267E8] shrink-0" />
                    <span className="truncate text-[#20232D]">{doc.name}</span>
                    <span className="text-[10px] text-[#747B8C] font-mono">({Math.round(doc.size / 1024)} KB)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDoc(idx)}
                    className="text-[#747B8C] hover:text-[#DC2626] p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Declaration and Consent */}
        <div className="p-3.5 bg-[#F7F8FA] rounded-lg border border-[#E8EAF0] flex items-start gap-2.5">
          <input
            type="checkbox"
            id="declaration"
            checked={consentAccepted}
            onChange={(e) => setConsentAccepted(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[#E8EAF0] text-[#5267E8] focus:ring-[#5267E8]"
          />
          <label htmlFor="declaration" className="text-[11px] text-[#747B8C] leading-normal cursor-pointer select-none">
            I hereby declare that the facts stated in this grievance are true to the best of my knowledge and belief. I understand that submitting false or fabricated allegations is liable for regulatory and academic penalties under AICTE guidelines.
          </label>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8EAF0]">
          <button
            type="button"
            onClick={() => navigate('/student/dashboard')}
            className="px-4 py-2 text-xs font-medium text-[#747B8C] hover:text-[#20232D] hover:bg-[#F7F8FA] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-medium text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit Official Complaint</span>
          </button>
        </div>
      </form>
    </div>
  );
}

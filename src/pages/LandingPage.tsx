/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layers, 
  GitCompare, 
  Activity, 
  ArrowRight, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { user, getDefaultRouteForRole } = useAuth();

  return (
    <div className="min-h-screen bg-[#171A23] text-white flex flex-col font-sans selection:bg-[#5267E8] selection:text-white">
      {/* Top Header */}
      <header className="h-14 px-6 lg:px-12 border-b border-[#262B3A] flex items-center justify-between gap-6 shrink-0 bg-[#171A23]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#5267E8] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs">
            IN
          </div>
          <span className="font-heading font-bold text-base text-white tracking-tight">IN-Sight</span>
          <span className="text-[11px] text-[#717C94] hidden sm:inline font-mono">· AICTE Grievance Platform</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#98A1B3]">
          <a href="#problem" className="hover:text-white transition-colors">Problem Statement</a>
          <a href="#solution" className="hover:text-white transition-colors">Hybrid Matching Engine</a>
          <a href="#demonstration" className="hover:text-white transition-colors">SIH '26 Demo</a>
        </nav>

        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <button
              onClick={() => navigate(getDefaultRouteForRole(user.role))}
              className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#5267E8] rounded-lg hover:bg-[#4354D0] transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-medium text-[#98A1B3] hover:text-white hover:bg-[#202534] rounded-lg transition-colors"
              >
                Officer / Student Login
              </button>
              <button
                onClick={() => navigate('/admin/login')}
                className="px-3 py-1.5 text-xs font-medium text-[#8695F3] border border-[#333C57] hover:border-[#5267E8] hover:bg-[#202534] rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3" />
                <span>Admin Portal</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#242A3D] border border-[#333C57] text-[#8695F3] text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#5267E8]" />
            <span>Smart India Hackathon 2026 · Team InfluenCode</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Integrated Dashboard for Monitoring & Tracking Institution Grievance Cases
          </h1>

          <p className="text-sm sm:text-base text-[#98A1B3] leading-relaxed">
            Consolidating complaints across AICTE Bureaus & Cells (Regulation Bureau, Public Grievance Redressal Cell, Central Intake). Powered by a hybrid matching engine combining AICTE Permanent ID verification, regulatory rule checks, and sentence-transformers vector embeddings.
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-3">
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-sm transition-all flex items-center gap-2"
            >
              <span>Explore Live Demonstration</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-4 py-2.5 text-xs font-semibold text-[#98A1B3] hover:text-white bg-[#1E222E] hover:bg-[#252A3A] border border-[#2B3142] rounded-lg transition-colors"
            >
              Public Student Registration
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div id="solution" className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 pt-10 border-t border-[#262B3A]">
          <div className="p-5 bg-[#1B1E29] rounded-xl border border-[#282D3D] space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#5267E8]/15 text-[#8695F3] border border-[#5267E8]/20 flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-white">Hybrid Matching Engine</h3>
            <p className="text-xs text-[#98A1B3] leading-relaxed">
              Detects parallel complaints across distinct bureaus for the same AICTE Permanent ID using dense transformer embeddings and domain regulatory keywords.
            </p>
          </div>

          <div className="p-5 bg-[#1B1E29] rounded-xl border border-[#282D3D] space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#6366F1]/15 text-[#A5B4FC] border border-[#6366F1]/20 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-white">Cross-Bureau Coordination</h3>
            <p className="text-xs text-[#98A1B3] leading-relaxed">
              Eliminates duplicate inquiries between Regulation Bureau (RB) and Public Grievance Redressal Cell (PGRC) with unified case linking and joint review.
            </p>
          </div>

          <div className="p-5 bg-[#1B1E29] rounded-xl border border-[#282D3D] space-y-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#10B981]/15 text-[#6EE7B7] border border-[#10B981]/20 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="font-heading text-sm font-bold text-white">Full Lifecycle & SLA Tracking</h3>
            <p className="text-xs text-[#98A1B3] leading-relaxed">
              Automated stage tracking from Intake verification to resolution, with countdown alerts for ageing cases and immutable audit logging.
            </p>
          </div>
        </div>

        {/* Direct Persona Access Links for Evaluators */}
        <div id="demonstration" className="mt-10 p-5 bg-[#1C202E] rounded-xl border border-[#282D3D] space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="font-heading text-xs font-semibold text-[#8695F3] uppercase tracking-wider">
              SIH Evaluator Quick Access (Pre-seeded Accounts)
            </span>
            <span className="text-[11px] font-mono text-[#717C94]">Password for all: Demo@123</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { role: 'Student', email: 'rahul.sharma@example.com', path: '/login' },
              { role: 'Intake Officer', email: 'intake@insight.aicte.gov.in', path: '/login' },
              { role: 'RB Officer', email: 'rb.officer@insight.aicte.gov.in', path: '/login' },
              { role: 'PGRC Officer', email: 'pgrc.officer@insight.aicte.gov.in', path: '/login' },
              { role: 'Senior Authority', email: 'authority@insight.aicte.gov.in', path: '/login' },
              { role: 'Admin Console', email: 'admin@insight.aicte.gov.in', path: '/admin/login' },
            ].map(p => (
              <button
                key={p.role}
                onClick={() => navigate(p.path, { state: { prefillEmail: p.email } })}
                className="p-3 bg-[#171A23] hover:bg-[#202534] border border-[#282D3D] hover:border-[#5267E8] rounded-lg text-left transition-all"
              >
                <p className="font-heading text-xs font-semibold text-white truncate">{p.role}</p>
                <p className="text-[10px] text-[#717C94] truncate mt-0.5 font-mono">{p.email.split('@')[0]}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="h-12 px-6 lg:px-12 border-t border-[#262B3A] flex items-center justify-between text-xs text-[#66728A] bg-[#141720]">
        <span>© 2026 IN-Sight · InfluenCode (Smart India Hackathon)</span>
        <span>AICTE Institutional Grievance Monitoring Platform</span>
      </footer>
    </div>
  );
}

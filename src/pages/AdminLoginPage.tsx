/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [email, setEmail] = useState('admin@insight.aicte.gov.in');
  const [password, setPassword] = useState('Demo@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsLoading(true);
      await adminLogin(email.trim(), password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Access Denied: Only authorized Administrative personnel can access this portal.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#171A23] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans text-white selection:bg-[#5267E8] selection:text-white">
      {/* Return to Normal Portal */}
      <div className="absolute top-6 left-6">
        <Link 
          to="/login"
          className="text-xs text-[#98A1B3] hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Standard User Portal</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Executive Administrative Shield Emblem */}
        <div className="mx-auto w-12 h-12 rounded-xl bg-[#5267E8]/20 border border-[#5267E8]/40 flex items-center justify-center text-[#8695F3] shadow-xs mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="font-heading text-xl font-bold tracking-tight text-white">
          IN-Sight Administrative Console
        </h2>
        <p className="mt-1 text-xs text-[#717C94]">
          Strictly restricted to Admin and Super Admin governance credentials
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#1C202E] py-7 px-6 shadow-xl border border-[#282D3D] rounded-xl space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2]/10 border border-[#EF4444]/40 rounded-lg flex items-start gap-2 text-xs text-[#FCA5A5]">
              <ShieldAlert className="w-4 h-4 text-[#EF4444] mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Pre-fills for Administrator Evaluation */}
          <div className="p-3 bg-[#171A23] rounded-lg border border-[#282D3D] space-y-2">
            <span className="text-[10px] font-semibold text-[#717C94] uppercase tracking-wider block">
              Pre-seeded Administrative Personas:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@insight.aicte.gov.in');
                  setPassword('Demo@123');
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md border text-left transition-colors ${
                  email === 'admin@insight.aicte.gov.in'
                    ? 'bg-[#5267E8]/20 border-[#5267E8] text-[#8695F3]'
                    : 'bg-[#1E222E] border-[#2E3547] text-[#98A1B3] hover:border-[#5267E8]'
                }`}
              >
                <p className="font-semibold text-white">System Admin</p>
                <p className="text-[10px] text-[#717C94] font-mono">admin@insight...</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('superadmin@insight.aicte.gov.in');
                  setPassword('Demo@123');
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md border text-left transition-colors ${
                  email === 'superadmin@insight.aicte.gov.in'
                    ? 'bg-[#5267E8]/20 border-[#5267E8] text-[#8695F3]'
                    : 'bg-[#1E222E] border-[#2E3547] text-[#98A1B3] hover:border-[#5267E8]'
                }`}
              >
                <p className="font-semibold text-white">Super Admin</p>
                <p className="text-[10px] text-[#717C94] font-mono">superadmin@insight...</p>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-heading text-xs font-semibold text-[#D0D4DF] mb-1">
                Administrative Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#171A23] border border-[#282D3D] rounded-lg focus:ring-2 focus:ring-[#5267E8]/30 focus:border-[#5267E8] text-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-heading text-xs font-semibold text-[#D0D4DF]">
                  Password
                </label>
                <span className="text-[11px] text-[#717C94] font-mono">Demo: Demo@123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#171A23] border border-[#282D3D] rounded-lg focus:ring-2 focus:ring-[#5267E8]/30 focus:border-[#5267E8] text-white"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>Authenticate Administrator Console</span>
            </button>
          </form>

          {/* Security Policy Reminder */}
          <div className="p-3 bg-[#171A23] rounded-lg border border-[#282D3D] text-[11px] text-[#717C94] leading-relaxed">
            <span className="font-semibold text-[#D0D4DF]">Security Rule: </span>
            Administrator accounts cannot be self-registered. Authority roles and bureau permissions are granted exclusively by Super Administrators under strict audit control.
          </div>
        </div>
      </div>
    </div>
  );
}

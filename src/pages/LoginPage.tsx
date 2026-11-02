/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { LogIn, AlertCircle, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, getDefaultRouteForRole } = useAuth();

  const prefillEmail = (location.state as any)?.prefillEmail || '';
  const [email, setEmail] = useState(prefillEmail || 'rahul.sharma@example.com');
  const [password, setPassword] = useState('Demo@123');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      setIsLoading(true);
      const user = await login(email.trim(), password);
      navigate(getDefaultRouteForRole(user.role));
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { label: 'Student', email: 'rahul.sharma@example.com' },
    { label: 'Intake Desk', email: 'intake@insight.aicte.gov.in' },
    { label: 'RB Officer', email: 'rb.officer@insight.aicte.gov.in' },
    { label: 'PGRC Officer', email: 'pgrc.officer@insight.aicte.gov.in' },
    { label: 'Senior Authority', email: 'authority@insight.aicte.gov.in' },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20232D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Lockup */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#5267E8] text-white flex items-center justify-center font-bold text-base shadow-xs">
            IN
          </div>
        </div>
        <h2 className="mt-3.5 text-center font-heading text-xl font-bold tracking-tight text-[#20232D]">
          IN-Sight Official Portal Login
        </h2>
        <p className="mt-1 text-center text-xs text-[#747B8C]">
          Authorized access for Complainants, Bureau Officers, and Senior Authorities
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-7 px-6 shadow-xs border border-[#E8EAF0] rounded-xl space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-lg flex items-center gap-2 text-xs text-[#B91C1C]">
              <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Demo Fill Buttons for SIH Hackathon Evaluators */}
          <div className="p-3 bg-[#F7F8FA] rounded-lg border border-[#E8EAF0] space-y-2">
            <span className="text-[10px] font-semibold text-[#747B8C] uppercase tracking-wider block">
              Quick Fill Demo Personas:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {demoAccounts.map(d => (
                <button
                  key={d.label}
                  type="button"
                  onClick={() => {
                    setEmail(d.email);
                    setPassword('Demo@123');
                  }}
                  className={`px-2 py-1 text-[11px] font-medium rounded border transition-colors ${
                    email === d.email 
                      ? 'bg-[#5267E8] text-white border-[#5267E8]' 
                      : 'bg-white text-[#20232D] border-[#E8EAF0] hover:border-[#D0D4DF]'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-heading text-xs font-semibold text-[#20232D]">
                  Password
                </label>
                <span className="text-[11px] text-[#747B8C] font-mono">Demo: Demo@123</span>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-3.5 h-3.5" />
              )}
              <span>Sign In to Dashboard</span>
            </button>
          </form>

          {/* Links & Admin Redirect */}
          <div className="pt-4 border-t border-[#E8EAF0] space-y-3 text-center text-xs">
            <p className="text-[#747B8C]">
              New Student?{' '}
              <Link to="/register" className="font-semibold text-[#5267E8] hover:underline">
                Create public account
              </Link>
            </p>

            <div className="p-2.5 bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg flex items-center justify-between text-[11px]">
              <span className="text-[#747B8C] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[#747B8C]" />
                <span>AICTE System Administrator?</span>
              </span>
              <Link to="/admin/login" className="font-semibold text-[#5267E8] hover:underline flex items-center gap-0.5">
                <span>Admin Login</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

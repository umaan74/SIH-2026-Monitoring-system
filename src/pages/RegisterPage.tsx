/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    try {
      setIsLoading(true);
      await register(name.trim(), email.trim(), password, phone.trim());
      setSuccessMsg('Account registered successfully as Student Complainant! Redirecting to student dashboard...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#20232D] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#5267E8] text-white flex items-center justify-center font-bold text-base shadow-xs">
            IN
          </div>
        </div>
        <h2 className="mt-3.5 text-center font-heading text-xl font-bold tracking-tight text-[#20232D]">
          Student Complainant Registration
        </h2>
        <p className="mt-1 text-center text-xs text-[#747B8C]">
          Create an official grievance tracking account under AICTE Guidelines
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

          {successMsg && (
            <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-lg flex items-center gap-2 text-xs text-[#047857]">
              <Sparkles className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Role Rule Notice */}
          <div className="p-3 bg-[#EEF1FD] border border-[#D2D9FA] rounded-lg text-[11px] text-[#20232D]">
            <span className="font-semibold text-[#5267E8]">Governance Policy: </span>
            Public registration strictly provisions accounts with the <strong className="font-semibold">STUDENT</strong> role. All newly registered users automatically populate the Admin User Directory.
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91-9876543210"
                className="w-full px-3 py-2 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg focus:ring-2 focus:ring-[#5267E8]/20 focus:border-[#5267E8] text-[#20232D]"
              />
            </div>

            <div>
              <label className="block font-heading text-xs font-semibold text-[#20232D] mb-1">
                Password * (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span>Register Official Complainant Profile</span>
            </button>
          </form>

          <div className="pt-4 border-t border-[#E8EAF0] text-center text-xs">
            <p className="text-[#747B8C]">
              Already registered?{' '}
              <Link to="/login" className="font-semibold text-[#5267E8] hover:underline">
                Sign in to your account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

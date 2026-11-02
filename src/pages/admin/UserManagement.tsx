/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserX, 
  UserCheck, 
  Edit3, 
  AlertCircle,
  Building2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import { User, UserRole, BureauCell } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';

export function UserManagement() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT');
  const [selectedBureau, setSelectedBureau] = useState<BureauCell>('REGULATION_BUREAU');
  const [department, setDepartment] = useState('');
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Status Change Dialog
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    api.getUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openEditModal = (u: User) => {
    setEditingUser(u);
    setSelectedRole(u.role);
    setSelectedBureau(u.bureau || 'REGULATION_BUREAU');
    setDepartment(u.department || '');
  };

  const handleSaveRole = async () => {
    if (!editingUser) return;
    try {
      setIsUpdatingRole(true);
      await api.updateUserRole(editingUser.id, {
        role: selectedRole,
        bureau: selectedRole === 'STUDENT' ? undefined : selectedBureau,
        department
      });
      setEditingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!deactivatingUser) return;
    try {
      setIsUpdatingStatus(true);
      await api.updateUserStatus(deactivatingUser.id, !deactivatingUser.isActive, 'Administrative review.');
      setDeactivatingUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? u.isActive : !u.isActive);
    const q = searchTerm.toLowerCase();
    const matchesQuery = !searchTerm ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));
    return matchesRole && matchesStatus && matchesQuery;
  });

  return (
    <DashboardLayout breadcrumbs={[{ label: 'Administration Console', href: '/admin/dashboard' }, { label: 'User Directory & Roles' }]}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#20232D] dark:text-white tracking-tight">
            User Management & Role-Based Access Control (RBAC)
          </h1>
          <p className="text-xs text-[#747B8C] mt-0.5">
            Assign Bureau jurisdictions, allocate governance permissions, and manage account states
          </p>
        </div>
      </div>

      {/* Governance Notice Banner */}
      <div className="p-3.5 bg-[#EEF1FD]/60 dark:bg-[#5267E8]/10 border border-[#5267E8]/20 rounded-xl flex items-start gap-3 text-xs text-[#20232D] dark:text-slate-200">
        <Info className="w-4 h-4 text-[#5267E8] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-[#20232D] dark:text-white">Strict AICTE Architecture Rule: </strong>
          Administrators do NOT create user accounts directly. Public applicants register as Students, appear automatically in this directory, and may then be elevated to Intake Desk, Regulation Bureau, Grievance Cell, or Senior Authority by authorized administrators.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search by User Name, Email, Department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white placeholder:text-[#747B8C] focus:outline-hidden focus:border-[#5267E8] focus:ring-2 focus:ring-[#5267E8]/15 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="p-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">STUDENT</option>
            <option value="INTAKE_OFFICER">INTAKE_OFFICER</option>
            <option value="RB_OFFICER">RB_OFFICER</option>
            <option value="PGRC_OFFICER">PGRC_OFFICER</option>
            <option value="SENIOR_AUTHORITY">SENIOR_AUTHORITY</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
          >
            <option value="ALL">All Account States</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1A1D27] rounded-xl border border-[#E8EAF0] dark:border-[#262A38] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-6"><LoadingSkeleton count={5} /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#747B8C]">
            No registered users found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F8FA] dark:bg-[#202433] text-[#747B8C] uppercase tracking-wider text-[10px] font-medium border-b border-[#E8EAF0] dark:border-[#262A38]">
                <tr>
                  <th className="px-6 py-3 font-semibold">User Identity</th>
                  <th className="px-6 py-3 font-semibold">Assigned Role</th>
                  <th className="px-6 py-3 font-semibold">Bureau / Jurisdiction</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Registered On</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EAF0] dark:divide-[#262A38] text-[#20232D] dark:text-slate-200">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-[#F7F8FA]/70 dark:hover:bg-[#202433]/50 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-[#20232D] dark:text-white">{u.name}</p>
                      <p className="text-[11px] text-[#747B8C]">{u.email}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#F7F8FA] dark:bg-[#202433] text-[#20232D] dark:text-slate-200 border border-[#E8EAF0] dark:border-[#2C3244]">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-[#20232D] dark:text-slate-200">
                        {u.bureau ? u.bureau.replace(/_/g, ' ') : 'General Complainant'}
                      </p>
                      {u.department && (
                        <p className="text-[10px] text-[#747B8C] truncate max-w-xs">{u.department}</p>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                          : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                      }`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[#747B8C] font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#5267E8] hover:bg-[#EEF1FD] dark:hover:bg-[#5267E8]/10 rounded-lg transition-colors cursor-pointer"
                      >
                        Change Role
                      </button>
                      <button
                        onClick={() => setDeactivatingUser(u)}
                        disabled={u.id === currentAdmin?.id}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 cursor-pointer ${
                          u.isActive 
                            ? 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40' 
                            : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                        }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Assignment Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Assign Role & Bureau: ${editingUser.name}`}
          subtitle={editingUser.email}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                Select Authorized System Role *
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
              >
                <option value="STUDENT">STUDENT (Public Complainant)</option>
                <option value="INTAKE_OFFICER">INTAKE_OFFICER (Central Intake Desk)</option>
                <option value="RB_OFFICER">RB_OFFICER (Regulation Bureau)</option>
                <option value="PGRC_OFFICER">PGRC_OFFICER (Grievance Redressal Cell)</option>
                <option value="SENIOR_AUTHORITY">SENIOR_AUTHORITY (Executive Secretariat)</option>
                {currentAdmin?.role === 'SUPER_ADMIN' && (
                  <>
                    <option value="ADMIN">ADMIN (System Administrator)</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN (Apex Authority)</option>
                  </>
                )}
              </select>
            </div>

            {selectedRole !== 'STUDENT' && (
              <>
                <div>
                  <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                    Bureau / Cell Jurisdiction *
                  </label>
                  <select
                    value={selectedBureau}
                    onChange={(e) => setSelectedBureau(e.target.value as BureauCell)}
                    className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                  >
                    <option value="CENTRAL_INTAKE">CENTRAL_INTAKE</option>
                    <option value="REGULATION_BUREAU">REGULATION_BUREAU</option>
                    <option value="PUBLIC_GRIEVANCE_REDRESSAL_CELL">PUBLIC_GRIEVANCE_REDRESSAL_CELL</option>
                    <option value="APPROVAL_BUREAU">APPROVAL_BUREAU</option>
                    <option value="POLICY_ACADEMIC_PLANNING">POLICY_ACADEMIC_PLANNING</option>
                    <option value="ALL_BUREAUS">ALL_BUREAUS (Cross-Bureau Governance)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#20232D] dark:text-white block mb-1">
                    Designated Department / Unit
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Northern Regional Oversight Desk"
                    className="w-full p-2.5 text-xs bg-[#F7F8FA] dark:bg-[#202433] border border-[#E8EAF0] dark:border-[#2C3244] rounded-lg text-[#20232D] dark:text-white focus:outline-hidden focus:border-[#5267E8]"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E8EAF0] dark:border-[#262A38]">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs text-[#747B8C] hover:text-[#20232D] hover:bg-[#F7F8FA] dark:hover:bg-[#202433] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isUpdatingRole}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#5267E8] hover:bg-[#4354D0] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
              >
                {isUpdatingRole ? 'Updating...' : 'Confirm Role Assignment'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Account Deactivation / Activation Confirmation */}
      {deactivatingUser && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setDeactivatingUser(null)}
          onConfirm={handleToggleStatus}
          title={deactivatingUser.isActive ? `Deactivate Account: ${deactivatingUser.name}` : `Activate Account: ${deactivatingUser.name}`}
          message={
            deactivatingUser.isActive
              ? `Are you sure you want to deactivate ${deactivatingUser.email}? This will immediately revoke their ability to sign in or perform actions across the platform.`
              : `Restore full access for ${deactivatingUser.email}? They will be able to sign in with their existing credentials.`
          }
          confirmLabel={deactivatingUser.isActive ? 'Deactivate Account' : 'Activate Account'}
          isDestructive={deactivatingUser.isActive}
          isLoading={isUpdatingStatus}
        />
      )}
    </DashboardLayout>
  );
}

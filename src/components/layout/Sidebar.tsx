/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Inbox, 
  GitCompare, 
  Users, 
  Building2, 
  FileText, 
  Settings, 
  Activity, 
  ChevronLeft, 
  ChevronRight,
  Layers, 
  History,
  FolderSync
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  interface NavItem {
    label: string;
    href: string;
    icon: React.ElementType;
    badge?: string;
  }

  const getNavItems = (role: UserRole): NavItem[] => {
    switch (role) {
      case 'STUDENT':
        return [
          { label: 'Overview', href: '/student/dashboard', icon: LayoutDashboard },
          { label: 'Submit Complaint', href: '/student/complaints/new', icon: FilePlus2 },
          { label: 'My Complaints', href: '/student/complaints', icon: FileText },
          { label: 'Profile & Institutions', href: '/student/profile', icon: Users }
        ];

      case 'INTAKE_OFFICER':
        return [
          { label: 'Intake Dashboard', href: '/intake/dashboard', icon: LayoutDashboard },
          { label: 'Incoming Queue', href: '/intake/complaints', icon: Inbox },
          { label: 'Institution Registry', href: '/admin/institutions', icon: Building2 },
          { label: 'Potential Overlaps', href: '/authority/coordination', icon: GitCompare }
        ];

      case 'RB_OFFICER':
        return [
          { label: 'RB Dashboard', href: '/rb/dashboard', icon: LayoutDashboard },
          { label: 'Assigned Cases', href: '/rb/cases', icon: FileText },
          { label: 'Overlap Alerts', href: '/rb/overlaps', icon: GitCompare, badge: 'Smart' },
          { label: 'Institutions', href: '/admin/institutions', icon: Building2 }
        ];

      case 'PGRC_OFFICER':
        return [
          { label: 'PGRC Dashboard', href: '/pgrc/dashboard', icon: LayoutDashboard },
          { label: 'Grievance Cases', href: '/pgrc/cases', icon: FileText },
          { label: 'Overlap Alerts', href: '/pgrc/overlaps', icon: GitCompare, badge: 'Smart' },
          { label: 'Institutions', href: '/admin/institutions', icon: Building2 }
        ];

      case 'SENIOR_AUTHORITY':
        return [
          { label: 'Apex Overview', href: '/authority/dashboard', icon: LayoutDashboard },
          { label: 'Cross-Bureau Cases', href: '/authority/cases', icon: Layers },
          { label: 'Coordination Hub', href: '/authority/coordination', icon: FolderSync },
          { label: 'Workload & SLA', href: '/authority/analytics', icon: Activity },
          { label: 'Institutions Directory', href: '/admin/institutions', icon: Building2 }
        ];

      case 'ADMIN':
      case 'SUPER_ADMIN':
        return [
          { label: 'Admin Console', href: '/admin/dashboard', icon: LayoutDashboard },
          { label: 'User Management', href: '/admin/users', icon: Users },
          { label: 'AICTE Institutions', href: '/admin/institutions', icon: Building2 },
          { label: 'System Audit Trail', href: '/admin/audit-logs', icon: History },
          { label: 'System Settings', href: '/admin/settings', icon: Settings }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems(user.role);

  return (
    <aside 
      className={`bg-[#171A23] text-[#98A1B3] flex flex-col shrink-0 transition-all duration-200 border-r border-[#232736] relative z-40 select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center justify-between border-b border-[#232736]">
        {!collapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-[#5267E8] text-white flex items-center justify-center font-bold text-xs tracking-wider shadow-xs shrink-0">
              IN
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold text-white text-sm tracking-tight leading-none">IN-Sight</span>
                <span className="text-[10px] bg-[#242A3D] text-[#8695F3] border border-[#333C57] font-mono px-1.5 py-0.2 rounded font-medium">SIH '26</span>
              </div>
              <p className="text-[10px] text-[#717C94] truncate mt-0.5">AICTE Grievance Portal</p>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-7 h-7 rounded-lg bg-[#5267E8] text-white flex items-center justify-center font-bold text-xs">
            IN
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-md text-[#717C94] hover:text-white hover:bg-[#202534] transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Role Banner */}
      {!collapsed && (
        <div className="px-4 py-2.5 bg-[#1B1E29] border-b border-[#232736]">
          <p className="text-[10px] font-semibold tracking-wider text-[#66728A] uppercase">Current Bureau / Role</p>
          <p className="text-xs font-semibold text-[#8695F3] truncate mt-0.5">
            {user.bureau ? user.bureau.replace(/_/g, ' ') : user.role.replace(/_/g, ' ')}
          </p>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto dark-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href) && item.href !== '/admin/dashboard');

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-[#242938] text-white border-l-2 border-[#5267E8] shadow-xs font-semibold'
                  : 'text-[#98A1B3] hover:text-white hover:bg-[#1E2330]'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#8695F3]' : 'text-[#717C94] group-hover:text-white'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#5267E8]/20 text-[#9BB0FC] border border-[#5267E8]/30">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      {!collapsed && (
        <div className="p-3.5 border-t border-[#232736] text-[11px] text-[#66728A] space-y-1">
          <div className="flex items-center justify-between text-[#717C94]">
            <span className="font-medium">Team: InfluenCode</span>
            <span className="font-mono text-[10px]">v1.0-SIH</span>
          </div>
          <p className="text-[10px] text-[#606B82] leading-tight">
            Integrated AICTE Cross-Bureau Case Coordination Engine
          </p>
        </div>
      )}
    </aside>
  );
}

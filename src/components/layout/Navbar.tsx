/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  RefreshCw, 
  ChevronDown,
  Building2,
  Check
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { UserRole } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function Navbar({ breadcrumbs = [] }: NavbarProps) {
  const { user, logout, switchDemoRole, getDefaultRouteForRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Close popovers on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target as Node)) {
        setShowDemoMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDemoSwitch = async (role: UserRole) => {
    try {
      setIsSwitchingRole(true);
      const switchedUser = await switchDemoRole(role);
      setShowDemoMenu(false);
      const targetRoute = getDefaultRouteForRole(switchedUser.role);
      navigate(targetRoute);
    } catch (err) {
      console.error('Demo persona switch failed:', err);
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (user?.role === 'STUDENT') {
      navigate(`/student/complaints?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'INTAKE_OFFICER') {
      navigate(`/intake/complaints?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'RB_OFFICER') {
      navigate(`/rb/cases?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'PGRC_OFFICER') {
      navigate(`/pgrc/cases?search=${encodeURIComponent(searchQuery)}`);
    } else if (user?.role === 'SENIOR_AUTHORITY') {
      navigate(`/authority/cases?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const demoRoles: { role: UserRole; title: string; subtitle: string; badge: string }[] = [
    { role: 'STUDENT', title: 'Rahul Sharma', subtitle: 'Complainant Student', badge: 'Student' },
    { role: 'INTAKE_OFFICER', title: 'Sunita Deshmukh', subtitle: 'Central Intake Desk', badge: 'Intake' },
    { role: 'RB_OFFICER', title: 'Virendra Kashyap', subtitle: 'Regulation Bureau (RB)', badge: 'RB' },
    { role: 'PGRC_OFFICER', title: 'Dr. Meenakshi Sundaram', subtitle: 'Grievance Cell (PGRC)', badge: 'PGRC' },
    { role: 'SENIOR_AUTHORITY', title: 'Prof. K. Rajagopal', subtitle: 'Member Secretary AICTE', badge: 'Apex' },
    { role: 'ADMIN', title: 'Rameshwar Sen', subtitle: 'System & Role Admin', badge: 'Admin' },
    { role: 'SUPER_ADMIN', title: 'Dr. Alok Verma', subtitle: 'Highest Authority', badge: 'SuperAdmin' }
  ];

  return (
    <header className="h-14 px-6 bg-white border-b border-[#E8EAF0] flex items-center justify-between gap-6 shrink-0 z-30 sticky top-0">
      {/* Zone 1: Contextual Breadcrumb Trail */}
      <div className="flex items-center gap-2 text-xs text-[#747B8C] overflow-hidden">
        <span className="font-heading font-semibold text-[#20232D]">IN-Sight</span>
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span className="text-[#D8DCE4]">/</span>
            {crumb.href ? (
              <button 
                onClick={() => navigate(crumb.href!)} 
                className="hover:text-[#5267E8] transition-colors whitespace-nowrap"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-[#20232D] font-medium whitespace-nowrap truncate max-w-xs">
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Zone 2: Global Search & Live Demo Switcher */}
      <div className="flex items-center gap-3 flex-1 max-w-xl justify-end">
        <form onSubmit={handleSearchSubmit} className="relative w-full max-w-xs hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#747B8C]" />
          <input
            type="text"
            placeholder="Search AICTE ID, Case, Subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#F7F8FA] border border-[#E8EAF0] rounded-lg text-[#20232D] placeholder:text-[#9AA1B2] focus:outline-hidden focus:ring-2 focus:ring-[#5267E8]/15 focus:border-[#5267E8] transition-all"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-[#9AA1B2] bg-white px-1.5 py-0.5 rounded border border-[#E8EAF0]">
            /
          </kbd>
        </form>

        {/* Live Demo Persona Switcher */}
        <div className="relative" ref={demoRef}>
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            disabled={isSwitchingRole}
            className="px-2.5 py-1.5 text-xs font-medium text-[#5267E8] bg-[#EEF1FD] hover:bg-[#E4E9FB] border border-[#D2D9FA] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            title="Fast Switch Persona for SIH Demonstration"
          >
            <RefreshCw className={`w-3 h-3 text-[#5267E8] ${isSwitchingRole ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline font-mono text-[11px] text-[#5267E8]/80">Role:</span>
            <span className="font-semibold text-[#5267E8]">
              {user?.role.replace('_', ' ')}
            </span>
            <ChevronDown className="w-3 h-3 text-[#5267E8]/70" />
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#E8EAF0] p-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#E8EAF0]">
                <p className="font-heading text-xs font-semibold text-[#20232D]">SIH Demo Persona Switcher</p>
                <p className="text-[11px] text-[#747B8C]">Switch role instantly without re-logging</p>
              </div>
              <div className="py-1 max-h-72 overflow-y-auto space-y-0.5">
                {demoRoles.map(item => {
                  const isCurrent = user?.role === item.role;
                  return (
                    <button
                      key={item.role}
                      onClick={() => handleDemoSwitch(item.role)}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition-colors ${
                        isCurrent 
                          ? 'bg-[#EEF1FD] text-[#5267E8] font-medium' 
                          : 'text-[#20232D] hover:bg-[#F7F8FA]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-[#20232D]">{item.title}</p>
                          {isCurrent && <Check className="w-3 h-3 text-[#5267E8]" />}
                        </div>
                        <p className="text-[10px] text-[#747B8C]">{item.subtitle}</p>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        isCurrent 
                          ? 'bg-[#5267E8] text-white border-[#5267E8]' 
                          : 'bg-[#F7F8FA] text-[#747B8C] border-[#E8EAF0]'
                      }`}>
                        {item.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Zone 3: Notification Center & User Profile */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Notification Center */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-1.5 text-[#747B8C] hover:text-[#20232D] hover:bg-[#F7F8FA] border border-transparent hover:border-[#E8EAF0] rounded-lg relative transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#5267E8] rounded-full ring-2 ring-white" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E8EAF0] overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#E8EAF0] bg-[#F7F8FA]">
                <span className="font-heading text-xs font-semibold text-[#20232D]">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-[11px] text-[#5267E8] font-medium hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#E8EAF0]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#747B8C]">
                    No recent notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.trackingId) {
                          if (user?.role === 'STUDENT') {
                            navigate(`/student/complaints/${n.complaintId || n.trackingId}`);
                          } else if (user?.role === 'RB_OFFICER') {
                            navigate(`/rb/cases`);
                          } else if (user?.role === 'PGRC_OFFICER') {
                            navigate(`/pgrc/cases`);
                          } else {
                            navigate(`/authority/cases`);
                          }
                          setShowNotifMenu(false);
                        }
                      }}
                      className={`p-3 text-xs cursor-pointer hover:bg-[#F7F8FA] transition-colors ${
                        !n.isRead ? 'bg-[#EEF1FD]/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-medium ${!n.isRead ? 'text-[#5267E8]' : 'text-[#20232D]'}`}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="w-1.5 h-1.5 bg-[#5267E8] rounded-full shrink-0 mt-1" />}
                      </div>
                      <p className="text-[11px] text-[#747B8C] mt-1 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-[#9AA1B2] mt-1.5 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#F7F8FA] border border-transparent hover:border-[#E8EAF0] transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-[#171A23] text-white flex items-center justify-center text-xs font-semibold">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-semibold text-[#20232D] leading-none truncate max-w-[120px]">
                {user?.name}
              </p>
              <p className="text-[10px] text-[#747B8C] mt-0.5 truncate max-w-[120px]">
                {user?.role}
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E8EAF0] p-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#E8EAF0]">
                <p className="font-heading text-xs font-semibold text-[#20232D] truncate">{user?.name}</p>
                <p className="text-[11px] text-[#747B8C] truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#5267E8] font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user?.role}</span>
                </div>
              </div>

              <div className="py-1">
                {user?.role === 'STUDENT' && (
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/student/profile'); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#20232D] hover:bg-[#F7F8FA] rounded-md flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#747B8C]" />
                    <span>My Profile</span>
                  </button>
                )}
                {['ADMIN', 'SUPER_ADMIN'].includes(user?.role || '') && (
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/admin/settings'); }}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#20232D] hover:bg-[#F7F8FA] rounded-md flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-[#747B8C]" />
                    <span>System Settings</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-[#DC2626] hover:bg-[#FEF2F2] rounded-md flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

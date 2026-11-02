/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  adminLogin: (email: string, pass: string) => Promise<User>;
  register: (name: string, email: string, pass: string, phone?: string) => Promise<User>;
  logout: () => void;
  switchDemoRole: (role: UserRole) => Promise<User>;
  getDefaultRouteForRole: (role?: UserRole) => string;
  isStudent: boolean;
  isIntakeOfficer: boolean;
  isRbOfficer: boolean;
  isPgrcOfficer: boolean;
  isSeniorAuthority: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOfficer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const initAuth = async () => {
    try {
      const current = await api.getMe();
      setUser(current);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login({ email, password: pass });
    setUser(res.user);
    return res.user;
  };

  const adminLogin = async (email: string, pass: string) => {
    const res = await api.adminLogin({ email, password: pass });
    setUser(res.user);
    return res.user;
  };

  const register = async (name: string, email: string, pass: string, phone?: string) => {
    const res = await api.register({ name, email, password: pass, phone });
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const switchDemoRole = async (role: UserRole) => {
    const res = await api.demoSwitch(role);
    setUser(res.user);
    return res.user;
  };

  const getDefaultRouteForRole = (role?: UserRole): string => {
    const targetRole = role || user?.role;
    switch (targetRole) {
      case 'STUDENT':
        return '/student/dashboard';
      case 'INTAKE_OFFICER':
        return '/intake/dashboard';
      case 'RB_OFFICER':
        return '/rb/dashboard';
      case 'PGRC_OFFICER':
        return '/pgrc/dashboard';
      case 'SENIOR_AUTHORITY':
        return '/authority/dashboard';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  const role = user?.role;
  const isStudent = role === 'STUDENT';
  const isIntakeOfficer = role === 'INTAKE_OFFICER';
  const isRbOfficer = role === 'RB_OFFICER';
  const isPgrcOfficer = role === 'PGRC_OFFICER';
  const isSeniorAuthority = role === 'SENIOR_AUTHORITY';
  const isAdmin = role === 'ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isOfficer = ['INTAKE_OFFICER', 'RB_OFFICER', 'PGRC_OFFICER', 'SENIOR_AUTHORITY'].includes(role || '');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        adminLogin,
        register,
        logout,
        switchDemoRole,
        getDefaultRouteForRole,
        isStudent,
        isIntakeOfficer,
        isRbOfficer,
        isPgrcOfficer,
        isSeniorAuthority,
        isAdmin,
        isSuperAdmin,
        isOfficer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

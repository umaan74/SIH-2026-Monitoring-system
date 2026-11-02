/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentComplaints } from './pages/student/StudentComplaints';
import { NewComplaintPage } from './pages/student/NewComplaintPage';
import { ComplaintDetail } from './pages/student/ComplaintDetail';
import { StudentProfile } from './pages/student/StudentProfile';

// Intake Officer Pages
import { IntakeDashboard } from './pages/intake/IntakeDashboard';
import { IntakeComplaints } from './pages/intake/IntakeComplaints';

// Regulation Bureau (RB) Pages
import { RbDashboard } from './pages/rb/RbDashboard';
import { RbCases } from './pages/rb/RbCases';
import { RbOverlaps } from './pages/rb/RbOverlaps';

// Public Grievance Redressal Cell (PGRC) Pages
import { PgrcDashboard } from './pages/pgrc/PgrcDashboard';
import { PgrcCases } from './pages/pgrc/PgrcCases';
import { PgrcOverlaps } from './pages/pgrc/PgrcOverlaps';

// Senior Authority Pages
import { SeniorAuthorityDashboard } from './pages/authority/SeniorAuthorityDashboard';
import { MasterCases } from './pages/authority/MasterCases';
import { CrossBureauCoordination } from './pages/authority/CrossBureauCoordination';

// Administrative Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { InstitutionManagement } from './pages/admin/InstitutionManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { SystemSettings } from './pages/admin/SystemSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Entry Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
                  <StudentComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints/new"
              element={
                <ProtectedRoute allowedRoles={['STUDENT', 'SUPER_ADMIN', 'ADMIN']}>
                  <NewComplaintPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/complaints/:id"
              element={
                <ProtectedRoute>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentProfile />
                </ProtectedRoute>
              }
            />

            {/* Central Intake Desk Routes */}
            <Route
              path="/intake/dashboard"
              element={
                <ProtectedRoute allowedRoles={['INTAKE_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <IntakeDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake/complaints"
              element={
                <ProtectedRoute allowedRoles={['INTAKE_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <IntakeComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake/verification/:id"
              element={
                <ProtectedRoute allowedRoles={['INTAKE_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />

            {/* Regulation Bureau (RB) Routes */}
            <Route
              path="/rb/dashboard"
              element={
                <ProtectedRoute allowedRoles={['RB_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <RbDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rb/cases"
              element={
                <ProtectedRoute allowedRoles={['RB_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <RbCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rb/cases/:id"
              element={
                <ProtectedRoute allowedRoles={['RB_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rb/overlaps"
              element={
                <ProtectedRoute allowedRoles={['RB_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <RbOverlaps />
                </ProtectedRoute>
              }
            />

            {/* Public Grievance Redressal Cell (PGRC) Routes */}
            <Route
              path="/pgrc/dashboard"
              element={
                <ProtectedRoute allowedRoles={['PGRC_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <PgrcDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pgrc/cases"
              element={
                <ProtectedRoute allowedRoles={['PGRC_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <PgrcCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pgrc/cases/:id"
              element={
                <ProtectedRoute allowedRoles={['PGRC_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <ComplaintDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pgrc/overlaps"
              element={
                <ProtectedRoute allowedRoles={['PGRC_OFFICER', 'SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY']}>
                  <PgrcOverlaps />
                </ProtectedRoute>
              }
            />

            {/* Senior Authority Apex Oversight Routes */}
            <Route
              path="/authority/dashboard"
              element={
                <ProtectedRoute allowedRoles={['SENIOR_AUTHORITY', 'SUPER_ADMIN', 'ADMIN']}>
                  <SeniorAuthorityDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/cases"
              element={
                <ProtectedRoute allowedRoles={['SENIOR_AUTHORITY', 'SUPER_ADMIN', 'ADMIN']}>
                  <MasterCases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/coordination"
              element={
                <ProtectedRoute allowedRoles={['SENIOR_AUTHORITY', 'SUPER_ADMIN', 'ADMIN', 'INTAKE_OFFICER', 'RB_OFFICER', 'PGRC_OFFICER']}>
                  <CrossBureauCoordination />
                </ProtectedRoute>
              }
            />
            <Route
              path="/authority/analytics"
              element={
                <ProtectedRoute allowedRoles={['SENIOR_AUTHORITY', 'SUPER_ADMIN', 'ADMIN']}>
                  <SeniorAuthorityDashboard />
                </ProtectedRoute>
              }
            />

            {/* System Administration Console Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/institutions"
              element={
                <ProtectedRoute>
                  <InstitutionManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'SENIOR_AUTHORITY']}>
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

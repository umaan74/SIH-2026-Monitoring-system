/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  User, 
  Complaint, 
  ComplaintMatch, 
  Institution, 
  Notification, 
  AuditLog, 
  DashboardStats,
  ComplaintStatus,
  BureauCell
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('insight_jwt_token');
  }

  private setToken(token: string) {
    localStorage.setItem('insight_jwt_token', token);
  }

  private clearToken() {
    localStorage.removeItem('insight_jwt_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- Auth ---
  public async register(payload: { name: string; email: string; password: string; phone?: string }) {
    const res = await this.request<{ message: string; user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async login(payload: { email: string; password: string }) {
    const res = await this.request<{ message: string; user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async adminLogin(payload: { email: string; password: string }) {
    const res = await this.request<{ message: string; user: User; token: string }>('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.setToken(res.token);
    return res;
  }

  public async getMe(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await this.request<{ user: User }>('/auth/me');
      return res.user;
    } catch (err) {
      this.clearToken();
      return null;
    }
  }

  public async demoSwitch(role: string) {
    const res = await this.request<{ message: string; user: User; token: string }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    this.setToken(res.token);
    return res;
  }

  public logout() {
    this.clearToken();
  }

  // --- Complaints ---
  public async getComplaints(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await this.request<{ complaints: Complaint[] }>(`/complaints${query}`);
    return res.complaints;
  }

  public async getComplaintById(id: string) {
    const res = await this.request<{ complaint: Complaint }>(`/complaints/${id}`);
    return res.complaint;
  }

  public async submitComplaint(payload: {
    institutionName: string;
    aictePermanentId: string;
    category: string;
    subject: string;
    description: string;
    priority?: string;
    supportingDocuments?: any[];
  }) {
    const res = await this.request<{ message: string; complaint: Complaint }>('/complaints', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.complaint;
  }

  public async updateComplaintStatus(
    id: string,
    payload: {
      newStatus: ComplaintStatus;
      remarks: string;
      internalNotes?: string;
      assignedBureau?: BureauCell;
      assignedOfficerId?: string;
      assignedOfficerName?: string;
    }
  ) {
    const res = await this.request<{ message: string; complaint: Complaint }>(`/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res.complaint;
  }

  public async assignComplaint(
    id: string,
    payload: {
      assignedBureau: BureauCell;
      assignedOfficerId?: string;
      assignedOfficerName?: string;
      remarks?: string;
    }
  ) {
    const res = await this.request<{ message: string; complaint: Complaint }>(`/complaints/${id}/assign`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res.complaint;
  }

  // --- Matches ---
  public async getMatches(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await this.request<{ matches: ComplaintMatch[] }>(`/matches${query}`);
    return res.matches;
  }

  public async recordMatchDecision(
    matchId: string,
    decision: 'CONFIRMED_RELATED' | 'NOT_RELATED' | 'LINKED',
    notes: string
  ) {
    const res = await this.request<{ message: string; match: ComplaintMatch }>(`/matches/${matchId}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes })
    });
    return res.match;
  }

  public async triggerMatchingScan() {
    return this.request<{ message: string; matchesCount: number }>('/matches/scan', {
      method: 'POST'
    });
  }

  // --- Institutions ---
  public async getInstitutions(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    const res = await this.request<{ institutions: Institution[] }>(`/institutions${query}`);
    return res.institutions;
  }

  public async getInstitutionById(id: string) {
    return this.request<{ institution: Institution; complaints: Complaint[] }>(`/institutions/${id}`);
  }

  public async createInstitution(payload: Partial<Institution>) {
    const res = await this.request<{ institution: Institution }>('/institutions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return res.institution;
  }

  // --- User Management ---
  public async getUsers() {
    const res = await this.request<{ users: User[] }>('/users');
    return res.users;
  }

  public async updateUserRole(id: string, payload: { role: string; bureau?: string; department?: string }) {
    const res = await this.request<{ message: string; user: User }>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    return res.user;
  }

  public async updateUserStatus(id: string, isActive: boolean, reason?: string) {
    const res = await this.request<{ message: string; user: User }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive, reason })
    });
    return res.user;
  }

  // --- Analytics ---
  public async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/stats/dashboard');
  }

  // --- Notifications ---
  public async getNotifications() {
    const res = await this.request<{ notifications: Notification[] }>('/notifications');
    return res.notifications;
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  public async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH'
    });
  }

  // --- Audit Logs & Reset ---
  public async getAuditLogs() {
    const res = await this.request<{ auditLogs: AuditLog[] }>('/audit-logs');
    return res.auditLogs;
  }

  public async resetDemoDatabase() {
    return this.request<{ message: string }>('/demo/seed', {
      method: 'POST'
    });
  }
}

export const api = new ApiService();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'STUDENT'
  | 'INTAKE_OFFICER'
  | 'RB_OFFICER'
  | 'PGRC_OFFICER'
  | 'SENIOR_AUTHORITY';

export type BureauCell = 
  | 'CENTRAL_INTAKE'
  | 'REGULATION_BUREAU'
  | 'PUBLIC_GRIEVANCE_REDRESSAL_CELL'
  | 'APPROVAL_BUREAU'
  | 'POLICY_ACADEMIC_PLANNING'
  | 'ALL_BUREAUS';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNDER_VERIFICATION'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'UNDER_REVIEW'
  | 'NEEDS_INFORMATION'
  | 'ACTION_TAKEN'
  | 'RESOLVED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'CLOSED';

export type ComplaintCategory =
  | 'Faculty and Teaching'
  | 'Infrastructure'
  | 'Admission Irregularities'
  | 'Scholarship Issues'
  | 'Examination Issues'
  | 'Academic Facilities'
  | 'Capitation Fee & Exploitation'
  | 'Other';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bureau?: BureauCell;
  department?: string;
  isActive: boolean;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Institution {
  id: string;
  name: string;
  aictePermanentId: string;
  state: string;
  city: string;
  address: string;
  institutionType: 'Government' | 'Govt-Aided' | 'Private-Unaided' | 'Deemed-University' | 'Autonomous';
  contactEmail: string;
  contactPhone: string;
  activeComplaintsCount?: number;
  totalComplaintsCount?: number;
  createdAt: string;
}

export interface CaseAction {
  id: string;
  complaintId: string;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  changedById: string;
  changedByName: string;
  changedByRole: UserRole;
  remarks: string;
  internalNotes?: string;
  timestamp: string;
}

export interface SupportingDocument {
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Complaint {
  id: string;
  trackingId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  institutionId: string;
  institutionName: string;
  aictePermanentId: string;
  category: ComplaintCategory;
  subject: string;
  description: string;
  status: ComplaintStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedBureau?: BureauCell;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  supportingDocuments: SupportingDocument[];
  actionsHistory: CaseAction[];
  slaDeadline: string;
  isEscalated?: boolean;
  linkedComplaintIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintMatch {
  id: string;
  sourceComplaintId: string;
  targetComplaintId: string;
  sourceTrackingId: string;
  targetTrackingId: string;
  institutionName: string;
  aictePermanentId: string;
  sourceBureau?: BureauCell;
  targetBureau?: BureauCell;
  overallScore: number;
  similarityLevel: 'HIGH' | 'MODERATE' | 'LOW';
  matchFactors: {
    institutionScore: number;
    categoryScore: number;
    textSimilarityScore: number;
    semanticEmbeddingScore?: number;
    modelUsed?: string;
    matchedKeywords: string[];
    explanation: string[];
  };
  reviewStatus: 'PENDING_REVIEW' | 'CONFIRMED_RELATED' | 'NOT_RELATED' | 'LINKED';
  reviewedById?: string;
  reviewedByName?: string;
  reviewDecisionNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'COMPLAINT_RECEIVED' | 'VERIFIED' | 'ASSIGNED' | 'STATUS_UPDATED' | 'INFO_REQUESTED' | 'OVERLAP_DETECTED' | 'ESCALATED' | 'RESOLVED';
  complaintId?: string;
  trackingId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'AUTH' | 'USER_MGMT' | 'COMPLAINT' | 'ASSIGNMENT' | 'MATCHING' | 'SLA_ESCALATION' | 'SYSTEM';
  performedById: string;
  performedByName: string;
  performedByRole: UserRole;
  targetId?: string;
  targetType?: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface DashboardStats {
  summary: {
    totalComplaints: number;
    pendingComplaints: number;
    resolvedComplaints: number;
    overdueComplaints: number;
    escalatedComplaints: number;
    totalInstitutions: number;
    activeInstitutionsInvolved: number;
    potentialOverlapsCount: number;
    highOverlapAlertsCount: number;
  };
  bureauDistribution: { bureau: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  ageingDistribution: { range: string; count: number }[];
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import { 
  User, 
  Institution, 
  Complaint, 
  ComplaintMatch, 
  Notification, 
  AuditLog,
  UserRole,
  BureauCell
} from './types.js';
import { scanAndGenerateMatches } from './matching-engine.js';

interface DatabaseSchema {
  users: User[];
  institutions: Institution[];
  complaints: Complaint[];
  matches: ComplaintMatch[];
  notifications: Notification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class DatabaseStore {
  private data: DatabaseSchema = {
    users: [],
    institutions: [],
    complaints: [],
    matches: [],
    notifications: [],
    auditLogs: []
  };
  private isInitialized = false;

  constructor() {
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (err) {
        console.error('Failed to create data directory:', err);
      }
    }
  }

  private saveToDisk() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.complaints && parsed.institutions) {
          this.data = parsed;
          this.isInitialized = true;
          console.log(`[Database] Loaded existing database with ${this.data.complaints.length} complaints and ${this.data.users.length} users.`);
          return;
        }
      } catch (err) {
        console.warn('[Database] Existing db.json invalid or corrupt. Re-seeding...', err);
      }
    }

    await this.seedDefaults();
    this.isInitialized = true;
  }

  public async resetAndSeed(): Promise<void> {
    await this.seedDefaults();
  }

  private async seedDefaults(): Promise<void> {
    console.log('[Database] Seeding pristine demonstration database...');
    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('Demo@123', salt);

    const users: User[] = [
      {
        id: 'usr-superadmin',
        name: 'Dr. Alok Verma',
        email: 'superadmin@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'SUPER_ADMIN',
        bureau: 'ALL_BUREAUS',
        department: 'AICTE Apex Governance & System Administration',
        isActive: true,
        phone: '+91-11-29581001',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'usr-admin',
        name: 'Rameshwar Sen',
        email: 'admin@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'ADMIN',
        bureau: 'ALL_BUREAUS',
        department: 'Institutional Cell & Access Management',
        isActive: true,
        phone: '+91-11-29581022',
        createdAt: '2026-01-02T00:00:00.000Z',
        updatedAt: '2026-01-02T00:00:00.000Z'
      },
      {
        id: 'usr-intake',
        name: 'Sunita Deshmukh',
        email: 'intake@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'INTAKE_OFFICER',
        bureau: 'CENTRAL_INTAKE',
        department: 'Centralized Grievance Intake & Verification Desk',
        isActive: true,
        phone: '+91-11-29581045',
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: '2026-01-05T00:00:00.000Z'
      },
      {
        id: 'usr-rb',
        name: 'Virendra Kashyap',
        email: 'rb.officer@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'RB_OFFICER',
        bureau: 'REGULATION_BUREAU',
        department: 'Regulation Bureau (Standards & Compliance)',
        isActive: true,
        phone: '+91-11-29581078',
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: '2026-01-05T00:00:00.000Z'
      },
      {
        id: 'usr-pgrc',
        name: 'Dr. Meenakshi Sundaram',
        email: 'pgrc.officer@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'PGRC_OFFICER',
        bureau: 'PUBLIC_GRIEVANCE_REDRESSAL_CELL',
        department: 'Public Grievance Redressal Cell (Student Welfare)',
        isActive: true,
        phone: '+91-11-29581090',
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: '2026-01-05T00:00:00.000Z'
      },
      {
        id: 'usr-authority',
        name: 'Prof. K. Rajagopal (Member Secretary)',
        email: 'authority@insight.aicte.gov.in',
        passwordHash: defaultPasswordHash,
        role: 'SENIOR_AUTHORITY',
        bureau: 'ALL_BUREAUS',
        department: 'Executive Secretariat & Cross-Bureau Oversight',
        isActive: true,
        phone: '+91-11-29581000',
        createdAt: '2026-01-05T00:00:00.000Z',
        updatedAt: '2026-01-05T00:00:00.000Z'
      },
      {
        id: 'usr-student-1',
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        isActive: true,
        phone: '+91-9876543210',
        createdAt: '2026-01-10T00:00:00.000Z',
        updatedAt: '2026-01-10T00:00:00.000Z'
      },
      {
        id: 'usr-student-2',
        name: 'Sneha Patil',
        email: 'sneha.patil@example.com',
        passwordHash: defaultPasswordHash,
        role: 'STUDENT',
        isActive: true,
        phone: '+91-9876543211',
        createdAt: '2026-01-12T00:00:00.000Z',
        updatedAt: '2026-01-12T00:00:00.000Z'
      }
    ];

    const institutions: Institution[] = [
      {
        id: 'inst-1',
        name: 'Apex Institute of Engineering & Technology',
        aictePermanentId: '1-45678901',
        state: 'Delhi',
        city: 'New Delhi',
        address: 'Sector 14, Institutional Area, Dwarka, New Delhi 110078',
        institutionType: 'Private-Unaided',
        contactEmail: 'principal@apextech.edu.in',
        contactPhone: '+91-11-45678900',
        activeComplaintsCount: 2,
        totalComplaintsCount: 3,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inst-2',
        name: 'Maharashtra Institute of Technology & Research',
        aictePermanentId: '1-78901234',
        state: 'Maharashtra',
        city: 'Pune',
        address: 'Paud Road, Kothrud, Pune, Maharashtra 411038',
        institutionType: 'Autonomous',
        contactEmail: 'director@mitr-pune.ac.in',
        contactPhone: '+91-20-25432100',
        activeComplaintsCount: 1,
        totalComplaintsCount: 2,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inst-3',
        name: 'Silicon Valley College of Technology',
        aictePermanentId: '1-34567890',
        state: 'Karnataka',
        city: 'Bengaluru',
        address: 'Electronic City Phase 1, Hosur Road, Bengaluru 560100',
        institutionType: 'Private-Unaided',
        contactEmail: 'registrar@svct.edu.in',
        contactPhone: '+91-80-28521000',
        activeComplaintsCount: 1,
        totalComplaintsCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inst-4',
        name: 'Kaveri Polytechnic & Engineering College',
        aictePermanentId: '1-56789012',
        state: 'Tamil Nadu',
        city: 'Chennai',
        address: 'Grand Southern Trunk Rd, Guindy, Chennai 600025',
        institutionType: 'Govt-Aided',
        contactEmail: 'office@kaveritech.edu.in',
        contactPhone: '+91-44-22350000',
        activeComplaintsCount: 0,
        totalComplaintsCount: 2,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inst-5',
        name: 'National Institute of Science & Vocational Studies',
        aictePermanentId: '1-90123456',
        state: 'Uttar Pradesh',
        city: 'Lucknow',
        address: 'Sitapur Road, Mohibullapur, Lucknow 226021',
        institutionType: 'Government',
        contactEmail: 'dean@nisvs.ac.in',
        contactPhone: '+91-522-2361000',
        activeComplaintsCount: 1,
        totalComplaintsCount: 2,
        createdAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'inst-6',
        name: 'Gujarat Central Institute of Applied Tech',
        aictePermanentId: '1-23456789',
        state: 'Gujarat',
        city: 'Ahmedabad',
        address: 'SG Highway, Bodakdev, Ahmedabad 380054',
        institutionType: 'Autonomous',
        contactEmail: 'admin@gciat.ac.in',
        contactPhone: '+91-79-26850000',
        activeComplaintsCount: 0,
        totalComplaintsCount: 1,
        createdAt: '2026-01-01T00:00:00.000Z'
      }
    ];

    const complaints: Complaint[] = [
      {
        id: 'cmp-101',
        trackingId: 'AIC-2026-89421',
        studentId: 'usr-student-1',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul.sharma@example.com',
        institutionId: 'inst-1',
        institutionName: 'Apex Institute of Engineering & Technology',
        aictePermanentId: '1-45678901',
        category: 'Faculty and Teaching',
        subject: 'Severe shortage of qualified professors and non-payment of faculty salaries',
        description: 'The college has not paid professor salaries for four months leading to mass resignations in AI & Data Science and Computer Engineering branches. Classes are abruptly cancelled or handled by unqualified temporary staff.',
        status: 'ASSIGNED',
        priority: 'HIGH',
        assignedBureau: 'REGULATION_BUREAU',
        assignedOfficerId: 'usr-rb',
        assignedOfficerName: 'Virendra Kashyap',
        supportingDocuments: [
          { name: 'Semester_Class_Schedule_Cancelled.pdf', size: 1240000, type: 'application/pdf' },
          { name: 'Faculty_Representation_Letter.pdf', size: 840000, type: 'application/pdf' }
        ],
        actionsHistory: [
          {
            id: 'act-1',
            complaintId: 'cmp-101',
            previousStatus: 'SUBMITTED',
            newStatus: 'UNDER_VERIFICATION',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Verification underway for AICTE Permanent ID 1-45678901 against current approval portal records.',
            timestamp: '2026-01-15T09:30:00.000Z'
          },
          {
            id: 'act-2',
            complaintId: 'cmp-101',
            previousStatus: 'UNDER_VERIFICATION',
            newStatus: 'VERIFIED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Institution affiliation and student enrollment verified. Document evidence authenticated.',
            timestamp: '2026-01-16T11:00:00.000Z'
          },
          {
            id: 'act-3',
            complaintId: 'cmp-101',
            previousStatus: 'VERIFIED',
            newStatus: 'ASSIGNED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Matter involves regulatory compliance and faculty cadre norms. Assigned to Regulation Bureau for inspection inquiry.',
            internalNotes: 'Noted potential overlap with PGRC grievance submitted by student council representative.',
            timestamp: '2026-01-16T14:15:00.000Z'
          }
        ],
        slaDeadline: '2026-02-15T18:00:00.000Z',
        createdAt: '2026-01-14T16:20:00.000Z',
        updatedAt: '2026-01-16T14:15:00.000Z'
      },
      {
        id: 'cmp-102',
        trackingId: 'AIC-2026-89455',
        studentId: 'usr-student-2',
        studentName: 'Sneha Patil',
        studentEmail: 'sneha.patil@example.com',
        institutionId: 'inst-1',
        institutionName: 'Apex Institute of Engineering & Technology',
        aictePermanentId: '1-45678901',
        category: 'Faculty and Teaching',
        subject: 'Unqualified faculty and teacher strike disrupting 6th semester lab exams',
        description: 'Professors are on continuous strike over unpaid salary arrears. College administration has deployed non-technical administrative clerks to invigilate and evaluate specialized laboratory practicals.',
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        assignedBureau: 'PUBLIC_GRIEVANCE_REDRESSAL_CELL',
        assignedOfficerId: 'usr-pgrc',
        assignedOfficerName: 'Dr. Meenakshi Sundaram',
        supportingDocuments: [
          { name: 'Notice_Practical_Exam_Disruption.jpg', size: 950000, type: 'image/jpeg' }
        ],
        actionsHistory: [
          {
            id: 'act-10',
            complaintId: 'cmp-102',
            previousStatus: 'SUBMITTED',
            newStatus: 'ASSIGNED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Expedited grievance intake due to student exam impact. Routed to PGRC.',
            timestamp: '2026-01-18T10:00:00.000Z'
          },
          {
            id: 'act-11',
            complaintId: 'cmp-102',
            previousStatus: 'ASSIGNED',
            newStatus: 'UNDER_REVIEW',
            changedById: 'usr-pgrc',
            changedByName: 'Dr. Meenakshi Sundaram',
            changedByRole: 'PGRC_OFFICER',
            remarks: 'Summoned institutional ombudsman and principal for urgent grievance hearing.',
            internalNotes: 'Flagged intelligent match with RB Case AIC-2026-89421. Need coordinated cross-bureau action.',
            timestamp: '2026-01-19T11:45:00.000Z'
          }
        ],
        slaDeadline: '2026-02-18T18:00:00.000Z',
        createdAt: '2026-01-17T18:00:00.000Z',
        updatedAt: '2026-01-19T11:45:00.000Z'
      },
      {
        id: 'cmp-103',
        trackingId: 'AIC-2026-89102',
        studentId: 'usr-student-1',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul.sharma@example.com',
        institutionId: 'inst-2',
        institutionName: 'Maharashtra Institute of Technology & Research',
        aictePermanentId: '1-78901234',
        category: 'Capitation Fee & Exploitation',
        subject: 'Unlawful demand of Rs 2,50,000 cash capitation donation under guise of development fund',
        description: 'Institute management withheld semester admit cards demanding mandatory cash donation receipt. When questioned, authorities threatened academic cancellation.',
        status: 'UNDER_VERIFICATION',
        priority: 'CRITICAL',
        assignedBureau: 'CENTRAL_INTAKE',
        assignedOfficerId: 'usr-intake',
        assignedOfficerName: 'Sunita Deshmukh',
        supportingDocuments: [
          { name: 'Fee_Receipt_Breakdown_Unofficial.pdf', size: 1420000, type: 'application/pdf' }
        ],
        actionsHistory: [
          {
            id: 'act-20',
            complaintId: 'cmp-103',
            previousStatus: 'SUBMITTED',
            newStatus: 'UNDER_VERIFICATION',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Scrutinizing financial allegations and cross-checking approved fee structure with State Fee Regulatory Committee.',
            timestamp: '2026-01-20T14:00:00.000Z'
          }
        ],
        slaDeadline: '2026-02-05T18:00:00.000Z',
        createdAt: '2026-01-20T08:30:00.000Z',
        updatedAt: '2026-01-20T14:00:00.000Z'
      },
      {
        id: 'cmp-104',
        trackingId: 'AIC-2026-88904',
        studentId: 'usr-student-2',
        studentName: 'Sneha Patil',
        studentEmail: 'sneha.patil@example.com',
        institutionId: 'inst-3',
        institutionName: 'Silicon Valley College of Technology',
        aictePermanentId: '1-34567890',
        category: 'Infrastructure',
        subject: 'Laboratory fire safety hazard and non-functional hazardous chemical exhaust',
        description: 'Chemistry and material science laboratories lack mandatory fire extinguishers and functional ventilation. Recent small flash fire was extinguished using tap water.',
        status: 'UNDER_REVIEW',
        priority: 'HIGH',
        assignedBureau: 'REGULATION_BUREAU',
        assignedOfficerId: 'usr-rb',
        assignedOfficerName: 'Virendra Kashyap',
        supportingDocuments: [
          { name: 'Lab_Condition_Photographs.pdf', size: 2100000, type: 'application/pdf' }
        ],
        actionsHistory: [
          {
            id: 'act-30',
            complaintId: 'cmp-104',
            previousStatus: 'SUBMITTED',
            newStatus: 'ASSIGNED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Physical safety risk identified. Directly dispatched to Regulation Bureau for surprise inspection order.',
            timestamp: '2026-01-10T12:00:00.000Z'
          },
          {
            id: 'act-31',
            complaintId: 'cmp-104',
            previousStatus: 'ASSIGNED',
            newStatus: 'UNDER_REVIEW',
            changedById: 'usr-rb',
            changedByName: 'Virendra Kashyap',
            changedByRole: 'RB_OFFICER',
            remarks: 'Show-cause notice served to institutional management with 7-day compliance window.',
            timestamp: '2026-01-12T16:00:00.000Z'
          }
        ],
        slaDeadline: '2026-02-10T18:00:00.000Z',
        createdAt: '2026-01-09T11:00:00.000Z',
        updatedAt: '2026-01-12T16:00:00.000Z'
      },
      {
        id: 'cmp-105',
        trackingId: 'AIC-2026-87410',
        studentId: 'usr-student-1',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul.sharma@example.com',
        institutionId: 'inst-4',
        institutionName: 'Kaveri Polytechnic & Engineering College',
        aictePermanentId: '1-56789012',
        category: 'Scholarship Issues',
        subject: 'PMSSS and Post-Matric Scholarship Funds Withheld by Accounts Division',
        description: 'Sanctioned government scholarship funds for academic year 2025-26 were credited to college account but not disbursed to eligible students.',
        status: 'RESOLVED',
        priority: 'MEDIUM',
        assignedBureau: 'PUBLIC_GRIEVANCE_REDRESSAL_CELL',
        assignedOfficerId: 'usr-pgrc',
        assignedOfficerName: 'Dr. Meenakshi Sundaram',
        supportingDocuments: [
          { name: 'NSP_Portal_Sanction_Proof.pdf', size: 680000, type: 'application/pdf' }
        ],
        actionsHistory: [
          {
            id: 'act-40',
            complaintId: 'cmp-105',
            previousStatus: 'SUBMITTED',
            newStatus: 'VERIFIED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Sanction order confirmed on National Scholarship Portal.',
            timestamp: '2026-01-05T10:00:00.000Z'
          },
          {
            id: 'act-41',
            complaintId: 'cmp-105',
            previousStatus: 'VERIFIED',
            newStatus: 'ASSIGNED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Forwarded to PGRC for direct conciliation.',
            timestamp: '2026-01-05T11:30:00.000Z'
          },
          {
            id: 'act-42',
            complaintId: 'cmp-105',
            previousStatus: 'ASSIGNED',
            newStatus: 'ACTION_TAKEN',
            changedById: 'usr-pgrc',
            changedByName: 'Dr. Meenakshi Sundaram',
            changedByRole: 'PGRC_OFFICER',
            remarks: 'Direction issued to bank and college accounts branch under AICTE Redressal Norms.',
            timestamp: '2026-01-08T15:00:00.000Z'
          },
          {
            id: 'act-43',
            complaintId: 'cmp-105',
            previousStatus: 'ACTION_TAKEN',
            newStatus: 'RESOLVED',
            changedById: 'usr-pgrc',
            changedByName: 'Dr. Meenakshi Sundaram',
            changedByRole: 'PGRC_OFFICER',
            remarks: 'Full disbursement receipt confirmed by student bank statement. Grievance resolved successfully.',
            timestamp: '2026-01-14T17:30:00.000Z'
          }
        ],
        slaDeadline: '2026-02-04T18:00:00.000Z',
        createdAt: '2026-01-04T14:00:00.000Z',
        updatedAt: '2026-01-14T17:30:00.000Z'
      },
      {
        id: 'cmp-106',
        trackingId: 'AIC-2026-86501',
        studentId: 'usr-student-2',
        studentName: 'Sneha Patil',
        studentEmail: 'sneha.patil@example.com',
        institutionId: 'inst-5',
        institutionName: 'National Institute of Science & Vocational Studies',
        aictePermanentId: '1-90123456',
        category: 'Examination Issues',
        subject: 'Arbitrary withholding of final semester grade sheets and migration certificate',
        description: 'Graduating batch students prevented from taking jobs due to non-release of original marksheets despite all fee clearances.',
        status: 'ACTION_TAKEN',
        priority: 'MEDIUM',
        assignedBureau: 'REGULATION_BUREAU',
        assignedOfficerId: 'usr-rb',
        assignedOfficerName: 'Virendra Kashyap',
        supportingDocuments: [
          { name: 'No_Dues_Certificate_Signed.pdf', size: 450000, type: 'application/pdf' }
        ],
        actionsHistory: [
          {
            id: 'act-50',
            complaintId: 'cmp-106',
            previousStatus: 'SUBMITTED',
            newStatus: 'ASSIGNED',
            changedById: 'usr-intake',
            changedByName: 'Sunita Deshmukh',
            changedByRole: 'INTAKE_OFFICER',
            remarks: 'Verified student clearance.',
            timestamp: '2026-01-02T11:00:00.000Z'
          },
          {
            id: 'act-51',
            complaintId: 'cmp-106',
            previousStatus: 'ASSIGNED',
            newStatus: 'ACTION_TAKEN',
            changedById: 'usr-rb',
            changedByName: 'Virendra Kashyap',
            changedByRole: 'RB_OFFICER',
            remarks: 'Official directive sent to Registrar citing AICTE Approval Process Handbook Clause 13.4. Certificates to be issued within 48 hours.',
            timestamp: '2026-01-06T15:20:00.000Z'
          }
        ],
        slaDeadline: '2026-02-01T18:00:00.000Z',
        createdAt: '2026-01-02T09:00:00.000Z',
        updatedAt: '2026-01-06T15:20:00.000Z'
      },
      {
        id: 'cmp-107',
        trackingId: 'AIC-2026-90214',
        studentId: 'usr-student-1',
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul.sharma@example.com',
        institutionId: 'inst-1',
        institutionName: 'Apex Institute of Engineering & Technology',
        aictePermanentId: '1-45678901',
        category: 'Infrastructure',
        subject: 'Inadequate hostel drinking water purification and rampant water-borne illness',
        description: 'Over 40 students developed gastroenteritis due to contaminated overhead tanks in Hostels A & B. Zero water test reports provided despite complaints to warden.',
        status: 'SUBMITTED',
        priority: 'HIGH',
        supportingDocuments: [
          { name: 'Medical_Prescriptions_Hostel.pdf', size: 890000, type: 'application/pdf' }
        ],
        actionsHistory: [],
        slaDeadline: '2026-02-25T18:00:00.000Z',
        createdAt: '2026-01-25T10:15:00.000Z',
        updatedAt: '2026-01-25T10:15:00.000Z'
      }
    ];

    const notifications: Notification[] = [
      {
        id: 'notif-1',
        userId: 'usr-rb',
        title: 'Potential Cross-Bureau Overlap Alert',
        message: 'Intelligent Matching Engine detected 88% similarity between Case AIC-2026-89421 (RB) and Case AIC-2026-89455 (PGRC) at Apex Institute.',
        type: 'OVERLAP_DETECTED',
        complaintId: 'cmp-101',
        trackingId: 'AIC-2026-89421',
        isRead: false,
        createdAt: '2026-01-19T12:00:00.000Z'
      },
      {
        id: 'notif-2',
        userId: 'usr-pgrc',
        title: 'Cross-Bureau Case Notice',
        message: 'High overlap detected with Regulation Bureau Case AIC-2026-89421 regarding faculty strikes and unpaid salaries.',
        type: 'OVERLAP_DETECTED',
        complaintId: 'cmp-102',
        trackingId: 'AIC-2026-89455',
        isRead: false,
        createdAt: '2026-01-19T12:00:00.000Z'
      },
      {
        id: 'notif-3',
        userId: 'usr-student-1',
        title: 'Complaint Case Assigned',
        message: 'Your complaint AIC-2026-89421 has been verified and assigned to the Regulation Bureau for official investigation.',
        type: 'ASSIGNED',
        complaintId: 'cmp-101',
        trackingId: 'AIC-2026-89421',
        isRead: true,
        createdAt: '2026-01-16T14:15:00.000Z'
      },
      {
        id: 'notif-4',
        userId: 'usr-authority',
        title: 'New High Priority Case Assigned',
        message: 'Critical capitation fee case AIC-2026-89102 flagged in Maharashtra Institute of Technology & Research.',
        type: 'ESCALATED',
        complaintId: 'cmp-103',
        trackingId: 'AIC-2026-89102',
        isRead: false,
        createdAt: '2026-01-20T14:05:00.000Z'
      }
    ];

    const auditLogs: AuditLog[] = [
      {
        id: 'aud-1',
        action: 'USER_REGISTERED',
        category: 'AUTH',
        performedById: 'usr-student-1',
        performedByName: 'Rahul Sharma',
        performedByRole: 'STUDENT',
        details: { email: 'rahul.sharma@example.com', registeredRole: 'STUDENT' },
        timestamp: '2026-01-10T00:00:00.000Z'
      },
      {
        id: 'aud-2',
        action: 'COMPLAINT_SUBMITTED',
        category: 'COMPLAINT',
        performedById: 'usr-student-1',
        performedByName: 'Rahul Sharma',
        performedByRole: 'STUDENT',
        targetId: 'cmp-101',
        targetType: 'Complaint',
        details: { trackingId: 'AIC-2026-89421', institution: 'Apex Institute of Engineering & Technology' },
        timestamp: '2026-01-14T16:20:00.000Z'
      },
      {
        id: 'aud-3',
        action: 'CASE_ASSIGNED',
        category: 'ASSIGNMENT',
        performedById: 'usr-intake',
        performedByName: 'Sunita Deshmukh',
        performedByRole: 'INTAKE_OFFICER',
        targetId: 'cmp-101',
        targetType: 'Complaint',
        details: { assignedBureau: 'REGULATION_BUREAU', officer: 'Virendra Kashyap' },
        timestamp: '2026-01-16T14:15:00.000Z'
      },
      {
        id: 'aud-4',
        action: 'HYBRID_MATCH_GENERATED',
        category: 'MATCHING',
        performedById: 'SYSTEM',
        performedByName: 'IN-Sight Intelligent Engine',
        performedByRole: 'SUPER_ADMIN',
        targetId: 'cmp-101',
        targetType: 'ComplaintMatch',
        details: { source: 'AIC-2026-89421', target: 'AIC-2026-89455', score: 88, level: 'HIGH' },
        timestamp: '2026-01-19T11:46:00.000Z'
      }
    ];

    // Compute matches using hybrid engine
    const initialMatches = scanAndGenerateMatches(complaints);

    this.data = {
      users,
      institutions,
      complaints,
      matches: initialMatches,
      notifications,
      auditLogs
    };

    this.saveToDisk();
    console.log(`[Database] Seed complete. Generated ${initialMatches.length} intelligent cross-case matches.`);
  }

  // --- Users ---
  public async getUsers(): Promise<User[]> {
    await this.initialize();
    return [...this.data.users];
  }

  public async getUserById(id: string): Promise<User | null> {
    await this.initialize();
    return this.data.users.find(u => u.id === id) || null;
  }

  public async getUserByEmail(email: string): Promise<User | null> {
    await this.initialize();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public async createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    await this.initialize();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.saveToDisk();
    return newUser;
  }

  public async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    await this.initialize();
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    // Prevent modification of passwordHash or ID directly through this method
    const { id: _, passwordHash: __, createdAt: ___, ...safeUpdates } = updates;
    this.data.users[index] = {
      ...this.data.users[index],
      ...safeUpdates,
      updatedAt: new Date().toISOString()
    };
    this.saveToDisk();
    return this.data.users[index];
  }

  // --- Institutions ---
  public async getInstitutions(): Promise<Institution[]> {
    await this.initialize();
    return [...this.data.institutions];
  }

  public async getInstitutionById(id: string): Promise<Institution | null> {
    await this.initialize();
    return this.data.institutions.find(i => i.id === id || i.aictePermanentId === id) || null;
  }

  public async createInstitution(inst: Omit<Institution, 'id' | 'createdAt'>): Promise<Institution> {
    await this.initialize();
    const newInst: Institution = {
      ...inst,
      id: `inst-${Date.now()}`,
      activeComplaintsCount: 0,
      totalComplaintsCount: 0,
      createdAt: new Date().toISOString()
    };
    this.data.institutions.push(newInst);
    this.saveToDisk();
    return newInst;
  }

  public async updateInstitution(id: string, updates: Partial<Institution>): Promise<Institution | null> {
    await this.initialize();
    const index = this.data.institutions.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.data.institutions[index] = {
      ...this.data.institutions[index],
      ...updates
    };
    this.saveToDisk();
    return this.data.institutions[index];
  }

  // --- Complaints ---
  public async getComplaints(): Promise<Complaint[]> {
    await this.initialize();
    return [...this.data.complaints];
  }

  public async getComplaintById(id: string): Promise<Complaint | null> {
    await this.initialize();
    return this.data.complaints.find(c => c.id === id || c.trackingId === id) || null;
  }

  public async createComplaint(complaintData: Omit<Complaint, 'id' | 'trackingId' | 'actionsHistory' | 'createdAt' | 'updatedAt'>): Promise<Complaint> {
    await this.initialize();
    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingId = `AIC-${year}-${randomSuffix}`;
    const id = `cmp-${Date.now()}`;

    const newComplaint: Complaint = {
      ...complaintData,
      id,
      trackingId,
      actionsHistory: [
        {
          id: `act-${Date.now()}`,
          complaintId: id,
          previousStatus: 'SUBMITTED',
          newStatus: 'SUBMITTED',
          changedById: complaintData.studentId,
          changedByName: complaintData.studentName,
          changedByRole: 'STUDENT',
          remarks: 'Complaint formally submitted to AICTE Centralized Monitoring Portal.',
          timestamp: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.data.complaints.unshift(newComplaint);

    // Update institution stats
    const inst = this.data.institutions.find(i => i.id === complaintData.institutionId || i.aictePermanentId === complaintData.aictePermanentId);
    if (inst) {
      inst.activeComplaintsCount = (inst.activeComplaintsCount || 0) + 1;
      inst.totalComplaintsCount = (inst.totalComplaintsCount || 0) + 1;
    }

    // Run matching engine across corpus to update potential overlaps
    this.data.matches = scanAndGenerateMatches(this.data.complaints);

    // If new matches found for this complaint, notify officers
    const relatedMatches = this.data.matches.filter(m => m.sourceComplaintId === id || m.targetComplaintId === id);
    if (relatedMatches.length > 0 && relatedMatches[0].overallScore >= 70) {
      this.data.notifications.unshift({
        id: `notif-${Date.now()}`,
        userId: 'usr-intake',
        title: 'High Potential Case Overlap Detected',
        message: `New complaint ${trackingId} has ${relatedMatches[0].overallScore}% overlap with existing case at ${newComplaint.institutionName}.`,
        type: 'OVERLAP_DETECTED',
        complaintId: id,
        trackingId,
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    this.saveToDisk();
    return newComplaint;
  }

  public async updateComplaint(id: string, updates: Partial<Complaint>): Promise<Complaint | null> {
    await this.initialize();
    const index = this.data.complaints.findIndex(c => c.id === id);
    if (index === -1) return null;

    this.data.complaints[index] = {
      ...this.data.complaints[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Re-run matching to keep similarity indices current
    this.data.matches = scanAndGenerateMatches(this.data.complaints);
    this.saveToDisk();
    return this.data.complaints[index];
  }

  public async addCaseAction(
    complaintId: string, 
    action: {
      newStatus: Complaint['status'];
      changedById: string;
      changedByName: string;
      changedByRole: UserRole;
      remarks: string;
      internalNotes?: string;
      assignedBureau?: BureauCell;
      assignedOfficerId?: string;
      assignedOfficerName?: string;
    }
  ): Promise<Complaint | null> {
    await this.initialize();
    const complaint = this.data.complaints.find(c => c.id === complaintId);
    if (!complaint) return null;

    const previousStatus = complaint.status;
    const newAction = {
      id: `act-${Date.now()}`,
      complaintId,
      previousStatus,
      newStatus: action.newStatus,
      changedById: action.changedById,
      changedByName: action.changedByName,
      changedByRole: action.changedByRole,
      remarks: action.remarks,
      internalNotes: action.internalNotes,
      timestamp: new Date().toISOString()
    };

    complaint.status = action.newStatus;
    if (action.assignedBureau) complaint.assignedBureau = action.assignedBureau;
    if (action.assignedOfficerId) complaint.assignedOfficerId = action.assignedOfficerId;
    if (action.assignedOfficerName) complaint.assignedOfficerName = action.assignedOfficerName;
    complaint.actionsHistory.push(newAction);
    complaint.updatedAt = new Date().toISOString();

    // If resolved or closed, adjust active complaints count
    if (['RESOLVED', 'CLOSED', 'REJECTED'].includes(action.newStatus) && !['RESOLVED', 'CLOSED', 'REJECTED'].includes(previousStatus)) {
      const inst = this.data.institutions.find(i => i.id === complaint.institutionId);
      if (inst && (inst.activeComplaintsCount || 0) > 0) {
        inst.activeComplaintsCount! -= 1;
      }
    }

    // Notify student about official progress
    this.data.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: complaint.studentId,
      title: `Complaint Status Updated: ${action.newStatus}`,
      message: `Your complaint ${complaint.trackingId} status changed to ${action.newStatus}. Remarks: "${action.remarks}"`,
      type: action.newStatus === 'RESOLVED' ? 'RESOLVED' : action.newStatus === 'ASSIGNED' ? 'ASSIGNED' : 'STATUS_UPDATED',
      complaintId: complaint.id,
      trackingId: complaint.trackingId,
      isRead: false,
      createdAt: new Date().toISOString()
    });

    this.saveToDisk();
    return complaint;
  }

  // --- Matches ---
  public async getMatches(): Promise<ComplaintMatch[]> {
    await this.initialize();
    return [...this.data.matches];
  }

  public async updateMatchDecision(
    matchId: string, 
    decision: 'CONFIRMED_RELATED' | 'NOT_RELATED' | 'LINKED',
    notes: string,
    officerId: string,
    officerName: string
  ): Promise<ComplaintMatch | null> {
    await this.initialize();
    const match = this.data.matches.find(m => m.id === matchId);
    if (!match) return null;

    match.reviewStatus = decision;
    match.reviewedById = officerId;
    match.reviewedByName = officerName;
    match.reviewDecisionNotes = notes;
    match.reviewedAt = new Date().toISOString();

    // If linked, also cross-link the complaints
    if (decision === 'LINKED' || decision === 'CONFIRMED_RELATED') {
      const src = this.data.complaints.find(c => c.id === match.sourceComplaintId);
      const tgt = this.data.complaints.find(c => c.id === match.targetComplaintId);
      if (src && tgt) {
        src.linkedComplaintIds = Array.from(new Set([...(src.linkedComplaintIds || []), tgt.id]));
        tgt.linkedComplaintIds = Array.from(new Set([...(tgt.linkedComplaintIds || []), src.id]));
      }
    }

    this.saveToDisk();
    return match;
  }

  // --- Notifications ---
  public async getNotifications(userId: string): Promise<Notification[]> {
    await this.initialize();
    return this.data.notifications.filter(n => n.userId === userId || n.userId === 'ALL');
  }

  public async markNotificationRead(id: string): Promise<boolean> {
    await this.initialize();
    const notif = this.data.notifications.find(n => n.id === id);
    if (!notif) return false;
    notif.isRead = true;
    this.saveToDisk();
    return true;
  }

  public async markAllNotificationsRead(userId: string): Promise<void> {
    await this.initialize();
    for (const notif of this.data.notifications) {
      if (notif.userId === userId) {
        notif.isRead = true;
      }
    }
    this.saveToDisk();
  }

  // --- Audit Logs ---
  public async getAuditLogs(): Promise<AuditLog[]> {
    await this.initialize();
    return [...this.data.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public async createAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<AuditLog> {
    await this.initialize();
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    this.data.auditLogs.unshift(newLog);
    this.saveToDisk();
    return newLog;
  }
}

export const db = new DatabaseStore();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, Response } from 'express';
import { db } from './db.js';
import { 
  requireAuth, 
  requireRoles, 
  generateToken, 
  hashPassword, 
  comparePassword, 
  AuthenticatedRequest 
} from './auth.js';
import { ComplaintCategory, BureauCell, ComplaintStatus, UserRole } from './types.js';
import { 
  scanAndGenerateMatches, 
  AVAILABLE_EMBEDDING_MODELS, 
  getSelectedEmbeddingModel, 
  setSelectedEmbeddingModel 
} from './matching-engine.js';

export const apiRouter = Router();

// Helper to sanitize user object (remove password hash)
function sanitizeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

// ----------------------------------------------------
// 1. AUTHENTICATION ENDPOINTS
// ----------------------------------------------------

/**
 * Public User Registration
 * CRITICAL RULE: Public registration ALWAYS assigns the STUDENT role.
 * Admin and Super Admin must NOT create user accounts; users register here
 * and automatically appear in Admin User Management.
 */
apiRouter.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.getUserByEmail(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    const passwordHash = await hashPassword(password);
    const newUser = await db.createUser({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: 'STUDENT', // Mandatory STUDENT role on public registration
      isActive: true,
      phone: phone ? phone.trim() : undefined
    });

    await db.createAuditLog({
      action: 'USER_REGISTERED',
      category: 'AUTH',
      performedById: newUser.id,
      performedByName: newUser.name,
      performedByRole: newUser.role,
      targetId: newUser.id,
      targetType: 'User',
      details: { email: newUser.email, assignedRole: 'STUDENT' }
    });

    const token = generateToken(newUser);
    res.status(201).json({
      message: 'Account created successfully as Student.',
      user: sanitizeUser(newUser),
      token
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create user account.', details: err.message });
  }
});

/**
 * Normal User Login (/login)
 * Shared by: Students, Intake Officers, RB Officers, PGRC Officers, Senior Authorities.
 */
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'This account has been deactivated by the administrator.' });
      return;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Notice for Admins logging into normal portal: prompt them or let them through with redirect guidance
    const token = generateToken(user);

    await db.createAuditLog({
      action: 'USER_LOGIN',
      category: 'AUTH',
      performedById: user.id,
      performedByName: user.name,
      performedByRole: user.role,
      details: { portal: 'NORMAL_USER_LOGIN' }
    });

    res.json({
      message: 'Login successful.',
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

/**
 * Administrator Login (/admin/login)
 * Exclusively for ADMIN and SUPER_ADMIN.
 */
apiRouter.post('/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.getUserByEmail(email.trim().toLowerCase());
    if (!user) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Administrator account is inactive.' });
      return;
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid administrator credentials.' });
      return;
    }

    // Enforce administrative role verification
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      res.status(403).json({
        error: 'Access Denied: This administrative console is restricted exclusively to Admin and Super Admin personnel. Please use the standard user login portal.'
      });
      return;
    }

    const token = generateToken(user);

    await db.createAuditLog({
      action: 'ADMIN_LOGIN',
      category: 'AUTH',
      performedById: user.id,
      performedByName: user.name,
      performedByRole: user.role,
      details: { portal: 'ADMIN_CONSOLE_LOGIN' }
    });

    res.json({
      message: 'Administrator authentication successful.',
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Authentication failed.' });
  }
});

/**
 * Get current authenticated user profile
 */
apiRouter.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: sanitizeUser(req.user) });
});

/**
 * Demo Fast-Switch Endpoint
 * Allows instantaneous switching among pre-configured demo personas during live SIH demonstration
 */
apiRouter.post('/auth/demo-switch', async (req, res) => {
  try {
    const { role } = req.body;
    const users = await db.getUsers();
    const targetUser = users.find(u => u.role === role);
    if (!targetUser) {
      res.status(404).json({ error: `Demo account for role "${role}" not found.` });
      return;
    }

    const token = generateToken(targetUser);
    res.json({
      message: `Switched demo identity to ${targetUser.name} (${targetUser.role})`,
      user: sanitizeUser(targetUser),
      token
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to switch demo persona.' });
  }
});

// ----------------------------------------------------
// 2. COMPLAINT MANAGEMENT ENDPOINTS
// ----------------------------------------------------

/**
 * List Complaints with role-based filtering and search
 */
apiRouter.get('/complaints', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    let allComplaints = await db.getComplaints();

    // 1. Role-based isolation
    if (currentUser.role === 'STUDENT') {
      // Complainant sees only their own complaints
      allComplaints = allComplaints.filter(c => c.studentId === currentUser.id || c.studentEmail.toLowerCase() === currentUser.email.toLowerCase());
    } else if (currentUser.role === 'INTAKE_OFFICER') {
      // Intake sees all complaints, especially unverified and pending assignment
    } else if (currentUser.role === 'RB_OFFICER') {
      // RB Officer sees cases routed to Regulation Bureau or unassigned verification backlog
      allComplaints = allComplaints.filter(c => c.assignedBureau === 'REGULATION_BUREAU' || !c.assignedBureau);
    } else if (currentUser.role === 'PGRC_OFFICER') {
      // PGRC Officer sees cases routed to PGRC or unassigned
      allComplaints = allComplaints.filter(c => c.assignedBureau === 'PUBLIC_GRIEVANCE_REDRESSAL_CELL' || !c.assignedBureau);
    }
    // SENIOR_AUTHORITY, ADMIN, and SUPER_ADMIN have full cross-bureau visibility

    // 2. Query parameter filters
    const { status, category, priority, bureau, institutionId, search } = req.query;

    if (status && typeof status === 'string') {
      allComplaints = allComplaints.filter(c => c.status === status);
    }
    if (category && typeof category === 'string') {
      allComplaints = allComplaints.filter(c => c.category === category);
    }
    if (priority && typeof priority === 'string') {
      allComplaints = allComplaints.filter(c => c.priority === priority);
    }
    if (bureau && typeof bureau === 'string') {
      allComplaints = allComplaints.filter(c => c.assignedBureau === bureau);
    }
    if (institutionId && typeof institutionId === 'string') {
      allComplaints = allComplaints.filter(c => c.institutionId === institutionId || c.aictePermanentId === institutionId);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      allComplaints = allComplaints.filter(c => 
        c.trackingId.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q) ||
        c.aictePermanentId.toLowerCase().includes(q) ||
        c.studentName.toLowerCase().includes(q)
      );
    }

    // 3. For students, sanitize out private internal officer notes
    if (currentUser.role === 'STUDENT') {
      allComplaints = allComplaints.map(c => ({
        ...c,
        actionsHistory: c.actionsHistory.map(a => {
          const { internalNotes, ...safeAction } = a;
          return safeAction as any;
        })
      }));
    }

    res.json({ complaints: allComplaints });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch complaints.' });
  }
});

/**
 * Get Single Complaint by ID or Tracking ID
 */
apiRouter.get('/complaints/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = await db.getComplaintById(id);
    if (!complaint) {
      res.status(404).json({ error: 'Complaint record not found.' });
      return;
    }

    const currentUser = req.user!;
    // Role check: students can only view their own
    if (currentUser.role === 'STUDENT' && complaint.studentId !== currentUser.id && complaint.studentEmail.toLowerCase() !== currentUser.email.toLowerCase()) {
      res.status(403).json({ error: 'Access denied. You can only view your own submitted complaints.' });
      return;
    }

    // Sanitize internal notes for students
    let payload = { ...complaint };
    if (currentUser.role === 'STUDENT') {
      payload.actionsHistory = payload.actionsHistory.map(a => {
        const { internalNotes, ...safe } = a;
        return safe as any;
      });
    }

    res.json({ complaint: payload });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve complaint.' });
  }
});

/**
 * Submit New Complaint (Student Portal)
 */
apiRouter.post('/complaints', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const currentUser = req.user!;
    const { 
      institutionName, 
      aictePermanentId, 
      category, 
      subject, 
      description,
      priority = 'MEDIUM',
      supportingDocuments = []
    } = req.body;

    if (!institutionName || !aictePermanentId || !category || !subject || !description) {
      res.status(400).json({ error: 'Institution name, AICTE Permanent ID, category, subject, and description are required.' });
      return;
    }

    // Verify or find institution in directory
    const institutions = await db.getInstitutions();
    let matchedInst = institutions.find(i => 
      i.aictePermanentId.toLowerCase() === aictePermanentId.trim().toLowerCase() ||
      i.name.toLowerCase().includes(institutionName.trim().toLowerCase())
    );

    const institutionId = matchedInst ? matchedInst.id : `inst-ref-${Date.now()}`;

    // SLA calculation: 30 days default from submission
    const slaDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const created = await db.createComplaint({
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      institutionId,
      institutionName: matchedInst ? matchedInst.name : institutionName.trim(),
      aictePermanentId: aictePermanentId.trim(),
      category: category as ComplaintCategory,
      subject: subject.trim(),
      description: description.trim(),
      status: 'SUBMITTED',
      priority,
      assignedBureau: 'CENTRAL_INTAKE',
      supportingDocuments,
      slaDeadline
    });

    await db.createAuditLog({
      action: 'COMPLAINT_SUBMITTED',
      category: 'COMPLAINT',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: created.id,
      targetType: 'Complaint',
      details: {
        trackingId: created.trackingId,
        institutionName: created.institutionName,
        category: created.category
      }
    });

    res.status(201).json({
      message: 'Complaint submitted successfully.',
      complaint: created
    });
  } catch (err: any) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Failed to submit complaint.' });
  }
});

/**
 * Update Complaint Status & Add Official Action
 */
apiRouter.patch('/complaints/:id/status', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { newStatus, remarks, internalNotes, assignedBureau, assignedOfficerId, assignedOfficerName } = req.body;
    const currentUser = req.user!;

    if (!newStatus || !remarks) {
      res.status(400).json({ error: 'New status and official remarks are required.' });
      return;
    }

    // Role check: students cannot update complaint status
    if (currentUser.role === 'STUDENT') {
      res.status(403).json({ error: 'Students cannot modify complaint status.' });
      return;
    }

    const updated = await db.addCaseAction(id, {
      newStatus: newStatus as ComplaintStatus,
      changedById: currentUser.id,
      changedByName: currentUser.name,
      changedByRole: currentUser.role,
      remarks,
      internalNotes,
      assignedBureau,
      assignedOfficerId,
      assignedOfficerName
    });

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    await db.createAuditLog({
      action: 'CASE_STATUS_CHANGED',
      category: 'COMPLAINT',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: updated.id,
      targetType: 'Complaint',
      details: {
        trackingId: updated.trackingId,
        newStatus,
        remarks,
        assignedBureau: updated.assignedBureau
      }
    });

    res.json({
      message: `Status updated to ${newStatus}`,
      complaint: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update complaint status.' });
  }
});

/**
 * Assign Complaint to Bureau & Officer
 */
apiRouter.patch('/complaints/:id/assign', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'INTAKE_OFFICER', 'SENIOR_AUTHORITY', 'RB_OFFICER', 'PGRC_OFFICER'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { assignedBureau, assignedOfficerId, assignedOfficerName, remarks } = req.body;
    const currentUser = req.user!;

    if (!assignedBureau) {
      res.status(400).json({ error: 'Assigned Bureau/Cell is required.' });
      return;
    }

    const updated = await db.addCaseAction(id, {
      newStatus: 'ASSIGNED',
      changedById: currentUser.id,
      changedByName: currentUser.name,
      changedByRole: currentUser.role,
      remarks: remarks || `Case formally assigned to ${assignedBureau}.`,
      assignedBureau,
      assignedOfficerId,
      assignedOfficerName
    });

    if (!updated) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }

    await db.createAuditLog({
      action: 'CASE_ASSIGNED',
      category: 'ASSIGNMENT',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: updated.id,
      targetType: 'Complaint',
      details: {
        trackingId: updated.trackingId,
        assignedBureau,
        officer: assignedOfficerName
      }
    });

    res.json({
      message: `Case assigned to ${assignedBureau}`,
      complaint: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to assign case.' });
  }
});

// ----------------------------------------------------
// 3. INTELLIGENT MATCHING ENGINE ENDPOINTS
// ----------------------------------------------------

/**
 * Get Intelligent Overlap Matches
 */
apiRouter.get('/matches', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'INTAKE_OFFICER', 'RB_OFFICER', 'PGRC_OFFICER', 'SENIOR_AUTHORITY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const matches = await db.getMatches();
    const { level, status, bureau } = req.query;

    let filtered = matches;
    if (level && typeof level === 'string') {
      filtered = filtered.filter(m => m.similarityLevel === level);
    }
    if (status && typeof status === 'string') {
      filtered = filtered.filter(m => m.reviewStatus === status);
    }
    if (bureau && typeof bureau === 'string') {
      filtered = filtered.filter(m => m.sourceBureau === bureau || m.targetBureau === bureau);
    }

    res.json({ matches: filtered });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch matches.' });
  }
});

/**
 * Get Available Embedding Models
 */
apiRouter.get('/matches/models', requireAuth, (req, res) => {
  res.json({
    models: Object.values(AVAILABLE_EMBEDDING_MODELS),
    activeModel: getSelectedEmbeddingModel()
  });
});

/**
 * Switch Active Embedding Model and Re-index
 */
apiRouter.post('/matches/models/select', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { modelName } = req.body;
    const selected = setSelectedEmbeddingModel(modelName);
    
    // Re-scan complaints with newly selected model
    const complaints = await db.getComplaints();
    const updatedMatches = scanAndGenerateMatches(complaints, modelName);
    (db as any).data.matches = updatedMatches;
    (db as any).saveToDisk();

    await db.createAuditLog({
      action: 'EMBEDDING_MODEL_UPDATED',
      category: 'MATCHING',
      performedById: req.user!.id,
      performedByName: req.user!.name,
      performedByRole: req.user!.role,
      details: {
        modelSelected: selected.name,
        dimension: selected.dimension,
        matchesRecalculated: updatedMatches.length
      }
    });

    res.json({
      message: `Active sentence embedding model updated to ${selected.name}`,
      activeModel: selected,
      recalculatedMatchesCount: updatedMatches.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update embedding model.' });
  }
});

/**
 * Officer Decision on Potential Overlap Match
 */
apiRouter.post('/matches/:id/decision', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'INTAKE_OFFICER', 'RB_OFFICER', 'PGRC_OFFICER', 'SENIOR_AUTHORITY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { decision, notes } = req.body;
    const currentUser = req.user!;

    if (!['CONFIRMED_RELATED', 'NOT_RELATED', 'LINKED'].includes(decision)) {
      res.status(400).json({ error: 'Decision must be CONFIRMED_RELATED, NOT_RELATED, or LINKED.' });
      return;
    }

    const updatedMatch = await db.updateMatchDecision(
      id,
      decision,
      notes || 'Decision recorded by authorized officer.',
      currentUser.id,
      currentUser.name
    );

    if (!updatedMatch) {
      res.status(404).json({ error: 'Match record not found.' });
      return;
    }

    await db.createAuditLog({
      action: 'MATCH_DECISION_RECORDED',
      category: 'MATCHING',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: id,
      targetType: 'ComplaintMatch',
      details: {
        decision,
        source: updatedMatch.sourceTrackingId,
        target: updatedMatch.targetTrackingId,
        score: updatedMatch.overallScore,
        notes
      }
    });

    res.json({
      message: `Match marked as ${decision}`,
      match: updatedMatch
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record match decision.' });
  }
});

/**
 * Trigger On-Demand Matching Engine Scan
 */
apiRouter.post('/matches/scan', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const complaints = await db.getComplaints();
    const newMatches = scanAndGenerateMatches(complaints);
    res.json({
      message: `Matching engine complete. Evaluated ${complaints.length} complaints and found ${newMatches.length} candidate pairs.`,
      matchesCount: newMatches.length
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to run matching scan.' });
  }
});

// ----------------------------------------------------
// 4. INSTITUTION DIRECTORY ENDPOINTS
// ----------------------------------------------------

apiRouter.get('/institutions', requireAuth, async (req, res) => {
  try {
    const institutions = await db.getInstitutions();
    const { search, state, type } = req.query;

    let filtered = institutions;
    if (state && typeof state === 'string') {
      filtered = filtered.filter(i => i.state.toLowerCase() === state.toLowerCase());
    }
    if (type && typeof type === 'string') {
      filtered = filtered.filter(i => i.institutionType === type);
    }
    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      filtered = filtered.filter(i => 
        i.name.toLowerCase().includes(q) ||
        i.aictePermanentId.toLowerCase().includes(q) ||
        i.city.toLowerCase().includes(q)
      );
    }

    res.json({ institutions: filtered });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch institutions.' });
  }
});

apiRouter.get('/institutions/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const institution = await db.getInstitutionById(id);
    if (!institution) {
      res.status(404).json({ error: 'Institution not found.' });
      return;
    }

    // Also get complaints history for this institution
    const complaints = await db.getComplaints();
    const institutionComplaints = complaints.filter(c => 
      c.institutionId === institution.id || 
      c.aictePermanentId.toLowerCase() === institution.aictePermanentId.toLowerCase()
    );

    res.json({
      institution,
      complaints: institutionComplaints
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve institution profile.' });
  }
});

apiRouter.post('/institutions', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, aictePermanentId, state, city, address, institutionType, contactEmail, contactPhone } = req.body;
    if (!name || !aictePermanentId || !state || !city) {
      res.status(400).json({ error: 'Name, AICTE Permanent ID, state, and city are required.' });
      return;
    }

    const created = await db.createInstitution({
      name,
      aictePermanentId,
      state,
      city,
      address: address || '',
      institutionType: institutionType || 'Private-Unaided',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || ''
    });

    await db.createAuditLog({
      action: 'INSTITUTION_ADDED',
      category: 'SYSTEM',
      performedById: req.user!.id,
      performedByName: req.user!.name,
      performedByRole: req.user!.role,
      targetId: created.id,
      targetType: 'Institution',
      details: { name: created.name, aictePermanentId: created.aictePermanentId }
    });

    res.status(201).json({ institution: created });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create institution record.' });
  }
});

// ----------------------------------------------------
// 5. USER MANAGEMENT (Admin & Super Admin)
// ----------------------------------------------------

/**
 * List all registered users
 */
apiRouter.get('/users', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json({ users: users.map(sanitizeUser) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user directory.' });
  }
});

/**
 * Update user role and Bureau assignment
 * Enforces:
 * - Public users register as STUDENT
 * - Admin assigns roles to registered users
 * - Super Admin permissions required to promote someone to ADMIN or SUPER_ADMIN
 */
apiRouter.patch('/users/:id/role', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role, bureau, department } = req.body;
    const currentUser = req.user!;

    if (!role) {
      res.status(400).json({ error: 'Role is required.' });
      return;
    }

    // Only SUPER_ADMIN can assign ADMIN or SUPER_ADMIN roles
    if (['ADMIN', 'SUPER_ADMIN'].includes(role) && currentUser.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Only Super Administrators can grant administrative roles.' });
      return;
    }

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const previousRole = targetUser.role;
    const updated = await db.updateUser(id, {
      role: role as UserRole,
      bureau: bureau as BureauCell,
      department
    });

    await db.createAuditLog({
      action: 'USER_ROLE_CHANGED',
      category: 'USER_MGMT',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: id,
      targetType: 'User',
      details: {
        userEmail: targetUser.email,
        previousRole,
        newRole: role,
        bureau
      }
    });

    res.json({
      message: `User role updated to ${role}`,
      user: sanitizeUser(updated)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
});

/**
 * Activate or Deactivate user account
 */
apiRouter.patch('/users/:id/status', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive, reason } = req.body;
    const currentUser = req.user!;

    if (typeof isActive !== 'boolean') {
      res.status(400).json({ error: 'isActive boolean flag is required.' });
      return;
    }

    const targetUser = await db.getUserById(id);
    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    // Prevent deactivating own account
    if (targetUser.id === currentUser.id) {
      res.status(400).json({ error: 'You cannot deactivate your own account.' });
      return;
    }

    const updated = await db.updateUser(id, { isActive });

    await db.createAuditLog({
      action: isActive ? 'ACCOUNT_ACTIVATED' : 'ACCOUNT_DEACTIVATED',
      category: 'USER_MGMT',
      performedById: currentUser.id,
      performedByName: currentUser.name,
      performedByRole: currentUser.role,
      targetId: id,
      targetType: 'User',
      details: {
        userEmail: targetUser.email,
        isActive,
        reason: reason || 'Administrative action.'
      }
    });

    res.json({
      message: `User account ${isActive ? 'activated' : 'deactivated'}.`,
      user: sanitizeUser(updated)
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to modify account status.' });
  }
});

// ----------------------------------------------------
// 6. ANALYTICS & SLA STATS
// ----------------------------------------------------

apiRouter.get('/stats/dashboard', requireAuth, async (req, res) => {
  try {
    const complaints = await db.getComplaints();
    const institutions = await db.getInstitutions();
    const matches = await db.getMatches();

    const now = Date.now();
    let pendingCount = 0;
    let resolvedCount = 0;
    let overdueCount = 0;
    let escalatedCount = 0;

    const bureauDistribution: Record<string, number> = {
      'CENTRAL_INTAKE': 0,
      'REGULATION_BUREAU': 0,
      'PUBLIC_GRIEVANCE_REDRESSAL_CELL': 0,
      'APPROVAL_BUREAU': 0,
      'POLICY_ACADEMIC_PLANNING': 0
    };

    const categoryDistribution: Record<string, number> = {};

    const ageingBuckets = {
      '0-7 Days': 0,
      '8-15 Days': 0,
      '16-30 Days': 0,
      '30+ Days': 0
    };

    for (const c of complaints) {
      const isClosed = ['RESOLVED', 'CLOSED', 'REJECTED'].includes(c.status);
      if (isClosed) {
        resolvedCount++;
      } else {
        pendingCount++;
        // Check SLA
        if (new Date(c.slaDeadline).getTime() < now) {
          overdueCount++;
        }
      }

      if (c.status === 'ESCALATED' || c.isEscalated) {
        escalatedCount++;
      }

      // Bureau
      if (c.assignedBureau && bureauDistribution[c.assignedBureau] !== undefined) {
        bureauDistribution[c.assignedBureau]++;
      } else if (!c.assignedBureau) {
        bureauDistribution['CENTRAL_INTAKE']++;
      }

      // Category
      categoryDistribution[c.category] = (categoryDistribution[c.category] || 0) + 1;

      // Ageing
      const ageDays = Math.floor((now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (ageDays <= 7) ageingBuckets['0-7 Days']++;
      else if (ageDays <= 15) ageingBuckets['8-15 Days']++;
      else if (ageDays <= 30) ageingBuckets['16-30 Days']++;
      else ageingBuckets['30+ Days']++;
    }

    const highOverlapCount = matches.filter(m => m.similarityLevel === 'HIGH').length;
    const institutionsWithComplaints = institutions.filter(i => (i.activeComplaintsCount || 0) > 0).length;

    res.json({
      summary: {
        totalComplaints: complaints.length,
        pendingComplaints: pendingCount,
        resolvedComplaints: resolvedCount,
        overdueComplaints: overdueCount,
        escalatedComplaints: escalatedCount,
        totalInstitutions: institutions.length,
        activeInstitutionsInvolved: institutionsWithComplaints,
        potentialOverlapsCount: matches.length,
        highOverlapAlertsCount: highOverlapCount
      },
      bureauDistribution: Object.entries(bureauDistribution).map(([bureau, count]) => ({ bureau, count })),
      categoryDistribution: Object.entries(categoryDistribution).map(([category, count]) => ({ category, count })),
      ageingDistribution: Object.entries(ageingBuckets).map(([range, count]) => ({ range, count }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate analytics summary.' });
  }
});

// ----------------------------------------------------
// 7. NOTIFICATIONS
// ----------------------------------------------------

apiRouter.get('/notifications', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const notifs = await db.getNotifications(req.user!.id);
    res.json({ notifications: notifs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notifications.' });
  }
});

apiRouter.patch('/notifications/:id/read', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await db.markNotificationRead(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update notification.' });
  }
});

apiRouter.patch('/notifications/read-all', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.markAllNotificationsRead(req.user!.id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to clear notifications.' });
  }
});

// ----------------------------------------------------
// 8. AUDIT LOGS & SEED RESET
// ----------------------------------------------------

apiRouter.get('/audit-logs', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY'), async (req, res) => {
  try {
    const logs = await db.getAuditLogs();
    res.json({ auditLogs: logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch audit records.' });
  }
});

apiRouter.post('/demo/seed', requireAuth, requireRoles('SUPER_ADMIN', 'ADMIN'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    await db.resetAndSeed();
    res.json({ message: 'Demonstration database reset and re-seeded with pristine AICTE records successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to reset seed data.' });
  }
});

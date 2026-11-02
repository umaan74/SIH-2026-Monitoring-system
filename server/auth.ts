/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User, UserRole, BureauCell } from './types.js';
import { db } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'in-sight-sih-2026-secure-jwt-token-key-super-secret';
const TOKEN_EXPIRY = '7d';

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  bureau?: BureauCell;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/**
 * Generate JWT token for an authenticated user
 */
export function generateToken(user: User): string {
  const payload: AuthTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    bureau: user.bureau,
    name: user.name
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Middleware to require valid JWT token
 */
export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
    const user = await db.getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User account no longer exists.' });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ error: 'Account has been deactivated by administrator.' });
      return;
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware to restrict route to specific roles
 */
export function requireRoles(...allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({ 
        error: `Access denied. Role "${req.user.role}" does not have permission to access this resource.`,
        requiredRoles: allowedRoles 
      });
      return;
    }
    next();
  };
}

/**
 * Middleware to restrict route to specific bureaus or super admin / senior authority
 */
export function requireBureau(...allowedBureaus: BureauCell[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }
    // Super Admin, Admin, and Senior Authority have overarching monitoring scope
    if (['SUPER_ADMIN', 'ADMIN', 'SENIOR_AUTHORITY'].includes(req.user.role)) {
      return next();
    }

    if (!req.user.bureau || (!allowedBureaus.includes(req.user.bureau) && req.user.bureau !== 'ALL_BUREAUS')) {
      res.status(403).json({ 
        error: `Bureau-level access restriction. Your assigned Bureau is "${req.user.bureau || 'None'}".`,
        requiredBureaus: allowedBureaus
      });
      return;
    }
    next();
  };
}

/**
 * Hash password securely with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

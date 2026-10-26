import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { env } from '../config/env';

export type UserRole = 'Admin' | 'Counsel' | 'Analyst' | 'Viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organization: string;
  tenantId: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      tenantId?: string;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'odin-war-room-secret-dev-key-change-in-prod';

/**
 * Creates a signed HS256 JWT-compatible token without external dependencies
 */
export function signToken(payload: AuthUser, expiresInSeconds = 86400): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = Buffer.from(JSON.stringify({ ...payload, exp })).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Creates a development token for a specific user name and role
 */
export function signDevToken(name: string, role: UserRole, tenantId = 'tenant-quillhub-001'): string {
  return signToken({
    id: `usr-${role.toLowerCase()}-${Date.now()}`,
    name,
    email: `${name.toLowerCase().replace(/\s+/g, '.')}@quillhub.com`,
    role,
    organization: 'Quillhub Inc.',
    tenantId,
  });
}

/**
 * Verifies and decodes the token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      organization: decoded.organization,
      tenantId: decoded.tenantId,
    };
  } catch {
    return null;
  }
}

/**
 * Authentication Middleware:
 * Parses Bearer token or attaches default development Counsel context if running locally.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const requireStrictAuth = process.env.REQUIRE_AUTH === 'true' || env.NODE_ENV === 'production';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      req.tenantId = user.tenantId;
      return next();
    } else if (requireStrictAuth) {
      res.status(401).json({ error: 'Unauthorized: Invalid or expired token', statusCode: 401 });
      return;
    }
  }

  // Local development default authenticated identity
  if (!requireStrictAuth) {
    req.user = {
      id: 'usr-counsel-01',
      name: 'Marcus Ellison',
      email: 'm.ellison@quillhub.com',
      role: 'Counsel',
      organization: 'Quillhub Inc.',
      tenantId: 'tenant-quillhub-001',
    };
    req.tenantId = 'tenant-quillhub-001';
    return next();
  }

  res.status(401).json({ error: 'Unauthorized: Authentication required', statusCode: 401 });
}

/**
 * Role-Based Access Control (RBAC) guard
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: No active user session', statusCode: 401 });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' lacks permission for this action. Required: [${allowedRoles.join(', ')}]`,
        statusCode: 403,
      });
      return;
    }

    next();
  };
}

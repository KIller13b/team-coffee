import { Router, Request, Response } from 'express';
import { signToken, AuthUser, UserRole, requireRole, authMiddleware } from '../middleware/auth';
import { auditTrail, logAuditEvent } from '../middleware/auditLogger';

export const authRouter = Router();

// Pre-configured test accounts for demo & evaluation
const DEMO_USERS: Record<string, AuthUser> = {
  admin: {
    id: 'usr-admin-01',
    name: 'Priya Chandrasekaran',
    email: 'priya.c@quillhub.com',
    role: 'Admin',
    organization: 'Quillhub Inc.',
    tenantId: 'tenant-quillhub-001',
  },
  counsel: {
    id: 'usr-counsel-01',
    name: 'Marcus Ellison',
    email: 'm.ellison@quillhub.com',
    role: 'Counsel',
    organization: 'Quillhub Inc.',
    tenantId: 'tenant-quillhub-001',
  },
  analyst: {
    id: 'usr-analyst-01',
    name: 'Sarah Connor',
    email: 's.connor@quillhub.com',
    role: 'Analyst',
    organization: 'Quillhub Inc.',
    tenantId: 'tenant-quillhub-001',
  },
  viewer: {
    id: 'usr-viewer-01',
    name: 'Auditor External',
    email: 'auditor@auditfirm.com',
    role: 'Viewer',
    organization: 'External Audit LLC',
    tenantId: 'tenant-quillhub-001',
  },
};

/**
 * POST /api/auth/login
 * Body: { username: "admin" | "counsel" | "analyst" | "viewer" } or custom email/role
 */
authRouter.post('/login', (req: Request, res: Response) => {
  const { username, role, name, email } = req.body;
  const key = (username || '').toLowerCase();

  let user: AuthUser;
  if (DEMO_USERS[key]) {
    user = DEMO_USERS[key];
  } else {
    user = {
      id: `usr-${Date.now().toString(36)}`,
      name: name || username || 'Legal Evaluator',
      email: email || `${username || 'user'}@quillhub.com`,
      role: (['Admin', 'Counsel', 'Analyst', 'Viewer'].includes(role) ? role : 'Counsel') as UserRole,
      organization: 'Quillhub Inc.',
      tenantId: 'tenant-quillhub-001',
    };
  }

  const token = signToken(user);
  logAuditEvent(req, 'LOGIN', 'USER_SESSION', user.id, { role: user.role });

  res.json({
    token,
    user,
    message: `Successfully authenticated as ${user.name} (${user.role})`,
  });
});

/**
 * GET /api/auth/me
 */
authRouter.get('/me', authMiddleware, (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }
  res.json({
    user: req.user,
    permissions: {
      canUploadContracts: ['Admin', 'Counsel'].includes(req.user.role),
      canDeleteContracts: ['Admin'].includes(req.user.role),
      canApproveActions: ['Admin', 'Counsel'].includes(req.user.role),
      canTriggerReExtraction: ['Admin', 'Counsel', 'Analyst'].includes(req.user.role),
      canScrubTimeline: ['Admin', 'Counsel', 'Analyst'].includes(req.user.role),
    },
  });
});

/**
 * GET /api/auth/audit-log
 * Protected: Admin and Counsel only
 */
authRouter.get('/audit-log', authMiddleware, requireRole(['Admin', 'Counsel']), (req: Request, res: Response) => {
  res.json({
    totalRecords: auditTrail.length,
    records: auditTrail,
  });
});

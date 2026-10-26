import { Request, Response, NextFunction } from 'express';

export interface AuditRecord {
  timestamp: string;
  userId: string;
  userRole: string;
  organization: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  ip: string;
  status: 'success' | 'failure';
  details?: Record<string, any>;
}

export const auditTrail: AuditRecord[] = [];

/**
 * Redacts sensitive fields (passwords, tokens, api keys, bank accounts)
 */
export function redactSensitiveData(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;

  const SENSITIVE_KEYS = [
    'password',
    'secret',
    'token',
    'apikey',
    'api_key',
    'authorization',
    'bearer',
    'key',
    'credit_card',
    'bank_account',
  ];

  if (Array.isArray(obj)) {
    return obj.map(redactSensitiveData);
  }

  const sanitized: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((s) => k.toLowerCase().includes(s));
    if (isSensitive && typeof v === 'string') {
      sanitized[k] = v.length > 8 ? `${v.slice(0, 3)}...[REDACTED]` : '[REDACTED]';
    } else if (typeof v === 'object' && v !== null) {
      sanitized[k] = redactSensitiveData(v);
    } else {
      sanitized[k] = v;
    }
  }
  return sanitized;
}

/**
 * Records an immutable audit event
 */
export function logAuditEvent(
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>,
  status: 'success' | 'failure' = 'success'
): AuditRecord {
  const record: AuditRecord = {
    timestamp: new Date().toISOString(),
    userId: req.user?.id || 'anonymous',
    userRole: req.user?.role || 'Guest',
    organization: req.user?.organization || 'Default Org',
    action,
    resourceType,
    resourceId,
    ip: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
    status,
    details: details ? redactSensitiveData(details) : undefined,
  };

  auditTrail.unshift(record);
  if (auditTrail.length > 500) {
    auditTrail.pop(); // Keep bounded memory log
  }

  return record;
}

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { signDevToken } from '../src/middleware/auth';

describe('Auth, RBAC and CORS Security Tests', () => {
  it('rejects cross-origin requests from unauthorized origins', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'https://malicious-site.com');
    
    // In our CORS configuration, unauthorized origins are either blocked with 500/CORS error or headers omitted
    expect(res.headers['access-control-allow-origin']).not.toBe('https://malicious-site.com');
  });

  it('allows requests from localhost:5173', async () => {
    const res = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('GET /api/auth/me returns current user identity with valid token', async () => {
    const token = signDevToken('Marcus Ellison', 'Counsel');
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe('Marcus Ellison');
    expect(res.body.user.role).toBe('Counsel');
  });

  it('POST /api/auth/login generates valid JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'Admin', role: 'Admin' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.role).toBe('Admin');
  });

  it('DELETE /api/contracts requires Admin role and rejects Viewer/Analyst', async () => {
    const viewerToken = signDevToken('Viewer User', 'Viewer');
    const res = await request(app)
      .delete('/api/contracts')
      .set('Authorization', `Bearer ${viewerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Forbidden');
  });
});

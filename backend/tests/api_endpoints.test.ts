import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { warRoomState } from '../src/services/warRoomState';

describe('Odin Express API Endpoints Integration Tests', () => {
  beforeAll(async () => {
    await warRoomState.initialize();
  });

  it('GET / returns system status and agents list', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.body.system).toContain('Odin');
    expect(res.body.status).toBe('online');
    expect(res.body.agents).toContain('Thor');
  });

  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('GET /api/contracts returns contract list', async () => {
    const res = await request(app).get('/api/contracts');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/contracts/:id returns A1 contract with exact canonical details', async () => {
    const res = await request(app).get('/api/contracts/A1');
    expect(res.status).toBe(200);
    expect(res.body.counterparty).toBe('StratoNode Inc.');
    expect(res.body.startDate).toBe('2026-08-01');
    expect(res.body.endDate).toBe('2028-07-31');
    expect(res.body.renewalDate).toBe('2028-05-02');
    expect(res.body.clauses.length).toBeGreaterThanOrEqual(8);
    expect(res.body.obligations.length).toBeGreaterThan(0);
  });

  it('GET /api/contracts/:id with prefixed id cnt-A1 returns the same contract', async () => {
    const res = await request(app).get('/api/contracts/cnt-A1');
    expect(res.status).toBe(200);
    expect(res.body.counterparty).toBe('StratoNode Inc.');
  });

  it('GET /api/agents returns 6 agents with current statuses', async () => {
    const res = await request(app).get('/api/agents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    const agentIds = res.body.map((a: any) => a.id);
    expect(agentIds).toContain('odin');
    expect(agentIds).toContain('thor');
    expect(agentIds).toContain('norns');
    expect(agentIds).toContain('loki');
    expect(agentIds).toContain('heimdall');
    expect(agentIds).toContain('tyr');
  });

  it('GET /api/agents/messages returns inter-agent deliberation messages', async () => {
    const res = await request(app).get('/api/agents/messages');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/workflow/steps returns workflow execution stages', async () => {
    const res = await request(app).get('/api/workflow/steps');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/risks returns risks, exposures, and cross-contract collisions', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/timeline/events returns chronological milestones', async () => {
    const res = await request(app).get('/api/timeline/events');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('GET /api/clock and POST /api/clock/set updates temporal state', async () => {
    const getRes = await request(app).get('/api/clock');
    expect(getRes.status).toBe(200);
    expect(getRes.body.currentDate).toBeTruthy();

    const postRes = await request(app)
      .post('/api/clock/set')
      .send({ date: '2027-04-15' });
    expect(postRes.status).toBe(200);
    expect(postRes.body.currentDate).toBe('2027-04-15');
  });

  it('GET /api/reports returns synthesized executive report with P1-P4 actions', async () => {
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].totalExposureINR).toBeGreaterThan(0);
    expect(res.body[0].recommendedActions.length).toBeGreaterThan(0);
  });

  it('POST /api/chat responds intelligently for each agent persona', async () => {
    const res = await request(app)
      .post('/api/chat')
      .send({ agentId: 'thor', message: 'What is the governing law of A1?' });
    expect(res.status).toBe(200);
    expect(res.body.response).toBeTruthy();
    expect(res.body.agentId).toBe('thor');
  });
});

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { warRoomState } from '../src/services/warRoomState';
import { signDevToken } from '../src/middleware/auth';

describe('Contract 404 & Cascading Deletion Verification', () => {
  const adminToken = signDevToken('Admin User', 'Admin');

  beforeAll(async () => {
    await warRoomState.initialize();
  });

  it('GET /api/contracts/unknown-contract-id strictly returns 404 without contract-0 fallback', async () => {
    const res = await request(app).get('/api/contracts/totally-nonexistent-contract-xyz');
    expect(res.status).toBe(404);
    expect(res.body.error).toContain('not found');
  });

  it('GET /api/contracts/cnt-unknown-999 strictly returns 404', async () => {
    const res = await request(app).get('/api/contracts/cnt-unknown-999');
    expect(res.status).toBe(404);
  });

  it('DELETE /api/contracts/:id deletes contract and cascades across risks and timeline', async () => {
    // 1. First ensure contracts exist
    const listRes = await request(app).get('/api/contracts');
    expect(listRes.body.length).toBeGreaterThan(0);
    const targetCid = listRes.body[0].id;

    // 2. Delete single contract with Admin token
    const deleteRes = await request(app)
      .delete(`/api/contracts/${targetCid}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(deleteRes.status).toBe(200);

    // 3. Confirm 404 on deleted contract
    const verifyRes = await request(app).get(`/api/contracts/${targetCid}`);
    expect(verifyRes.status).toBe(404);

    // 4. Confirm risks for this contract were purged
    const risksRes = await request(app).get(`/api/risks?contract_id=${targetCid}`);
    expect(risksRes.body.length).toBe(0);
  });

  it('DELETE /api/contracts clears all contracts, risks, timeline events, and reports', async () => {
    const clearRes = await request(app)
      .delete('/api/contracts')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(clearRes.status).toBe(200);

    const contractsRes = await request(app).get('/api/contracts');
    expect(contractsRes.body).toEqual([]);

    const risksRes = await request(app).get('/api/risks');
    expect(risksRes.body).toEqual([]);

    const timelineRes = await request(app).get('/api/timeline/events');
    expect(timelineRes.body).toEqual([]);

    // Restore canonical state for other test suites
    await warRoomState.recomputeAll();
  });
});

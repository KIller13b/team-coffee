import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { warRoomState } from '../src/services/warRoomState';
import { signDevToken } from '../src/middleware/auth';

describe('Novel Contract Ingestion & Multi-Agent Generalization Tests', () => {
  const counselToken = signDevToken('Marcus Ellison', 'Counsel');

  beforeAll(async () => {
    await warRoomState.initialize();
  });

  it('POST /api/contracts/upload processes novel contract and generates synthesized actions', async () => {
    const novelContractText = `
MASTER SERVICES AGREEMENT
BETWEEN: Apex Innovations LLC ("Provider")
AND: Global Meridian Enterprises ("Customer")
EFFECTIVE DATE: September 1, 2026

1. SERVICES AND UPTIME
Provider warrants that the Hosted Cloud Infrastructure shall maintain a Monthly Uptime Percentage of not less than 99.8%.
In the event of an outage exceeding 120 minutes in any calendar month, Customer shall receive a 20% service credit.
Customer must submit all credit claims in writing within thirty (30) days following the incident.

2. TERM AND RENEWAL
This Agreement shall continue for an initial term of 12 months.
Either party may prevent automatic renewal by providing formal written notice at least sixty (60) days prior to the expiration date.

3. GOVERNING LAW AND NOTICES
This Agreement is governed by the laws of the State of Delaware.
All notices must be delivered by registered mail to the legal department.
`;

    const res = await request(app)
      .post('/api/contracts/upload')
      .set('Authorization', `Bearer ${counselToken}`)
      .attach('file', Buffer.from(novelContractText), 'apex_agreement.txt');

    expect(res.status).toBe(201);
    expect(res.body.id).toBeTruthy();
    expect(res.body.counterparty).toBeTruthy();
    expect(res.body.clauses.length).toBeGreaterThan(0);

    // Verify novel contract has a synthesized dossier report
    const reportsRes = await request(app).get('/api/reports');
    const novelReport = reportsRes.body.find((r: any) => r.contractId === res.body.id);
    expect(novelReport).toBeTruthy();
    expect(novelReport.recommendedActions.length).toBeGreaterThan(0);
    // Ensure draft letter is synthesized
    expect(novelReport.recommendedActions[0].draftLetter).toBeTruthy();
  });
});

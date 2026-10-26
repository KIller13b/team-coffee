import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { warRoomState } from '../src/services/warRoomState';
import { simulationService } from '../src/services/simulationService';
import { IContract } from '../models/Contract.model';

describe('What-If Strategy Sandbox — Simulation Service & API Integration Tests', () => {
  beforeAll(async () => {
    await warRoomState.initialize();
  });

  // 1. Successful simulation with explicit valid terms
  it('successfully simulates vendor default on contract A1 with explicit terms', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-02-15',
        scenarioType: 'vendor_default',
        params: {
          outageDurationHours: 48,
          curePeriodDays: 0,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.scenarioType).toBe('vendor_default');
    expect(res.body.isMock).toBe(false);
    expect(res.body.baseline.contractId).toBe('cnt-A1');
    expect(res.body.simulated.directFinancialImpactINR).toBeGreaterThan(0);
    expect(res.body.simulated.costBreakdown.length).toBeGreaterThan(0);
    expect(res.body.simulated.simulatedTimelineEvents.length).toBeGreaterThan(0);
  });

  // 2. Cascading effects across dependent contracts
  it('traces cascading downstream SLA breach on dependent customer contracts (e.g. B1)', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-03-01',
        scenarioType: 'vendor_default',
        params: {
          outageDurationHours: 72,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.simulated.cascadingEffects.length).toBeGreaterThan(0);
    const b1Cascade = res.body.simulated.cascadingEffects.find(
      (c: any) => c.affectedContractId === 'cnt-B1' || c.affectedContractTitle.includes('Harbor')
    );
    expect(b1Cascade).toBeDefined();
    expect(b1Cascade.severity).toBe('critical');
    expect(res.body.simulated.downstreamFinancialImpactINR).toBeGreaterThan(0);
    expect(res.body.simulated.totalExposureINR).toBe(
      res.body.simulated.directFinancialImpactINR + res.body.simulated.downstreamFinancialImpactINR
    );
  });

  // 3. Prevention of duplicate costs
  it('prevents double-counting duplicate penalties or identical cost items', () => {
    const sampleContract: IContract = {
      id: 'cnt-TEST-DUP',
      title: 'Deduplication Test Agreement',
      counterparty: 'Acme Corp',
      contractType: 'Vendor',
      status: 'active',
      analysisStatus: 'completed',
      riskLevel: 'medium',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      renewalDate: '2026-11-01',
      durationMonths: 12,
      jurisdiction: 'NY',
      totalValueINR: 1000000,
      financialExposureINR: 200000,
      autoRenewalConditions: 'None',
      paymentSchedule: 'Monthly',
      confidenceScore: 0.9,
      tags: [],
      clauses: [
        {
          id: 'cls-1',
          contractId: 'cnt-TEST-DUP',
          field: 'sla',
          category: 'sla',
          extractedValue: '15% credit',
          clauseCitation: 'Section 4.1',
          confidenceScore: 0.9,
          verbatimText: 'Monthly Uptime < 99.5% entitles Customer to a 15% Service Credit',
          extractedBy: 'thor',
        },
      ],
      obligations: [],
    } as any;

    const result = simulationService.simulate(
      {
        contractId: 'cnt-TEST-DUP',
        simulationDate: '2027-01-15',
        scenarioType: 'vendor_default',
        params: { outageDurationHours: 24 },
      },
      sampleContract,
      [sampleContract]
    );

    // Verify all breakdown items have unique IDs / categories
    const categories = result.simulated.costBreakdown.map((c) => `${c.category}:${c.clauseCitation}`);
    const uniqueCategories = new Set(categories);
    expect(categories.length).toBe(uniqueCategories.size);
  });

  // 4. Missing penalty or termination cost information (insufficient data handling)
  it('returns explicit insufficient-data result when required contract values cannot be established', () => {
    const incompleteContract: IContract = {
      id: 'cnt-TEST-INCOMPLETE',
      title: 'Vague Agreement Without Terms',
      counterparty: 'Vague Corp',
      contractType: 'Services',
      status: 'active',
      analysisStatus: 'completed',
      riskLevel: 'low',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      renewalDate: '2026-11-01',
      durationMonths: 12,
      jurisdiction: 'Unknown',
      totalValueINR: 0,
      financialExposureINR: 0,
      autoRenewalConditions: '',
      paymentSchedule: '',
      confidenceScore: 0.5,
      tags: [],
      clauses: [], // Empty clauses: no SLA, no penalty, no termination terms
      obligations: [],
    } as any;

    const result = simulationService.simulate(
      {
        contractId: 'cnt-TEST-INCOMPLETE',
        simulationDate: '2027-02-01',
        scenarioType: 'vendor_default',
      },
      incompleteContract,
      [incompleteContract]
    );

    expect(result.dataQuality.hasSufficientData).toBe(false);
    expect(result.dataQuality.missingFields.length).toBeGreaterThan(0);
    expect(result.status).toBe('insufficient_data');
    expect(result.dataQuality.confidenceScore).toBeLessThan(0.5);
  });

  // 5. Unknown contract and unknown dependency handling
  it('returns 404 for unknown contract ID', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-NONEXISTENT-999',
        simulationDate: '2027-03-01',
        scenarioType: 'vendor_default',
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Contract not found');
  });

  it('gracefully handles and flags unknown dependencies declared in contract', () => {
    const contractWithUnknownDep: IContract = {
      id: 'cnt-HAS-GHOST-DEP',
      title: 'Contract With Ghost Dependency',
      counterparty: 'Ghost Vendor',
      contractType: 'SaaS',
      status: 'active',
      analysisStatus: 'completed',
      riskLevel: 'low',
      startDate: '2026-01-01',
      endDate: '2027-01-01',
      renewalDate: '2026-11-01',
      durationMonths: 12,
      jurisdiction: 'DE',
      totalValueINR: 500000,
      financialExposureINR: 100000,
      autoRenewalConditions: '',
      paymentSchedule: 'Monthly',
      confidenceScore: 0.8,
      tags: [],
      relatedContractIds: ['cnt-UNKNOWN-ORPHAN-404'], // Declares nonexistent dependency
      clauses: [],
      obligations: [],
    } as any;

    const result = simulationService.simulate(
      {
        contractId: 'cnt-HAS-GHOST-DEP',
        simulationDate: '2027-01-15',
        scenarioType: 'early_termination',
      },
      contractWithUnknownDep,
      [contractWithUnknownDep]
    );

    expect(result.dataQuality.warnings.some((w) => w.includes('cnt-UNKNOWN-ORPHAN-404'))).toBe(true);
  });

  // 6. Invalid event dates and scenario inputs validation
  it('rejects invalid event date format with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: 'invalid-date-string',
        scenarioType: 'vendor_default',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
    expect(res.body.issues.length).toBeGreaterThan(0);
  });

  it('rejects unsupported scenario types with 400 validation error', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-04-01',
        scenarioType: 'alien_invasion_scenario',
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  // 7. Ensuring the baseline contract and timeline remain unchanged (immutability)
  it('ensures baseline contract and warRoomState clock remain completely unchanged during simulation', async () => {
    const initialClock = warRoomState.clockDate;
    const initialContractExposure = warRoomState.contracts.find((c) => c.id === 'cnt-A1')?.financialExposureINR;

    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-09-20', // Far in future
        scenarioType: 'vendor_default',
        params: { outageDurationHours: 100 },
      });

    expect(res.status).toBe(200);

    // Baseline temporal clock must NOT have moved
    expect(warRoomState.clockDate).toBe(initialClock);

    // Contract in warRoomState must NOT have mutated
    const currentContract = warRoomState.contracts.find((c) => c.id === 'cnt-A1');
    if (initialContractExposure !== undefined) {
      expect(currentContract?.financialExposureINR).toBe(initialContractExposure);
    }
  });

  // 8. Mock mode versus live-data mode
  it('distinguishes explicit mock mode from live simulation mode', async () => {
    const liveRes = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-05-01',
        scenarioType: 'early_termination',
        mockMode: false,
      });

    expect(liveRes.status).toBe(200);
    expect(liveRes.body.isMock).toBe(false);

    const mockRes = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-A1',
        simulationDate: '2027-05-01',
        scenarioType: 'early_termination',
        mockMode: true,
      });

    expect(mockRes.status).toBe(200);
    expect(mockRes.body.isMock).toBe(true);
    expect(mockRes.body.dataQuality.assumptions.some((a: string) => a.includes('SYNTHETIC MOCK DATA'))).toBe(true);
  });

  // 9. Milestone failure simulation
  it('simulates milestone failure and detects deemed acceptance / delay exposure', async () => {
    const res = await request(app)
      .post('/api/simulation/what-if')
      .send({
        contractId: 'cnt-D1',
        simulationDate: '2027-02-01',
        scenarioType: 'milestone_failure',
        params: {
          delayDays: 45,
          isCritical: true,
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.scenarioType).toBe('milestone_failure');
    expect(res.body.simulated.directFinancialImpactINR).toBeGreaterThan(0);
    expect(res.body.simulated.simulatedTimelineEvents.length).toBeGreaterThan(0);
  });

  // 10. GET /api/simulation/scenarios returns templates
  it('GET /api/simulation/scenarios returns predefined template options', async () => {
    const res = await request(app).get('/api/simulation/scenarios');
    expect(res.status).toBe(200);
    expect(res.body.templates.length).toBeGreaterThanOrEqual(3);
    expect(res.body.supportedTypes).toContain('vendor_default');
  });

  // 11. GET /api/simulation/dependencies/:id returns dependency graph data
  it('GET /api/simulation/dependencies/cnt-A1 returns downstream dependencies', async () => {
    const res = await request(app).get('/api/simulation/dependencies/cnt-A1');
    expect(res.status).toBe(200);
    expect(res.body.contractId).toBe('cnt-A1');
    expect(Array.isArray(res.body.dependents)).toBe(true);
  });
});

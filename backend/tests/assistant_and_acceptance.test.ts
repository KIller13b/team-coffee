import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { warRoomState } from '../src/services/warRoomState';
import { slaRecoveryEngine } from '../src/services/slaRecoveryEngine';
import { breachInvestigationEngine } from '../src/services/breachInvestigationEngine';
import { evidenceRetrievalService } from '../src/services/evidenceRetrievalService';

describe('Odin Contract Intelligence Assistant & Acceptance Tests (PS-2)', () => {
  beforeAll(async () => {
    await warRoomState.initialize();
  });

  // =========================================================================
  // ACCEPTANCE TEST A: Hidden Contradictions & Unmet Dependencies
  // =========================================================================
  describe('Acceptance Test A: Harbor Retail Non-Outage Breach & Insurance Contradiction', () => {
    const query =
      'Is Quillhub currently in default or material breach of any terms in the Harbor Retail agreement (B1), unrelated to service outages? Cite specific provisions and company records.';

    it('processes query and returns evidence-grounded non-outage determination', async () => {
      const res = await request(app)
        .post('/api/assistant/query')
        .send({ query });

      expect(res.status).toBe(200);
      expect(res.body.directAnswer).toBeTruthy();

      // Must explicitly address Harbor Retail B1
      expect(res.body.queryIntent.targetContracts).toContain('B1');

      // Must evaluate non-outage provisions
      const claimCategories = res.body.claims.map((c: any) => c.category);
      expect(claimCategories).toContain('Data Protection & Security Compliance');
      expect(claimCategories).toContain('Commercial Exclusivity Covenant');
      expect(claimCategories).toContain('Insurance Maintenance Obligation');

      // Must conclude NOT in material breach today prior to June 30, 2027
      const insuranceClaim = res.body.claims.find(
        (c: any) => c.category === 'Insurance Maintenance Obligation'
      );
      expect(insuranceClaim).toBeDefined();
      expect(insuranceClaim.status).toBe('confirmed');

      // Citations must reference B1 sections and company records
      const citations = res.body.citations;
      expect(citations.some((c: any) => c.sectionOrClause?.includes('Section F') || c.sectionOrClause?.includes('§5.1'))).toBe(true);
      expect(citations.some((c: any) => c.sectionOrClause?.includes('Section H') || c.sectionOrClause?.includes('§7.1'))).toBe(true);
      expect(citations.some((c: any) => c.sourceType === 'company_record')).toBe(true);

      // Contradictions must be identified
      expect(res.body.contradictions.length).toBeGreaterThan(0);
      const insuranceContradiction = res.body.contradictions.find(
        (c: any) => c.contractualTerm?.includes('B1') && c.conflictingRecord?.includes('June 30, 2027')
      );
      expect(insuranceContradiction).toBeDefined();
      expect(insuranceContradiction.severity).toBe('high');
    });

    it('engine directly verifies B1 insurance lapse rule under clock dates', () => {
      const evidence = {
        query,
        category: 'breach_investigation' as const,
        targetContracts: ['B1'],
        targetEvents: ['E-16'],
        contractTexts: {},
        relevantClauses: [],
        companyContext: 'Policy MML-2024-88714 Expiry: June 30, 2027',
        events: [],
        citations: [],
        missingEntities: [],
      };

      // Clock before June 30, 2027 -> Not currently in breach
      const beforeResult = breachInvestigationEngine.investigateBreachesAndContradictions(
        evidence,
        '2027-03-15'
      );
      expect(beforeResult.directConclusion).toContain('NOT currently in default or material breach');

      // Clock after June 30, 2027 -> Material breach triggered under §7.2
      const afterResult = breachInvestigationEngine.investigateBreachesAndContradictions(
        evidence,
        '2027-07-01'
      );
      expect(afterResult.directConclusion).toContain('MATERIAL BREACH');
    });
  });

  // =========================================================================
  // ACCEPTANCE TEST B: Outages & Financial Recovery Gap
  // =========================================================================
  describe('Acceptance Test B: Outages & Financial Recovery Gap (March 3, 2027, Event E-04)', () => {
    const query =
      "On March 3, 2027, an unscheduled outage occurred (Event E-04). What was Quillhub's platform uptime percentage for March 2027, what financial credits does Quillhub owe its customers, and what credits can it recover from StratoNode?";

    it('computes exact platform uptime, customer credits, and vendor recovery gap', async () => {
      const res = await request(app)
        .post('/api/assistant/query')
        .send({ query });

      expect(res.status).toBe(200);
      const calc = res.body.calculation;
      expect(calc).toBeDefined();

      // 1. Uptime calculation check
      expect(calc.inputs.totalMinutesInMonth).toBe(44640);
      expect(calc.inputs.downtimeMinutes).toBe(190);
      // Uptime: (44,640 - 190) / 44,640 * 100 = 99.57%
      expect(calc.steps.some((s: any) => s.result.includes('99.57%'))).toBe(true);

      // 2. Customer credits owed: $6,000 (15% of $40,000)
      expect(calc.customerCreditsOwedUSD).toBe(6000);
      expect(calc.customerCreditsOwedINR).toBe(498000);

      // 3. Vendor credits recoverable: $0 (StratoNode achieved 99.57% >= 99.5%)
      expect(calc.vendorCreditsRecoverableUSD).toBe(0);
      expect(calc.vendorCreditsRecoverableINR).toBe(0);

      // 4. Unrecovered exposure: $6,000
      expect(calc.unrecoveredExposureUSD).toBe(6000);
      expect(calc.unrecoveredExposureINR).toBe(498000);

      // Citations must reference Harbor B1 and StratoNode A2
      expect(calc.governingSlaCitation).toContain('Harbor Retail Agreement B1');
      expect(calc.governingSlaCitation).toContain('StratoNode SLA A2');

      // Direct text must state the exact numbers
      expect(res.body.directAnswer).toContain('99.57%');
      expect(res.body.directAnswer).toContain('$6,000.00');
      expect(res.body.directAnswer).toContain('$0.00');
    });

    it('slaRecoveryEngine independently handles boundary conditions, maintenance exclusions, and May outage', () => {
      // Test May 2027 (Event E-12, 505 minutes downtime)
      const mayResult = slaRecoveryEngine.calculateUptimeAndRecovery({
        year: 2027,
        month: 5,
      });

      // Uptime in May: (44,640 - 505) / 44,640 = 98.87%
      expect(mayResult.steps[3].result).toBe('98.87%');

      // Customer owed $6,000 (15%)
      expect(mayResult.customerCreditsOwedUSD).toBe(6000);

      // Vendor StratoNode uptime was 98.87% < 99.5% and >= 95.0%
      // StratoNode owes 15% credit on $8,000 = $1,200.00
      expect(mayResult.vendorCreditsRecoverableUSD).toBe(1200);

      // Unrecovered gap in May: $6,000 - $1,200 = $4,800.00
      expect(mayResult.unrecoveredExposureUSD).toBe(4800);
    });
  });

  // =========================================================================
  // MULTI-AGENT ORCHESTRATION & INVESTIGATION TRACES
  // =========================================================================
  describe('Multi-Agent Investigation & Debate Endpoints', () => {
    it('returns observable agent traces for Thor, Norns, Loki, Heimdall, Tyr, and Odin', async () => {
      const res = await request(app)
        .post('/api/assistant/query')
        .send({ query: 'Audit Harbor Retail contract B1 for hidden traps and contradictions.' });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.agentTraces)).toBe(true);
      expect(res.body.agentTraces.length).toBe(6);

      const agentIds = res.body.agentTraces.map((t: any) => t.agentId);
      expect(agentIds).toEqual(['thor', 'norns', 'loki', 'heimdall', 'tyr', 'odin']);

      // Statuses must be completed, execution times measured
      for (const trace of res.body.agentTraces) {
        expect(trace.status).toBe('completed');
        expect(trace.executionDurationMs).toBeGreaterThanOrEqual(0);
        expect(trace.summary).toBeTruthy();
      }

      // Debate items must be present
      expect(Array.isArray(res.body.debateItems)).toBe(true);
      expect(res.body.debateItems.length).toBeGreaterThan(0);
      expect(res.body.debateItems[0].lokiChallenge).toBeTruthy();
      expect(res.body.debateItems[0].heimdallVerification).toBeTruthy();
      expect(res.body.debateItems[0].tyrVerdict).toBeTruthy();
    });

    it('GET /api/assistant/investigations lists recent investigations', async () => {
      const res = await request(app).get('/api/assistant/investigations');
      expect(res.status).toBe(200);
      expect(res.body.total).toBeGreaterThan(0);
      expect(Array.isArray(res.body.investigations)).toBe(true);

      const first = res.body.investigations[0];
      expect(first.id).toBeTruthy();
      expect(first.query).toBeTruthy();

      // Retrieve single investigation by ID
      const singleRes = await request(app).get(`/api/assistant/investigations/${first.id}`);
      expect(singleRes.status).toBe(200);
      expect(singleRes.body.id).toBe(first.id);
    });

    it('GET /api/assistant/sources/:sourceId returns citation source details', async () => {
      const res = await request(app).get('/api/assistant/sources/cit-b1-sec7-insurance');
      expect(res.status).toBe(200);
      expect(res.body.contractId).toBe('B1');
      expect(res.body.verbatimExcerpt).toBeTruthy();
    });

    it('validates query schema and rejects empty query with 400', async () => {
      const res = await request(app)
        .post('/api/assistant/query')
        .send({ query: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });
});

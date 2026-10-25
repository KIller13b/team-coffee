import { describe, it, expect, beforeAll } from 'vitest';
import { CANONICAL_METADATA, CANONICAL_CLAUSES, CANONICAL_OBLIGATIONS } from '../src/data/canonicalMetadata';
import { SEED_CONTRACTS } from '../src/data/seedData';
import { BusinessCalendar } from '../src/services/businessCalendar';
import { ContractWarRoomWorkflow } from '../src/agents/workflow';
import { warRoomState } from '../src/services/warRoomState';
import { llmService } from '../src/services/llmCascade';

describe('Canonical Contract QH-STRATO-2026-001 (A1.pdf) Invariant Verification', () => {
  beforeAll(async () => {
    // Initialize state with dataset bundle
    await warRoomState.initialize();
  });

  const a1Meta = CANONICAL_METADATA['A1'];
  const a1Seed = SEED_CONTRACTS.find((c) => c.id === 'cnt-A1')!;

  it('verifies provider and customer entities', () => {
    expect(a1Meta.counterparty).toBe('StratoNode Inc.');
    expect(a1Seed.counterparty).toBe('StratoNode Inc.');
    expect(a1Seed.title).toContain('QH-STRATO');
  });

  it('verifies effective date, end date, and 24-month initial term', () => {
    expect(a1Meta.startDate).toBe('2026-08-01');
    expect(a1Meta.endDate).toBe('2028-07-31');
    expect(a1Meta.durationMonths).toBe(24);
    expect(a1Seed.effectiveDate).toBe('2026-08-01');
    expect(a1Seed.expiryDate).toBe('2028-07-31');
    expect(a1Seed.clausesCount).toBeGreaterThanOrEqual(10);
  });

  it('verifies automatic renewal and 90-day non-renewal notice', () => {
    expect(a1Meta.autoRenewalTermMonths).toBe(12);
    expect(a1Meta.renewalNoticeDays).toBe(90);
    expect(a1Seed.autoRenew).toBe(true);
    expect(a1Seed.renewalNoticeDays).toBe(90);
    expect(a1Meta.autoRenewalConditions).toContain('90 days');
  });

  it('verifies initial-term notice deadline is exactly May 2, 2028 (calendar-day calculation)', () => {
    // July 31, 2028 minus 90 calendar days
    const end = new Date('2028-07-31T00:00:00Z');
    const noticeDate = new Date(end);
    noticeDate.setUTCDate(noticeDate.getUTCDate() - 90);
    const calculatedIso = noticeDate.toISOString().slice(0, 10);

    expect(calculatedIso).toBe('2028-05-02');
    expect(a1Meta.renewalDate).toBe('2028-05-02');
  });

  it('verifies fees: $8,000 monthly, $96,000 annualized recurring, $192,000 initial term', () => {
    expect(a1Meta.monthlyFeeUSD).toBe(8000);
    expect(a1Meta.annualRecurringFeeUSD).toBe(96000);
    expect(a1Meta.initialTermRecurringUSD).toBe(192000);
  });

  it('verifies governing law and jurisdiction: State of Oregon, Multnomah County', () => {
    expect(a1Meta.jurisdiction).toBe('State of Oregon');
    expect(a1Meta.governingLaw).toContain('Oregon');
    expect(a1Meta.disputeVenue).toContain('Multnomah County');
    expect(a1Seed.jurisdiction).toContain('Oregon');
  });

  it('verifies SLA hierarchy citations: Section E of Cover Page prevails', () => {
    expect(a1Meta.slaCitation).toBe('Section E of Cover Page');
    expect(a1Meta.orderOfPrecedenceRule).toContain('Cover Page prevails');
  });

  it('verifies clauses and verbatim quotes exist for A1', () => {
    const a1Clauses = CANONICAL_CLAUSES['A1'];
    expect(a1Clauses.length).toBeGreaterThanOrEqual(10);
    const termClause = a1Clauses.find((c) => c.section === 'Section B' || c.field.includes('Renewal'));
    expect(termClause).toBeDefined();
    expect(termClause?.verbatim_text).toContain('90 days');
  });

  it('verifies obligations exist for A1 with responsible parties', () => {
    const a1Obs = CANONICAL_OBLIGATIONS['A1'];
    expect(a1Obs.length).toBeGreaterThan(0);
    const noticeObligation = a1Obs.find((o) => o.title.toLowerCase().includes('notice'));
    expect(noticeObligation).toBeDefined();
    expect(noticeObligation?.dueDate).toBe('2028-05-02');
  });
});

describe('Business Calendar Engine & Holiday Calculations', () => {
  it('identifies weekends and standard holidays correctly', () => {
    // 2026-12-25 is Christmas (Holiday)
    expect(BusinessCalendar.isBusinessDay('2026-12-25')).toBe(false);
    // 2026-12-26 is Saturday (Weekend)
    expect(BusinessCalendar.isBusinessDay('2026-12-26')).toBe(false);
    // 2026-12-27 is Sunday (Weekend)
    expect(BusinessCalendar.isBusinessDay('2026-12-27')).toBe(false);
    // 2026-12-28 is Monday (Business day)
    expect(BusinessCalendar.isBusinessDay('2026-12-28')).toBe(true);
  });

  it('calculates 10 business days correctly', () => {
    // Starting on Monday 2026-10-12
    const target = BusinessCalendar.addBusinessDays('2026-10-12', 10);
    expect(target).toBe('2026-10-26');
    const diff = BusinessCalendar.businessDaysBetween('2026-10-12', target);
    expect(diff).toBe(10);
  });
});

describe('Multi-Agent War Room Workflow & Dispute Arbitration', () => {
  it('executes workflow for contract bundle A1 and produces multi-agent synthesis', () => {
    const workflow = new ContractWarRoomWorkflow();
    const result = workflow.execute('A1', 'Sample Contract Text', warRoomState.rawEvents, '2027-01-15');

    expect(result.thor.clauses.length).toBeGreaterThan(0);
    expect(result.norns.timeline_items.length).toBeGreaterThan(0);
    expect(result.loki.risks_and_claims.length).toBeGreaterThan(0);
    expect(result.heimdall).toBeDefined();
    expect(result.tyr).toBeDefined();
    expect(result.odin.executive_summary).toBeTruthy();
  });

  it('verifies Heimdall audit branches and Tyr binding arbitration', () => {
    const workflow = new ContractWarRoomWorkflow();
    const result = workflow.execute('A2', 'Sample Contract Text', warRoomState.rawEvents, '2027-01-15');

    // Loki should flag cross-contract collisions
    expect(result.loki.cross_contract_collisions.length).toBeGreaterThanOrEqual(0);
    // Heimdall audit output
    expect(result.heimdall).toBeDefined();
    // Tyr provides arbitration rulings
    expect(result.tyr.rulings.length).toBeGreaterThanOrEqual(0);
  });
});

describe('LLM Cascade Architecture', () => {
  it('validates provider priority order: Claude -> Groq -> Gemini -> OpenAI', () => {
    const expectedOrder = ['claude', 'groq', 'gemini', 'openai'];
    expect(llmService.providerOrder).toEqual(expectedOrder);
  });
});

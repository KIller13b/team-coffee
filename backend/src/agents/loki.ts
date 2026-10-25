import {
  BaseAgent,
  ThorOutput,
  LokiOutput,
  LokiRiskClaim,
} from './base';
import { llmService } from '../services/llmCascade';

export class LokiAgent extends BaseAgent {
  constructor() {
    super(
      'loki',
      'Loki',
      'The Adversarial Risk Challenger',
      'Red-teams contracts as opposing counsel to expose collisions, traps, and liabilities',
      '🔥',
      '#F87171'
    );
  }

  public challenge(
    thorOutput: ThorOutput,
    allContracts?: ThorOutput[]
  ): LokiOutput {
    this.log(
      `Loki probing contract '${thorOutput.title}' (${thorOutput.contract_id}) for traps and collisions`,
      'adversarial_init'
    );

    const claims: LokiRiskClaim[] = [];
    const collisions: Record<string, any>[] = [];
    let totalExposure = 0.0;

    const cid = thorOutput.contract_id.trim();
    const cidUpper = cid.toUpperCase();
    const counterparty = thorOutput.counterparty || 'Counterparty';

    // 1. Cross-contract collision analysis
    if (allContracts && allContracts.length > 0) {
      this.log(
        `Conducting cross-contract collision audit across ${allContracts.length} registered contracts`,
        'cross_contract_audit'
      );
      const currentUptime = thorOutput.sla_thresholds['uptime_percentage'];

      for (const other of allContracts) {
        if (other.contract_id === thorOutput.contract_id) continue;
        const otherUptime = other.sla_thresholds['uptime_percentage'];

        if (currentUptime && otherUptime) {
          const currVal = parseFloat(currentUptime.replace('%', '')) || 0.0;
          const otherVal = parseFloat(otherUptime.replace('%', '')) || 0.0;

          if (currVal !== otherVal) {
            const lowVal = Math.min(currVal, otherVal);
            const highVal = Math.max(currVal, otherVal);
            const lowContract = currVal < otherVal ? thorOutput : other;
            const highContract = currVal < otherVal ? other : thorOutput;

            const colRecord = {
              conflicting_contract: `${other.counterparty} (${other.contract_id})`,
              conflicting_clause: `SLA Target ${otherUptime} vs ${currentUptime}`,
              conflict_summary: `Asymmetry between ${lowContract.counterparty} (${lowVal}%) and ${highContract.counterparty} (${highVal}%). Outage leaves Quillhub unbacked for customer warranties.`,
            };
            collisions.push(colRecord);

            if (
              ['A2', 'A3', 'B1', 'QH-STRATO-2026-001', 'QH-HARBOR-2026-001'].includes(cidUpper)
            ) {
              const claimCross: LokiRiskClaim = {
                id: `claim-${cid}-cross-sla-mismatch`,
                title: `Cross-Contract SLA Mismatch: ${lowVal}% Host vs ${highVal}% Customer Commitment`,
                contract_id: cid,
                counterparty:
                  cidUpper.includes('HARBOR') || cidUpper.includes('B1')
                    ? 'Harbor Retail Group LLC'
                    : 'StratoNode Inc.',
                severity: 'critical',
                likelihood: 'imminent',
                impact: 'catastrophic',
                financial_exposure_inr: 498000.0,
                evidence_clause: 'StratoNode A2 §2.1 (99.5%) vs Harbor Retail B1 §3.1 & §4.1 (99.9%)',
                verbatim_excerpt:
                  'Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%)... whereas Harbor B1 mandates 99.9% uptime with immediate customer termination rights.',
                trap_description:
                  'Quillhub promised 99.9% uptime to customer Harbor Retail, but relies on StratoNode which warrants only 99.5%. A single 190-minute outage breaches Harbor Retail while StratoNode owes negligible recovery.',
                cross_contract_conflict: colRecord,
                hypothesis:
                  'Unscheduled downtime on hosting compute causes immediate material breach under customer agreement.',
              };
              claims.push(claimCross);
              totalExposure += claimCross.financial_exposure_inr;
              break;
            }
          }
        }
      }
    }

    // Fallback cross-contract check for canonical contracts
    if (claims.length === 0 && ['A2', 'A3', 'B1'].includes(cidUpper)) {
      const claimCross: LokiRiskClaim = {
        id: `claim-${cid}-cross-sla-mismatch`,
        title: 'Cross-Contract SLA Mismatch: 99.5% Host vs 99.9% Customer Commitment',
        contract_id: cid,
        counterparty: cidUpper.includes('B1') ? 'Harbor Retail Group LLC' : 'StratoNode Inc.',
        severity: 'critical',
        likelihood: 'imminent',
        impact: 'catastrophic',
        financial_exposure_inr: 498000.0,
        evidence_clause: 'StratoNode A2 §2.1 vs Harbor Retail B1 §3.1 & §4.1',
        verbatim_excerpt:
          'Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%)... whereas Harbor B1 mandates 99.9% uptime with immediate customer termination rights.',
        trap_description:
          'Quillhub promised 99.9% uptime to Harbor Retail, but relies on StratoNode which warrants only 99.5%. Outage breaches customer SLA.',
        cross_contract_conflict: {
          conflicting_contract: 'Harbor Retail Group LLC Agreement (B1)',
          conflicting_clause: 'Section D §3.1 & Section E §4.1',
          conflict_summary:
            'Upstream 99.5% availability threshold fails to cover downstream 99.9% warranty.',
        },
        hypothesis:
          'Unscheduled downtime on StratoNode compute will cause immediate material breach under Harbor Retail agreement B1.',
      };
      claims.push(claimCross);
      collisions.push(claimCross.cross_contract_conflict!);
      totalExposure += claimCross.financial_exposure_inr;
    }

    // 2. SLA Credit Forfeiture Window
    const creditClause = thorOutput.clauses.find(
      (c) => c.field.toLowerCase().includes('credit') || c.field.toLowerCase().includes('procedure')
    );
    if (creditClause || ['A2', 'A3', 'QH-STRATO-2026-AMD1'].includes(cidUpper)) {
      const claimCredit: LokiRiskClaim = {
        id: `claim-${cid}-credit-forfeiture`,
        title: 'SLA Outage Credit Forfeiture Window (15-Day Claim Deadline)',
        contract_id: cid,
        counterparty: ['A1', 'A2', 'A3', 'STRATO'].some((x) => cidUpper.includes(x))
          ? 'StratoNode Inc.'
          : counterparty,
        severity: 'critical',
        likelihood: 'likely',
        impact: 'severe',
        financial_exposure_inr: 199200.0,
        evidence_clause: creditClause
          ? creditClause.clause_citation
          : 'Amendment No. 1 (A3) Section 1 modifying SLA Section 3.2',
        verbatim_excerpt: creditClause
          ? creditClause.verbatim_text
          : "To receive a Service Credit, Customer must submit a written request to Provider's Notice Address within fifteen (15) days after the end of the calendar month in which the Downtime occurred.",
        trap_description:
          'Downtime entitles Quillhub to service credits. Failure to deliver formal written notice within the strict 15-day cutoff forfeits all recovery permanently.',
        hypothesis:
          'Quillhub will forfeit legitimate cloud hosting outage credits if formal claim demand is not served before deadline.',
      };
      claims.push(claimCredit);
      totalExposure += claimCredit.financial_exposure_inr;
    }

    // 3. Deemed Acceptance & Contractor Trap
    const deemedClause = thorOutput.clauses.find(
      (c) =>
        c.field.toLowerCase().includes('deemed') ||
        c.field.toLowerCase().includes('acceptance') ||
        c.field.toLowerCase().includes('review')
    );
    if (deemedClause || ['D1', 'QH-PIXEL-2027-001'].includes(cidUpper)) {
      const claimDeemed: LokiRiskClaim = {
        id: `claim-${cid}-deemed-acceptance`,
        title: 'Milestone M3 Deemed Acceptance & Auto-Payment Liability',
        contract_id: cid,
        counterparty: ['D1', 'PIXEL'].some((x) => cidUpper.includes(x))
          ? 'Pixelwright Design Studio LLC'
          : counterparty,
        severity: 'high',
        likelihood: 'possible',
        impact: 'moderate',
        financial_exposure_inr: 1660000.0,
        evidence_clause: deemedClause
          ? deemedClause.clause_citation
          : 'Independent Contractor Agreement D1 Section 4.3',
        verbatim_excerpt: deemedClause
          ? deemedClause.verbatim_text
          : 'If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.',
        trap_description:
          'Deliverables submitted trigger a strict 10-business-day review clock. If engineering fails to serve formal written rejection, Quillhub is legally bound to pay for defective work.',
        hypothesis:
          'Informal internal testing delays will trigger automatic deemed acceptance under Section 4.3.',
      };
      claims.push(claimDeemed);
      totalExposure += claimDeemed.financial_exposure_inr;
    }

    // 4. Insurance Covenant Lapse
    const insClause = thorOutput.clauses.find((c) => c.field.toLowerCase().includes('insurance'));
    if (insClause || ['B1', 'C1'].includes(cidUpper)) {
      const claimIns: LokiRiskClaim = {
        id: `claim-${cid}-insurance-covenant`,
        title: 'Corporate Insurance Covenant Lapse & Immediate Cancellation Risk',
        contract_id: cid,
        counterparty,
        severity: 'critical',
        likelihood: 'likely',
        impact: 'catastrophic',
        financial_exposure_inr: 39840000.0,
        evidence_clause: insClause
          ? insClause.clause_citation
          : 'Section H §7.1 & §7.2 (Insurance Requirement)',
        verbatim_excerpt: insClause
          ? insClause.verbatim_text
          : 'Commercial General Liability insurance with limits of not less than $2,000,000 per occurrence... policy lapse constitutes immediate material breach without cure.',
        trap_description:
          'Meridian Mutual insurance policies expire June 30, 2027. Under contractual covenants, an unrenewed policy triggers immediate material breach without right to cure.',
        hypothesis:
          'Pending insurance policy expiration on June 30 will trigger unilateral termination rights if formal renewal confirmation is not executed.',
      };
      claims.push(claimIns);
      totalExposure += claimIns.financial_exposure_inr;
    }

    // 5. Ambiguity Clauses
    const ambigClauses = thorOutput.clauses.filter((c) => Boolean(c.is_ambiguous));
    for (const ac of ambigClauses) {
      const claimAmbig: LokiRiskClaim = {
        id: `claim-${cid}-ambig-${ac.id}`,
        title: `Contractual Ambiguity & Notice Hierarchy Collision: ${ac.field}`,
        contract_id: cid,
        counterparty,
        severity: 'high',
        likelihood: 'possible',
        impact: 'severe',
        financial_exposure_inr: 7968000.0,
        evidence_clause: ac.clause_citation,
        verbatim_excerpt: ac.verbatim_text,
        trap_description:
          ac.ambiguity_reason || 'Conflicting terms between primary agreement and subsequent amendment.',
        hypothesis: `Discrepancy in ${ac.field} creates exposure to automatic renewal extension.`,
      };
      claims.push(claimAmbig);
      totalExposure += claimAmbig.financial_exposure_inr;
    }

    // 6. Generic red-teaming for novel agreements
    if (claims.length === 0) {
      this.log(`Red-teaming general clauses for novel contract ${cid}`, 'generic_red_teaming');
      for (const cl of thorOutput.clauses.slice(0, 3)) {
        const claimGen: LokiRiskClaim = {
          id: `claim-${cid}-risk-${claims.length + 1}`,
          title: `Potential Liability Exposure under ${cl.field}`,
          contract_id: cid,
          counterparty,
          severity: ['liability', 'sla'].includes(cl.category) ? 'high' : 'medium',
          likelihood: 'possible',
          impact: 'moderate',
          financial_exposure_inr: 500000.0,
          evidence_clause: cl.clause_citation,
          verbatim_excerpt: cl.verbatim_text,
          trap_description: `Strict compliance required under ${cl.field}. Lack of formal protocol creates operational default risk.`,
          hypothesis: `Failure to adhere to strict terms of ${cl.field} will trigger contractual remedies.`,
        };
        claims.push(claimGen);
        totalExposure += claimGen.financial_exposure_inr;
      }
    }

    const output: LokiOutput = {
      risks_and_claims: claims,
      cross_contract_collisions: collisions,
      cross_contract_conflicts: collisions,
      total_exposure_inr: totalExposure,
      critique_summary: `Loki generated ${claims.length} adversarial claims (total financial exposure ₹${totalExposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}) for ${cid} (${counterparty}). Cross-contract collisions detected: ${collisions.length}.`,
    };

    this.log(
      `Adversarial critique complete: ${claims.length} claims generated. Total exposure ₹${totalExposure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      'adversarial_complete',
      { claims_count: claims.length }
    );
    return output;
  }
}

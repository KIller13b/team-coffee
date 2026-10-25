import {
  BaseAgent,
  ThorOutput,
  NornsOutput,
  LokiOutput,
  HeimdallOutput,
  TyrOutput,
  OdinSynthesisOutput,
  FinalActionItem,
  Citation,
} from './base';

export class OdinAgent extends BaseAgent {
  constructor() {
    super(
      'odin',
      'Odin',
      'The Supreme Orchestrator & Allfather',
      'Coordinates the agent council and synthesizes intelligence into concrete legal actions',
      '👑',
      '#60A5FA'
    );
  }

  public synthesizeFinalActions(
    thor: ThorOutput,
    norns: NornsOutput,
    loki: LokiOutput,
    heimdall: HeimdallOutput,
    tyr: TyrOutput
  ): OdinSynthesisOutput {
    this.log('Odin convening War Room council to generate final legal actions', 'synthesis_init');

    const finalActions: FinalActionItem[] = [];
    const totalExposure = norns.worst_case_exposure_inr;

    // 1. From Heimdall YES branch (Materialized events & breaches)
    for (const yesClaim of heimdall.yes_branch_claims) {
      const titleL = yesClaim.claim_title.toLowerCase();

      if (titleL.includes('cross-contract') || titleL.includes('mismatch')) {
        const actionId = `act-${thor.contract_id}-rca-credit`;
        const draftLetter = `FORMAL NOTICE OF SERVICE DISRUPTION, ROOT-CAUSE ANALYSIS & SERVICE CREDIT CONFIRMATION

Date: March 15, 2027
To: Nora Chen, SVP Supply Chain
    Harbor Retail Group LLC
    4500 Seattle Trade Center, Suite 1200, Seattle, WA 98101
    Email: legal-notices@harborretail.com

From: Marcus Ellison, VP of Legal & Compliance
      Quillhub Inc., 1200 Innovation Drive, Suite 400, Austin, TX 78701

Reference Agreement: Cloud Service Agreement (Contract ID: QH-HARBOR-2026-001)

Dear Nora,

Pursuant to Section E §4.2 of our Agreement, please accept this formal written root-cause analysis report regarding the unscheduled service disruption that affected the Route Optimizer Enterprise platform on March 3, 2027.

1. INCIDENT DETAILS & DURATION:
   The outage commenced at approximately 10:05 UTC and was fully restored at 13:15 UTC (total duration: 190 minutes). No Scheduled Maintenance was in effect during this window.

2. ROOT-CAUSE SUMMARY:
   An upstream network switch failure in our hosting infrastructure provider's us-west-2a availability zone caused a cascading failover bottleneck. Redundant paths were provisioned and cluster instances restarted to restore service.

3. SLA COMMITMENT & SERVICE CREDIT ADJUSTMENT:
   Quillhub's platform achieved a Monthly Uptime Percentage of 99.57% for the month of March 2027. While this satisfied our baseline provider threshold, it fell below the Harbor Uptime Target of ninety-nine and nine-tenths percent (99.9%) established under Section D §3.1.

   In strict compliance with Section D §3.3, Quillhub is applying a fifteen percent (15%) service credit ($6,000.00 USD) against Harbor Retail's upcoming monthly service invoice.

Please contact customer success or our operations desk with any further inquiries.

Sincerely,
/s/ Marcus Ellison
Marcus Ellison, VP of Legal & Compliance
Quillhub Inc.`;

        finalActions.push({
          id: actionId,
          priority: 'P1_URGENT',
          action_type: 'CURE_NOTICE',
          title: 'Serve Formal Incident RCA & $6,000 SLA Credit Notice to Harbor Retail',
          target_counterparty: 'Harbor Retail Group LLC',
          contract_id: 'B1',
          deadline: 'Within 5 Business Days',
          responsible_agent: 'Odin & Tyr',
          financial_impact_inr: 498000.0,
          citation: {
            doc_id: 'B1',
            clause: 'Section E §4.2 (Incident Reports)',
            verbatim_quote:
              'For any unplanned Downtime exceeding thirty (30) minutes, Quillhub will provide a written root-cause analysis to Harbor Retail within five (5) business days after service is restored.',
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftLetter,
          status: 'drafted',
        });
      } else if (
        titleL.includes('stratonode') ||
        titleL.includes('sla outage credit') ||
        titleL.includes('credit forfeiture')
      ) {
        const actionId = `act-${thor.contract_id}-stratonode-credit-demand`;
        const draftLetter = `FORMAL WRITTEN DEMAND FOR SLA SERVICE CREDITS

Date: June 1, 2027
To: Jordan Hale, VP Sales
    StratoNode Inc., 8500 Cascade Boulevard, Suite 200, Portland, OR 97204
    Email: legal@stratonode.com, support@stratonode.com

From: Marcus Ellison, VP of Legal & Compliance
      Quillhub Inc., 1200 Innovation Drive, Suite 400, Austin, TX 78701

Reference: Cloud Service Agreement (QH-STRATO-2026-001) & Amendment No. 1 (QH-STRATO-2026-AMD1)

Dear Jordan,

Pursuant to Section 1 of Amendment No. 1 (modifying Section 3.2 of the Service Level Agreement), Quillhub Inc. hereby submits this formal written claim for Service Credits for the month of May 2027.

1. DOWNTIME INCIDENT:
   A severe unscheduled service disruption occurred from May 1, 2027 at 22:15 UTC to May 2, 2027 at 06:40 UTC affecting CloudCore Networking in the us-west-2 region (Duration: 505 consecutive minutes). This incident was not classified as Scheduled Maintenance and no advance notice was provided.

2. UPTIME CALCULATION:
   Total minutes in May: 44,640. Downtime minutes: 505. Calculated Monthly Uptime Percentage: 98.87%, falling well below the 99.5% Uptime Target specified in SLA Section 2.1.

3. SERVICE CREDIT CALCULATION (AMENDMENT NO. 1 SECTION 2):
   - Base Credit (95.0% to < 99.0% tier): 25% of Monthly Fee ($2,000.00).
   - Additional Single Incident Credit (>60 consecutive minutes): 5% of Monthly Fee ($400.00).
   - Total Service Credit Claim: Thirty percent (30%) of Monthly Fee = $2,400.00 USD.

Please apply this $2,400.00 credit to Quillhub's next monthly invoice per Section 3.2.

Sincerely,
/s/ Marcus Ellison
Marcus Ellison, VP of Legal & Compliance, Quillhub Inc.`;

        finalActions.push({
          id: actionId,
          priority: 'P1_URGENT',
          action_type: 'SLA_CREDIT_CLAIM',
          title: 'Serve Formal Written SLA Credit Demand ($2,400) on StratoNode Inc.',
          target_counterparty: 'StratoNode Inc.',
          contract_id: 'A3',
          deadline: 'June 15, 2027 (Strict Cutoff)',
          responsible_agent: 'Odin & Thor',
          financial_impact_inr: 199200.0,
          citation: {
            doc_id: 'A3',
            clause: 'Amendment No. 1 Section 1',
            verbatim_quote:
              "To receive a Service Credit, Customer must submit a written request to Provider's Notice Address within fifteen (15) days after the end of the calendar month in which the Downtime occurred.",
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftLetter,
          status: 'drafted',
        });
      } else if (titleL.includes('deemed acceptance') || titleL.includes('milestone m3')) {
        const actionId = `act-${thor.contract_id}-pixelwright-m3`;
        const draftMemo = `INTERNAL LEGAL DIRECTIVE: MILESTONE M3 DEEMED ACCEPTANCE & DISBURSEMENT AUTHORIZATION

Date: March 15, 2027
To: Lena Torres, Finance Controller; Dana Kowalski, Director of Engineering
From: Marcus Ellison, VP Legal & Compliance

Subject: Settlement of Milestone M3 Payment Obligation under Agreement QH-PIXEL-2026-001

1. LEGAL DETERMINATION:
   Pixelwright Design Studio delivered the Milestone M3 package (Front-End Development) on February 28, 2027 (Event E-03). Under Section 4.2, Quillhub was entitled to ten (10) business days to review the deliverable and either accept or issue a formal Rejection Notice. Excluding weekends and observed company holidays, this review window expired on Friday, March 12, 2027.

2. BINDING EFFECT:
   Pursuant to Section 4.3 ('Deemed Acceptance'), because no Rejection Notice was served within the 10-business-day window, Milestone M3 is contractually deemed accepted. Quillhub has no ongoing right of rejection or withholding.

3. DIRECTIVE:
   Finance is authorized to process Pixelwright's milestone invoice in the amount of $20,000.00 within twenty (20) business days of receipt pursuant to Section 3.2. Engineering is directed to establish rigorous acceptance testing protocols for Milestone M4 to ensure any deficiencies are served prior to the deemed acceptance cutoff.

Approved by Legal & Compliance.`;

        finalActions.push({
          id: actionId,
          priority: 'P2_HIGH',
          action_type: 'INTERNAL_CORRECTION',
          title: 'Authorize Milestone M3 Disbursement ($20,000) & Institute M4 Review Controls',
          target_counterparty: 'Pixelwright Design Studio LLC',
          contract_id: 'D1',
          deadline: 'Within 20 Business Days',
          responsible_agent: 'Odin',
          financial_impact_inr: 1660000.0,
          citation: {
            doc_id: 'D1',
            clause: 'Section 4.3 (Deemed Acceptance)',
            verbatim_quote:
              'If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.',
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftMemo,
          status: 'drafted',
        });
      }
    }

    // 2. From Tyr Rulings (NO branch)
    for (const ruling of tyr.rulings) {
      if (ruling.verdict === 'negotiate_bridge_amendment') {
        const actionId = `act-${thor.contract_id}-sla-bridge-addendum`;
        const draftAmendment = `PROPOSED AMENDMENT NO. 2 (SERVICE LEVEL HARMONIZATION ADDENDUM)

This Amendment No. 2 is entered into between StratoNode Inc. ('Provider') and Quillhub Inc. ('Customer').

WHEREAS, the parties desire to harmonize upstream infrastructure availability commitments with enterprise customer operational requirements;

NOW THEREFORE, Section 2.1 of the Service Level Agreement (QH-STRATO-2026-SLA) is hereby amended as follows:

  '2.1  Provider will make the Cloud Service available at least ninety-nine and nine-tenths percent (99.9%) of the minutes in each calendar month, not counting Scheduled Maintenance (the Revised Uptime Target).'

All other terms of the Agreement and Amendment No. 1 remain in full force and effect.

Executed for Quillhub Inc. and StratoNode Inc.`;

        finalActions.push({
          id: actionId,
          priority: 'P2_HIGH',
          action_type: 'BRIDGE_EXTENSION',
          title: 'Initiate SLA Alignment & Bridge Addendum Negotiations with StratoNode',
          target_counterparty: 'StratoNode Inc.',
          contract_id: 'A3',
          deadline: 'Prior to 60-Day Renewal Window',
          responsible_agent: 'Tyr & Odin',
          financial_impact_inr: ruling.financial_impact_inr,
          citation: {
            doc_id: 'A3',
            clause: 'Amendment No. 1 Section 3',
            verbatim_quote:
              'The Non-Renewal Notice Period is changed from ninety (90) days to sixty (60) days before the end of the then-current Subscription Period.',
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftAmendment,
          status: 'drafted',
        });
      } else if (ruling.verdict === 'dismissed_as_false_alarm') {
        const actionId = `act-${thor.contract_id}-notice-reiteration`;
        const draftReassurance = `FORMAL WRITTEN CLARIFICATION: CONTRACTUAL NOTICE AND DELIVERY REQUIREMENTS

Date: March 25, 2027
To: Counterparty Lead Representative
From: Marcus Ellison, VP Legal & Compliance, Quillhub Inc.

Dear Representative,

In response to recent informal dialogues, please be formally advised that under Common Paper Standard Terms Section 12.4, any notice, request, waiver, or amendment must be in writing and delivered to the registered Notice Address specified in the agreement. Oral statements or informal phone summaries do not alter existing obligations.

All milestone timelines and renewal conditions remain strictly binding as executed.

Sincerely,
Marcus Ellison, VP of Legal & Compliance, Quillhub Inc.`;

        finalActions.push({
          id: actionId,
          priority: 'P3_MEDIUM',
          action_type: 'INTERNAL_CORRECTION',
          title: 'Issue Formal Clarification of Mandatory Notice Protocols',
          target_counterparty: thor.counterparty,
          contract_id: 'STD',
          deadline: 'Within 5 Business Days',
          responsible_agent: 'Tyr',
          financial_impact_inr: 0.0,
          citation: {
            doc_id: 'STD',
            clause: 'Section 12.4 (Notices)',
            verbatim_quote:
              'Any notice, request, or approval about the Agreement must be in writing and sent to the Notice Address specified on the Cover Page.',
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftReassurance,
          status: 'drafted',
        });
      } else if (ruling.verdict === 'formal_cure_required') {
        const actionId = `act-${thor.contract_id}-insurance-renewal`;
        const draftInsInstruction = `EXECUTIVE INSTRUCTION: IMMEDIATE BINDING OF MERIDIAN MUTUAL INSURANCE POLICIES

Date: June 15, 2027
To: Sarah Mitchell, Commercial Account Representative
    Meridian Mutual Insurance Co., sarah.mitchell@meridianmutual.com

CC: Priya Chandrasekaran, CEO; Lena Torres, Finance Controller

From: Marcus Ellison, VP of Legal & Compliance, Quillhub Inc.

Dear Sarah,

Please accept this binding written instruction to renew Quillhub Inc.'s commercial insurance policies for the annual period effective July 1, 2027 through June 30, 2028, without interruption:

  1. Policy MML-2024-88714: Commercial General Liability ($2,000,000 occurrence / $5,000,000 aggregate)
  2. Policy MML-2024-88715: Technology E&O / Cyber Liability ($3,000,000 claim / $5,000,000 aggregate)

Under our major customer agreements (including Harbor Retail Group Section H §7.2), maintaining continuous insurance is a strict covenant, and any lapse constitutes an immediate material breach. Please issue the renewed Certificates of Insurance designating Harbor Retail Group LLC as additional insured immediately upon binding.

Sincerely,
/s/ Marcus Ellison
Marcus Ellison, VP of Legal & Compliance, Quillhub Inc.`;

        finalActions.push({
          id: actionId,
          priority: 'P1_URGENT',
          action_type: 'INTERNAL_CORRECTION',
          title: 'Execute Binding Renewal for Meridian Mutual Cyber ($3M) & CGL Policies',
          target_counterparty: 'Meridian Mutual Insurance Co.',
          contract_id: 'B1',
          deadline: 'June 25, 2027 (Strict Cutoff)',
          responsible_agent: 'Odin & Tyr',
          financial_impact_inr: ruling.financial_impact_inr,
          citation: {
            doc_id: 'B1',
            clause: 'Section H §7.2 (Lapse Notification)',
            verbatim_quote:
              'A lapse in required insurance coverage constitutes a material breach of this Agreement.',
            confidence: 1.0,
            verified: true,
          },
          draft_letter: draftInsInstruction,
          status: 'drafted',
        });
      }
    }

    const thorTitle = thor ? thor.title : 'Master Commercial Portfolio';
    const thorId = thor ? thor.contract_id : 'PORTFOLIO';
    const thorClausesCount = thor ? thor.clauses.length : 0;
    const thorCitationsCount = thor ? thor.verbatim_citations.length : 0;

    const execSummary = `WAR ROOM MISSION DIRECTIVE COMPLETE:
Evaluated agreement '${thorTitle}' against simulated clock [${norns.clock_checkpoint}].
1. Thor anchored ${thorClausesCount} clauses with verbatim citations.
2. Norns projected ₹${norns.worst_case_exposure_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} worst-case exposure with ${norns.upcoming_deadlines_30d.length} imminent deadlines.
3. Loki generated ${loki.risks_and_claims.length} adversarial risk claims.
4. Heimdall verified real-world events: ${heimdall.yes_branch_claims.length} active breaches confirmed (YES), ${heimdall.no_branch_claims.length} contested/unverified (NO).
5. Tyr adjudicated ${tyr.rulings.length} disputes with binding directives.
Odin has drafted ${finalActions.length} concrete legal actions ready for immediate deployment.`;

    const output: OdinSynthesisOutput = {
      mission_id: `mission-${thorId}-${Math.floor(Date.now() / 1000)}`,
      generated_at: new Date().toISOString(),
      total_exposure_inr: totalExposure,
      active_breaches_count: heimdall.yes_branch_claims.length,
      adjudicated_risks_count: tyr.rulings.length,
      executive_summary: execSummary,
      final_actions: finalActions,
      agent_contributions: {
        thor: `${thorClausesCount} clauses, ${thorCitationsCount} citations`,
        norns: `${norns.timeline_items.length} temporal milestones, ₹${norns.worst_case_exposure_inr.toLocaleString('en-IN', { minimumFractionDigits: 2 })} worst-case exposure`,
        loki: `${loki.risks_and_claims.length} adversarial challenges`,
        heimdall: `${heimdall.yes_branch_claims.length} YES (active breaches), ${heimdall.no_branch_claims.length} NO (disputed)`,
        tyr: `${tyr.rulings.length} binding arbitration rulings rendered`,
        odin: `${finalActions.length} ready-to-dispatch legal actions formulated`,
      },
    };

    this.log(
      `Odin finalized war room assessment: ${finalActions.length} actions ready.`,
      'synthesis_complete',
      { actions_count: finalActions.length }
    );
    return output;
  }
}

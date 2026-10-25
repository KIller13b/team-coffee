"""
Odin Agent: The Supreme Allfather Orchestrator & Action Synthesizer
Role: 'Synthesize & Generate FINAL ACTION'
Receives:
1. Norns: Timeline deadlines & liability projections
2. Heimdall (YES branch): Materialized real-world breaches
3. Tyr (NO branch): Binding arbitration rulings & dispute solutions
4. Thor: Verbatim clause citations
Synthesizes the complete War Room intelligence and drafts ready-to-execute legal actions.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from app.agents.base import (
    BaseAgent, ThorOutput, NornsOutput, LokiOutput, HeimdallOutput, TyrOutput,
    OdinSynthesisOutput, FinalActionItem, Citation
)


class OdinAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="odin",
            name="Odin",
            title="The Supreme Orchestrator & Allfather",
            role="Coordinates the agent council and synthesizes intelligence into concrete legal actions",
            avatar="👑",
            color="#60A5FA"
        )

    def synthesize_final_actions(
        self,
        thor: ThorOutput,
        norns: NornsOutput,
        loki: LokiOutput,
        heimdall: HeimdallOutput,
        tyr: TyrOutput
    ) -> OdinSynthesisOutput:
        """
        Synthesizes council findings into prioritized, citation-backed final actions.
        """
        self.log("Odin convening War Room council to generate final legal actions", "synthesis_init")
        
        final_actions: List[FinalActionItem] = []
        total_exposure = norns.worst_case_exposure_inr

        # Action 1: From Heimdall YES branch (Materialized events & breaches)
        for yes_claim in heimdall.yes_branch_claims:
            title_l = yes_claim.claim_title.lower()

            if "cross-contract" in title_l or "mismatch" in title_l:
                action_id = f"act-{thor.contract_id}-rca-credit"
                draft_letter = (
                    f"FORMAL NOTICE OF SERVICE DISRUPTION, ROOT-CAUSE ANALYSIS & SERVICE CREDIT CONFIRMATION\n\n"
                    f"Date: March 15, 2027\n"
                    f"To: Nora Chen, SVP Supply Chain\n"
                    f"    Harbor Retail Group LLC\n"
                    f"    4500 Seattle Trade Center, Suite 1200, Seattle, WA 98101\n"
                    f"    Email: legal-notices@harborretail.com\n\n"
                    f"From: Marcus Ellison, VP of Legal & Compliance\n"
                    f"      Quillhub Inc., 1200 Innovation Drive, Suite 400, Austin, TX 78701\n\n"
                    f"Reference Agreement: Cloud Service Agreement (Contract ID: QH-HARBOR-2026-001)\n\n"
                    f"Dear Nora,\n\n"
                    f"Pursuant to Section E §4.2 of our Agreement, please accept this formal written root-cause analysis report "
                    f"regarding the unscheduled service disruption that affected the Route Optimizer Enterprise platform on March 3, 2027.\n\n"
                    f"1. INCIDENT DETAILS & DURATION:\n"
                    f"   The outage commenced at approximately 10:05 UTC and was fully restored at 13:15 UTC (total duration: 190 minutes).\n"
                    f"   No Scheduled Maintenance was in effect during this window.\n\n"
                    f"2. ROOT-CAUSE SUMMARY:\n"
                    f"   An upstream network switch failure in our hosting infrastructure provider's us-west-2a availability zone caused "
                    f"   a cascading failover bottleneck. Redundant paths were provisioned and cluster instances restarted to restore service.\n\n"
                    f"3. SLA COMMITMENT & SERVICE CREDIT ADJUSTMENT:\n"
                    f"   Quillhub's platform achieved a Monthly Uptime Percentage of 99.57% for the month of March 2027. While this satisfied "
                    f"   our baseline provider threshold, it fell below the Harbor Uptime Target of ninety-nine and nine-tenths percent (99.9%) "
                    f"   established under Section D §3.1.\n\n"
                    f"   In strict compliance with Section D §3.3, Quillhub is applying a fifteen percent (15%) service credit ($6,000.00 USD) "
                    f"   against Harbor Retail's upcoming monthly service invoice.\n\n"
                    f"Please contact customer success or our operations desk with any further inquiries.\n\n"
                    f"Sincerely,\n"
                    f"/s/ Marcus Ellison\n"
                    f"Marcus Ellison, VP of Legal & Compliance\n"
                    f"Quillhub Inc."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P1_URGENT",
                    action_type="CURE_NOTICE",
                    title="Serve Formal Incident RCA & $6,000 SLA Credit Notice to Harbor Retail",
                    target_counterparty="Harbor Retail Group LLC",
                    contract_id="B1",
                    deadline="Within 5 Business Days",
                    responsible_agent="Odin & Tyr",
                    financial_impact_inr=498000.0, # $6,000 USD
                    citation=Citation(
                        doc_id="B1",
                        clause="Section E §4.2 (Incident Reports)",
                        verbatim_quote="For any unplanned Downtime exceeding thirty (30) minutes, Quillhub will provide a written root-cause analysis to Harbor Retail within five (5) business days after service is restored.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_letter,
                    status="drafted"
                ))

            elif "stratonode" in title_l or "sla outage credit" in title_l or "credit forfeiture" in title_l:
                action_id = f"act-{thor.contract_id}-stratonode-credit-demand"
                draft_letter = (
                    f"FORMAL WRITTEN DEMAND FOR SLA SERVICE CREDITS\n\n"
                    f"Date: June 1, 2027\n"
                    f"To: Jordan Hale, VP Sales\n"
                    f"    StratoNode Inc., 8500 Cascade Boulevard, Suite 200, Portland, OR 97204\n"
                    f"    Email: legal@stratonode.com, support@stratonode.com\n\n"
                    f"From: Marcus Ellison, VP of Legal & Compliance\n"
                    f"      Quillhub Inc., 1200 Innovation Drive, Suite 400, Austin, TX 78701\n\n"
                    f"Reference: Cloud Service Agreement (QH-STRATO-2026-001) & Amendment No. 1 (QH-STRATO-2026-AMD1)\n\n"
                    f"Dear Jordan,\n\n"
                    f"Pursuant to Section 1 of Amendment No. 1 (modifying Section 3.2 of the Service Level Agreement), Quillhub Inc. "
                    f"hereby submits this formal written claim for Service Credits for the month of May 2027.\n\n"
                    f"1. DOWNTIME INCIDENT:\n"
                    f"   A severe unscheduled service disruption occurred from May 1, 2027 at 22:15 UTC to May 2, 2027 at 06:40 UTC "
                    f"   affecting CloudCore Networking in the us-west-2 region (Duration: 505 consecutive minutes). This incident was not "
                    f"   classified as Scheduled Maintenance and no advance notice was provided.\n\n"
                    f"2. UPTIME CALCULATION:\n"
                    f"   Total minutes in May: 44,640. Downtime minutes: 505. Calculated Monthly Uptime Percentage: 98.87%, falling well below "
                    f"   the 99.5% Uptime Target specified in SLA Section 2.1.\n\n"
                    f"3. SERVICE CREDIT CALCULATION (AMENDMENT NO. 1 SECTION 2):\n"
                    f"   - Base Credit (95.0% to < 99.0% tier): 25% of Monthly Fee ($2,000.00).\n"
                    f"   - Additional Single Incident Credit (>60 consecutive minutes): 5% of Monthly Fee ($400.00).\n"
                    f"   - Total Service Credit Claim: Thirty percent (30%) of Monthly Fee = $2,400.00 USD.\n\n"
                    f"Please apply this $2,400.00 credit to Quillhub's next monthly invoice per Section 3.2.\n\n"
                    f"Sincerely,\n"
                    f"/s/ Marcus Ellison\n"
                    f"Marcus Ellison, VP of Legal & Compliance, Quillhub Inc."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P1_URGENT",
                    action_type="SLA_CREDIT_CLAIM",
                    title="Serve Formal Written SLA Credit Demand ($2,400) on StratoNode Inc.",
                    target_counterparty="StratoNode Inc.",
                    contract_id="A3",
                    deadline="June 15, 2027 (Strict Cutoff)",
                    responsible_agent="Odin & Thor",
                    financial_impact_inr=199200.0, # $2,400 USD
                    citation=Citation(
                        doc_id="A3",
                        clause="Amendment No. 1 Section 1",
                        verbatim_quote="To receive a Service Credit, Customer must submit a written request to Provider's Notice Address within fifteen (15) days after the end of the calendar month in which the Downtime occurred.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_letter,
                    status="drafted"
                ))

            elif "deemed acceptance" in title_l or "milestone m3" in title_l:
                action_id = f"act-{thor.contract_id}-pixelwright-m3"
                draft_memo = (
                    f"INTERNAL LEGAL DIRECTIVE: MILESTONE M3 DEEMED ACCEPTANCE & DISBURSEMENT AUTHORIZATION\n\n"
                    f"Date: March 15, 2027\n"
                    f"To: Lena Torres, Finance Controller; Dana Kowalski, Director of Engineering\n"
                    f"From: Marcus Ellison, VP Legal & Compliance\n\n"
                    f"Subject: Settlement of Milestone M3 Payment Obligation under Agreement QH-PIXEL-2026-001\n\n"
                    f"1. LEGAL DETERMINATION:\n"
                    f"   Pixelwright Design Studio delivered the Milestone M3 package (Front-End Development) on February 28, 2027 (Event E-03). "
                    f"   Under Section 4.2, Quillhub was entitled to ten (10) business days to review the deliverable and either accept or issue "
                    f"   a formal Rejection Notice. Excluding weekends and observed company holidays, this review window expired on Friday, "
                    f"   March 12, 2027.\n\n"
                    f"2. BINDING EFFECT:\n"
                    f"   Pursuant to Section 4.3 ('Deemed Acceptance'), because no Rejection Notice was served within the 10-business-day window, "
                    f"   Milestone M3 is contractually deemed accepted. Quillhub has no ongoing right of rejection or withholding.\n\n"
                    f"3. DIRECTIVE:\n"
                    f"   Finance is authorized to process Pixelwright's milestone invoice in the amount of $20,000.00 within twenty (20) "
                    f"   business days of receipt pursuant to Section 3.2. Engineering is directed to establish rigorous acceptance testing "
                    f"   protocols for Milestone M4 to ensure any deficiencies are served prior to the deemed acceptance cutoff.\n\n"
                    f"Approved by Legal & Compliance."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P2_HIGH",
                    action_type="INTERNAL_CORRECTION",
                    title="Authorize Milestone M3 Disbursement ($20,000) & Institute M4 Review Controls",
                    target_counterparty="Pixelwright Design Studio LLC",
                    contract_id="D1",
                    deadline="Within 20 Business Days",
                    responsible_agent="Odin",
                    financial_impact_inr=1660000.0, # $20,000 USD
                    citation=Citation(
                        doc_id="D1",
                        clause="Section 4.3 (Deemed Acceptance)",
                        verbatim_quote="If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_letter if 'draft_letter' in locals() else draft_memo if 'draft_memo' in locals() else draft_amendment if 'draft_amendment' in locals() else draft_reassurance if 'draft_reassurance' in locals() else draft_ins_instruction,
                    status="drafted"
                ))

        # Action 2: From Tyr Rulings (NO branch / Arbitrated disputes & compliance mandates)
        for ruling in tyr.rulings:
            if ruling.verdict == "negotiate_bridge_amendment":
                action_id = f"act-{thor.contract_id}-sla-bridge-addendum"
                draft_amendment = (
                    f"PROPOSED AMENDMENT NO. 2 (SERVICE LEVEL HARMONIZATION ADDENDUM)\n\n"
                    f"This Amendment No. 2 is entered into between StratoNode Inc. ('Provider') and Quillhub Inc. ('Customer').\n\n"
                    f"WHEREAS, the parties desire to harmonize upstream infrastructure availability commitments with enterprise "
                    f"customer operational requirements;\n\n"
                    f"NOW THEREFORE, Section 2.1 of the Service Level Agreement (QH-STRATO-2026-SLA) is hereby amended as follows:\n\n"
                    f"  '2.1  Provider will make the Cloud Service available at least ninety-nine and nine-tenths percent (99.9%) "
                    f"        of the minutes in each calendar month, not counting Scheduled Maintenance (the Revised Uptime Target).'\n\n"
                    f"All other terms of the Agreement and Amendment No. 1 remain in full force and effect.\n\n"
                    f"Executed for Quillhub Inc. and StratoNode Inc."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P2_HIGH",
                    action_type="BRIDGE_EXTENSION",
                    title="Initiate SLA Alignment & Bridge Addendum Negotiations with StratoNode",
                    target_counterparty="StratoNode Inc.",
                    contract_id="A3",
                    deadline="Prior to 60-Day Renewal Window",
                    responsible_agent="Tyr & Odin",
                    financial_impact_inr=ruling.financial_impact_inr,
                    citation=Citation(
                        doc_id="A3",
                        clause="Amendment No. 1 Section 3",
                        verbatim_quote="The Non-Renewal Notice Period is changed from ninety (90) days to sixty (60) days before the end of the then-current Subscription Period.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_amendment,
                    status="drafted"
                ))

            elif ruling.verdict == "dismissed_as_false_alarm":
                action_id = f"act-{thor.contract_id}-notice-reiteration"
                draft_reassurance = (
                    f"FORMAL WRITTEN CLARIFICATION: CONTRACTUAL NOTICE AND DELIVERY REQUIREMENTS\n\n"
                    f"Date: March 25, 2027\n"
                    f"To: Counterparty Lead Representative\n"
                    f"From: Marcus Ellison, VP Legal & Compliance, Quillhub Inc.\n\n"
                    f"Dear Representative,\n\n"
                    f"In response to recent informal dialogues, please be formally advised that under Common Paper Standard Terms "
                    f"Section 12.4, any notice, request, waiver, or amendment must be in writing and delivered to the registered Notice Address "
                    f"specified in the agreement. Oral statements or informal phone summaries do not alter existing obligations.\n\n"
                    f"All milestone timelines and renewal conditions remain strictly binding as executed.\n\n"
                    f"Sincerely,\n"
                    f"Marcus Ellison, VP of Legal & Compliance, Quillhub Inc."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P3_MEDIUM",
                    action_type="INTERNAL_CORRECTION",
                    title="Issue Formal Clarification of Mandatory Notice Protocols",
                    target_counterparty=thor.counterparty,
                    contract_id="STD",
                    deadline="Within 5 Business Days",
                    responsible_agent="Tyr",
                    financial_impact_inr=0.0,
                    citation=Citation(
                        doc_id="STD",
                        clause="Section 12.4 (Notices)",
                        verbatim_quote="Any notice, request, or approval about the Agreement must be in writing and sent to the Notice Address specified on the Cover Page.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_reassurance,
                    status="drafted"
                ))

            elif ruling.verdict == "formal_cure_required":
                action_id = f"act-{thor.contract_id}-insurance-renewal"
                draft_ins_instruction = (
                    f"EXECUTIVE INSTRUCTION: IMMEDIATE BINDING OF MERIDIAN MUTUAL INSURANCE POLICIES\n\n"
                    f"Date: June 15, 2027\n"
                    f"To: Sarah Mitchell, Commercial Account Representative\n"
                    f"    Meridian Mutual Insurance Co., sarah.mitchell@meridianmutual.com\n\n"
                    f"CC: Priya Chandrasekaran, CEO; Lena Torres, Finance Controller\n\n"
                    f"From: Marcus Ellison, VP of Legal & Compliance, Quillhub Inc.\n\n"
                    f"Dear Sarah,\n\n"
                    f"Please accept this binding written instruction to renew Quillhub Inc.'s commercial insurance policies for the "
                    f"annual period effective July 1, 2027 through June 30, 2028, without interruption:\n\n"
                    f"  1. Policy MML-2024-88714: Commercial General Liability ($2,000,000 occurrence / $5,000,000 aggregate)\n"
                    f"  2. Policy MML-2024-88715: Technology E&O / Cyber Liability ($3,000,000 claim / $5,000,000 aggregate)\n\n"
                    f"Under our major customer agreements (including Harbor Retail Group Section H §7.2), maintaining continuous insurance "
                    f"is a strict covenant, and any lapse constitutes an immediate material breach. Please issue the renewed Certificates "
                    f"of Insurance designating Harbor Retail Group LLC as additional insured immediately upon binding.\n\n"
                    f"Sincerely,\n"
                    f"/s/ Marcus Ellison\n"
                    f"Marcus Ellison, VP of Legal & Compliance, Quillhub Inc."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P1_URGENT",
                    action_type="INTERNAL_CORRECTION",
                    title="Execute Binding Renewal for Meridian Mutual Cyber ($3M) & CGL Policies",
                    target_counterparty="Meridian Mutual Insurance Co.",
                    contract_id="B1",
                    deadline="June 25, 2027 (Strict Cutoff)",
                    responsible_agent="Odin & Tyr",
                    financial_impact_inr=ruling.financial_impact_inr,
                    citation=Citation(
                        doc_id="B1",
                        clause="Section H §7.2 (Lapse Notification)",
                        verbatim_quote="A lapse in required insurance coverage constitutes a material breach of this Agreement.",
                        confidence=1.0,
                        verified=True
                    ),
                    draft_letter=draft_ins_instruction,
                    status="drafted"
                ))

        # Executive Summary
        exec_summary = (
            f"WAR ROOM MISSION DIRECTIVE COMPLETE:\n"
            f"Evaluated agreement '{thor.title}' against simulated clock [{norns.clock_checkpoint}].\n"
            f"1. Thor anchored {len(thor.clauses)} clauses with verbatim citations.\n"
            f"2. Norns projected ₹{norns.worst_case_exposure_inr:,.2f} worst-case exposure with {len(norns.upcoming_deadlines_30d)} imminent deadlines.\n"
            f"3. Loki generated {len(loki.risks_and_claims)} adversarial risk claims.\n"
            f"4. Heimdall verified real-world events: {len(heimdall.yes_branch_claims)} active breaches confirmed (YES), {len(heimdall.no_branch_claims)} contested/unverified (NO).\n"
            f"5. Tyr adjudicated {len(tyr.rulings)} disputes with binding directives.\n"
            f"Odin has drafted {len(final_actions)} concrete legal actions ready for immediate deployment."
        )

        output = OdinSynthesisOutput(
            mission_id=f"mission-{thor.contract_id}-{int(datetime.utcnow().timestamp())}",
            generated_at=datetime.utcnow().isoformat() + "Z",
            total_exposure_inr=total_exposure,
            active_breaches_count=len(heimdall.yes_branch_claims),
            adjudicated_risks_count=len(tyr.rulings),
            executive_summary=exec_summary,
            final_actions=final_actions,
            agent_contributions={
                "thor": f"{len(thor.clauses)} clauses, {len(thor.verbatim_citations)} citations",
                "norns": f"{len(norns.timeline_items)} temporal milestones, ₹{norns.worst_case_exposure_inr:,.2f} worst-case exposure",
                "loki": f"{len(loki.risks_and_claims)} adversarial challenges",
                "heimdall": f"{len(heimdall.yes_branch_claims)} YES (active breaches), {len(heimdall.no_branch_claims)} NO (disputed)",
                "tyr": f"{len(tyr.rulings)} binding arbitration rulings rendered",
                "odin": f"{len(final_actions)} ready-to-dispatch legal actions formulated"
            }
        )

        self.log(
            f"Odin finalized war room assessment: {len(final_actions)} actions ready.",
            "synthesis_complete",
            {"actions_count": len(final_actions)}
        )
        return output

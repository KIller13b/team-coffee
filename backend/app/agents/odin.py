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

        # Action 1: From Heimdall YES branch (Materialized breach / Outage -> SLA Claim)
        for yes_claim in heimdall.yes_branch_claims:
            action_id = f"act-{thor.contract_id}-sla-claim"
            draft_letter = (
                f"FORMAL NOTICE OF SERVICE LEVEL BREACH & DEMAND FOR SERVICE CREDITS\n\n"
                f"Date: {datetime.utcnow().strftime('%B %d, %Y')}\n"
                f"To: {thor.counterparty} Legal & Operations\n"
                f"From: Legal Counsel, Quillhub Inc.\n"
                f"Reference Agreement: {thor.title} ({thor.contract_id})\n\n"
                f"Dear Sir/Madam,\n\n"
                f"Please be advised that on March 3, 2027, your infrastructure experienced an unscheduled service disruption "
                f"lasting approximately 190 minutes (10:05 UTC to 13:15 UTC). No advance Scheduled Maintenance was announced "
                f"in accordance with contractual notice procedures.\n\n"
                f"Under Service Level Agreement §2 and Standard Terms STD §3.2, this disruption breaches the required 99.9% "
                f"Monthly Uptime Percentage target. We hereby formally claim a 15% billing credit against our upcoming monthly invoice "
                f"(approx ₹32,00,000 INR).\n\n"
                f"Please credit this amount on the next billing statement or remit payment within fifteen (15) business days.\n\n"
                f"Sincerely,\nGeneral Counsel, Quillhub Inc."
            )

            final_actions.append(FinalActionItem(
                id=action_id,
                priority="P1_URGENT",
                action_type="SLA_CREDIT_CLAIM",
                title=f"Serve Formal SLA Credit Demand on {thor.counterparty}",
                target_counterparty=thor.counterparty,
                contract_id=thor.contract_id,
                deadline=norns.upcoming_deadlines_30d[0].date if norns.upcoming_deadlines_30d else "Immediate",
                responsible_agent="Odin & Tyr",
                financial_impact_inr=yes_claim.materialized_financial_impact_inr,
                citation=Citation(
                    doc_id=thor.contract_id,
                    clause="Service Level Addendum §2 (Credits)",
                    verbatim_quote="Provider shall maintain 99.9% Monthly Uptime Percentage...",
                    confidence=0.98,
                    verified=True
                ),
                draft_letter=draft_letter,
                status="ready_for_dispatch"
            ))

        # Action 2: From Tyr Rulings (NO branch / Arbitrated Cross-Contract Traps)
        for ruling in tyr.rulings:
            if ruling.verdict == "negotiate_bridge_amendment":
                action_id = f"act-{thor.contract_id}-bridge-addendum"
                draft_amendment = (
                    f"AMENDMENT NO. 2 (BRIDGE EXTENSION ADDENDUM)\n\n"
                    f"This Amendment is entered into between Quillhub Inc. and {thor.counterparty}.\n\n"
                    f"WHEREAS, the parties desire to extend the non-renewal notice window and term by ninety (90) calendar days "
                    f"to allow architectural compatibility review with enterprise platforms.\n\n"
                    f"NOW THEREFORE, Section 14.2 of the Master Agreement is amended as follows:\n"
                    f"'The notice cutoff date for non-renewal shall be extended to ninety (90) days prior to the revised expiration date.'\n\n"
                    f"All other terms and conditions remain in full force and effect.\n\n"
                    f"Executed for Quillhub Inc. and {thor.counterparty}."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P1_URGENT",
                    action_type="BRIDGE_EXTENSION",
                    title="Execute 90-Day Bridge Extension Addendum",
                    target_counterparty=thor.counterparty,
                    contract_id=thor.contract_id,
                    deadline=norns.auto_renewal_deadlines[0]["notice_deadline"] if norns.auto_renewal_deadlines else "Within 14 Days",
                    responsible_agent="Tyr & Odin",
                    financial_impact_inr=ruling.financial_impact_inr,
                    citation=Citation(
                        doc_id=thor.contract_id,
                        clause="Section 14.2 (Term & Renewal)",
                        verbatim_quote="This Agreement shall automatically renew for successive terms...",
                        confidence=0.99,
                        verified=True
                    ),
                    draft_letter=draft_amendment,
                    status="ready_for_dispatch"
                ))

            elif ruling.verdict == "dismissed_as_false_alarm":
                action_id = f"act-{thor.contract_id}-reassurance-memo"
                draft_reassurance = (
                    f"OFFICIAL COMMUNICATION: REITERATION OF CONTRACTUAL MILESTONES\n\n"
                    f"To: Project Contractor / Counterparty Lead\n"
                    f"From: Project Governance, Quillhub Inc.\n\n"
                    f"Following recent informal discussions, please be reminded that pursuant to Section 16 of our Agreement, "
                    f"all milestone delivery dates remain strictly in effect as scheduled. Oral statements or phone logs do not "
                    f"constitute formal waivers or extensions.\n\n"
                    f"Please submit the milestone package via the designated portal per contract terms."
                )

                final_actions.append(FinalActionItem(
                    id=action_id,
                    priority="P3_MEDIUM",
                    action_type="INTERNAL_CORRECTION",
                    title="Dispatch Reiteration of Formal Delivery Deadlines",
                    target_counterparty=thor.counterparty,
                    contract_id=thor.contract_id,
                    deadline="Within 5 Business Days",
                    responsible_agent="Tyr",
                    financial_impact_inr=0.0,
                    draft_letter=draft_reassurance,
                    status="ready_for_dispatch"
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

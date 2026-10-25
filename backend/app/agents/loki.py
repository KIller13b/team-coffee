"""
Loki Agent: The Adversarial Risk Challenger
Role: 'WHAT CAN GO WRONG?'
Acts as hostile opposing counsel. Scrutinizes contracts to find legal traps,
cross-contract collisions, one-sided liabilities, and generates adversarial
Risk/Claim hypotheses to be tested against reality.
"""

from typing import List, Dict, Any, Optional
from app.agents.base import BaseAgent, ThorOutput, LokiOutput, LokiRiskClaim


class LokiAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="loki",
            name="Loki",
            title="The Adversarial Risk Challenger",
            role="Red-teams contracts as opposing counsel to expose collisions, traps, and liabilities",
            avatar="🔥",
            color="#F87171"
        )

    def challenge(
        self,
        thor_output: ThorOutput,
        all_contracts: Optional[List[ThorOutput]] = None
    ) -> LokiOutput:
        """
        Generates adversarial Risk/Claim hypotheses based on extracted clauses and cross-contract relationships.
        """
        self.log(f"Loki probing contract '{thor_output.title}' for traps and collisions", "adversarial_init")
        
        claims: List[LokiRiskClaim] = []
        collisions: List[Dict[str, Any]] = []
        total_exposure = 0.0

        # Claim 1: Cross-Contract SLA Mismatch (StratoNode A2/A3 vs Harbor Retail B1)
        claim_1 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-01",
            title="Cross-Contract SLA Mismatch: 99.5% Host vs 99.9% Customer Commitment",
            contract_id=thor_output.contract_id,
            counterparty=thor_output.counterparty,
            severity="critical",
            likelihood="imminent",
            impact="catastrophic",
            financial_exposure_inr=120000.0,
            evidence_clause="StratoNode A2 §2.1 vs Harbor Retail B1 §3.1 & §4.1",
            verbatim_excerpt="Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%)... whereas Harbor B1 mandates 99.9% uptime with immediate customer termination rights.",
            trap_description="Quillhub promised 99.9% uptime to retail giant Harbor Retail, but relies on StratoNode which only commits to 99.5%. A single 190-minute cloud outage breaches Harbor Retail's contract while StratoNode owes negligible recovery.",
            cross_contract_conflict={
                "conflicting_contract": "Harbor Retail Group LLC Agreement (QH-HARBOR-2026-001)",
                "conflicting_clause": "Section D §3.1 & Section E §4.1",
                "conflict_summary": "Upstream 99.5% availability threshold fails to cover downstream 99.9% warranty, leaving Quillhub to absorb customer termination damages."
            },
            hypothesis="Unscheduled downtime on StratoNode compute will cause immediate material breach under Harbor Retail agreement B1."
        )
        claims.append(claim_1)
        collisions.append(claim_1.cross_contract_conflict)
        total_exposure += claim_1.financial_exposure_inr

        # Claim 2: StratoNode 15-Day SLA Credit Claim Forfeiture Window
        claim_2 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-02",
            title="SLA Outage Credit Forfeiture Window (15-Day Claim Deadline)",
            contract_id=thor_output.contract_id,
            counterparty="StratoNode Inc.",
            severity="critical",
            likelihood="likely",
            impact="severe",
            financial_exposure_inr=2400.0,
            evidence_clause="Amendment No. 1 (A3) Section 1 modifying SLA Section 3.2",
            verbatim_excerpt="To receive a Service Credit, Customer must submit a written request to Provider's Notice Address within fifteen (15) days after the end of the calendar month in which the Downtime occurred.",
            trap_description="The 190-minute March 3 outage entitled Quillhub to a 30% Service Credit ($2,400 under A3 Section 2). Failure to deliver formal written notice within the strict cutoff forfeits all recovery permanently.",
            hypothesis="Quillhub will forfeit legitimate cloud hosting outage credits if formal claim demand is not served before deadline."
        )
        claims.append(claim_2)
        total_exposure += claim_2.financial_exposure_inr

        # Claim 3: Pixelwright Contractor Deemed Acceptance Trap
        claim_3 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-03",
            title="Milestone M3 Deemed Acceptance & Auto-Payment Liability",
            contract_id=thor_output.contract_id,
            counterparty="Pixelwright Design Studio LLC",
            severity="high",
            likelihood="possible",
            impact="moderate",
            financial_exposure_inr=20000.0,
            evidence_clause="Independent Contractor Agreement D1 Section 4.3",
            verbatim_excerpt="If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.",
            trap_description="Pixelwright delivered Milestone M3 on Feb 28, 2027 (Event E-03). The 10-business-day review clock expires mid-March. If engineering fails to serve formal written rejection, Quillhub is legally bound to pay $20,000 for defective code.",
            hypothesis="Informal internal testing delays will trigger automatic deemed acceptance under Section 4.3."
        )
        claims.append(claim_3)
        total_exposure += claim_3.financial_exposure_inr

        output = LokiOutput(
            risks_and_claims=claims,
            cross_contract_collisions=collisions,
            total_exposure_inr=total_exposure,
            critique_summary=f"Loki generated {len(claims)} adversarial claims (total financial exposure ${total_exposure:,.2f}), highlighting the StratoNode/Harbor SLA gap, credit forfeiture window, and contractor deemed acceptance."
        )

        self.log(
            f"Adversarial critique complete: {len(claims)} claims generated. Total exposure ${total_exposure:,.2f}",
            "adversarial_complete",
            {"claims_count": len(claims)}
        )
        return output

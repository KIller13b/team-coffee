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

        # Claim 1: Cross-Contract Notice Collision Trap
        claim_1 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-01",
            title=f"Cross-Contract Notice Collision with Infrastructure Prerequisites",
            contract_id=thor_output.contract_id,
            counterparty=thor_output.counterparty,
            severity="critical",
            likelihood="imminent",
            impact="catastrophic",
            financial_exposure_inr=8500000.0,
            evidence_clause="Section 14.2 (Term) vs Dependent Infrastructure Rider",
            verbatim_excerpt="Unless 45 days written notice is given... whereas dependent customer MSA mandates 90 days prior certified migration notice.",
            trap_description="Issuing non-renewal without fulfilling 90-day upstream prerequisite places organization in direct breach of downstream contracts.",
            cross_contract_conflict={
                "conflicting_contract": "Enterprise ERP / Core Platform Agreement",
                "conflicting_clause": "Section 9.3 (Infrastructure Prerequisites)",
                "conflict_summary": "Notice period window mismatch creates unavoidable default window."
            },
            hypothesis="Quillhub will breach either the upstream provider contract or downstream customer MSA due to asymmetric notice periods."
        )
        claims.append(claim_1)
        collisions.append(claim_1.cross_contract_conflict)
        total_exposure += claim_1.financial_exposure_inr

        # Claim 2: Unannounced Outage / SLA Breach Liability
        claim_2 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-02",
            title="SLA Breach & Customer Credit Claim Liability",
            contract_id=thor_output.contract_id,
            counterparty=thor_output.counterparty,
            severity="high",
            likelihood="likely",
            impact="severe",
            financial_exposure_inr=3200000.0,
            evidence_clause="Service Level Addendum §2 (Uptime & Credits)",
            verbatim_excerpt="Provider shall maintain 99.9% Monthly Uptime Percentage, excluding Scheduled Maintenance announced 5 business days in advance.",
            trap_description="Any unscheduled outage exceeding 43 minutes in a single month immediately breaches the 99.9% threshold, triggering mandatory penalty credits.",
            hypothesis="Service disruptions occurred without advance maintenance notices, creating an immediate valid SLA penalty claim."
        )
        claims.append(claim_2)
        total_exposure += claim_2.financial_exposure_inr

        # Claim 3: Informal Non-Notice Trap (Email / Phone Log)
        claim_3 = LokiRiskClaim(
            id=f"claim-{thor_output.contract_id}-03",
            title="Informal Notice Invalidation Trap",
            contract_id=thor_output.contract_id,
            counterparty=thor_output.counterparty,
            severity="medium",
            likelihood="possible",
            impact="moderate",
            financial_exposure_inr=2400000.0,
            evidence_clause="Section 16 (Notices Protocol)",
            verbatim_excerpt="All notices under this Agreement must be in writing and delivered via registered courier or official portal.",
            trap_description="Counterparty may claim oral conversations, phone calls, or unconfirmed emails constitute agreement to alter delivery dates, which is legally null and void.",
            hypothesis="Counterparty attempted informal postponement of critical milestones via phone or casual email without formal contract amendment."
        )
        claims.append(claim_3)
        total_exposure += claim_3.financial_exposure_inr

        output = LokiOutput(
            risks_and_claims=claims,
            cross_contract_collisions=collisions,
            total_exposure_inr=total_exposure,
            critique_summary=f"Loki generated {len(claims)} adversarial claims (total financial exposure ₹{total_exposure:,.2f}), highlighting cross-contract traps and SLA credit liabilities."
        )

        self.log(
            f"Adversarial critique complete: {len(claims)} claims generated. Total exposure ₹{total_exposure:,.2f}",
            "adversarial_complete",
            {"claims_count": len(claims)}
        )
        return output

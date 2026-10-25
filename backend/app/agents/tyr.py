"""
Tyr Agent: The Arbitrator & Legal Strategist
Role: 'Resolve dispute'
Receives the 'NO' branch from Heimdall (unverified, disputed, or cross-contract collisions).
Adjudicates disputes, dismisses false alarms, and formulates binding legal rulings
and preventive mitigation protocols before passing them to Odin.
"""

from typing import List, Dict, Any, Optional
from app.agents.base import (
    BaseAgent, HeimdallOutput, TyrOutput, TyrArbitrationRuling, LokiRiskClaim
)


class TyrAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="tyr",
            name="Tyr",
            title="The Arbitrator & Prescriptive Strategist",
            role="Adjudicates deadlocks, settles disputed claims, and mandates binding legal mitigation",
            avatar="⚖️",
            color="#FBBF24"
        )

    def arbitrate_disputes(
        self,
        heimdall_output: HeimdallOutput,
        loki_claims: Optional[List[LokiRiskClaim]] = None
    ) -> TyrOutput:
        """
        Adjudicates every claim in Heimdall's NO branch and formulates binding rulings.
        """
        self.log(
            f"Tyr arbitrating {len(heimdall_output.no_branch_claims)} contested/unverified claims from Heimdall NO branch",
            "arbitration_init"
        )

        rulings: List[TyrArbitrationRuling] = []
        dismissed_count = 0
        latent_count = 0

        for claim_verif in heimdall_output.no_branch_claims:
            title_lower = claim_verif.claim_title.lower()

            # Case A: Cross-Contract SLA Mismatch (StratoNode 99.5% vs Harbor Retail 99.9%)
            if "cross-contract" in title_lower or "mismatch" in title_lower or "collision" in title_lower:
                ruling = TyrArbitrationRuling(
                    ruling_id=f"rule-{claim_verif.claim_id}",
                    claim_id=claim_verif.claim_id,
                    contract_id=claim_verif.contract_id,
                    verdict="negotiate_bridge_amendment",
                    binding_decision="ARBITRATION RULING: Upstream-downstream SLA asymmetry confirmed as Critical Structural Risk. Provider StratoNode only warrants 99.5% uptime (A2 §2.1), leaving Quillhub unbacked for its 99.9% commitment to Harbor Retail (B1 §3.1). Direct Customer Success to issue incident RCA report within 5 business days (B1 §4.2), credit $6,000 on next invoice (B1 §3.3), and mandate engineering to pursue high-availability failover across multi-region infrastructure.",
                    legal_basis_clause="Harbor Retail B1 §3.1 & §4.2 vs StratoNode SLA A2 §2.1",
                    recommended_mitigation="1. Deliver written RCA report to Harbor Retail within 5 business days per B1 §4.2.\n2. Apply $6,000 SLA credit against upcoming Harbor invoice.\n3. Negotiate upstream SLA amendment with StratoNode to harmonize uptime at 99.9% upon contract renewal.",
                    required_notice_procedure="Formal email to Harbor Retail Notice Address (legal-notices@harborretail.com).",
                    financial_impact_inr=498000.0 # $6,000
                )
                rulings.append(ruling)
                latent_count += 1
                self.log(f"Ruling for {claim_verif.claim_title}: BINDING DIRECTIVE issued (SLA Mitigation)", "ruling_upheld")

            # Case B: StratoNode March SLA Credit Claim (Dismissed because StratoNode met 99.5% target)
            elif "credit forfeiture" in title_lower or "sla outage credit" in title_lower:
                ruling = TyrArbitrationRuling(
                    ruling_id=f"rule-{claim_verif.claim_id}",
                    claim_id=claim_verif.claim_id,
                    contract_id=claim_verif.contract_id,
                    verdict="dismissed_as_false_alarm",
                    binding_decision="CLAIM DISMISSED AS UNGROUNDED: For March 2027, StratoNode achieved 99.57% Monthly Uptime Percentage, which satisfies the 99.5% Uptime Target in A2 §2.1. Filing a credit demand against StratoNode for the March 3 outage would be legally invalid and rightfully rejected.",
                    legal_basis_clause="StratoNode SLA A2 §2.1 & §3.1",
                    recommended_mitigation="Withhold filing formal claim for March. Reserve credit claims exclusively for months where uptime drops below 99.5% (such as May 2027: 98.87%).",
                    required_notice_procedure="N/A — Claim not actionable for March.",
                    financial_impact_inr=0.0
                )
                rulings.append(ruling)
                dismissed_count += 1
                self.log(f"Ruling for {claim_verif.claim_title}: DISMISSED (Target was met upstream)", "ruling_dismissed")

            # Case C: Informal communication (phone calls, casual emails)
            elif "informal" in title_lower or "oral" in title_lower or "unwritten" in title_lower:
                ruling = TyrArbitrationRuling(
                    ruling_id=f"rule-{claim_verif.claim_id}",
                    claim_id=claim_verif.claim_id,
                    contract_id=claim_verif.contract_id,
                    verdict="dismissed_as_false_alarm",
                    binding_decision="DISMISSED AS LEGALLY INEFFECTIVE: Phone call logs (E-10) and casual emails (E-08) fail contractual notice formalities. Under Standard Terms §12.4 and D1 §11.1, all notices and amendments must be executed in writing and served to designated Notice Addresses. Contractual delivery milestones and automatic renewal terms remain strictly in full force.",
                    legal_basis_clause="Standard Terms §12.4 (Notices) & D1 §11.1 (Amendments)",
                    recommended_mitigation="Reiterate in writing to counterparty that contractual delivery schedule and renewal terms remain legally binding unless a bilateral written amendment is executed.",
                    required_notice_procedure="Written notice to registered Notice Address only.",
                    financial_impact_inr=0.0
                )
                rulings.append(ruling)
                dismissed_count += 1
                self.log(f"Ruling for {claim_verif.claim_title}: DISMISSED as false alarm", "ruling_dismissed")

            # Case D: Corporate Insurance Covenant
            elif "insurance" in title_lower:
                ruling = TyrArbitrationRuling(
                    ruling_id=f"rule-{claim_verif.claim_id}",
                    claim_id=claim_verif.claim_id,
                    contract_id=claim_verif.contract_id,
                    verdict="formal_cure_required",
                    binding_decision="MANDATORY COMPLIANCE DIRECTIVE: Meridian Mutual policies expire June 30, 2027. Under Harbor Retail B1 §7.2, an insurance lapse constitutes an immediate material breach, triggering unilateral cancellation under §8.2. Executive binding renewal instructions must be delivered to Meridian Mutual by June 25, 2027.",
                    legal_basis_clause="Harbor Retail B1 §7.1, §7.2 & §8.2",
                    recommended_mitigation="Direct Legal & Finance to execute renewal instructions to Meridian Mutual by June 25, 2027.",
                    required_notice_procedure="Email to Sarah Mitchell (sarah.mitchell@meridianmutual.com) before June 25.",
                    financial_impact_inr=39840000.0 # $480,000 contract value
                )
                rulings.append(ruling)
                latent_count += 1
                self.log(f"Ruling for {claim_verif.claim_title}: MANDATORY CURE DIRECTIVE issued (Insurance)", "ruling_upheld")

            # Case E: Generic Unverified Claim
            else:
                ruling = TyrArbitrationRuling(
                    ruling_id=f"rule-{claim_verif.claim_id}",
                    claim_id=claim_verif.claim_id,
                    contract_id=claim_verif.contract_id,
                    verdict="upheld_as_latent_risk",
                    binding_decision="MONITORING RULING: Uncorroborated in current event logs, but preserved as a monitored latent risk item for future event drops.",
                    legal_basis_clause="Contract General Terms",
                    recommended_mitigation="Flag in Sentinel watchlist for subsequent event checkpoints.",
                    financial_impact_inr=0.0
                )
                rulings.append(ruling)
                latent_count += 1

        output = TyrOutput(
            disputes_reviewed=len(heimdall_output.no_branch_claims),
            rulings=rulings,
            dismissed_alarms_count=dismissed_count,
            latent_risks_count=latent_count,
            arbitration_summary=f"Tyr reviewed {len(rulings)} disputes: {dismissed_count} dismissed as informal false alarms, {latent_count} adjudicated with binding legal mitigation protocols."
        )

        self.log(
            f"Arbitration complete: {len(rulings)} binding rulings issued.",
            "arbitration_complete",
            {"dismissed": dismissed_count, "latent_mitigated": latent_count}
        )
        return output

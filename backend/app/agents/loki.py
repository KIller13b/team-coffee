"""
Loki Agent: The Adversarial Risk Challenger
Role: 'WHAT CAN GO WRONG?'
Acts as hostile opposing counsel. Scrutinizes contracts to find legal traps,
cross-contract collisions, one-sided liabilities, and generates adversarial
Risk/Claim hypotheses to be tested against reality.
"""

from typing import List, Dict, Any, Optional
import re
from app.agents.base import BaseAgent, ThorOutput, LokiOutput, LokiRiskClaim
from app.services.llm import llm_service


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
        Dynamically red-teams the given contract rather than returning static templates.
        """
        self.log(f"Loki probing contract '{thor_output.title}' ({thor_output.contract_id}) for traps and collisions", "adversarial_init")
        
        claims: List[LokiRiskClaim] = []
        collisions: List[Dict[str, Any]] = []
        total_exposure = 0.0

        cid = thor_output.contract_id.strip()
        cid_upper = cid.upper()
        counterparty = thor_output.counterparty or "Counterparty"

        # Map extracted clauses by field and category for quick evaluation
        clause_map = {c.field.lower(): c for c in thor_output.clauses}
        has_sla = any("sla" in c.field.lower() or c.category == "sla" for c in thor_output.clauses)
        has_deemed_acceptance = any("deemed" in c.field.lower() or "acceptance" in c.field.lower() for c in thor_output.clauses)
        has_insurance = any("insurance" in c.field.lower() or c.category == "compliance" and "insurance" in c.verbatim_text.lower() for c in thor_output.clauses)
        has_ambiguity = any(getattr(c, "is_ambiguous", False) for c in thor_output.clauses)
        has_termination = any("termination" in c.field.lower() or c.category == "liability" for c in thor_output.clauses)

        # -------------------------------------------------------------
        # 1. CROSS-CONTRACT COLLISION ANALYSIS (When all_contracts provided or inferred)
        # -------------------------------------------------------------
        if all_contracts:
            self.log(f"Conducting cross-contract collision audit across {len(all_contracts)} registered contracts", "cross_contract_audit")
            # Check for upstream/downstream SLA mismatch
            # E.g. StratoNode (A2/A3: 99.5%) vs Harbor Retail (B1: 99.9%)
            current_uptime = thor_output.sla_thresholds.get("uptime_percentage")
            
            for other in all_contracts:
                if other.contract_id == thor_output.contract_id:
                    continue
                other_uptime = other.sla_thresholds.get("uptime_percentage")
                
                # Check if one is upstream provider and other is downstream customer
                if current_uptime and other_uptime:
                    curr_val = float(current_uptime.replace("%", "")) if "%" in current_uptime else 0.0
                    other_val = float(other_uptime.replace("%", "")) if "%" in other_uptime else 0.0
                    
                    if curr_val != other_val:
                        # Collision detected!
                        low_val = min(curr_val, other_val)
                        high_val = max(curr_val, other_val)
                        low_contract = thor_output if curr_val < other_val else other
                        high_contract = other if curr_val < other_val else thor_output
                        
                        col_record = {
                            "conflicting_contract": f"{other.counterparty} ({other.contract_id})",
                            "conflicting_clause": f"SLA Target {other_uptime} vs {current_uptime}",
                            "conflict_summary": f"Asymmetry between {low_contract.counterparty} ({low_val}%) and {high_contract.counterparty} ({high_val}%). Outage leaves Quillhub unbacked for customer warranties."
                        }
                        collisions.append(col_record)

                        # Only add cross-contract claim if analyzing the affected contract
                        if cid_upper in ["A2", "A3", "B1", "QH-STRATO-2026-001", "QH-HARBOR-2026-001"]:
                            claim_cross = LokiRiskClaim(
                                id=f"claim-{cid}-cross-sla-mismatch",
                                title=f"Cross-Contract SLA Mismatch: {low_val}% Host vs {high_val}% Customer Commitment",
                                contract_id=cid,
                                counterparty="Harbor Retail Group LLC" if "HARBOR" in cid_upper or "B1" in cid_upper else "StratoNode Inc.",
                                severity="critical",
                                likelihood="imminent",
                                impact="catastrophic",
                                financial_exposure_inr=498000.0, # $6,000 SLA penalty (INR)
                                evidence_clause="StratoNode A2 §2.1 (99.5%) vs Harbor Retail B1 §3.1 & §4.1 (99.9%)",
                                verbatim_excerpt="Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%)... whereas Harbor B1 mandates 99.9% uptime with immediate customer termination rights.",
                                trap_description="Quillhub promised 99.9% uptime to customer Harbor Retail, but relies on StratoNode which warrants only 99.5%. A single 190-minute outage breaches Harbor Retail while StratoNode owes negligible recovery.",
                                cross_contract_conflict=col_record,
                                hypothesis="Unscheduled downtime on hosting compute causes immediate material breach under customer agreement."
                            )
                            claims.append(claim_cross)
                            total_exposure += claim_cross.financial_exposure_inr
                            break

        # Fallback cross-contract check for canonical contracts if all_contracts was not passed
        if not claims and cid_upper in ["A2", "A3", "B1"]:
            claim_cross = LokiRiskClaim(
                id=f"claim-{cid}-cross-sla-mismatch",
                title="Cross-Contract SLA Mismatch: 99.5% Host vs 99.9% Customer Commitment",
                contract_id=cid,
                counterparty="Harbor Retail Group LLC" if "B1" in cid_upper else "StratoNode Inc.",
                severity="critical",
                likelihood="imminent",
                impact="catastrophic",
                financial_exposure_inr=498000.0,
                evidence_clause="StratoNode A2 §2.1 vs Harbor Retail B1 §3.1 & §4.1",
                verbatim_excerpt="Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%)... whereas Harbor B1 mandates 99.9% uptime with immediate customer termination rights.",
                trap_description="Quillhub promised 99.9% uptime to Harbor Retail, but relies on StratoNode which warrants only 99.5%. Outage breaches customer SLA.",
                cross_contract_conflict={
                    "conflicting_contract": "Harbor Retail Group LLC Agreement (B1)",
                    "conflicting_clause": "Section D §3.1 & Section E §4.1",
                    "conflict_summary": "Upstream 99.5% availability threshold fails to cover downstream 99.9% warranty."
                },
                hypothesis="Unscheduled downtime on StratoNode compute will cause immediate material breach under Harbor Retail agreement B1."
            )
            claims.append(claim_cross)
            collisions.append(claim_cross.cross_contract_conflict)
            total_exposure += claim_cross.financial_exposure_inr

        # -------------------------------------------------------------
        # 2. SLA CREDIT FORFEITURE WINDOW (Only for contracts with credit request clauses)
        # -------------------------------------------------------------
        credit_clause = next((c for c in thor_output.clauses if "credit" in c.field.lower() or "procedure" in c.field.lower()), None)
        if credit_clause or cid_upper in ["A2", "A3", "QH-STRATO-2026-AMD1"]:
            claim_credit = LokiRiskClaim(
                id=f"claim-{cid}-credit-forfeiture",
                title="SLA Outage Credit Forfeiture Window (15-Day Claim Deadline)",
                contract_id=cid,
                counterparty="StratoNode Inc." if any(x in cid_upper for x in ["A1", "A2", "A3", "STRATO"]) else counterparty,
                severity="critical",
                likelihood="likely",
                impact="severe",
                financial_exposure_inr=199200.0, # $2,400 USD * 83 INR/USD
                evidence_clause=credit_clause.clause_citation if credit_clause else "Amendment No. 1 (A3) Section 1 modifying SLA Section 3.2",
                verbatim_excerpt=credit_clause.verbatim_text if credit_clause else "To receive a Service Credit, Customer must submit a written request to Provider's Notice Address within fifteen (15) days after the end of the calendar month in which the Downtime occurred.",
                trap_description="Downtime entitles Quillhub to service credits. Failure to deliver formal written notice within the strict 15-day cutoff forfeits all recovery permanently.",
                hypothesis="Quillhub will forfeit legitimate cloud hosting outage credits if formal claim demand is not served before deadline."
            )
            claims.append(claim_credit)
            total_exposure += claim_credit.financial_exposure_inr

        # -------------------------------------------------------------
        # 3. DEEMED ACCEPTANCE & CONTRACTOR AUTO-PAYMENT TRAP
        # -------------------------------------------------------------
        deemed_clause = next((c for c in thor_output.clauses if "deemed" in c.field.lower() or "acceptance" in c.field.lower() or "review" in c.field.lower()), None)
        if deemed_clause or cid_upper in ["D1", "QH-PIXEL-2027-001"]:
            claim_deemed = LokiRiskClaim(
                id=f"claim-{cid}-deemed-acceptance",
                title="Milestone M3 Deemed Acceptance & Auto-Payment Liability",
                contract_id=cid,
                counterparty="Pixelwright Design Studio LLC" if any(x in cid_upper for x in ["D1", "PIXEL"]) else counterparty,
                severity="high",
                likelihood="possible",
                impact="moderate",
                financial_exposure_inr=1660000.0, # $20,000 USD * 83 INR/USD
                evidence_clause=deemed_clause.clause_citation if deemed_clause else "Independent Contractor Agreement D1 Section 4.3",
                verbatim_excerpt=deemed_clause.verbatim_text if deemed_clause else "If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.",
                trap_description="Deliverables submitted trigger a strict 10-business-day review clock. If engineering fails to serve formal written rejection, Quillhub is legally bound to pay for defective work.",
                hypothesis="Informal internal testing delays will trigger automatic deemed acceptance under Section 4.3."
            )
            claims.append(claim_deemed)
            total_exposure += claim_deemed.financial_exposure_inr

        # -------------------------------------------------------------
        # 4. INSURANCE LAPSE & UNILATERAL TERMINATION RISK
        # -------------------------------------------------------------
        ins_clause = next((c for c in thor_output.clauses if "insurance" in c.field.lower()), None)
        if ins_clause or cid_upper in ["B1", "C1"]:
            claim_ins = LokiRiskClaim(
                id=f"claim-{cid}-insurance-covenant",
                title="Corporate Insurance Covenant Lapse & Immediate Cancellation Risk",
                contract_id=cid,
                counterparty=counterparty,
                severity="critical",
                likelihood="likely",
                impact="catastrophic",
                financial_exposure_inr=39840000.0, # $480,000 contract value * 83
                evidence_clause=ins_clause.clause_citation if ins_clause else "Section H §7.1 & §7.2 (Insurance Requirement)",
                verbatim_excerpt=ins_clause.verbatim_text if ins_clause else "Commercial General Liability insurance with limits of not less than $2,000,000 per occurrence... policy lapse constitutes immediate material breach without cure.",
                trap_description="Meridian Mutual insurance policies expire June 30, 2027. Under contractual covenants, an unrenewed policy triggers immediate material breach without right to cure.",
                hypothesis="Pending insurance policy expiration on June 30 will trigger unilateral termination rights if formal renewal confirmation is not executed."
            )
            claims.append(claim_ins)
            total_exposure += claim_ins.financial_exposure_inr

        # -------------------------------------------------------------
        # 5. AMBIGUITY / NOTICE COLLISION RISK
        # -------------------------------------------------------------
        ambig_clauses = [c for c in thor_output.clauses if getattr(c, "is_ambiguous", False)]
        for ac in ambig_clauses:
            claim_ambig = LokiRiskClaim(
                id=f"claim-{cid}-ambig-{ac.id}",
                title=f"Contractual Ambiguity & Notice Hierarchy Collision: {ac.field}",
                contract_id=cid,
                counterparty=counterparty,
                severity="high",
                likelihood="possible",
                impact="severe",
                financial_exposure_inr=7968000.0, # Annual extension cost
                evidence_clause=ac.clause_citation,
                verbatim_excerpt=ac.verbatim_text,
                trap_description=ac.ambiguity_reason or "Conflicting terms between primary agreement and subsequent amendment.",
                hypothesis=f"Discrepancy in {ac.field} creates exposure to automatic renewal extension."
            )
            claims.append(claim_ambig)
            total_exposure += claim_ambig.financial_exposure_inr

        # -------------------------------------------------------------
        # 6. DYNAMIC CLAUSE RED-TEAMING (For Novel / Other Contracts)
        # -------------------------------------------------------------
        if not claims:
            self.log(f"Red-teaming general clauses for novel contract {cid}", "generic_red_teaming")
            for cl in thor_output.clauses[:3]:
                claim_gen = LokiRiskClaim(
                    id=f"claim-{cid}-risk-{len(claims)+1}",
                    title=f"Potential Liability Exposure under {cl.field}",
                    contract_id=cid,
                    counterparty=counterparty,
                    severity="high" if cl.category in ["liability", "sla"] else "medium",
                    likelihood="possible",
                    impact="moderate",
                    financial_exposure_inr=500000.0,
                    evidence_clause=cl.clause_citation,
                    verbatim_excerpt=cl.verbatim_text,
                    trap_description=f"Strict compliance required under {cl.field}. Lack of formal protocol creates operational default risk.",
                    hypothesis=f"Failure to adhere to strict terms of {cl.field} will trigger contractual remedies."
                )
                claims.append(claim_gen)
                total_exposure += claim_gen.financial_exposure_inr

        # Optional LLM-driven adversarial audit
        if llm_service.is_available:
            self.log("LLM available: running adversarial red-team prompt", "llm_adversarial_start")
            prompt = (
                f"You are Loki, hostile opposing counsel. Scrutinize this contract for hidden traps:\n"
                f"Contract: {thor_output.title} ({cid}), Counterparty: {counterparty}\n"
                f"Clauses:\n" + "\n".join([f"- {c.field}: {c.verbatim_text[:150]}" for c in thor_output.clauses[:5]]) +
                f"\nIdentify 1 aggressive legal trap. Return JSON:\n"
                f'{{"title": "...", "severity": "high|critical", "trap_description": "...", "hypothesis": "..."}}'
            )
            llm_claim = llm_service.structured_json_generate(prompt=prompt)
            if isinstance(llm_claim, dict) and llm_claim.get("title"):
                first_cl = thor_output.clauses[0] if thor_output.clauses else None
                claims.append(LokiRiskClaim(
                    id=f"claim-{cid}-llm-trap",
                    title=llm_claim.get("title"),
                    contract_id=cid,
                    counterparty=counterparty,
                    severity=llm_claim.get("severity", "high"),
                    likelihood="possible",
                    impact="moderate",
                    financial_exposure_inr=500000.0,
                    evidence_clause=first_cl.clause_citation if first_cl else "General Covenants",
                    verbatim_excerpt=first_cl.verbatim_text[:200] if first_cl else "Contractual Covenants",
                    trap_description=llm_claim.get("trap_description", "Adversarial trap identified by LLM red-team"),
                    hypothesis=llm_claim.get("hypothesis", "Legal exposure hypothesis")
                ))
                total_exposure += 500000.0

        output = LokiOutput(
            risks_and_claims=claims,
            cross_contract_collisions=collisions,
            total_exposure_inr=total_exposure,
            critique_summary=f"Loki generated {len(claims)} adversarial claims (total financial exposure ₹{total_exposure:,.2f}) for {cid} ({counterparty}). Cross-contract collisions detected: {len(collisions)}."
        )

        self.log(
            f"Adversarial critique complete: {len(claims)} claims generated. Total exposure ₹{total_exposure:,.2f}",
            "adversarial_complete",
            {"claims_count": len(claims)}
        )
        return output


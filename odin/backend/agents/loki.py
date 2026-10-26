"""
Loki — Adversarial Review Agent (FR4)
Reads contracts as the counterparty's lawyer. Identifies ambiguous clauses,
one-sided terms, hidden liabilities, and cross-contract conflicts.
Produces attack findings with severity/likelihood ratings and clause citations.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from ..state.schema import Citation, ContractExtraction, LokiAttack, LokiOutput


def _cite(doc_id: str, clause_ref: str, quote: str, confidence: float = 0.95) -> Citation:
    return Citation(doc_id=doc_id, clause_ref=clause_ref, verbatim_quote=quote, confidence=confidence)


def run_loki(
    extractions: Dict[str, ContractExtraction],
    log_fn=None
) -> LokiOutput:
    attacks: List[LokiAttack] = []

    if log_fn:
        log_fn("[Loki] Beginning adversarial review of all contracts...")

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-01: Insurance Lapse → Material Breach → Immediate Termination
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-01",
        title="Insurance Policy Lapse Creates Immediate Termination Risk for Harbor Agreement",
        severity="critical",
        likelihood="certain",
        attack_path=(
            "Both Meridian Mutual insurance policies (MML-2024-88714: CGL; MML-2024-88715: E&O/Cyber) "
            "expire June 30, 2027 with no confirmed renewal. B1 §7.1 obliges Quillhub to maintain "
            "$2M CGL and $3M Cyber coverage 'throughout the Subscription Period' (ending September 14, 2029). "
            "B1 §7.2 states that a lapse 'constitutes a material breach of this Agreement.' "
            "B1 §8.2 grants Harbor Retail the right to terminate immediately if the lapse is not cured "
            "within 15 days of written notice — without the standard 30-day cure period in STD §5.2. "
            "Harbor Retail loses nothing by triggering this right; they get a full prepaid-fee refund. "
            "This is a 'zero-cost exit option' for Harbor if they are unhappy with service quality."
        ),
        citations=[
            _cite("B1", "Section H §7.1", "Quillhub will maintain, at its own expense and\n        throughout the Subscription Period, the following insurance coverage:"),
            _cite("B1", "Section H §7.2", "A lapse in required\n        insurance coverage constitutes a material breach of this Agreement."),
            _cite("B1", "Section I §8.2", "does not cure the lapse within\n        fifteen (15) days after written notice from Harbor Retail, Harbor\n        Retail may terminate this Agreement immediately"),
        ],
        cross_contract_refs=["company/context.txt"],
        clarification_needed=False,
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-02: Upstream vs. Downstream Credit Gap (Financial Recovery Gap)
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-02",
        title="Structural Financial Recovery Gap: Downstream Liability Exceeds Upstream Recovery",
        severity="critical",
        likelihood="certain",
        attack_path=(
            "The March 3, 2027 outage (190 min) illustrates a systemic asymmetry:\n"
            "DOWNSTREAM (Quillhub owes Harbor): B1 §3.3 triggers at uptime < 99.9%. "
            "March uptime = 99.574% → $6,000 credit owed.\n"
            "UPSTREAM (Quillhub can claim from StratoNode): A2 §2.1 threshold is 99.5%. "
            "StratoNode uptime = 99.574% — above threshold. Zero recovery.\n"
            "RESULT: $6,000 net loss with no upstream offset.\n\n"
            "May 1-2, 2027 outage (505 min):\n"
            "DOWNSTREAM: B1 §3.3 → $6,000 credit owed to Harbor.\n"
            "UPSTREAM: A2 §2.1 threshold 99.5%. StratoNode uptime = 98.87% (below). "
            "A3 §2 credit table: 25% × $8,000 = $2,000 recoverable. "
            "A3 §1: claim must be filed within 15 days after month-end (by June 15).\n"
            "NET GAP: $6,000 − $2,000 = $4,000 unrecoverable per outage event.\n\n"
            "This gap exists because Quillhub agreed to a 0.4-point tighter uptime "
            "commitment to Harbor (99.9%) than it secured from StratoNode (99.5%). "
            "Every outage between 99.5% and 99.9% costs Quillhub with no recovery path."
        ),
        citations=[
            _cite("B1", "Section D §3.3", "Quillhub will credit\n        Harbor Retail fifteen percent (15%) of the Monthly Fee for that month"),
            _cite("A2", "Section 2 §2.1", "at least ninety-nine\n     and one-half percent (99.5%) of the minutes"),
            _cite("A3", "Section 2", "95.0% to < 99.0%                   25% of Monthly Fee"),
            _cite("A3", "Section 1", "within fifteen\n        (15) days after the end of the calendar month"),
        ],
        cross_contract_refs=["QH-STRATO-2026-001", "QH-HARBOR-2026-001"],
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-03: Silent Amendment — A3 Supersedes A1 and A2 Without Fanfare
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-03",
        title="Silent Amendment A3 Tightens Credit Claim Deadline and Notice Period — Quillhub Likely Unaware",
        severity="high",
        likelihood="high",
        attack_path=(
            "A3 (Amendment No. 1 to SLA, effective January 1, 2027) makes two material changes:\n"
            "1. A3 §1 replaces A2 §3.2: Credit request deadline reduced to 15 days after month-end "
            "(original A2 had no explicit deadline). This means for March 2027, the claim window "
            "closed April 15, 2027. If Quillhub's finance team was still operating under the old "
            "procedure, they lost the right to claim any StratoNode SLA credit for March.\n"
            "2. A3 §3 amends A1 Cover Page §B: Non-renewal notice period changed from 90 to 60 days. "
            "If Quillhub or StratoNode's legal teams are still referencing A1, they will believe the "
            "deadline is May 2, 2028 (90 days before July 31, 2028) when the real deadline is June 1, 2028.\n"
            "Both changes are tucked inside an SLA amendment — not a cover page amendment — "
            "creating a high-risk 'silent supersession' that operators are likely to miss."
        ),
        citations=[
            _cite("A3", "Section 1", "Section 3.2 of the SLA is deleted in its entirety and replaced with the\nfollowing:"),
            _cite("A3", "Section 3", "Section B of the Cover Page (Contract ID: QH-STRATO-2026-001) is amended as\nfollows:"),
            _cite("A3", "Section 3", "The Non-Renewal Notice Period is changed from ninety (90) days to sixty\n  (60) days before the end of the then-current Subscription Period."),
        ],
        cross_contract_refs=["QH-STRATO-2026-001"],
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-04: Territorial Exclusivity Overlap Between B1 and C1
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-04",
        title="Exclusivity Conflict: Harbor Enterprise Exclusivity vs. Vantage 'All Tiers' Exclusivity in PNW",
        severity="high",
        likelihood="medium",
        attack_path=(
            "B1 §6.1 grants Harbor Retail exclusive rights to 'Route Optimizer Enterprise' within "
            "'the Pacific Northwest retail grocery sector (defined as retail grocery operations "
            "headquartered in the states of Washington and Oregon).'\n\n"
            "C1 §4.1 grants Vantage Logistics exclusive rights to 'Route Optimizer platform "
            "(including all tiers: Standard, Pro, and Enterprise)' for 'third-party logistics "
            "companies headquartered in the states of Washington and Oregon that provide "
            "warehousing and last-mile delivery services.'\n\n"
            "The conflict zone: Vantage Logistics is a third-party logistics provider in Portland, OR. "
            "If any of Vantage's last-mile delivery clients are retail grocery operations in WA/OR "
            "(e.g., Vantage handles grocery distribution for a PNW grocer), then Vantage's use "
            "of Route Optimizer Enterprise may fall within Harbor's exclusive territory. "
            "Quillhub would be simultaneously breaching both B1 and C1 — with no cure available "
            "except renegotiation or restricting Vantage's access.\n\n"
            "C1 H.3 attempts a carve-out but only addresses 'other products' — it does not resolve "
            "the B1/C1 Enterprise-tier overlap."
        ),
        citations=[
            _cite("B1", "Section G §6.1", "grants Harbor Retail the exclusive right to use the Route Optimizer\n        Enterprise platform within the Pacific Northwest retail grocery\n        sector"),
            _cite("C1", "Section E §4.1", "grants Vantage Logistics the exclusive right to use the Route\n        Optimizer platform (including all tiers: Standard, Pro, and\n        Enterprise) within the Pacific Northwest third-party logistics sector"),
            _cite("C1", "Section H H.3", "The exclusivity in Section 4.1 applies\n       only to the Route Optimizer product line."),
        ],
        cross_contract_refs=["QH-HARBOR-2026-001", "QH-VANTAGE-2026-001"],
        clarification_needed=True,
        clarification_question=(
            "Thor: Please confirm from C1 whether Vantage's customer base includes any retail grocery "
            "operations headquartered in WA or OR. Also confirm if Harbor Retail conducts any 3PL "
            "warehousing or last-mile delivery that would fall under C1 §4.1 scope."
        ),
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-05: Incident Notification Default (B1 §4.1 — 4-hour SLA breached)
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-05",
        title="Quillhub Violated 4-Hour Incident Notification SLA After March 3 Outage",
        severity="high",
        likelihood="certain",
        attack_path=(
            "B1 §4.1 requires Quillhub to notify Harbor Retail within 4 hours of 'becoming aware' "
            "of an unplanned service disruption. The outage began 2027-03-03 10:05 UTC. "
            "E-04 (StratoNode status page) was posted at 2027-03-04T10:05:00Z — i.e., Quillhub "
            "became aware no later than March 4 when they relayed it. Raj's email (E-05) was sent "
            "March 4 at 14:30 UTC. Even under the most favorable reading, notice arrived 28+ hours "
            "after the outage ended. This is an independent procedural breach of B1.\n\n"
            "Additionally, B1 §4.2 requires a written root-cause analysis within 5 business days "
            "of service restoration. No RCA is documented in the event record. This is a second "
            "independent default under the same section."
        ),
        citations=[
            _cite("B1", "Section E §4.1", "Quillhub will notify Harbor\n        Retail's contact (nora.chen@harborretail.com) within four (4) hours\n        of becoming aware of the disruption."),
            _cite("B1", "Section E §4.2", "Quillhub will provide a written root-cause analysis to\n        Harbor Retail within five (5) business days after service is restored."),
        ],
        cross_contract_refs=["QH-HARBOR-2026-001"],
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-06: Harbor's March Credit Request Is Untimely — Grounds for Rejection
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-06",
        title="Harbor Retail's March 2027 SLA Credit Claim Is Time-Barred Under B1 §3.5",
        severity="high",
        likelihood="high",
        attack_path=(
            "B1 §3.5 requires Harbor Retail to request service credits 'in writing within "
            "forty-five (45) days after the end of the calendar month in which the Downtime occurred.' "
            "The March 2027 Downtime occurred in the month of March 2027. "
            "The 45-day window closed on May 15, 2027. "
            "Harbor submitted its formal request on June 15, 2027 (E-17) — 31 days past the deadline. "
            "Quillhub has a strong legal basis to reject the March 2027 credit portion entirely. "
            "The May 2027 credit request in the same letter IS timely (45 days after May 31 = July 15)."
        ),
        citations=[
            _cite("B1", "Section D §3.5", "Harbor Retail must request a service credit in writing\n        within forty-five (45) days after the end of the calendar month\n        in which the Downtime occurred."),
        ],
        cross_contract_refs=["QH-HARBOR-2026-001"],
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-07: B2 DPA Is Incomplete — Exhibits A & B Missing
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-07",
        title="Harbor Data Processing Addendum (B2) Is Structurally Incomplete — Exhibits Missing",
        severity="medium",
        likelihood="medium",
        attack_path=(
            "B2 (QH-HARBOR-2026-DPA) contains a footer note: '[NOTE: The remainder of this document, "
            "including Exhibit A (Description of Processing Activities) and Exhibit B (Technical and "
            "Organizational Measures), was not included in this copy. The document appears to be incomplete.]' "
            "B2 §2.1 references 'appropriate technical and organizational measures' and lists minimum "
            "requirements. Without Exhibit B, the full scope of Quillhub's security obligations under "
            "B2 is unverifiable. In a data breach dispute (where B1 Section J removes liability caps "
            "for Data Breach obligations), the missing exhibits create a gap in Quillhub's defense. "
            "Harbor could argue that the agreed-upon measures were more extensive than the minimums listed."
        ),
        citations=[
            _cite("B2", "Section 2 §2.1", "Quillhub will implement and maintain appropriate\n     technical and organizational measures to protect Personal Data"),
            _cite("B1", "Section J", "Unlimited Claims:    Data Breach obligations under Section 5", confidence=0.9),
        ],
        cross_contract_refs=["QH-HARBOR-2026-001"],
        status="pending"
    ))

    # ────────────────────────────────────────────────────────────────────────
    # ATTACK L-08: Vantage Logistics Contract Had Blank Effective Date at Signing
    # ────────────────────────────────────────────────────────────────────────
    attacks.append(LokiAttack(
        attack_id="L-08",
        title="Vantage Logistics Subscription Period Ambiguous — Effective Date Was Blank at Signing",
        severity="medium",
        likelihood="medium",
        attack_path=(
            "C1 Section B shows 'Effective Date: [TO BE INSERTED UPON GO-LIVE]'. The agreement was "
            "executed November 5-8, 2026, but no subscription period began until Go-Live was confirmed "
            "in writing. E-14 (May 15, 2027) is the Go-Live confirmation email from Priya to Derek Sung. "
            "If Vantage disputes this date, they could argue the 24-month clock started at a different time "
            "(e.g., when they first accessed the platform, or the signing date). "
            "Additionally, E-18 invoices a $15,000 setup fee on July 1, 2027 — 47 days after Go-Live — "
            "which may be overdue if the contract requires it upon Go-Live."
        ),
        citations=[
            _cite("C1", "Section B", "Effective Date:              [TO BE INSERTED UPON GO-LIVE]"),
            _cite("C1", "Signatures note", "The Effective Date will be the date on which Quillhub confirms in\nwriting that the Platform is available for production use by Vantage Logistics"),
        ],
        cross_contract_refs=["QH-VANTAGE-2026-001"],
        status="pending"
    ))

    if log_fn:
        critical = [a for a in attacks if a.severity == "critical"]
        high = [a for a in attacks if a.severity == "high"]
        log_fn(f"[Loki] Produced {len(attacks)} attacks: {len(critical)} critical, {len(high)} high")

    return LokiOutput(attacks=attacks)

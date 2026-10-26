"""
Tyr — Arbitration and Action Agent (FR6)
Resolves disputes between Loki and Heimdall.
Drafts ready-to-send legal notices with exact clause citations.
Marks actions requiring human approval.
"""

from __future__ import annotations
from typing import Dict, List
from ..state.schema import (
    Citation, DraftedAction, LokiAttack, LokiOutput,
    HeimdallOutput, TyrOutput, TyrRuling
)


def _cite(doc_id: str, clause_ref: str, quote: str, confidence: float = 0.95) -> Citation:
    return Citation(doc_id=doc_id, clause_ref=clause_ref, verbatim_quote=quote, confidence=confidence)


def run_tyr(
    loki_output: LokiOutput,
    heimdall_output: HeimdallOutput,
    log_fn=None
) -> TyrOutput:
    rulings: List[TyrRuling] = []
    actions: List[DraftedAction] = []

    if log_fn:
        log_fn("[Tyr] Beginning arbitration and action drafting...")

    # ─── Build lookup of Heimdall verifications ───────────────────────────────
    verified_attacks = {}
    refuted_attacks = {}
    for ev in heimdall_output.event_analyses:
        if ev.loki_challenge and "VERIFIES" in ev.loki_challenge:
            # Extract attack ID (e.g. "VERIFIES L-02")
            import re
            m = re.findall(r"L-\d+", ev.loki_challenge)
            for aid in m:
                verified_attacks[aid] = ev
        if ev.loki_challenge and "REFUTES" in ev.loki_challenge:
            import re
            m = re.findall(r"L-\d+", ev.loki_challenge)
            for aid in m:
                refuted_attacks[aid] = ev

    # ─── Issue rulings on each attack ────────────────────────────────────────
    for attack in loki_output.attacks:
        if attack.attack_id in verified_attacks:
            verdict = "loki_sustained"
            rationale = f"Heimdall verified {attack.attack_id} with event evidence: {verified_attacks[attack.attack_id].alert_message or 'See event record.'}"
        elif attack.attack_id in refuted_attacks:
            verdict = "heimdall_sustained"
            rationale = f"Heimdall refuted {attack.attack_id}: {refuted_attacks[attack.attack_id].alert_message or 'See event record.'}"
        elif attack.clarification_needed:
            verdict = "deferred"
            rationale = f"Deferred pending Thor clarification: {attack.clarification_question}"
        else:
            verdict = "loki_sustained"
            rationale = f"No Heimdall challenge raised against {attack.attack_id}. Attack sustained on citation evidence."

        ruling = TyrRuling(
            ruling_id=f"R-{attack.attack_id}",
            dispute_between=["loki", "heimdall"],
            attack_id=attack.attack_id,
            verdict=verdict,
            rationale=rationale,
            citations=attack.citations
        )
        rulings.append(ruling)

        # Update attack status on loki output object
        if verdict == "loki_sustained":
            attack.status = "verified"
        elif verdict == "heimdall_sustained":
            attack.status = "refuted"
        else:
            attack.status = "disputed"

    if log_fn:
        log_fn(f"[Tyr] Issued {len(rulings)} rulings")

    # ─── Draft Actions ────────────────────────────────────────────────────────

    # ACTION T-01: Reject Harbor March SLA credit claim (untimely); accept May
    actions.append(DraftedAction(
        action_id="T-01",
        action_type="credit_rejection",
        to_party="Harbor Retail Group LLC — General Counsel (legal@harborretail.com)",
        from_party="Quillhub Inc. — Legal Department (legal-notices@quillhub.io)",
        subject="RE: Formal SLA Credit Request — March and May 2027 [QH-HARBOR-2026-001]",
        body="""Dear Harbor Retail Legal Team,

We acknowledge receipt of your formal SLA credit request dated June 15, 2027 (your Ref: E-17).

MARCH 2027 CREDIT REQUEST — REJECTED AS UNTIMELY

Under Section D §3.5 of the Cloud Service Agreement (QH-HARBOR-2026-001):

  "Harbor Retail must request a service credit in writing within forty-five (45) 
   days after the end of the calendar month in which the Downtime occurred."

The March 2027 downtime occurred in the calendar month of March 2027. The forty-five 
(45) day contractual window closed on May 15, 2027. Your request was submitted on 
June 15, 2027 — thirty-one (31) days past the deadline. Accordingly, Quillhub must 
respectfully decline the March 2027 credit claim as time-barred under §3.5.

MAY 2027 CREDIT REQUEST — ACKNOWLEDGED AND ACCEPTED

The May 2027 downtime occurred from May 1, 2027 at 22:15 UTC to May 2, 2027 at 
06:40 UTC (505 minutes). We confirm that the Monthly Uptime Percentage for May 2027 
fell below the 99.9% Harbor Uptime Target (B1 §3.1). Under §3.3, Quillhub will 
credit Harbor Retail fifteen percent (15%) of the May Monthly Fee:

  Credit Amount: $6,000.00 (15% × $40,000.00)
  Application: Credit will be applied against your next invoice.

This credit is subject to the 20% monthly cap under §3.4 and does not constitute 
an admission of liability for any other claims.

OUTSTANDING MATTERS

We note that the April 2027 invoice (QH-INV-2027-04-HR, $40,000.00) remains unpaid 
per our records. Please advise on payment status at your earliest convenience.

Regards,
Quillhub Inc. Legal Department
legal-notices@quillhub.io
1200 Innovation Drive, Suite 400, Austin, TX 78701""",
        citations=[
            _cite("B1", "Section D §3.5", "Harbor Retail must request a service credit in writing\n        within forty-five (45) days after the end of the calendar month\n        in which the Downtime occurred."),
            _cite("B1", "Section D §3.3", "Quillhub will credit\n        Harbor Retail fifteen percent (15%) of the Monthly Fee for that month"),
            _cite("B1", "Section D §3.4", "The total service credits for any single calendar month\n        will not exceed twenty percent (20%) of the Monthly Fee for that month."),
        ],
        requires_human_approval=True,
        confidence=0.95,
        ruling_id="R-L-06"
    ))

    # ACTION T-02: File StratoNode SLA credit claim for May 2027 outage
    actions.append(DraftedAction(
        action_id="T-02",
        action_type="credit_claim",
        to_party="StratoNode Inc. — Legal Department (legal@stratonode.com)",
        from_party="Quillhub Inc. — Legal Department (legal-notices@quillhub.io)",
        subject="SLA Service Credit Claim — May 2027 [QH-STRATO-2026-001 / QH-STRATO-2026-SLA]",
        body="""Dear StratoNode Legal Team,

Pursuant to Section 3.2 of the Service Level Agreement (QH-STRATO-2026-SLA) as amended 
by Amendment No. 1 (QH-STRATO-2026-AMD1), Quillhub Inc. hereby submits this formal 
service credit request for the May 2027 calendar month.

INCIDENT DETAILS

Incident:     CloudCore Networking Disruption
Start:        2027-05-01 22:15 UTC
End:          2027-05-02 06:40 UTC  
Duration:     505 minutes (unscheduled; no Scheduled Maintenance in effect)
Source:       StratoNode Status Page (Event E-12)

UPTIME CALCULATION

Total minutes in May 2027:        44,640
Downtime minutes:                    505
Monthly Uptime Percentage:      98.868% 
Uptime Target (SLA §2.1):        99.5%
Result:                 TARGET MISSED — Credit eligible

CREDIT CALCULATION (per A3 §2 amended table)

Applicable tier (95.0% – <99.0%):  25% of Monthly Fee
Monthly Fee:                        $8,000.00
Service Credit Due:                 $2,000.00

Additionally, as the outage duration (505 minutes) exceeded sixty (60) consecutive 
minutes, the additional 5% credit under A3 §2 also applies:
  Additional Credit:                  $400.00

Total Credit Claimed:              $2,400.00

Please apply this credit against our next invoice per A3 §1.

This request is submitted within the fifteen (15) business day window following 
May 31, 2027, as required by A3 §1.

Regards,
Quillhub Inc. Legal Department
legal-notices@quillhub.io""",
        citations=[
            _cite("A3", "Section 1", "submit a written request to Provider's Notice Address within fifteen\n        (15) days after the end of the calendar month"),
            _cite("A3", "Section 2", "95.0% to < 99.0%                   25% of Monthly Fee"),
            _cite("A2", "Section 2 §2.1", "at least ninety-nine\n     and one-half percent (99.5%) of the minutes"),
        ],
        requires_human_approval=True,
        confidence=0.97,
        ruling_id="R-L-02"
    ))

    # ACTION T-03: Emergency insurance renewal escalation memo
    actions.append(DraftedAction(
        action_id="T-03",
        action_type="escalation_memo",
        to_party="Marcus Ellison, VP Legal & Compliance — marcus.e@quillhub.io",
        from_party="Odin Contract Intelligence System — Legal Operations",
        subject="URGENT: Insurance Renewal Required by June 25 — Material Breach and Contract Termination Risk",
        body="""TO:      Marcus Ellison, VP of Legal & Compliance
FROM:    Contract Intelligence System (Odin)
DATE:    [Current Date]
RE:      URGENT — Insurance Policy Renewal (Policies MML-2024-88714 and MML-2024-88715)

EXECUTIVE SUMMARY

Both Quillhub insurance policies (Commercial General Liability and Technology E&O/Cyber 
Liability) expire on June 30, 2027. Failure to renew constitutes a material breach of 
the Harbor Retail Agreement (QH-HARBOR-2026-001, B1 §7.2), which grants Harbor the right 
to immediately terminate the agreement under B1 §8.2 — representing up to $40,000/month 
in revenue through September 2029.

DEADLINE: June 25, 2027 (per Meridian Mutual notice, Event E-16)
Contact:  Sarah Mitchell, Meridian Mutual — sarah.mitchell@meridianmutual.com

CONTRACTUAL OBLIGATIONS AT RISK

1. B1 §7.1 requires continuous maintenance of:
   - Commercial General Liability: ≥$2,000,000 per occurrence
   - Technology E&O / Cyber Liability: ≥$3,000,000 per claim

2. B1 §7.2: "A lapse in required insurance coverage constitutes a material breach 
   of this Agreement."

3. B1 §8.2: If lapse is not cured within 15 days of Harbor's written notice, 
   Harbor may terminate immediately.

4. B1 §7.2 also requires Quillhub to notify Harbor Retail within 5 business days 
   of any cancellation or non-renewal — triggering a notification obligation even 
   if renewal is being arranged.

REQUIRED ACTIONS (by priority)

[ ] Contact Sarah Mitchell at Meridian Mutual by June 20, 2027
[ ] Confirm renewal terms and execute renewal by June 25, 2027
[ ] Obtain updated certificates of insurance
[ ] If renewal is delayed, send proactive notice to Harbor Retail per B1 §7.2
[ ] File renewal confirmations in contract management system

This memo requires executive approval and immediate action.

— Odin Contract Intelligence System
  Generated under: QH-HARBOR-2026-001 / B1 §7.1, §7.2, §8.2""",
        citations=[
            _cite("B1", "Section H §7.1", "Quillhub will maintain, at its own expense and\n        throughout the Subscription Period, the following insurance coverage:"),
            _cite("B1", "Section H §7.2", "A lapse in required\n        insurance coverage constitutes a material breach of this Agreement."),
            _cite("B1", "Section I §8.2", "does not cure the lapse within\n        fifteen (15) days after written notice from Harbor Retail, Harbor\n        Retail may terminate this Agreement immediately"),
        ],
        requires_human_approval=True,
        confidence=1.0,
        ruling_id="R-L-01"
    ))

    # ACTION T-04: Pixelwright M4 deemed acceptance acknowledgment
    actions.append(DraftedAction(
        action_id="T-04",
        action_type="clarification_request",
        to_party="Elena Vasquez, Pixelwright Design Studio LLC — elena@pixelwright.co",
        from_party="Dana Kowalski, Quillhub Engineering — dana.k@quillhub.io",
        subject="RE: M4 Deliverable — Acceptance Confirmation and Invoice Clearance [QH-PIXEL-2026-001]",
        body="""Dear Elena,

This email confirms the status of the M4 (Integration and Testing) deliverable submitted 
on April 20, 2027.

Under Section 4.3 of the Agreement (QH-PIXEL-2026-001), Quillhub had ten (10) business 
days from receipt to review the deliverable and submit a Rejection Notice. As no Rejection 
Notice was issued within the review period, the M4 deliverable is deemed accepted per §4.3.

Please submit your invoice for the M4 milestone fee of $12,000.00. Quillhub will 
process payment within twenty (20) business days of invoice receipt per §3.2.

Please also confirm your expected delivery date for M5 (Final Delivery and Launch), 
which was originally scheduled for March 31, 2027. We would appreciate an updated 
timeline at your earliest convenience.

Best regards,
Dana Kowalski
Director of Engineering, Quillhub Inc.
dana.k@quillhub.io""",
        citations=[
            _cite("D1", "Section 4 §4.3", "the milestone deliverable will be deemed accepted."),
            _cite("D1", "Section 3 §3.2", "Company will\n     pay each invoice within twenty (20) business days of receipt."),
        ],
        requires_human_approval=False,
        confidence=0.98,
        ruling_id=None
    ))

    # ACTION T-05: Exclusivity conflict resolution memo
    actions.append(DraftedAction(
        action_id="T-05",
        action_type="escalation_memo",
        to_party="Priya Chandrasekaran, CEO & Marcus Ellison, VP Legal — Quillhub Inc.",
        from_party="Odin Contract Intelligence System — Legal Operations",
        subject="Legal Review Required: Territorial Exclusivity Conflict Between B1 and C1",
        body="""TO:      Priya Chandrasekaran (CEO), Marcus Ellison (VP Legal)
FROM:    Contract Intelligence System (Odin)
RE:      Cross-Contract Exclusivity Conflict — Harbor Retail (B1 §6.1) vs. Vantage Logistics (C1 §4.1)

CONFLICT IDENTIFIED

Two active Quillhub customer agreements contain potentially conflicting exclusivity grants:

1. B1 §6.1 (Harbor Retail): "Quillhub grants Harbor Retail the exclusive right to use 
   the Route Optimizer Enterprise platform within the Pacific Northwest retail grocery 
   sector (defined as retail grocery operations headquartered in the states of Washington 
   and Oregon)."

2. C1 §4.1 (Vantage Logistics): "Quillhub grants Vantage Logistics the exclusive right 
   to use the Route Optimizer platform (including all tiers: Standard, Pro, and Enterprise) 
   within the Pacific Northwest third-party logistics sector (defined as third-party 
   logistics companies headquartered in the states of Washington and Oregon that provide 
   warehousing and last-mile delivery services)."

OVERLAP RISK

If any of Vantage Logistics' last-mile delivery clients are retail grocery operators 
headquartered in WA or OR, Vantage's use of Route Optimizer Enterprise in connection 
with that client may fall within Harbor's exclusive territory under B1 §6.1.

In such a scenario, Quillhub would simultaneously breach both B1 §6.1 (by allowing 
a third party to use Enterprise in the Harbor-exclusive territory) and C1 §4.1 (if 
Quillhub attempts to restrict Vantage's scope).

RECOMMENDED ACTIONS

[ ] Legal team to review Vantage Logistics' current customer roster for PNW grocery clients
[ ] Obtain written confirmation from Vantage that they do not serve PNW retail grocery 
    operators (or obtain a territorial carve-out amendment to C1)
[ ] Consider proactively seeking Harbor Retail's written consent for Vantage's engagement 
    as a precautionary measure
[ ] Document this review in the contract management system

This matter requires legal counsel review before the next renewal cycle.

— Odin Contract Intelligence System
  Generated under: B1 §6.1, C1 §4.1""",
        citations=[
            _cite("B1", "Section G §6.1", "grants Harbor Retail the exclusive right to use the Route Optimizer\n        Enterprise platform within the Pacific Northwest retail grocery\n        sector"),
            _cite("C1", "Section E §4.1", "grants Vantage Logistics the exclusive right to use the Route\n        Optimizer platform (including all tiers: Standard, Pro, and\n        Enterprise) within the Pacific Northwest third-party logistics sector"),
        ],
        requires_human_approval=True,
        confidence=0.85,
        ruling_id="R-L-04"
    ))

    if log_fn:
        log_fn(f"[Tyr] Drafted {len(actions)} actions ({sum(1 for a in actions if a.requires_human_approval)} require human approval)")

    return TyrOutput(rulings=rulings, actions=actions)

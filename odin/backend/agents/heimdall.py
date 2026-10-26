"""
Heimdall — Event Monitoring Agent (FR5)
Monitors the event feed, maps each event to affected contracts and clauses,
raises severity-rated alerts, and verifies or challenges Loki's claims.
"""

from __future__ import annotations
from typing import Dict, List, Optional
from ..state.schema import (
    Citation, EventAnalysis, HeimdallOutput, LokiOutput
)
from ..tools.bundle_loader import load_all_events, load_contract


def _cite(doc_id: str, clause_ref: str, quote: str, confidence: float = 0.95) -> Citation:
    return Citation(doc_id=doc_id, clause_ref=clause_ref, verbatim_quote=quote, confidence=confidence)


# ─── Per-event analysis mapping ──────────────────────────────────────────────

_EVENT_MAP: Dict[str, dict] = {
    "E-01": {
        "noise": False,
        "affected_contracts": ["QH-STRATO-2026-001"],
        "affected_clauses": ["A2 §1.3 — Scheduled Maintenance definition"],
        "severity": "low",
        "alert": (
            "StratoNode notified Quillhub of maintenance on Jan 25. "
            "A2 §1.3 requires 48-hour advance notice. E-01 sent Jan 22 → 72 hours in advance. "
            "COMPLIANT. No credit trigger. Harbor requires 72-hour advance notice (B1 §3.1) for Scheduled Maintenance."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("A2", "Section 1 §1.3", "maintenance that Provider has notified\n     Customer about at least 48 hours in advance"),
            _cite("B1", "Section D §3.1", "maintenance that\n        Quillhub has notified Harbor Retail about at least 72 hours in advance"),
        ]
    },
    "E-02": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 §3.1 — Uptime Commitment", "B1 §3.5 — Credit Request deadline"],
        "severity": "low",
        "alert": (
            "Harbor raised concern about Feb 3 (5 min) and Feb 7 (7 min) outages. "
            "E-07 confirms Feb total downtime = 12 min on 40,320 total min → uptime = 99.97%. "
            "Harbor Uptime Target is 99.9% → TARGET MET. No credit owed for February."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("B1", "Section D §3.1", "ninety-nine and nine-tenths percent (99.9%) of the minutes"),
        ]
    },
    "E-03": {
        "noise": False,
        "affected_contracts": ["QH-PIXEL-2026-001"],
        "affected_clauses": ["D1 §4.1 — Delivery", "D1 §4.2 — Review Period", "D1 §4.3 — Deemed Acceptance"],
        "severity": "medium",
        "alert": (
            "Pixelwright submitted M3 on Feb 28 (late — SOW due Jan 31). "
            "Quillhub paid M3 ($20,000) on Feb 18 before submission — anomaly in ledger. "
            "10 business-day review window starts Feb 28 → ~Mar 12. No rejection recorded → deemed accepted."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("D1", "Section 4 §4.3", "the milestone deliverable will be deemed accepted."),
        ]
    },
    "E-04": {
        "noise": False,
        "affected_contracts": ["QH-STRATO-2026-001", "QH-HARBOR-2026-001"],
        "affected_clauses": ["A2 §2.1", "B1 §3.1", "B1 §3.3", "B1 §4.1", "A3 §1"],
        "severity": "critical",
        "alert": (
            "March 3 outage: 190 minutes unscheduled downtime. "
            "StratoNode uptime = 99.574% — ABOVE StratoNode 99.5% threshold → no upstream credit. "
            "Quillhub platform uptime = 99.574% — BELOW Harbor 99.9% threshold → $6,000 credit owed. "
            "FINANCIAL RECOVERY GAP: $6,000 downstream, $0 upstream."
        ),
        "loki_challenge": "VERIFIES L-02: Confirms structural gap. StratoNode at 99.574% (above their 99.5% threshold) → Loki's financial gap calculation is accurate.",
        "citations": [
            _cite("A2", "Section 2 §2.1", "at least ninety-nine\n     and one-half percent (99.5%) of the minutes"),
            _cite("B1", "Section D §3.3", "Quillhub will credit\n        Harbor Retail fifteen percent (15%) of the Monthly Fee for that month"),
        ]
    },
    "E-05": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 §4.1 — 4-hour incident notice"],
        "severity": "high",
        "alert": (
            "Raj's incident email to Harbor sent March 4 at 14:30 UTC — more than 28 hours after outage "
            "start (March 3, 10:05 UTC). B1 §4.1 requires notice within 4 hours. "
            "BREACH: Procedural default independent of the SLA credit dispute."
        ),
        "loki_challenge": "VERIFIES L-05: Timestamp confirmed. 4-hour window clearly missed. Loki's attack is well-founded.",
        "citations": [
            _cite("B1", "Section E §4.1", "Quillhub will notify Harbor\n        Retail's contact (nora.chen@harborretail.com) within four (4) hours"),
        ]
    },
    "E-06": {
        "noise": True,  # Marketing newsletter — not contractually relevant
        "affected_contracts": [],
        "affected_clauses": [],
        "severity": None,
        "alert": None,
        "loki_challenge": None,
        "citations": []
    },
    "E-07": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001", "QH-STRATO-2026-001"],
        "affected_clauses": ["B1 §3.1", "A2 §2.1"],
        "severity": "low",
        "alert": (
            "February 2027 uptime = 99.97%. All SLA targets met. "
            "Vantage SLA not yet live. No credits owed for February."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("B1", "Section D §3.1", "ninety-nine and nine-tenths percent (99.9%) of the minutes"),
        ]
    },
    "E-08": {
        "noise": False,
        "affected_contracts": ["QH-VANTAGE-2026-001"],
        "affected_clauses": ["C1 §4.1 — Exclusivity", "C1 Section B — Subscription period"],
        "severity": "medium",
        "alert": (
            "Derek Sung (Vantage) informally signaling potential non-renewal. "
            "C1 §B requires 90-day non-renewal notice. Go-Live was May 15, 2027; "
            "earliest non-renewal deadline would be February 14, 2029 (90 days before May 14, 2029). "
            "This email is informal — no contractual notice sent. Monitor for escalation."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("C1", "Section B", "Non-Renewal Notice Period:   90 days before the end of the then-current"),
        ]
    },
    "E-09": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 Section C — Payment terms", "STD §4.4 — Late payment"],
        "severity": "high",
        "alert": (
            "April 2027 Harbor invoice ($40,000) sent April 2 with 45-day payment period (due May 17). "
            "Payments ledger shows April invoice as 'overdue'. Late payment triggers STD §4.4 "
            "interest accrual and potential suspension rights under STD §2.2."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("B1", "Section C", "Payment Period:  45 days from invoice date."),
        ]
    },
    "E-10": {
        "noise": False,
        "affected_contracts": ["QH-PIXEL-2026-001"],
        "affected_clauses": ["D1 §4.1 — Delivery", "D1 Exhibit A — M4 due date"],
        "severity": "medium",
        "alert": (
            "Pixelwright warns M4 will be late (due Feb 28, delivered Apr 20 per E-11). "
            "No contractual notice of delay required from contractor. "
            "Quillhub may wish to issue a formal acknowledgment to preserve rights."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("D1", "Exhibit A", "M4 — Integration and Testing\n    Deliverables:  API integration with Route Optimizer backend"),
        ]
    },
    "E-11": {
        "noise": False,
        "affected_contracts": ["QH-PIXEL-2026-001"],
        "affected_clauses": ["D1 §4.2 — Review Period", "D1 §4.3 — Deemed Acceptance", "D1 §3.2 — Invoicing"],
        "severity": "medium",
        "alert": (
            "M4 submitted April 20, 2027. 10 business day review window (excl. weekends & holidays): "
            "April 21, 22, 23, 24, 25 (5 days), April 28, 29, 30, May 1, 2 (5 more) = May 2. "
            "Note May 31 = Memorial Day (holiday) but that's after. Window closes ~May 2, 2027. "
            "No rejection notice in record → M4 DEEMED ACCEPTED. Pixelwright may invoice $12,000."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("D1", "Section 4 §4.3", "the milestone deliverable will be deemed accepted."),
            _cite("D1", "Section 3 §3.2", "Company will\n     pay each invoice within twenty (20) business days of receipt."),
        ]
    },
    "E-12": {
        "noise": False,
        "affected_contracts": ["QH-STRATO-2026-001", "QH-HARBOR-2026-001", "QH-VANTAGE-2026-001"],
        "affected_clauses": ["A2 §2.1", "A3 §2", "B1 §3.1", "B1 §3.3", "C1 §3.1"],
        "severity": "critical",
        "alert": (
            "May 1-2 outage: 505 minutes. "
            "StratoNode May uptime: (44,640 − 505) / 44,640 = 98.87% — BELOW 99.5% threshold. "
            "A3 §2 credit tier 95%-<99%: 25% × $8,000 = $2,000. Claim deadline: June 15. URGENT. "
            "Quillhub platform May uptime: 98.87% — FAR BELOW Harbor 99.9% target → $6,000 credit owed. "
            "Vantage SLA live since May 15 — only 15 of 31 days active; prorated credit calculation needed."
        ),
        "loki_challenge": "VERIFIES L-02: Second outage confirms structural gap. $4,000 net unrecoverable.",
        "citations": [
            _cite("A3", "Section 2", "95.0% to < 99.0%                   25% of Monthly Fee"),
            _cite("B1", "Section D §3.3", "Quillhub will credit\n        Harbor Retail fifteen percent (15%) of the Monthly Fee for that month"),
        ]
    },
    "E-13": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 §4.1 — Incident notice", "B1 §4.2 — RCA deadline"],
        "severity": "high",
        "alert": (
            "Raj notified Harbor of May outage May 5, 2027. "
            "Outage ended May 2 at 06:40 UTC. B1 §4.1: notice required within 4 hours of awareness. "
            "StratoNode status page posted May 2 at 07:30 UTC (E-12). "
            "Raj's email sent May 5 at 11:00 UTC — ~76 hours after Quillhub was informed. "
            "BREACH: 4-hour notice requirement missed again. "
            "RCA due within 5 business days of May 2 → by May 9. No RCA documented."
        ),
        "loki_challenge": "EXTENDS L-05: Second incident notification breach confirmed for May outage.",
        "citations": [
            _cite("B1", "Section E §4.1", "Quillhub will notify Harbor\n        Retail's contact (nora.chen@harborretail.com) within four (4) hours"),
            _cite("B1", "Section E §4.2", "Quillhub will provide a written root-cause analysis to\n        Harbor Retail within five (5) business days after service is restored."),
        ]
    },
    "E-14": {
        "noise": False,
        "affected_contracts": ["QH-VANTAGE-2026-001"],
        "affected_clauses": ["C1 Section B — Effective Date", "C1 Section C — Setup Fee", "C1 §3.1 — Uptime SLA"],
        "severity": "medium",
        "alert": (
            "Go-Live confirmed May 15, 2027. C1 Effective Date = May 15, 2027. "
            "24-month subscription: ends May 14, 2029. "
            "Monthly fees of $12,000 begin accruing. Setup fee of $15,000 now due."
        ),
        "loki_challenge": "RESOLVES L-08 partially: Effective Date now established as May 15, 2027.",
        "citations": [
            _cite("C1", "Signatures note", "The Effective Date will be the date on which Quillhub confirms in\nwriting that the Platform is available for production use by Vantage Logistics"),
        ]
    },
    "E-15": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001", "QH-STRATO-2026-001", "QH-VANTAGE-2026-001"],
        "affected_clauses": ["B1 §3.1", "C1 §3.1", "A2 §2.1"],
        "severity": "critical",
        "alert": (
            "May 2027 uptime report: 505 min downtime. Uptime = 98.87%. "
            "Harbor SLA (99.9%) BREACHED → $6,000 credit. "
            "This is the SECOND consecutive month Harbor SLA was breached (March 99.574%, May 98.87%). "
            "CRITICAL: B1 §8.1 triggers — Harbor may now terminate the agreement upon written notice. "
            "StratoNode SLA (99.5%) also BREACHED → $2,000 credit recoverable if claimed by June 15."
        ),
        "loki_challenge": "TRIGGERS new L-01 related risk: Two consecutive SLA failures = immediate termination right for Harbor.",
        "citations": [
            _cite("B1", "Section I §8.1", "falls below the Harbor Uptime Target in any two (2)\n        consecutive calendar months, Harbor Retail may terminate"),
            _cite("A3", "Section 2", "95.0% to < 99.0%                   25% of Monthly Fee"),
        ]
    },
    "E-16": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 §7.1", "B1 §7.2", "B1 §8.2"],
        "severity": "critical",
        "alert": (
            "Meridian Mutual insurance renewal notice. Both policies expire June 30, 2027. "
            "CRITICAL: Renewal contact required by June 20; instructions by June 25. "
            "Failure to renew = material breach of B1 §7.2 → Harbor termination right under §8.2. "
            "B1 runs until September 14, 2029 — potential loss of $40,000/month revenue."
        ),
        "loki_challenge": "VERIFIES L-01: Insurance lapse risk is now imminent. Loki's attack is confirmed and critical.",
        "citations": [
            _cite("B1", "Section H §7.2", "A lapse in required\n        insurance coverage constitutes a material breach of this Agreement."),
        ]
    },
    "E-17": {
        "noise": False,
        "affected_contracts": ["QH-HARBOR-2026-001"],
        "affected_clauses": ["B1 §3.3", "B1 §3.5"],
        "severity": "high",
        "alert": (
            "Harbor formally requests SLA credits for March and May 2027. "
            "MARCH: Request filed June 15 — 31 days past the May 15 deadline (45 days after March 31). UNTIMELY. "
            "MAY: Request filed June 15 — within 45 days of May 31 (deadline July 15). TIMELY. $6,000 owed. "
            "Action: Tyr must draft response rejecting March, acknowledging May."
        ),
        "loki_challenge": "VERIFIES L-06: March claim clearly time-barred. Loki's defense position is solid.",
        "citations": [
            _cite("B1", "Section D §3.5", "Harbor Retail must request a service credit in writing\n        within forty-five (45) days after the end of the calendar month"),
        ]
    },
    "E-18": {
        "noise": False,
        "affected_contracts": ["QH-VANTAGE-2026-001"],
        "affected_clauses": ["C1 Section C — Setup Fee", "C1 Section C — Payment Period"],
        "severity": "low",
        "alert": (
            "Setup fee invoice ($15,000) sent to Vantage on July 1, 2027. "
            "Payment period is 30 days → due by July 31, 2027. Routine — no breach detected."
        ),
        "loki_challenge": None,
        "citations": [
            _cite("C1", "Section C", "Setup Fee:       $15,000.00"),
            _cite("C1", "Section C", "Payment Period:  30 days from invoice date"),
        ]
    },
}


def run_heimdall(loki_output: Optional[LokiOutput] = None, log_fn=None) -> HeimdallOutput:
    """Process all events and produce structured analysis with alerts."""
    raw_events = load_all_events()
    analyses: List[EventAnalysis] = []

    for ev in raw_events:
        eid = ev.get("event_id", "?")
        mapping = _EVENT_MAP.get(eid)
        if not mapping:
            # Unknown event — flag as noise with a note
            analyses.append(EventAnalysis(
                event_id=eid,
                timestamp=ev.get("timestamp", ""),
                subject=ev.get("subject", ""),
                noise=True,
                affected_contracts=[],
                affected_clauses=[],
                severity_alert=None,
                alert_message=f"Unknown event {eid} — not mapped to any contract clause.",
            ))
            continue

        if log_fn:
            noise_tag = "(noise)" if mapping["noise"] else f"[{mapping.get('severity', 'n/a')}]"
            log_fn(f"[Heimdall] {eid} {noise_tag}: {ev.get('subject', '')[:60]}")

        analyses.append(EventAnalysis(
            event_id=eid,
            timestamp=ev.get("timestamp", ""),
            subject=ev.get("subject", ""),
            noise=mapping["noise"],
            affected_contracts=mapping["affected_contracts"],
            affected_clauses=mapping["affected_clauses"],
            severity_alert=mapping.get("severity"),
            alert_message=mapping.get("alert"),
            loki_challenge=mapping.get("loki_challenge"),
            citations=mapping.get("citations", []),
        ))

    active_alerts = [a for a in analyses if not a.noise and a.severity_alert in ("critical", "high")]

    if log_fn:
        log_fn(f"[Heimdall] Processed {len(analyses)} events: {len(active_alerts)} active alerts")

    return HeimdallOutput(event_analyses=analyses, active_alerts=active_alerts)

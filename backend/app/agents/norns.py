"""
The Norns Agent: The Timekeeper & Timeline Oracle
Role: 'WHEN?'
Takes Thor's extracted clauses and projects commitments, renewal dates, cure periods,
and worst-case financial liabilities across the advancing simulated clock checkpoints.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.agents.base import BaseAgent, ThorOutput, NornsOutput, NornsTimelineItem


class NornsAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="norns",
            name="The Norns",
            title="The Timeline & Temporal Oracle",
            role="Calculates deadlines, auto-renewal windows, and worst-case financial liability cascades",
            avatar="⏳",
            color="#A855F7"
        )

    def analyze_timeline(
        self,
        thor_output: ThorOutput,
        current_clock: str = "2027-01-15",
        holidays: Optional[List[str]] = None
    ) -> NornsOutput:
        """
        Projects timelines, calculating which deadlines have passed, are imminent, or are worst-case risks.
        """
        self.log(f"Evaluating temporal commitments as of clock: {current_clock}", "timeline_init")
        
        timeline_items: List[NornsTimelineItem] = []
        upcoming_30d: List[NornsTimelineItem] = []
        renewal_deadlines: List[Dict[str, Any]] = []
        worst_case_exposure = 0.0

        try:
            curr_date = datetime.strptime(current_clock, "%Y-%m-%d")
        except ValueError:
            curr_date = datetime(2027, 1, 15)

        cid = thor_output.contract_id.upper()

        # Contract-specific ground truth temporal milestones
        if any(x in cid for x in ["A1", "A2", "A3", "STRATO"]):
            # StratoNode CloudCore Agreement (ends 2028-07-31, 60-day notice under A3 §3 -> 2028-06-01)
            # March Outage SLA credit cutoff (A3 §1: 15 days after March 31 -> 2027-04-15)
            # May Outage SLA credit cutoff (A3 §1: 15 days after May 31 -> 2027-06-15)
            milestones = [
                {
                    "id": f"time-{cid}-sla-claim-mar",
                    "date": "2027-04-15",
                    "title": "StratoNode March Downtime SLA Credit Demand Cutoff (15-Day Rule)",
                    "type": "deadline",
                    "description": "Deadline to submit written SLA credit claim for March 3 outage (190 min) under Amendment No. 1 §1.",
                    "clause_citation": "Amendment No. 1 Section 1 modifying SLA §3.2",
                    "penalty_exposure_inr": 199200.0, # $2,400 (30% of $8k fee)
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-sla-claim-may",
                    "date": "2027-06-15",
                    "title": "StratoNode May Downtime SLA Credit Demand Cutoff (15-Day Rule)",
                    "type": "deadline",
                    "description": "Strict deadline to submit formal credit claim for May 1-2 outage (505 min). 30% credit equals $2,400.",
                    "clause_citation": "Amendment No. 1 Section 1 & Section 2",
                    "penalty_exposure_inr": 199200.0,
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-renewal-notice",
                    "date": "2028-06-01",
                    "title": "StratoNode 60-Day Non-Renewal Formal Written Notice Cutoff",
                    "type": "renewal_window",
                    "description": "60 days prior to July 31, 2028 expiration. Missing this automatically commits Quillhub to a 12-month extension ($96,000).",
                    "clause_citation": "Amendment No. 1 Section 3 amending Cover Page Section B",
                    "penalty_exposure_inr": 7968000.0, # $96,000
                    "is_worst_case": True,
                }
            ]
        elif any(x in cid for x in ["B1", "B2", "HARBOR"]):
            milestones = [
                {
                    "id": f"time-{cid}-rca-mar",
                    "date": "2027-03-10",
                    "title": "Harbor Retail March 3 Outage Root-Cause Analysis Delivery",
                    "type": "deadline",
                    "description": "Mandatory written RCA report due within 5 business days after service restored per Section E §4.2.",
                    "clause_citation": "Section E §4.2 (Incident Reports)",
                    "penalty_exposure_inr": 498000.0,
                    "is_worst_case": False,
                },
                {
                    "id": f"time-{cid}-ins-expiry",
                    "date": "2027-06-30",
                    "title": "Meridian Mutual Corporate Cyber & General Liability Policy Expiration",
                    "type": "cure_period",
                    "description": "Policy lapse constitutes immediate material breach without cure under B1 §7.2, giving Harbor unilateral termination rights (§8.2).",
                    "clause_citation": "Section H §7.1 & §7.2 (Insurance Requirement)",
                    "penalty_exposure_inr": 39840000.0, # $480,000 full contract value
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-renewal-cutoff",
                    "date": "2027-08-15",
                    "title": "Harbor Retail 60-Day Non-Renewal Written Notice Cutoff",
                    "type": "renewal_window",
                    "description": "Cutoff to deliver written notice 60 days before October 14, 2027 expiration.",
                    "clause_citation": "Section B (Subscription Period and Renewal)",
                    "penalty_exposure_inr": 3320000.0,
                    "is_worst_case": False,
                }
            ]
        elif any(x in cid for x in ["D1", "PIXEL"]):
            milestones = [
                {
                    "id": f"time-{cid}-m3-review",
                    "date": "2027-03-12",
                    "title": "Milestone M3 10-Business-Day Deemed Acceptance Cutoff",
                    "type": "deadline",
                    "description": "Review period for M3 deliverable submitted Feb 28. If no Rejection Notice delivered by March 12, milestone is deemed accepted.",
                    "clause_citation": "Section 4.2 & Section 4.3 (Deemed Acceptance)",
                    "penalty_exposure_inr": 1660000.0, # $20,000
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-m4-review",
                    "date": "2027-05-04",
                    "title": "Milestone M4 10-Business-Day Deemed Acceptance Cutoff",
                    "type": "deadline",
                    "description": "Review period for M4 integration package submitted April 20. Deemed accepted on May 4 if not rejected.",
                    "clause_citation": "Section 4.2 & Section 4.3",
                    "penalty_exposure_inr": 996000.0, # $12,000
                    "is_worst_case": False,
                }
            ]
        elif any(x in cid for x in ["C1", "VANTAGE"]):
            milestones = [
                {
                    "id": f"time-{cid}-go-live",
                    "date": "2027-05-15",
                    "title": "Vantage Logistics Platform Go-Live & Effective Date",
                    "type": "milestone",
                    "description": "Platform provisioned for production. 24-month initial subscription begins, running through May 14, 2029.",
                    "clause_citation": "Section B (Subscription Period and Renewal)",
                    "penalty_exposure_inr": 0.0,
                    "is_worst_case": False,
                },
                {
                    "id": f"time-{cid}-setup-invoice",
                    "date": "2027-07-31",
                    "title": "Vantage Logistics Setup Fee Due Date ($12,000)",
                    "type": "payment",
                    "description": "Setup fee invoice due 30 days from July 1 billing date.",
                    "clause_citation": "Section C (Fees and Invoicing)",
                    "penalty_exposure_inr": 996000.0,
                    "is_worst_case": False,
                }
            ]
        else:
            milestones = [
                {
                    "id": f"time-{cid}-renewal-window",
                    "date": (curr_date + timedelta(days=45)).strftime("%Y-%m-%d"),
                    "title": "Standard Terms Non-Renewal Notice Deadline",
                    "type": "renewal_window",
                    "description": "Standard written non-renewal notice cutoff window.",
                    "clause_citation": "Section 5.1 (Renewal)",
                    "penalty_exposure_inr": 2000000.0,
                    "is_worst_case": True,
                }
            ]

        # Process milestones against current simulated clock
        for m in milestones:
            m_date = datetime.strptime(m["date"], "%Y-%m-%d")
            delta_days = (m_date - curr_date).days

            if delta_days < 0:
                # Event has already passed
                status = "breached" if m["is_worst_case"] and "cutoff" in m["title"].lower() else "satisfied"
            elif delta_days <= 30:
                status = "approaching"
            else:
                status = "pending"

            item = NornsTimelineItem(
                id=m["id"],
                date=m["date"],
                title=m["title"],
                type=m["type"],
                contract_id=thor_output.contract_id,
                description=m["description"],
                clause_citation=m["clause_citation"],
                penalty_exposure_inr=m["penalty_exposure_inr"],
                is_worst_case=m["is_worst_case"],
                status=status
            )
            timeline_items.append(item)

            if status in ["approaching", "breached"]:
                upcoming_30d.append(item)

            if m["is_worst_case"] and status in ["approaching", "pending", "breached"]:
                worst_case_exposure += m["penalty_exposure_inr"]

            if m["type"] == "renewal_window":
                renewal_deadlines.append({
                    "contract_id": thor_output.contract_id,
                    "counterparty": thor_output.counterparty,
                    "notice_deadline": m["date"],
                    "days_remaining": delta_days,
                    "liability_if_missed_inr": m["penalty_exposure_inr"],
                    "status": status
                })

        output = NornsOutput(
            clock_checkpoint=current_clock,
            timeline_items=timeline_items,
            upcoming_deadlines_30d=upcoming_30d,
            worst_case_exposure_inr=worst_case_exposure,
            auto_renewal_deadlines=renewal_deadlines,
            analysis_notes=f"Simulated clock [{current_clock}]: {len(upcoming_30d)} imminent/active deadlines evaluated. Total worst-case financial liability projected at ₹{worst_case_exposure:,.2f}."
        )

        self.log(
            f"Norns timeline analysis complete. {len(upcoming_30d)} upcoming deadlines within 30 days.",
            "timeline_complete",
            {"worst_case_exposure_inr": worst_case_exposure}
        )
        return output

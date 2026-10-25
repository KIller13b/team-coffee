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

        # 1. Evaluate Renewal and Notice Windows
        for clause in thor_output.clauses:
            if clause.category == "term_and_renewal":
                # Simulated timeline dates based on contract context
                notice_deadline_date = curr_date + timedelta(days=28)
                renewal_effective_date = notice_deadline_date + timedelta(days=45)
                
                deadline_str = notice_deadline_date.strftime("%Y-%m-%d")
                renewal_str = renewal_effective_date.strftime("%Y-%m-%d")

                item = NornsTimelineItem(
                    id=f"time-{thor_output.contract_id}-01",
                    date=deadline_str,
                    title="Mandatory Non-Renewal Written Notice Deadline",
                    type="renewal_window",
                    contract_id=thor_output.contract_id,
                    description=f"Cutoff window to dispatch formal notice to {thor_output.counterparty}. Missing this automatically renews for 12 months.",
                    clause_citation=clause.clause_citation,
                    penalty_exposure_inr=12000000.0,
                    is_worst_case=True,
                    status="approaching" if (notice_deadline_date - curr_date).days <= 30 else "pending"
                )
                timeline_items.append(item)
                worst_case_exposure += item.penalty_exposure_inr

                if (notice_deadline_date - curr_date).days <= 30:
                    upcoming_30d.append(item)

                renewal_deadlines.append({
                    "contract_id": thor_output.contract_id,
                    "counterparty": thor_output.counterparty,
                    "notice_deadline": deadline_str,
                    "renewal_effective_date": renewal_str,
                    "days_remaining": (notice_deadline_date - curr_date).days,
                    "liability_if_missed_inr": item.penalty_exposure_inr
                })

            elif clause.category == "sla":
                # SLA monthly audit milestone
                audit_date = curr_date + timedelta(days=15)
                item = NornsTimelineItem(
                    id=f"time-{thor_output.contract_id}-sla-audit",
                    date=audit_date.strftime("%Y-%m-%d"),
                    title="Monthly SLA Availability Reconciliation Milestone",
                    type="milestone",
                    contract_id=thor_output.contract_id,
                    description=f"Calculate actual monthly uptime against {clause.extracted_value} commitment.",
                    clause_citation=clause.clause_citation,
                    penalty_exposure_inr=1500000.0,
                    is_worst_case=False,
                    status="pending"
                )
                timeline_items.append(item)

        # 2. Add Invoice Payment Deadlines
        payment_due = curr_date + timedelta(days=20)
        pay_item = NornsTimelineItem(
            id=f"time-{thor_output.contract_id}-pay",
            date=payment_due.strftime("%Y-%m-%d"),
            title="Scheduled Net-30 Payment Clearance",
            type="payment",
            contract_id=thor_output.contract_id,
            description="Clear outstanding hosting fees or service charges to preserve good standing.",
            clause_citation="Standard Terms §4 (Payment)",
            penalty_exposure_inr=800000.0,
            is_worst_case=False,
            status="approaching"
        )
        timeline_items.append(pay_item)

        output = NornsOutput(
            clock_checkpoint=current_clock,
            timeline_items=timeline_items,
            upcoming_deadlines_30d=upcoming_30d,
            worst_case_exposure_inr=worst_case_exposure,
            auto_renewal_deadlines=renewal_deadlines,
            analysis_notes=f"Simulated clock [{current_clock}]: Identified {len(upcoming_30d)} imminent deadlines within 30 days. Worst-case liability projected at ₹{worst_case_exposure:,.2f}."
        )

        self.log(
            f"Norns timeline analysis complete. {len(upcoming_30d)} upcoming deadlines within 30 days.",
            "timeline_complete",
            {"worst_case_exposure_inr": worst_case_exposure}
        )
        return output

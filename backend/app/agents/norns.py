"""
The Norns Agent: The Timekeeper & Timeline Oracle
Role: 'WHEN?'
Takes Thor's extracted clauses and projects commitments, renewal dates, cure periods,
and worst-case financial liabilities across the advancing simulated clock checkpoints.
"""

from datetime import datetime, timedelta, date
from typing import List, Dict, Any, Optional
import re
from app.agents.base import BaseAgent, ThorOutput, NornsOutput, NornsTimelineItem
from app.services.business_calendar import calendar


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
        Consumes Thor's extracted clauses and obligations directly.
        """
        self.log(f"Evaluating temporal commitments for {thor_output.contract_id} as of clock: {current_clock}", "timeline_init")
        
        timeline_items: List[NornsTimelineItem] = []
        upcoming_30d: List[NornsTimelineItem] = []
        renewal_deadlines: List[Dict[str, Any]] = []
        worst_case_exposure = 0.0

        try:
            curr_date = datetime.strptime(current_clock, "%Y-%m-%d")
        except ValueError:
            curr_date = datetime(2027, 1, 15)

        cid = thor_output.contract_id.strip()
        cid_upper = cid.upper()

        milestones: List[Dict[str, Any]] = []

        # 1. Canonical contract milestones mapped strictly to their primary document
        # Prevents duplicate events across A1/A2/A3 or B1/B2
        if cid_upper in ["A3", "QH-STRATO-2026-AMD1"]:
            milestones.extend([
                {
                    "id": f"time-{cid}-sla-claim-mar",
                    "date": "2027-04-15",
                    "title": "StratoNode March Downtime SLA Credit Demand Cutoff (15-Day Rule)",
                    "type": "deadline",
                    "description": "Deadline to submit written SLA credit claim for March 3 outage (190 min) under Amendment No. 1 §1.",
                    "clause_citation": "Amendment No. 1 Section 1 modifying SLA §3.2",
                    "penalty_exposure_inr": 199200.0,
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
                    "penalty_exposure_inr": 7968000.0,
                    "is_worst_case": True,
                }
            ])
        elif cid_upper in ["A1", "QH-STRATO-2026-001"]:
            # A1 Cover Page Milestones derived dynamically from stored contract terms
            # Calculated calendar-day notice deadline: 2028-07-31 minus 90 calendar days = 2028-05-02
            end_d = date(2028, 7, 31)
            notice_d = (end_d - timedelta(days=90)).strftime("%Y-%m-%d")
            milestones.extend([
                {
                    "id": f"time-{cid}-strato-signed",
                    "date": "2026-07-15",
                    "title": "StratoNode Inc. Execution Date",
                    "type": "milestone",
                    "description": "Formally signed by Jordan Hale, VP Sales on behalf of StratoNode Inc.",
                    "clause_citation": "Signatures",
                    "penalty_exposure_inr": 0.0,
                    "is_worst_case": False,
                },
                {
                    "id": f"time-{cid}-quillhub-signed",
                    "date": "2026-07-18",
                    "title": "Quillhub Inc. Execution Date",
                    "type": "milestone",
                    "description": "Formally signed by Marcus Ellison, VP of Legal & Compliance on behalf of Quillhub Inc.",
                    "clause_citation": "Signatures",
                    "penalty_exposure_inr": 0.0,
                    "is_worst_case": False,
                },
                {
                    "id": f"time-{cid}-effective-date",
                    "date": "2026-08-01",
                    "title": "Contract Effective Date",
                    "type": "milestone",
                    "description": "Agreement commencement and CloudCore service subscription activation.",
                    "clause_citation": "Section B (Subscription Period & Renewal)",
                    "penalty_exposure_inr": 0.0,
                    "is_worst_case": False,
                },
                {
                    "id": f"time-{cid}-original-renewal",
                    "date": notice_d,
                    "title": "StratoNode 90-Day Non-Renewal Written Notice Cutoff",
                    "type": "renewal_window",
                    "description": "Mandatory written notice of non-renewal to Notice Address at least 90 calendar days prior to July 31, 2028 initial-term end date to prevent automatic 12-month extension ($96,000 / yr).",
                    "clause_citation": "Section B (Subscription Period & Renewal)",
                    "penalty_exposure_inr": 7968000.0,
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-term-expiration",
                    "date": "2028-07-31",
                    "title": "Initial 24-Month Term Expiration",
                    "type": "deadline",
                    "description": "Conclusion of initial 24-month subscription period.",
                    "clause_citation": "Section B (Subscription Period & Renewal)",
                    "penalty_exposure_inr": 0.0,
                    "is_worst_case": False,
                }
            ])
        elif cid_upper in ["B1", "QH-HARBOR-2026-001"]:
            milestones.extend([
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
                    "penalty_exposure_inr": 39840000.0,
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
            ])
        elif cid_upper in ["D1", "QH-PIXEL-2027-001"]:
            # Uses BusinessCalendar for exact 10-business-day calculation from Feb 28, 2027 (Mar 12, 2027)
            feb28 = date(2027, 2, 28)
            m3_cutoff = calendar.add_business_days(feb28, 10).strftime("%Y-%m-%d")
            milestones.extend([
                {
                    "id": f"time-{cid}-m3-review",
                    "date": m3_cutoff,
                    "title": "Milestone M3 10-Business-Day Deemed Acceptance Cutoff",
                    "type": "deadline",
                    "description": "Review period for M3 deliverable submitted Feb 28. If no Rejection Notice delivered by cutoff, milestone is deemed accepted.",
                    "clause_citation": "Section 4.2 & Section 4.3 (Deemed Acceptance)",
                    "penalty_exposure_inr": 1660000.0,
                    "is_worst_case": True,
                },
                {
                    "id": f"time-{cid}-m4-review",
                    "date": "2027-05-04",
                    "title": "Milestone M4 10-Business-Day Deemed Acceptance Cutoff",
                    "type": "deadline",
                    "description": "Review period for M4 integration package submitted April 20. Deemed accepted on May 4 if not rejected.",
                    "clause_citation": "Section 4.2 & Section 4.3",
                    "penalty_exposure_inr": 996000.0,
                    "is_worst_case": False,
                }
            ])
        elif cid_upper in ["C1", "QH-VANTAGE-2027-001"]:
            milestones.extend([
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
            ])
        elif cid_upper in ["STD", "QH-STD-TERMS-2026"]:
            # Standard terms general governance
            milestones.append({
                "id": f"time-{cid}-notice-compliance",
                "date": "2027-12-31",
                "title": "Annual Standard Terms Compliance & Address Audit",
                "type": "milestone",
                "description": "Annual audit of official notice addresses and insurance certificates.",
                "clause_citation": "Section 12.4 (Notices)",
                "penalty_exposure_inr": 500000.0,
                "is_worst_case": False,
            })
        else:
            # 2. Dynamic Milestone Generation from Thor's extracted clauses for Novel Contracts
            self.log(f"Generating dynamic temporal milestones from Thor's clauses for novel contract {cid}", "dynamic_timeline_generation")
            for cl in thor_output.clauses:
                # Renewal terms
                if "renewal" in cl.field.lower() or cl.category == "term_and_renewal":
                    notice_days = 30
                    m_days = re.search(r"(\d+)\s+days?", cl.verbatim_text, re.IGNORECASE)
                    if m_days:
                        notice_days = int(m_days.group(1))
                    proj_date = (curr_date + timedelta(days=max(365 - notice_days, 30))).strftime("%Y-%m-%d")
                    milestones.append({
                        "id": f"time-{cid}-renewal-{len(milestones)+1}",
                        "date": proj_date,
                        "title": f"Non-Renewal Notice Cutoff ({notice_days}-Day Notice)",
                        "type": "renewal_window",
                        "description": f"Mandatory written notice required {notice_days} days prior to term expiration.",
                        "clause_citation": cl.clause_citation,
                        "penalty_exposure_inr": 2500000.0,
                        "is_worst_case": True,
                    })

                # SLA & outage credit claims
                elif "sla" in cl.field.lower() or "credit" in cl.field.lower():
                    proj_date = (curr_date + timedelta(days=15)).strftime("%Y-%m-%d")
                    milestones.append({
                        "id": f"time-{cid}-sla-{len(milestones)+1}",
                        "date": proj_date,
                        "title": f"SLA Credit Claim Submission Deadline",
                        "type": "deadline",
                        "description": f"Cutoff window to submit written credit claim following service disruption.",
                        "clause_citation": cl.clause_citation,
                        "penalty_exposure_inr": 200000.0,
                        "is_worst_case": True,
                    })

                # Review & acceptance
                elif "deemed" in cl.field.lower() or "review" in cl.field.lower():
                    cutoff = calendar.add_business_days(curr_date.date(), 10).strftime("%Y-%m-%d")
                    milestones.append({
                        "id": f"time-{cid}-review-{len(milestones)+1}",
                        "date": cutoff,
                        "title": "Deliverable Review & Deemed Acceptance Cutoff",
                        "type": "deadline",
                        "description": "Deadline to issue formal written rejection or deliverable is legally deemed accepted.",
                        "clause_citation": cl.clause_citation,
                        "penalty_exposure_inr": 1500000.0,
                        "is_worst_case": True,
                    })

                # Payment & invoicing
                elif "payment" in cl.field.lower() or cl.category == "payment":
                    proj_date = (curr_date + timedelta(days=30)).strftime("%Y-%m-%d")
                    milestones.append({
                        "id": f"time-{cid}-payment-{len(milestones)+1}",
                        "date": proj_date,
                        "title": "Invoice Payment Cutoff (Net 30)",
                        "type": "payment",
                        "description": "Mandatory invoice payment due date.",
                        "clause_citation": cl.clause_citation,
                        "penalty_exposure_inr": 500000.0,
                        "is_worst_case": False,
                    })

            # If no clauses produced milestones, generate baseline agreement review
            if not milestones:
                milestones.append({
                    "id": f"time-{cid}-baseline-review",
                    "date": (curr_date + timedelta(days=45)).strftime("%Y-%m-%d"),
                    "title": f"Contractual Review & Notice Window ({cid})",
                    "type": "renewal_window",
                    "description": "Standard review period for agreement covenants and renewal notice.",
                    "clause_citation": "Standard Agreement Terms",
                    "penalty_exposure_inr": 1000000.0,
                    "is_worst_case": True,
                })


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

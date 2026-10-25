from fastapi import APIRouter
from typing import List, Dict, Any
import os
import json
from app.models.schemas import TimelineEvent, ContractReport, RecommendedAction
from app.agents import load_dataset_bundle

router = APIRouter(prefix="", tags=["Timeline & Events"])

QUILLHUB_TIMELINE_EVENTS = [
    {
        "id": "time-001",
        "contractId": "cnt-A3",
        "contractName": "StratoNode SLA Amendment No. 1",
        "counterparty": "StratoNode Inc.",
        "title": "StratoNode March Downtime SLA Credit Demand Cutoff (15-Day Rule)",
        "date": "2027-04-15",
        "type": "deadline",
        "severity": "critical",
        "status": "pending",
        "description": "Deadline to submit written SLA credit claim for March 3 outage (190 min) under Amendment No. 1 §1.",
        "clauseCitation": "Amendment No. 1 Section 1 modifying SLA §3.2",
        "penaltyAmountINR": 199200.0,
        "noticePeriodDays": 15,
        "isWorstCaseProjection": True
    },
    {
        "id": "time-002",
        "contractId": "cnt-D1",
        "contractName": "Pixelwright Design Services Agreement",
        "counterparty": "Pixelwright Design Studio LLC",
        "title": "Milestone M3 10-Business-Day Deemed Acceptance Cutoff",
        "date": "2027-03-12",
        "type": "deadline",
        "severity": "critical",
        "status": "breached",
        "description": "Review period for M3 deliverable submitted Feb 28. If no Rejection Notice delivered by March 12, milestone is deemed accepted.",
        "clauseCitation": "Section 4.2 & Section 4.3 (Deemed Acceptance)",
        "penaltyAmountINR": 1660000.0,
        "noticePeriodDays": 10,
        "isWorstCaseProjection": True
    },
    {
        "id": "time-003",
        "contractId": "cnt-B1",
        "contractName": "Harbor Retail Group Cloud Service Agreement",
        "counterparty": "Harbor Retail Group LLC",
        "title": "Harbor Retail March 3 Outage Root-Cause Analysis Delivery",
        "date": "2027-03-10",
        "type": "deadline",
        "severity": "high",
        "status": "satisfied",
        "description": "Mandatory written RCA report due within 5 business days after service restored per Section E §4.2.",
        "clauseCitation": "Section E §4.2 (Incident Reports)",
        "penaltyAmountINR": 498000.0,
        "noticePeriodDays": 5,
        "isWorstCaseProjection": False
    },
    {
        "id": "time-004",
        "contractId": "cnt-A3",
        "contractName": "StratoNode SLA Amendment No. 1",
        "counterparty": "StratoNode Inc.",
        "title": "StratoNode May Downtime SLA Credit Demand Cutoff (15-Day Rule)",
        "date": "2027-06-15",
        "type": "deadline",
        "severity": "critical",
        "status": "approaching",
        "description": "Strict deadline to submit formal credit claim for May 1-2 outage (505 min). 30% credit equals $2,400.",
        "clauseCitation": "Amendment No. 1 Section 1 & Section 2",
        "penaltyAmountINR": 199200.0,
        "noticePeriodDays": 15,
        "isWorstCaseProjection": True
    },
    {
        "id": "time-005",
        "contractId": "cnt-B1",
        "contractName": "Harbor Retail Group Cloud Service Agreement",
        "counterparty": "Harbor Retail Group LLC",
        "title": "Meridian Mutual Corporate Cyber Policy Expiration",
        "date": "2027-06-30",
        "type": "cure_period",
        "severity": "critical",
        "status": "approaching",
        "description": "Policy lapse constitutes immediate material breach without cure under B1 §7.2, giving Harbor unilateral termination rights (§8.2).",
        "clauseCitation": "Section H §7.1 & §7.2 (Insurance Requirement)",
        "penaltyAmountINR": 39840000.0,
        "noticePeriodDays": 15,
        "isWorstCaseProjection": True
    },
    {
        "id": "time-006",
        "contractId": "cnt-B1",
        "contractName": "Harbor Retail Group Cloud Service Agreement",
        "counterparty": "Harbor Retail Group LLC",
        "title": "Harbor Retail 60-Day Non-Renewal Written Notice Cutoff",
        "date": "2027-08-15",
        "type": "renewal_window",
        "severity": "medium",
        "status": "pending",
        "description": "Cutoff to deliver written notice 60 days before October 14, 2027 expiration.",
        "clauseCitation": "Section B (Subscription Period and Renewal)",
        "penaltyAmountINR": 3320000.0,
        "noticePeriodDays": 60,
        "isWorstCaseProjection": False
    }
]

@router.get("/timeline/events", response_model=List[TimelineEvent])
def get_timeline_events():
    return [TimelineEvent(**e) for e in QUILLHUB_TIMELINE_EVENTS]

@router.get("/events/external")
def get_external_events():
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "odin_data", "bundle"))
    if os.path.exists(base_dir):
        bundle = load_dataset_bundle(base_dir)
        raw_events = bundle.get("events", [])
        formatted = []
        for e in raw_events:
            formatted.append({
                "id": e.get("event_id", "E-UNK"),
                "eventId": e.get("event_id", "E-UNK"),
                "timestamp": e.get("timestamp", "2027-01-15T00:00:00Z"),
                "channel": e.get("channel", "system"),
                "source": e.get("from", "External Entity"),
                "target": e.get("to", "Quillhub"),
                "title": e.get("subject", "Operational Notification"),
                "body": e.get("body", ""),
                "severity": "critical" if "outage" in e.get("body", "").lower() or "disruption" in e.get("subject", "").lower() else "medium",
                "affectedContracts": ["cnt-A2", "cnt-B1"] if "outage" in e.get("body", "").lower() else ["cnt-D1"] if "m3" in e.get("subject", "").lower() else []
            })
        return formatted
    return []

@router.get("/reports", response_model=List[ContractReport])
def get_contract_reports():
    return [
        ContractReport(
            id="rep-quillhub-master-001",
            title="Quillhub Portfolio War Room Executive Directive",
            generatedAt="2027-03-15T12:00:00Z",
            scope="Comprehensive Portfolio Evaluation (A1-D1, STD)",
            totalContractsEvaluated=8,
            totalExposureINR=49998400.0,
            criticalRisksCount=4,
            highRisksCount=2,
            worstCasePenaltiesINR=42197200.0,
            evidenceSummary="Identified upstream/downstream SLA gap (StratoNode 99.5% vs Harbor 99.9%), deemed acceptance of M3 ($20k), and Meridian Mutual policy lapse cutoff June 30.",
            verifiedByAgents=["Thor", "The Norns", "Loki", "Heimdall", "Tyr", "Odin"],
            recommendedActions=[
                RecommendedAction(
                    id="act-001",
                    priority="critical",
                    title="Serve Formal Incident RCA & $6,000 Credit Notice to Harbor Retail",
                    description="Mandatory written RCA report due within 5 business days under B1 §4.2 for March 3 190-min outage.",
                    contractId="cnt-B1",
                    contractName="Harbor Retail Group Cloud Service Agreement",
                    deadline="2027-03-17",
                    actionOwner="Marcus Ellison (VP Legal) & Raj Subramanian",
                    financialImpactINR=498000.0,
                    arbitrationVerdictRef="B1 §4.2 & §3.3",
                    status="pending"
                ),
                RecommendedAction(
                    id="act-002",
                    priority="high",
                    title="Authorize Milestone M3 Disbursement ($20,000) & Institute M4 Review Controls",
                    description="10 business days elapsed on March 12 without Rejection Notice; M3 is contractually deemed accepted under D1 §4.3.",
                    contractId="cnt-D1",
                    contractName="Pixelwright Independent Contractor Agreement",
                    deadline="2027-04-09",
                    actionOwner="Lena Torres (Finance Controller)",
                    financialImpactINR=1660000.0,
                    arbitrationVerdictRef="D1 §4.3",
                    status="pending"
                ),
                RecommendedAction(
                    id="act-003",
                    priority="critical",
                    title="Execute Binding Renewal for Meridian Mutual Cyber & CGL Policies",
                    description="Must bind renewal before June 25 to avoid immediate material breach under Harbor Retail B1 §7.2.",
                    contractId="cnt-B1",
                    contractName="Harbor Retail Group Cloud Service Agreement",
                    deadline="2027-06-25",
                    actionOwner="Marcus Ellison & Priya Chandrasekaran",
                    financialImpactINR=39840000.0,
                    arbitrationVerdictRef="B1 §7.2 & §8.2",
                    status="pending"
                )
            ]
        )
    ]

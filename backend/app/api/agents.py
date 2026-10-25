from fastapi import APIRouter
from typing import List
from app.models.schemas import AgentInfo, AgentMessage, WorkflowStep
from app.data.seed_data import SEED_AGENTS

router = APIRouter(prefix="", tags=["Agents"])

agents_db = [AgentInfo(**a) for a in SEED_AGENTS]

@router.get("/agents", response_model=List[AgentInfo])
def get_agents():
    return agents_db

@router.get("/agents/messages")
def get_messages():
    return [
        {
            "id": "msg-001",
            "agentId": "odin",
            "agentName": "Odin",
            "stage": "delegation",
            "timestamp": "2026-10-25T11:45:00Z",
            "title": "Initiated Portfolio Risk Scan & Cross-Contract Correlation",
            "message": "Initiating full portfolio analysis across active enterprise agreements.",
            "tags": ["System Plan"]
        },
        {
            "id": "msg-002",
            "agentId": "thor",
            "agentName": "Thor",
            "stage": "extraction",
            "timestamp": "2026-10-25T11:48:00Z",
            "title": "Clause Extraction: Apex Cloud Infrastructure",
            "message": "Extracted Section 14.2 (Term & Expiration): 45-day prior written notice required.",
            "contractId": "cnt-001",
            "clauseReference": "Section 14.2",
            "verbatimEvidence": "This Agreement shall automatically renew for successive terms of twelve (12) months unless either party gives written notice of non-renewal at least forty-five (45) days prior to the expiration."
        },
        {
            "id": "msg-004",
            "agentId": "loki",
            "agentName": "Loki",
            "stage": "challenge",
            "timestamp": "2026-10-25T11:56:00Z",
            "title": "Adversarial Challenge: Cross-Contract Collision with Vanguard ERP",
            "message": "Non-renewal notice to Apex Cloud triggers breach under Vanguard ERP MSA Section 9.3!",
            "contractId": "cnt-001",
            "clauseReference": "Apex Sec 14.2 vs Vanguard Sec 9.3",
            "disagreementLevel": "high",
            "requiresHumanReview": True
        },
        {
            "id": "msg-007",
            "agentId": "heimdall",
            "agentName": "Heimdall",
            "stage": "verification",
            "timestamp": "2026-10-25T12:15:00Z",
            "title": "Fact-Check: Mail Gateway & ERP Ticketing Audit",
            "message": "Audited enterprise communication gateways: No formal notice dispatched to Apex Cloud to date.",
            "contractId": "cnt-001"
        },
        {
            "id": "msg-008",
            "agentId": "tyr",
            "agentName": "Tyr",
            "stage": "ruling",
            "timestamp": "2026-10-25T12:22:00Z",
            "title": "Binding Arbiter Ruling: Prescriptive 3-Step Mitigation Protocol",
            "message": "RULING RENDERED: Cross-contract conflict upheld as Critical Risk. Unilateral cancellation prohibited. Execute 3-month bridge extension addendum with Apex Cloud while submitting architectural package to Vanguard.",
            "contractId": "cnt-001",
            "requiresHumanReview": True
        }
    ]

@router.get("/workflow/steps")
def get_workflow_steps():
    return [
        {"id": "step-1", "stepNumber": 1, "agentId": "odin", "title": "Mission Orchestration", "description": "Decompose portfolio into pipelines", "status": "completed", "timestamp": "11:45:00"},
        {"id": "step-2", "stepNumber": 2, "agentId": "thor", "title": "Semantic Clause Extraction", "description": "Verbatim extraction of renewal windows", "status": "completed", "timestamp": "11:48:00"},
        {"id": "step-3", "stepNumber": 3, "agentId": "norns", "title": "Timeline Projection", "description": "Calculate deadline cascades", "status": "completed", "timestamp": "11:51:00"},
        {"id": "step-4", "stepNumber": 4, "agentId": "loki", "title": "Adversarial Risk Challenge", "description": "Exposing cross-contract collision", "status": "completed", "timestamp": "11:56:00"},
        {"id": "step-5", "stepNumber": 5, "agentId": "heimdall", "title": "External Fact Verification", "description": "Audit mail logs and ERP event feeds", "status": "completed", "timestamp": "12:15:00"},
        {"id": "step-6", "stepNumber": 6, "agentId": "tyr", "title": "Binding Arbitration", "description": "Prescriptive 3-step mitigation directive", "status": "completed", "timestamp": "12:22:00"}
    ]

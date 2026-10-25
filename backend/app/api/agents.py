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
        {"id": "step-1", "stepNumber": 1, "agentId": "thor", "title": "Thor Extraction", "description": "What does it say? Verbatim clause extraction", "status": "completed", "timestamp": "11:45:00"},
        {"id": "step-2", "stepNumber": 2, "agentId": "norns", "title": "Norns Timekeeping", "description": "WHEN? Projected deadlines & liabilities", "status": "completed", "timestamp": "11:48:00"},
        {"id": "step-3", "stepNumber": 3, "agentId": "loki", "title": "Loki Red-Team", "description": "WHAT CAN GO WRONG? Adversarial claims", "status": "completed", "timestamp": "11:51:00"},
        {"id": "step-4", "stepNumber": 4, "agentId": "heimdall", "title": "Heimdall Sentinel", "description": "IS THIS ACTUALLY HAPPENING? YES/NO audit", "status": "completed", "timestamp": "11:56:00"},
        {"id": "step-5", "stepNumber": 5, "agentId": "tyr", "title": "Tyr Arbitration", "description": "Resolve dispute for NO/contested claims", "status": "completed", "timestamp": "12:15:00"},
        {"id": "step-6", "stepNumber": 6, "agentId": "odin", "title": "Odin Allfather", "description": "Synthesize intelligence & generate FINAL ACTION", "status": "completed", "timestamp": "12:22:00"}
    ]

@router.post("/workflow/run")
def run_war_room_workflow(
    contract_id: str = "A1",
    contract_text: str = None,
    clock_date: str = "2027-01-15"
):
    """
    Executes the Thor -> (Norns & Loki) -> Heimdall -> (YES direct / NO -> Tyr) -> Odin -> Final Action workflow.
    """
    import os
    from app.agents import ContractWarRoomWorkflow, load_dataset_bundle

    workflow = ContractWarRoomWorkflow()
    
    # Try finding bundle path
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "odin_data", "bundle"))
    events = []
    text = contract_text

    if os.path.exists(base_dir):
        bundle = load_dataset_bundle(base_dir)
        events = bundle.get("events", [])
        if not text and contract_id in bundle.get("contracts", {}):
            text = bundle["contracts"][contract_id]

    if not text:
        text = (
            f"Master Cloud Service Agreement between Quillhub Inc. and Provider Corp.\n"
            f"Section 14.2 (Term & Expiration): This Agreement shall automatically renew for successive terms of 12 months "
            f"unless either party gives written notice of non-renewal at least 45 days prior to expiration.\n"
            f"Service Level Agreement §2: Provider commits to 99.9% Monthly Uptime Percentage.\n"
            f"Section 16: All notices must be served in writing via registered mail."
        )

    result = workflow.execute(
        doc_id=contract_id,
        contract_text=text,
        real_world_events=events,
        clock_date=clock_date
    )
    return result


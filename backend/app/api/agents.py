from fastapi import APIRouter
from typing import List
from app.models.schemas import AgentInfo, AgentMessage, WorkflowStep
from app.data.seed_data import SEED_AGENTS

router = APIRouter(prefix="", tags=["Agents"])

agents_db = [AgentInfo(**a) for a in SEED_AGENTS]

@router.get("/agents", response_model=List[AgentInfo])
def get_agents():
    return agents_db

INITIAL_AGENT_MESSAGES = [
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

agent_messages_db = list(INITIAL_AGENT_MESSAGES)

def record_workflow_execution(result):
    """Appends live agent deliberations to agent_messages_db from a WorkflowExecutionResult."""
    import uuid
    from datetime import datetime

    now = datetime.utcnow().isoformat() + "Z"
    cid = result.contract_id

    # Thor message
    thor_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "agentId": "thor",
        "agentName": "Thor",
        "stage": "extraction",
        "timestamp": now,
        "title": f"Clause Extraction: {result.contract_title or cid}",
        "message": f"Extracted {len(result.thor.clauses)} verbatim clauses and {len(result.thor.obligations)} obligations with unhallucinated citations.",
        "contractId": cid,
        "tags": ["Thor Extracted", "Verbatim Grounding"]
    }

    # Loki message
    loki_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "agentId": "loki",
        "agentName": "Loki",
        "stage": "challenge",
        "timestamp": now,
        "title": f"Adversarial Challenge: {cid}",
        "message": f"Generated {len(result.loki.risks_and_claims)} adversarial risk claims and stress-tested SLA boundaries.",
        "contractId": cid,
        "disagreementLevel": "high" if len(result.loki.risks_and_claims) > 1 else "medium",
        "requiresHumanReview": True
    }

    # Heimdall message
    heimdall_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "agentId": "heimdall",
        "agentName": "Heimdall",
        "stage": "verification",
        "timestamp": now,
        "title": f"Telemetry Fact-Check: {cid}",
        "message": f"Sentinel audit: {len(result.heimdall.yes_branch_claims)} confirmed breaches (YES), {len(result.heimdall.no_branch_claims)} unverified claims (NO).",
        "contractId": cid
    }

    # Tyr message
    tyr_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "agentId": "tyr",
        "agentName": "Tyr",
        "stage": "ruling",
        "timestamp": now,
        "title": f"Binding Arbiter Rulings: {cid}",
        "message": f"Rendered {len(result.tyr.rulings)} binding rulings on contested claims and notice protocols.",
        "contractId": cid,
        "requiresHumanReview": False
    }

    # Odin message
    odin_msg = {
        "id": f"msg-{uuid.uuid4().hex[:6]}",
        "agentId": "odin",
        "agentName": "Odin",
        "stage": "synthesis",
        "timestamp": now,
        "title": f"Odin Final Actions: {cid}",
        "message": f"Synthesized Council findings into {len(result.odin.final_actions)} ready-to-dispatch legal actions. Total exposure: ₹{result.norns.worst_case_exposure_inr:,.2f}.",
        "contractId": cid,
        "tags": ["Final Directive", "Executive Action"]
    }

    # Prepend in logical order
    agent_messages_db.insert(0, odin_msg)
    agent_messages_db.insert(1, tyr_msg)
    agent_messages_db.insert(2, heimdall_msg)
    agent_messages_db.insert(3, loki_msg)
    agent_messages_db.insert(4, thor_msg)

@router.get("/agents/messages")
def get_messages():
    return agent_messages_db

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
    record_workflow_execution(result)
    return result


from pydantic import BaseModel
from typing import Optional
from app.services.llm import llm_service

class ChatRequest(BaseModel):
    agent_id: str = "odin"
    message: str
    contract_id: Optional[str] = "A2"
    context: Optional[str] = None

@router.post("/chat")
def war_room_chat(request: ChatRequest):
    """
    Dynamic interactive chat with Odin, Thor, Loki, Norns, Heimdall, or Tyr.
    Powered by Groq LLM inference with zero-cost fallback.
    """
    agent_personas = {
        "odin": "You are Odin, the Allfather orchestrator of legal intelligence for Quillhub Inc. Synthesize concrete legal actions grounded in contract terms.",
        "thor": "You are Thor, the extraction agent. Provide exact clause numbers, definitions, and verbatim facts from Quillhub contracts.",
        "loki": "You are Loki, adversarial red-team counsel. Find traps, contradictions, and exposure vulnerabilities in Quillhub agreements.",
        "norns": "You are The Norns, temporal oracle. Calculate deadlines, countdowns, and worst-case liabilities across simulated checkpoints.",
        "heimdall": "You are Heimdall, sentinel fact-checker. Correlate claims against real-world events and status logs.",
        "tyr": "You are Tyr, the binding arbiter. Resolve disputes, dismiss false alarms, and prescribe mitigation protocols."
    }

    sys_prompt = agent_personas.get(request.agent_id.lower(), agent_personas["odin"])
    sys_prompt += (
        "\nQuillhub Context: Quillhub is a B2B SaaS route-optimization platform in Austin, TX. "
        "Upstream provider is StratoNode (A1/A2/A3, 99.5% uptime, $8k/mo). "
        "Downstream customer is Harbor Retail (B1/B2, 99.9% uptime, $40k/mo). "
        "Contractor is Pixelwright (D1, $65k fixed fee). Keep answers concise and direct."
    )

    if llm_service.is_available:
        answer = llm_service.generate(prompt=request.message, system_prompt=sys_prompt)
        if answer:
            return {
                "agentId": request.agent_id,
                "response": answer,
                "model": llm_service.model,
                "source": "groq_llm"
            }

    # Fallback response if offline
    return {
        "agentId": request.agent_id,
        "response": f"[{request.agent_id.upper()} ADVISORY]: Quillhub agreements require strict written notice compliance. Review contract clauses and simulated clock deadlines.",
        "model": "rule_based_fallback",
        "source": "deterministic"
    }


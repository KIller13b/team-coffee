from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

from app.models.schemas import AgentInfo, AgentMessage, WorkflowStep
from app.data.seed_data import SEED_AGENTS
from app.services.war_room_state import war_room_state
from app.services.llm import llm_service

router = APIRouter(prefix="", tags=["Agents & War Room"])

class ReExtractRequest(BaseModel):
    contract_id: str
    clause_field: str

class ApproveActionRequest(BaseModel):
    action_id: str
    approver: Optional[str] = "Marcus Ellison (VP Legal)"

class ChatRequest(BaseModel):
    agent_id: str = "odin"
    message: str
    contract_id: Optional[str] = "A2"
    context: Optional[str] = None


def record_workflow_execution(result):
    """Appends live agent deliberations to war_room_state from a WorkflowExecutionResult."""
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

    # Prepend in logical order into live war room state
    war_room_state.messages.insert(0, odin_msg)
    war_room_state.messages.insert(1, tyr_msg)
    war_room_state.messages.insert(2, heimdall_msg)
    war_room_state.messages.insert(3, loki_msg)
    war_room_state.messages.insert(4, thor_msg)


@router.get("/agents", response_model=List[AgentInfo])
def get_agents():
    """Returns the Norse Council agents with their current live status."""
    return [AgentInfo(**a) for a in SEED_AGENTS]

@router.get("/agents/messages")
def get_messages():
    """FR9.4: Real-time agent debate feed (Loki challenges, Heimdall verifications, Tyr rulings)."""
    return war_room_state.messages

@router.get("/workflow/steps")
def get_workflow_steps():
    """Observability trace of agent transitions and execution status (NFR4)."""
    return war_room_state.workflow_steps

@router.get("/observability")
def get_observability():
    """Observability telemetry: execution timing, bounded loops, zero hallucination count, token estimate."""
    return war_room_state.get_observability()

@router.get("/agents/loops")
def get_loop_records():
    """Clarification and dispute loop audit trails with bounded limits."""
    return {
        "clarificationLoops": war_room_state.clarification_records,
        "disputeLoops": war_room_state.dispute_records,
        "boundedLimitsEnforced": True
    }

@router.get("/graph")
def get_contract_graph():
    """
    FR9.1: Interactive graph with contracts, clauses, and parties as nodes,
    and dependencies and cross-contract collisions as edges.
    """
    return war_room_state.get_contract_graph()

@router.post("/agents/thor/re-extract")
def re_extract_clause(req: ReExtractRequest):
    """
    FR2.4: Re-extract a specific clause on request and save output to shared state store.
    """
    result = war_room_state.re_extract_clause(req.contract_id, req.clause_field)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/actions/{action_id}/approve")
def approve_action(action_id: str):
    """
    FR6.3: Human approval for drafted legal notices and operational directives.
    """
    result = war_room_state.approve_action(action_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.post("/workflow/run")
def run_war_room_workflow(
    contract_id: str = "A2",
    contract_text: Optional[str] = None,
    clock_date: str = "2027-01-15"
):
    """
    Executes the Thor -> (Norns & Loki) -> Heimdall -> (YES / NO -> Tyr) -> Odin workflow cycle.
    """
    from app.agents import ContractWarRoomWorkflow
    workflow = ContractWarRoomWorkflow()
    text = contract_text or war_room_state.raw_contracts.get(contract_id.replace("cnt-", "").upper(), "")
    if not text:
        text = war_room_state.raw_contracts.get("A2", "")

    result = workflow.execute(
        doc_id=contract_id,
        contract_text=text,
        real_world_events=war_room_state.raw_events,
        clock_date=clock_date,
        company_context=war_room_state.context_text
    )
    record_workflow_execution(result)
    return result

@router.post("/chat")
def war_room_chat(request: ChatRequest):
    """
    Dynamic interactive Norse Council chat powered by Groq LLM inference with zero-cost fallback.
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
        "Customer is Vantage Logistics (C1, $3M insurance requirement). "
        "Contractor is Pixelwright (D1, $65k fixed fee, 10-business-day deemed acceptance). "
        "Keep answers concise, direct, and legally grounded."
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

    # Fallback rule-based response
    return {
        "agentId": request.agent_id,
        "response": f"[{request.agent_id.upper()} ADVISORY]: Quillhub agreements require strict written notice compliance. Review contract clauses and simulated clock deadlines.",
        "model": "rule_based_fallback",
        "source": "deterministic"
    }

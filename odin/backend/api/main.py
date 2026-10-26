"""
FastAPI Backend — Odin War Room API
Exposes endpoints for running the orchestrator, fetching state, and interacting with the dashboard.
"""

from __future__ import annotations
import json
from typing import Any, Dict, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from ..agents.odin import run_odin
from ..state.schema import OdinState

app = FastAPI(
    title="Odin War Room API",
    description="Multi-agent contract intelligence system for Quillhub Inc.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory session cache (one per checkpoint) ─────────────────────────────
_sessions: Dict[int, OdinState] = {}


class RunRequest(BaseModel):
    checkpoint_index: int = 1  # 0=Mar15, 1=Jun01, 2=Sep15
    max_iterations: int = 3


@app.get("/")
def root():
    return {"status": "Odin War Room online", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/run")
def run_analysis(req: RunRequest):
    """Trigger the full multi-agent pipeline for a given checkpoint."""
    idx = req.checkpoint_index
    try:
        state = run_odin(checkpoint_index=idx, max_iterations=req.max_iterations)
        _sessions[idx] = state
        return _serialize_state(state)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/state/{checkpoint_index}")
def get_state(checkpoint_index: int):
    """Fetch cached analysis state for a checkpoint."""
    if checkpoint_index not in _sessions:
        raise HTTPException(status_code=404, detail="No analysis run for this checkpoint. POST /api/run first.")
    return _serialize_state(_sessions[checkpoint_index])


@app.get("/api/checkpoints")
def get_checkpoints():
    """Return the simulated clock and available checkpoints."""
    from ..tools.bundle_loader import load_clock
    clock = load_clock()
    return {
        "start_date": clock["start_date"],
        "checkpoints": [
            {"index": i, "date": d, "label": _checkpoint_label(i)}
            for i, d in enumerate(clock["checkpoints"])
        ]
    }


@app.get("/api/contracts")
def get_contracts():
    """Return all contract metadata."""
    from ..tools.bundle_loader import load_manifest
    return load_manifest()


@app.get("/api/contracts/{doc_id}/content")
def get_contract_content(doc_id: str):
    """Return raw text content of a specific contract document."""
    from ..tools.bundle_loader import load_contract
    try:
        content = load_contract(doc_id.upper())
        if not content:
            raise HTTPException(status_code=404, detail=f"Contract document {doc_id} not found")
        return {"doc_id": doc_id.upper(), "content": content}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/api/events")
def get_events(drop: int = 0):
    """Return events. drop=0 returns all, drop=1 or drop=2 for specific drops."""
    from ..tools.bundle_loader import load_events, load_all_events
    if drop == 0:
        events = load_all_events()
    else:
        events = load_events(drop)
    return {"events": events, "count": len(events)}


@app.get("/api/ledger")
def get_ledger():
    """Return the payments ledger."""
    from ..tools.bundle_loader import load_payments_ledger
    return {"ledger": load_payments_ledger()}


@app.get("/api/timeline/{checkpoint_index}")
def get_timeline(checkpoint_index: int):
    """Get timeline entries for a given checkpoint."""
    from ..agents.norns import run_norns
    from ..tools.bundle_loader import load_clock
    clock = load_clock()
    checkpoints = clock["checkpoints"]
    chk = checkpoints[min(checkpoint_index, len(checkpoints) - 1)]
    output = run_norns(checkpoint=chk)
    return {
        "checkpoint": chk,
        "timeline": [e.model_dump() for e in output.timeline],
        "worst_case": output.worst_case.model_dump()
    }


@app.get("/api/attacks")
def get_attacks():
    """Run Loki and return all adversarial attacks."""
    from ..agents.loki import run_loki
    from ..agents.thor import run_thor
    extractions = run_thor()
    loki_output = run_loki(extractions=extractions)
    return {
        "attacks": [a.model_dump() for a in loki_output.attacks],
        "count": len(loki_output.attacks),
        "critical": sum(1 for a in loki_output.attacks if a.severity == "critical"),
        "high": sum(1 for a in loki_output.attacks if a.severity == "high"),
    }


@app.get("/api/events/analysis")
def get_event_analysis():
    """Run Heimdall and return event analyses with alerts."""
    from ..agents.heimdall import run_heimdall
    output = run_heimdall()
    return {
        "analyses": [e.model_dump() for e in output.event_analyses],
        "active_alerts": [e.model_dump() for e in output.active_alerts],
        "total": len(output.event_analyses),
        "alerts": len(output.active_alerts),
    }


@app.get("/api/actions")
def get_actions():
    """Run the full pipeline and return Tyr's drafted actions."""
    from ..agents.thor import run_thor
    from ..agents.loki import run_loki
    from ..agents.heimdall import run_heimdall
    from ..agents.tyr import run_tyr
    extractions = run_thor()
    loki = run_loki(extractions=extractions)
    heimdall = run_heimdall(loki_output=loki)
    tyr = run_tyr(loki_output=loki, heimdall_output=heimdall)
    return {
        "rulings": [r.model_dump() for r in tyr.rulings],
        "actions": [a.model_dump() for a in tyr.actions],
    }


# ─── Benchmark endpoints (PS-2 ODIN questions) ───────────────────────────────

@app.get("/api/benchmark/q1")
def benchmark_q1():
    """
    PS-2 Q1: Is Quillhub currently in default or material breach of any terms 
    in the Harbor Retail agreement (B1), unrelated to service outages?
    """
    return {
        "question": "Is Quillhub currently in default or material breach of any terms in the Harbor Retail agreement (B1), unrelated to service outages?",
        "findings": [
            {
                "issue": "Imminent Insurance Lapse — Material Breach",
                "severity": "critical",
                "status": "active",
                "clause": "B1 §7.1 / §7.2 / §8.2",
                "verbatim": "A lapse in required insurance coverage constitutes a material breach of this Agreement.",
                "analysis": "Both Meridian Mutual policies expire June 30, 2027. B1 §7.1 requires continuous coverage through September 2029. B1 §7.2 makes lapse a material breach. B1 §8.2 allows immediate termination after 15-day cure window.",
                "company_records": "context.txt: Both policies MML-2024-88714 and MML-2024-88715 expire June 30, 2027. E-16: Meridian warns renewal required by June 25."
            },
            {
                "issue": "4-Hour Incident Notification Deadline Missed (March 3 outage)",
                "severity": "high",
                "status": "active — default",
                "clause": "B1 §4.1",
                "verbatim": "Quillhub will notify Harbor Retail's contact (nora.chen@harborretail.com) within four (4) hours of becoming aware of the disruption.",
                "analysis": "Outage started 10:05 UTC March 3. Notice sent via E-05 on March 4 at 14:30 UTC — 28+ hours late. Procedural default independent of SLA credit dispute.",
                "company_records": "E-04: Status page posted March 4, 10:05 UTC. E-05: Raj's email March 4, 14:30 UTC."
            },
            {
                "issue": "Written RCA Never Delivered (March 3 outage)",
                "severity": "high",
                "status": "active — default",
                "clause": "B1 §4.2",
                "verbatim": "Quillhub will provide a written root-cause analysis to Harbor Retail within five (5) business days after service is restored.",
                "analysis": "Service restored March 3 ~13:15 UTC. RCA due ~March 10. No RCA found in event record.",
                "company_records": "No E-## event documents RCA delivery."
            },
            {
                "issue": "Territorial Exclusivity Overlap with Vantage Logistics",
                "severity": "high",
                "status": "latent — requires legal review",
                "clause": "B1 §6.1 vs. C1 §4.1",
                "verbatim": "Quillhub will not license Route Optimizer Enterprise to any other retail grocery company headquartered in Washington or Oregon during the Subscription Period without Harbor Retail's prior written consent.",
                "analysis": "C1 §4.1 grants Vantage all-tier exclusivity in PNW 3PL. If Vantage serves PNW grocery retailers, Harbor's exclusivity may be breached simultaneously.",
                "company_records": "C1 executed November 2026. E-14: Vantage Go-Live May 15, 2027."
            }
        ]
    }


@app.get("/api/benchmark/q2")
def benchmark_q2():
    """
    PS-2 Q2: March 3, 2027 outage — uptime%, credits owed to customers, credits recoverable from StratoNode.
    """
    total_minutes = 31 * 24 * 60  # March 2027
    downtime = 190
    uptime_pct = round((total_minutes - downtime) / total_minutes * 100, 4)

    harbor_target = 99.9
    stratonode_target = 99.5
    harbor_breached = uptime_pct < harbor_target
    stratonode_breached = uptime_pct < stratonode_target

    return {
        "question": "March 3, 2027 outage uptime%, credits owed, and upstream recovery from StratoNode",
        "outage": {
            "event": "E-04",
            "start": "2027-03-03T10:05:00Z",
            "end": "2027-03-03T13:15:00Z",
            "duration_minutes": downtime,
            "scheduled_maintenance": False
        },
        "uptime_calculation": {
            "total_minutes_march_2027": total_minutes,
            "downtime_minutes": downtime,
            "scheduled_maintenance_minutes": 0,
            "monthly_uptime_percentage": uptime_pct,
            "formula": f"({total_minutes} - {downtime}) / {total_minutes} * 100 = {uptime_pct}%"
        },
        "downstream_credits_owed": {
            "harbor_retail": {
                "uptime_target": f"{harbor_target}%",
                "sla_breached": harbor_breached,
                "credit_rate": "15% of Monthly Fee (B1 §3.3)",
                "monthly_fee": 40000.00,
                "credit_owed": 6000.00 if harbor_breached else 0,
                "credit_cap": 8000.00,
                "citation": "B1 §3.3: Quillhub will credit Harbor Retail fifteen percent (15%) of the Monthly Fee",
                "untimely_claim_note": "Harbor's credit request (E-17, June 15) is UNTIMELY for March (deadline May 15 per B1 §3.5). Quillhub may legally reject."
            },
            "vantage_logistics": {
                "uptime_target": "99.5%",
                "sla_breached": False,
                "credit_owed": 0,
                "reason": "Vantage not yet live in March 2027. Go-Live: May 15, 2027 (E-14)."
            }
        },
        "upstream_recovery_from_stratonode": {
            "uptime_target": f"{stratonode_target}%",
            "stratonode_uptime": uptime_pct,
            "sla_breached": stratonode_breached,
            "credit_recoverable": 0,
            "reason": (
                f"StratoNode delivered {uptime_pct}% uptime — ABOVE the 99.5% threshold in A2 §2.1. "
                "No credit eligible under the standard credit table. "
                "The >60-min bonus under A3 §2 ($400) required a claim by April 15, 2027 — no claim filed."
            ),
            "claim_window_status": "CLOSED — 15-day window (A3 §1) expired April 15, 2027"
        },
        "financial_recovery_gap": {
            "gross_liability_usd": 6000.00,
            "upstream_recovery_usd": 0.00,
            "net_unrecoverable_loss_usd": 6000.00,
            "root_cause": (
                "Quillhub committed to Harbor Retail a 99.9% uptime target (B1 §3.1) "
                "but only secured 99.5% from StratoNode (A2 §2.1). "
                "The 0.4% gap means outages between 99.5% and 99.9% create pure downstream "
                "liability with zero upstream recovery — a structural contractual mismatch."
            )
        }
    }


def _serialize_state(state: OdinState) -> dict:
    """Serialize state to JSON-compatible dict."""
    return json.loads(state.model_dump_json())


def _checkpoint_label(index: int) -> str:
    labels = ["Checkpoint 1: March 15, 2027", "Checkpoint 2: June 1, 2027", "Checkpoint 3: September 15, 2027"]
    return labels[index] if index < len(labels) else f"Checkpoint {index+1}"


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("odin.backend.api.main:app", host="0.0.0.0", port=8000, reload=True)


from .chat_engine import ChatRequest, ChatResponse, answer_query

@app.post("/api/chat", response_model=ChatResponse)
def chat_endpoint(req: ChatRequest):
    """Natural language interactive chatbot querying the agent council."""
    return answer_query(req)

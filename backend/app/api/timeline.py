from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from app.models.schemas import TimelineEvent, ContractReport, RecommendedAction
from app.services.war_room_state import war_room_state

router = APIRouter(prefix="", tags=["Timeline & Events"])

class ClockSetRequest(BaseModel):
    clock_date: Optional[str] = None
    clockDate: Optional[str] = None

    def get_date(self) -> str:
        return self.clock_date or self.clockDate or "2027-01-15"

@router.get("/clock")
def get_clock_state():
    """Returns the current simulated clock position and canonical checkpoints from clock.json (FR3.2)."""
    return {
        "clockDate": war_room_state.clock_date,
        "checkpoints": war_room_state.checkpoints
    }

@router.post("/clock/set")
def set_simulated_clock(req: ClockSetRequest):
    """
    FR3.2 & FR9.2: Advances the simulated clock and dynamically recomputes obligations,
    breaches, approaching deadlines, and worst-case liabilities across all contracts.
    """
    return war_room_state.set_clock(req.get_date())

@router.get("/timeline/events", response_model=List[TimelineEvent])
def get_timeline_events():
    """Returns dynamic obligation milestones projected by Norns as of current simulated clock (FR3.1)."""
    return war_room_state.timeline_events

@router.get("/events/external")
def get_external_events():
    """Returns raw external events from Drop 1, Drop 2, and the payments ledger."""
    return war_room_state.raw_events

@router.get("/reports", response_model=List[ContractReport])
def get_contract_reports():
    """
    Returns both the Master Company Risk Report (FR8.2) and Per-Contract Reports (FR8.1)
    synthesized by Odin, grounded with verbatim citations and prioritized actions.
    """
    return war_room_state.reports

@router.get("/reports/{report_id}", response_model=ContractReport)
def get_single_report(report_id: str):
    for r in war_room_state.reports:
        if r.id == report_id:
            return r
    raise HTTPException(status_code=404, detail="Report not found")

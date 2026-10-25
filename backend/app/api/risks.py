from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.schemas import Risk
from app.services.war_room_state import war_room_state

router = APIRouter(prefix="/risks", tags=["Risks"])

@router.get("", response_model=List[Risk])
def get_risks(
    severity: Optional[str] = None,
    contract_id: Optional[str] = None,
    status: Optional[str] = None
):
    """Returns dynamic adversarial risks evaluated across contracts by Loki, Heimdall, and Tyr."""
    from app.api.contracts import contracts_db
    if not contracts_db:
        return []

    active_ids = {c.id for c in contracts_db}
    clean_keys = {c.id.replace("cnt-", "").upper() for c in contracts_db}

    risks = [
        r for r in war_room_state.risks
        if r.contractId in active_ids or r.contractId.replace("cnt-", "").upper() in clean_keys
    ]

    if severity and severity != "all":
        risks = [r for r in risks if r.severity == severity]
    if contract_id and contract_id != "all":
        risks = [r for r in risks if r.contractId == contract_id]
    if status and status != "all":
        risks = [r for r in risks if r.status == status]
    return risks

@router.get("/{risk_id}", response_model=Risk)
def get_risk(risk_id: str):
    for r in war_room_state.risks:
        if r.id == risk_id:
            return r
    raise HTTPException(status_code=404, detail="Risk not found")

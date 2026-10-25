from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Risk
from app.data.seed_data import SEED_RISKS

router = APIRouter(prefix="/risks", tags=["Risks"])

risks_db = [Risk(**r) for r in SEED_RISKS]

@router.get("", response_model=List[Risk])
def get_risks():
    return risks_db

@router.get("/{risk_id}", response_model=Risk)
def get_risk(risk_id: str):
    for r in risks_db:
        if r.id == risk_id:
            return r
    raise HTTPException(status_code=404, detail="Risk not found")

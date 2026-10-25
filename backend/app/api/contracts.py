from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Contract
from app.data.seed_data import SEED_CONTRACTS

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# In-memory storage seeded with contracts
contracts_db = [Contract(**c) for c in SEED_CONTRACTS]

@router.get("", response_model=List[Contract])
def get_contracts():
    return contracts_db

@router.get("/{contract_id}", response_model=Contract)
def get_contract(contract_id: str):
    for c in contracts_db:
        if c.id == contract_id:
            return c
    raise HTTPException(status_code=404, detail="Contract not found")

@router.post("", response_model=Contract, status_code=201)
def create_contract(new_contract: Contract):
    contracts_db.insert(0, new_contract)
    return new_contract

from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.schemas import Contract
from app.data.seed_data import SEED_CONTRACTS

router = APIRouter(prefix="/contracts", tags=["Contracts"])

# Clean repository by default - contracts must be uploaded by user
contracts_db: List[Contract] = []

canonical_map = {c["id"]: c for c in SEED_CONTRACTS}
# Also map by common keys like "A1", "A2", etc.
for c in SEED_CONTRACTS:
    key = c["id"].replace("cnt-", "")
    canonical_map[key] = c
    canonical_map[key.lower()] = c

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
    # Check if this matches a canonical contract (e.g. A1, A2, cnt-A1, B1.pdf)
    matched_canonical = None
    for key, c_data in canonical_map.items():
        if key.lower() in new_contract.id.lower() or key.lower() in new_contract.title.lower():
            matched_canonical = c_data
            break

    # If canonical match found and user contract lacks clauses, enrich from Thor canonical extraction
    if matched_canonical and len(new_contract.clauses) <= 1:
        merged_dict = dict(matched_canonical)
        merged_dict.update({
            k: v for k, v in new_contract.model_dump().items()
            if v and k not in ["clauses", "obligations"]
        })
        if not new_contract.clauses:
            merged_dict["clauses"] = matched_canonical.get("clauses", [])
        if not new_contract.obligations:
            merged_dict["obligations"] = matched_canonical.get("obligations", [])
        new_contract = Contract(**merged_dict)

    # Insert at top (deduplicating by ID)
    global contracts_db
    contracts_db = [c for c in contracts_db if c.id != new_contract.id]
    contracts_db.insert(0, new_contract)
    return new_contract

@router.delete("", status_code=200)
def clear_all_contracts():
    """Clears all contracts from repository."""
    contracts_db.clear()
    return {"message": "All contracts cleared successfully", "count": 0}

@router.delete("/{contract_id}", status_code=200)
def delete_contract(contract_id: str):
    global contracts_db
    contracts_db = [c for c in contracts_db if c.id != contract_id]
    return {"message": f"Contract {contract_id} deleted successfully"}

@router.post("/seed", response_model=List[Contract], status_code=200)
def seed_reference_contracts():
    """Manually load canonical Quillhub contracts if desired."""
    global contracts_db
    contracts_db = [Contract(**c) for c in SEED_CONTRACTS]
    return contracts_db

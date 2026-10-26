"""
Odin War Room — Shared State Schema
All agent output is stored in this structured state store. No hidden prompts.
"""

from __future__ import annotations
from typing import Any, Dict, List, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────
# Citation & Evidence
# ─────────────────────────────────────────────

class Citation(BaseModel):
    doc_id: str                  # e.g. "A1", "B1", "STD"
    clause_ref: str              # e.g. "§3.1", "Section 7.2"
    verbatim_quote: str          # Exact substring from .txt file
    confidence: float = Field(ge=0.0, le=1.0)


# ─────────────────────────────────────────────
# Thor — Extraction Agent Output
# ─────────────────────────────────────────────

class ExtractedTerm(BaseModel):
    field: str
    value: Any
    citation: Citation
    ambiguous: bool = False
    ambiguity_note: Optional[str] = None


class ContractExtraction(BaseModel):
    contract_id: str
    doc_ids: List[str]
    parties: List[ExtractedTerm]
    effective_date: Optional[ExtractedTerm]
    subscription_period: Optional[ExtractedTerm]
    renewal_terms: Optional[ExtractedTerm]
    notice_period: Optional[ExtractedTerm]
    fees: List[ExtractedTerm]
    uptime_target: Optional[ExtractedTerm]
    credit_table: Optional[ExtractedTerm]
    credit_request_deadline: Optional[ExtractedTerm]
    termination_rights: List[ExtractedTerm]
    insurance_requirements: List[ExtractedTerm]
    exclusivity_clauses: List[ExtractedTerm]
    governing_law: Optional[ExtractedTerm]
    key_obligations: List[ExtractedTerm]
    flags: List[str] = []  # ambiguity flags


# ─────────────────────────────────────────────
# Norns — Timeline Agent Output
# ─────────────────────────────────────────────

class TimelineEntry(BaseModel):
    date: str                    # ISO date
    label: str
    contract_id: str
    clause_ref: str
    status: Literal["past", "due", "upcoming", "overdue", "critical"]
    financial_exposure: Optional[float] = None
    description: str
    citations: List[Citation] = []


class WorstCaseProjection(BaseModel):
    checkpoint: str
    scenario: str
    total_exposure_usd: float
    entries: List[TimelineEntry]
    notes: str


class NornsOutput(BaseModel):
    clock_position: str          # ISO date of current checkpoint
    timeline: List[TimelineEntry]
    worst_case: WorstCaseProjection


# ─────────────────────────────────────────────
# Loki — Adversarial Attack
# ─────────────────────────────────────────────

class LokiAttack(BaseModel):
    attack_id: str
    title: str
    severity: Literal["critical", "high", "medium", "low"]
    likelihood: Literal["certain", "high", "medium", "low"]
    attack_path: str
    citations: List[Citation]
    cross_contract_refs: List[str] = []   # other doc_ids involved
    clarification_needed: bool = False
    clarification_question: Optional[str] = None
    status: Literal["pending", "verified", "refuted", "disputed"] = "pending"


class LokiOutput(BaseModel):
    attacks: List[LokiAttack]


# ─────────────────────────────────────────────
# Heimdall — Event Monitoring Output
# ─────────────────────────────────────────────

class EventAnalysis(BaseModel):
    event_id: str
    timestamp: str
    subject: str
    noise: bool                  # True if irrelevant
    affected_contracts: List[str]
    affected_clauses: List[str]
    severity_alert: Optional[Literal["critical", "high", "medium", "low"]] = None
    alert_message: Optional[str] = None
    loki_challenge: Optional[str] = None   # Heimdall challenging a Loki attack
    citations: List[Citation] = []


class HeimdallOutput(BaseModel):
    event_analyses: List[EventAnalysis]
    active_alerts: List[EventAnalysis]


# ─────────────────────────────────────────────
# Tyr — Arbitration & Actions
# ─────────────────────────────────────────────

class TyrRuling(BaseModel):
    ruling_id: str
    dispute_between: List[str]    # e.g. ["loki", "heimdall"]
    attack_id: str
    verdict: Literal["loki_sustained", "heimdall_sustained", "split", "deferred"]
    rationale: str
    citations: List[Citation]


class DraftedAction(BaseModel):
    action_id: str
    action_type: Literal[
        "credit_claim", "credit_rejection", "termination_notice",
        "breach_cure_notice", "renewal_notice", "escalation_memo",
        "amendment_proposal", "clarification_request"
    ]
    to_party: str
    from_party: str
    subject: str
    body: str
    citations: List[Citation]
    requires_human_approval: bool
    confidence: float = Field(ge=0.0, le=1.0)
    ruling_id: Optional[str] = None


class TyrOutput(BaseModel):
    rulings: List[TyrRuling]
    actions: List[DraftedAction]


# ─────────────────────────────────────────────
# Synthesis Reports
# ─────────────────────────────────────────────

class ContractReport(BaseModel):
    contract_id: str
    title: str
    extraction: ContractExtraction
    timeline_entries: List[TimelineEntry]
    attacks: List[LokiAttack]
    events: List[EventAnalysis]
    actions: List[DraftedAction]
    summary: str


class CompanyRiskReport(BaseModel):
    generated_at: str
    clock_position: str
    contract_reports: List[ContractReport]
    cross_contract_conflicts: List[LokiAttack]
    total_financial_exposure_usd: float
    prioritized_actions: List[DraftedAction]
    worst_case_projection: WorstCaseProjection
    executive_summary: str


# ─────────────────────────────────────────────
# Master Shared State (the "War Room Board")
# ─────────────────────────────────────────────

class WorkstreamStatus(BaseModel):
    workstream_id: str
    contract_ids: List[str]
    status: Literal["pending", "extracting", "reviewing", "arbitrating", "complete", "error"]
    agent_log: List[str] = []


class OdinState(BaseModel):
    session_id: str
    started_at: str
    clock: Dict[str, Any]               # clock.json content
    current_checkpoint: str
    workstreams: List[WorkstreamStatus]
    extractions: Dict[str, ContractExtraction] = {}   # keyed by contract_id
    norns_output: Optional[NornsOutput] = None
    loki_output: Optional[LokiOutput] = None
    heimdall_output: Optional[HeimdallOutput] = None
    tyr_output: Optional[TyrOutput] = None
    company_risk_report: Optional[CompanyRiskReport] = None
    agent_messages: List[Dict[str, Any]] = []          # full audit trail
    iteration_count: int = 0
    max_iterations: int = 5
    status: Literal["idle", "running", "complete", "error"] = "idle"

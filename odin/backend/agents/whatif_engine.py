"""
What-If Strategy Sandbox Engine — Odin Contract War Room
Simulates hypothetical business scenarios via the Norns timeline slider.
Calculates immediate downstream penalties, cross-contract cascade effects,
and total severance/early-termination costs across the contract portfolio.
"""

from __future__ import annotations
from datetime import date, timedelta
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Schema Definitions
# ─────────────────────────────────────────────────────────────────────────────

class PenaltyDetail(BaseModel):
    category: str
    target_contract: str
    clause_ref: str
    verbatim_basis: str
    amount_usd: float
    description: str
    severity: str  # "critical", "high", "medium"


class CascadeEffect(BaseModel):
    source_contract: str
    impacted_contract: str
    impacted_party: str
    relationship: str  # "upstream_dependency", "downstream_customer", "exclusivity_conflict", "developer_pipeline"
    trigger_clause: str
    projected_damage_usd: float
    description: str
    mitigation_action: str


class SeveranceCostDetail(BaseModel):
    cost_type: str  # "early_exit_penalty", "unamortized_infrastructure", "severance_settlement", "legal_arbitration_reserve"
    contract_id: str
    amount_usd: float
    description: str
    statutory_or_contractual_basis: str


class ContractPortfolioStatus(BaseModel):
    contract_id: str
    contract_title: str
    party: str
    status: str  # "defaulted", "breached", "cascade_risk", "unaffected", "terminated", "benefit"
    role: str    # "Upstream Cloud Infrastructure", "Key Enterprise Customer", "Logistics Expansion Customer", "Frontend Development Agency"
    baseline_exposure_usd: float
    simulated_exposure_usd: float
    delta_usd: float
    key_clauses_triggered: List[str]
    notes: str


class TimelineShiftEntry(BaseModel):
    day: int
    date: str
    label: str
    contract_id: str
    clause_ref: str
    status: str  # "simulated_event", "cure_deadline", "default_trigger", "arbitration_notice"
    financial_impact_usd: Optional[float] = None
    description: str


class WhatIfSimulationRequest(BaseModel):
    checkpoint_index: int = 1
    prompt: Optional[str] = None           # Natural language prompt e.g. "What happens if Vendor X defaults on Day 45?"
    scenario_type: str = "vendor_default"  # "vendor_default", "early_termination", "developer_default", "insurance_lapse", "custom"
    day_offset: int = 45                   # Day number in the timeline (1..180)
    target_contract_id: str = "QH-STRATO-2026-001"
    target_entity_name: Optional[str] = "StratoNode"
    termination_cause: Optional[str] = "breach"  # "breach", "convenience"
    custom_params: Optional[Dict[str, Any]] = None


class WhatIfSimulationResult(BaseModel):
    scenario_id: str
    title: str
    simulated_day: int
    simulated_date: str
    target_contract: str
    target_entity: str
    user_prompt: Optional[str] = None
    prompt_interpretation: Optional[Dict[str, Any]] = None
    baseline_exposure_usd: float
    simulated_exposure_usd: float
    delta_exposure_usd: float
    immediate_penalties: List[PenaltyDetail]
    cascade_effects: List[CascadeEffect]
    severance_and_termination_costs: List[SeveranceCostDetail]
    contract_portfolio_impacts: List[ContractPortfolioStatus]
    norns_projected_timeline: List[TimelineShiftEntry]
    executive_summary: str
    recommended_mitigations: List[str]


# ─────────────────────────────────────────────────────────────────────────────
# Simulation Calculation Engine & Natural Language Query Parser
# ─────────────────────────────────────────────────────────────────────────────

import re

TIMELINE_START = date(2027, 3, 1)

def parse_natural_language_prompt(prompt: str) -> Dict[str, Any]:
    """
    Intelligently parse a free-form natural language query into simulation parameters:
    Extracts target contract, simulated day offset, scenario classification, and breach cause.
    """
    p = prompt.lower().strip()

    # 1. Day Offset Extraction
    day_offset = None
    day_match = re.search(r'\b(?:day|d)\s*([0-9]{1,3})\b', p)
    if day_match:
        day_offset = int(day_match.group(1))
    
    if day_offset is None:
        rel_match = re.search(r'\bin\s*([0-9]{1,3})\s*days\b', p)
        if rel_match:
            day_offset = int(rel_match.group(1))

    if day_offset is None:
        if "march 15" in p or "mar 15" in p:
            day_offset = 14
        elif "march 30" in p or "march 31" in p or "mar 30" in p or "mar 31" in p or "end of march" in p:
            day_offset = 30
        elif "april 15" in p or "apr 15" in p:
            day_offset = 45
        elif "april 30" in p or "apr 30" in p or "end of april" in p:
            day_offset = 60
        elif "may 15" in p:
            day_offset = 75
        elif "june 1" in p or "jun 1" in p or "june 01" in p:
            day_offset = 92
        elif "june 30" in p or "jun 30" in p or "end of june" in p or "june 25" in p:
            day_offset = 106
        elif "july 15" in p:
            day_offset = 136
        elif "july 31" in p:
            day_offset = 152
        elif "august" in p:
            day_offset = 165
        elif "september" in p or "sept" in p:
            day_offset = 180

    # 2. Target Contract & Entity Extraction
    target_contract_id = "QH-STRATO-2026-001"
    target_entity_name = "StratoNode LLC"
    scenario_type = "vendor_default"
    detected_entity = "Vendor X (StratoNode Cloud Hosting)"

    if any(k in p for k in ["product y", "harbor", "retail", "grocery", "b1", "b2", "route optimizer enterprise", "nora.chen"]):
        target_contract_id = "QH-HARBOR-2026-001"
        target_entity_name = "Harbor Retail Inc."
        detected_entity = "Product Y (Harbor Retail Enterprise SaaS)"
        scenario_type = "early_termination" if any(k in p for k in ["terminate", "cancel", "early", "severance", "exit", "stop", "withhold", "walk"]) else "early_termination"
    elif any(k in p for k in ["pixelwright", "pixel", "frontend", "developer", "agency", "contractor", "d1", "react", "m3", "m4", "m5", "milestone"]):
        target_contract_id = "QH-PIXEL-2026-001"
        target_entity_name = "Pixelwright Interactive Studio"
        detected_entity = "Frontend Engineering Contractor (Pixelwright)"
        scenario_type = "developer_default"
    elif any(k in p for k in ["vantage", "logistics", "c1", "3pl", "freight", "setup fee", "oregon", "washington"]):
        target_contract_id = "QH-VANTAGE-2026-001"
        target_entity_name = "Vantage Logistics Corp."
        detected_entity = "Vantage Logistics (3PL Customer)"
        scenario_type = "vendor_default"
    elif any(k in p for k in ["insurance", "meridian", "policy", "lapse", "cgl", "cyber", "e&o", "coverage"]):
        target_contract_id = "QH-HARBOR-2026-001"
        target_entity_name = "Meridian Mutual / Harbor Retail"
        detected_entity = "Insurance Coverage Covenant (Meridian Mutual)"
        scenario_type = "insurance_lapse"
        if day_offset is None:
            day_offset = 106
    elif any(k in p for k in ["vendor", "vendor x", "strato", "stratonode", "hosting", "cloud", "outage", "server", "a1", "a2", "a3"]):
        target_contract_id = "QH-STRATO-2026-001"
        target_entity_name = "StratoNode LLC"
        detected_entity = "Vendor X (StratoNode Cloud Infrastructure)"
        scenario_type = "vendor_default"

    # Action intent override
    if any(k in p for k in ["terminate", "cancel", "early termination", "exit", "severance", "buyout", "drop contract"]):
        if scenario_type != "insurance_lapse":
            scenario_type = "early_termination"

    # Default day if not explicitly identified
    if day_offset is None:
        if scenario_type == "insurance_lapse":
            day_offset = 106
        elif scenario_type == "early_termination":
            day_offset = 60
        elif scenario_type == "developer_default":
            day_offset = 60
        else:
            day_offset = 45

    # Termination cause
    termination_cause = "convenience" if any(k in p for k in ["convenience", "without cause", "voluntary", "no fault"]) else "breach"

    return {
        "prompt": prompt,
        "scenario_type": scenario_type,
        "day_offset": day_offset,
        "target_contract_id": target_contract_id,
        "target_entity_name": target_entity_name,
        "detected_entity": detected_entity,
        "termination_cause": termination_cause,
        "inferred_intent": f"Predicting impact of {scenario_type.replace('_', ' ')} for {detected_entity} on Day {day_offset} ({termination_cause}).",
        "confidence": 0.96
    }


def simulate_scenario(req: WhatIfSimulationRequest) -> WhatIfSimulationResult:
    """Run full what-if portfolio exposure and cascade simulation with prompt intelligence."""
    prompt_interpretation = None

    # If natural language prompt was provided, parse and apply extracted parameters
    if req.prompt and req.prompt.strip():
        parsed = parse_natural_language_prompt(req.prompt)
        prompt_interpretation = parsed
        req.day_offset = parsed["day_offset"]
        req.scenario_type = parsed["scenario_type"]
        req.target_contract_id = parsed["target_contract_id"]
        req.target_entity_name = parsed["target_entity_name"]
        req.termination_cause = parsed["termination_cause"]

    day = max(1, min(180, req.day_offset))
    sim_date = TIMELINE_START + timedelta(days=day)
    sim_date_str = sim_date.isoformat()

    # Determine baseline exposure for current checkpoint
    if req.checkpoint_index == 0:
        baseline_exp = 6000.0
    elif req.checkpoint_index == 1:
        baseline_exp = 44000.0
    else:
        baseline_exp = 1004000.0

    scenario_type = req.scenario_type.lower()
    target_id = req.target_contract_id or "QH-STRATO-2026-001"

    # Branch by scenario type
    if "vendor_default" in scenario_type or (target_id == "QH-STRATO-2026-001" and "early" not in scenario_type):
        res = _simulate_vendor_default(day, sim_date, baseline_exp, req)
    elif "early_termination" in scenario_type or target_id == "QH-HARBOR-2026-001":
        res = _simulate_early_termination(day, sim_date, baseline_exp, req)
    elif "pixel" in scenario_type or target_id == "QH-PIXEL-2026-001":
        res = _simulate_developer_default(day, sim_date, baseline_exp, req)
    elif "insurance" in scenario_type:
        res = _simulate_insurance_lapse(day, sim_date, baseline_exp, req)
    else:
        # Default fallback to vendor default simulation
        res = _simulate_vendor_default(day, sim_date, baseline_exp, req)

    # Attach prompt context if user asked via prompt
    if req.prompt:
        res.user_prompt = req.prompt
        res.prompt_interpretation = prompt_interpretation
        res.title = f"What-If Prediction: \"{req.prompt}\""

    return res


def _simulate_vendor_default(day: int, sim_date: date, baseline_exp: float, req: WhatIfSimulationRequest) -> WhatIfSimulationResult:
    """Scenario: Vendor X (StratoNode) defaults / suffers catastrophic infrastructure failure on Day N."""
    sim_date_str = sim_date.isoformat()
    
    # Calculations
    harbor_sla_penalty = 8000.0    # 20% cap under B1 §3.3
    harbor_outage_damages = 40000.0 # Harbor withholds monthly fee if outage > 48h
    vantage_setup_refund = 15000.0  # Setup fee clawback under C1 §3.2
    vantage_sla_penalty = 1200.0    # 10% credit under C1
    
    immediate_penalties = [
        PenaltyDetail(
            category="Customer SLA Liquidated Damages",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 §3.3 / §3.5",
            verbatim_basis="Quillhub will credit Harbor Retail fifteen percent (15%) of the Monthly Fee... capped at twenty percent (20%).",
            amount_usd=harbor_sla_penalty,
            description="Automatic monthly service credit triggered by catastrophic hosting outage breaching 99.9% uptime target.",
            severity="critical"
        ),
        PenaltyDetail(
            category="Customer Revenue Withholding",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 §4.1 / §8.1",
            verbatim_basis="Failure to maintain service without notice shall constitute a default under Section 8.1.",
            amount_usd=harbor_outage_damages,
            description="Harbor exercises contractual right to withhold active monthly SaaS fee pending infrastructure restoration.",
            severity="critical"
        ),
        PenaltyDetail(
            category="Implementation Delay Penalty",
            target_contract="QH-VANTAGE-2026-001",
            clause_ref="C1 Section C & §3.2",
            verbatim_basis="Setup Fee: $15,000.00... Platform production readiness required for commencement.",
            amount_usd=vantage_setup_refund,
            description="Vantage Logistics freezes and demands escrow refund of $15,000 setup fee due to production system outage.",
            severity="high"
        ),
        PenaltyDetail(
            category="Downstream Service Credit",
            target_contract="QH-VANTAGE-2026-001",
            clause_ref="C1 §3.1",
            verbatim_basis="10% credit of Monthly Fee ($12,000) for failure to meet standard availability.",
            amount_usd=vantage_sla_penalty,
            description="Direct downstream SLA credit claimed by Vantage Logistics for lost tracking window.",
            severity="medium"
        )
    ]

    cascade_effects = [
        CascadeEffect(
            source_contract="QH-STRATO-2026-001",
            impacted_contract="QH-HARBOR-2026-001",
            impacted_party="Harbor Retail Inc.",
            relationship="downstream_customer",
            trigger_clause="B1 §8.1 (Material Breach & Termination)",
            projected_damage_usd=480000.0,
            description="Extended cloud outage triggers Harbor's 30-day cure notice. If unresolved, Harbor terminates entire $40k/mo agreement (12-month minimum damage: $480,000).",
            mitigation_action="Issue formal Force Majeure reservation under B1 §11.1; hot-standby migration to AWS/GCP within 72 hours."
        ),
        CascadeEffect(
            source_contract="QH-STRATO-2026-001",
            impacted_contract="QH-VANTAGE-2026-001",
            impacted_party="Vantage Logistics Corp.",
            relationship="downstream_customer",
            trigger_clause="C1 §2.3 (Go-Live Contingency)",
            projected_damage_usd=144000.0,
            description="Vantage Logistics delays production rollout. Threatens cancellation of 24-month contract ($288,000 value). Immediate exposure: 1-year ARR ($144,000).",
            mitigation_action="Execute executive SLA waiver granting temporary credits in exchange for go-live deferral."
        ),
        CascadeEffect(
            source_contract="QH-STRATO-2026-001",
            impacted_contract="QH-PIXEL-2026-001",
            impacted_party="Pixelwright Interactive Studio",
            relationship="developer_pipeline",
            trigger_clause="D1 §4.2 (Review Period Dependencies)",
            projected_damage_usd=10000.0,
            description="Staging and QA environments hosted on StratoNode become unreachable. Pixelwright bills idle engineering stand-by rates ($2,500/week x 4 weeks).",
            mitigation_action="Redirect DNS and repository staging targets to temporary cloud instance."
        )
    ]

    emergency_cloud_migration = 35000.0
    outside_counsel_retainer = 25000.0
    severance_and_costs = [
        SeveranceCostDetail(
            cost_type="unamortized_infrastructure",
            contract_id="QH-STRATO-2026-001",
            amount_usd=16000.0,
            description="Two months of prepaid/committed cloud capacity forfeited due to vendor insolvency.",
            statutory_or_contractual_basis="A1 Section B (Prepaid Monthly Hosting Fees)"
        ),
        SeveranceCostDetail(
            cost_type="emergency_migration_transition",
            contract_id="QH-STRATO-2026-001",
            amount_usd=emergency_cloud_migration,
            description="Expedited container orchestration migration, database snapshot transfer, and DNS cutover.",
            statutory_or_contractual_basis="Emergency Business Continuity Provision"
        ),
        SeveranceCostDetail(
            cost_type="legal_arbitration_reserve",
            contract_id="QH-STRATO-2026-001",
            amount_usd=outside_counsel_retainer,
            description="Outside litigation counsel retainer to pursue breach claim under Delaware AAA arbitration rules (A1 §9.2).",
            statutory_or_contractual_basis="A1 §9.2 / Delaware Uniform Commercial Code"
        )
    ]

    total_immediate = sum(p.amount_usd for p in immediate_penalties)
    total_severance = sum(s.amount_usd for s in severance_and_costs)
    total_cascade_risk = sum(c.projected_damage_usd for c in cascade_effects)

    # Net simulated exposure
    simulated_exp = round(baseline_exp + total_immediate + total_severance + (total_cascade_risk * 0.35), 2)
    delta_exp = round(simulated_exp - baseline_exp, 2)

    portfolio_statuses = [
        ContractPortfolioStatus(
            contract_id="QH-STRATO-2026-001",
            contract_title="StratoNode Cloud Hosting Agreement (A1/A2/A3)",
            party="StratoNode LLC",
            status="defaulted",
            role="Upstream Cloud Infrastructure",
            baseline_exposure_usd=2000.0,
            simulated_exposure_usd=76000.0,
            delta_usd=74000.0,
            key_clauses_triggered=["A1 §6 (Termination for Cause)", "A2 §2.1 (SLA Target)", "A3 §1 (15-Day Claim Deadline)"],
            notes="Primary point of default. Upstream recovery compromised due to vendor insolvency."
        ),
        ContractPortfolioStatus(
            contract_id="QH-HARBOR-2026-001",
            contract_title="Harbor Retail Enterprise SaaS Agreement (B1/B2)",
            party="Harbor Retail Inc.",
            status="cascade_risk",
            role="Key Enterprise Customer",
            baseline_exposure_usd=6000.0,
            simulated_exposure_usd=114000.0,
            delta_usd=108000.0,
            key_clauses_triggered=["B1 §3.3 (15% Credit)", "B1 §4.1 (4-Hour Incident Notice)", "B1 §8.1 (30-Day Cure)"],
            notes="Critical downstream cascade: customer withholds fee and threatens material breach termination."
        ),
        ContractPortfolioStatus(
            contract_id="QH-VANTAGE-2026-001",
            contract_title="Vantage Logistics SaaS Agreement (C1)",
            party="Vantage Logistics Corp.",
            status="cascade_risk",
            role="Logistics Expansion Customer",
            baseline_exposure_usd=0.0,
            simulated_exposure_usd=31200.0,
            delta_usd=31200.0,
            key_clauses_triggered=["C1 Section C (Setup Fee)", "C1 §3.1 (SLA Availability)", "C1 §4.1 (PNW Exclusivity)"],
            notes="Go-live postponed; setup fee refund demanded."
        ),
        ContractPortfolioStatus(
            contract_id="QH-PIXEL-2026-001",
            contract_title="Pixelwright Design & Engineering Services (D1)",
            party="Pixelwright Interactive Studio",
            status="unaffected",
            role="Frontend Development Agency",
            baseline_exposure_usd=20000.0,
            simulated_exposure_usd=30000.0,
            delta_usd=10000.0,
            key_clauses_triggered=["D1 §4.2 (Review Period Dependencies)", "D1 §7.1 (Independent Contractor)"],
            notes="Staging offline causes developer idle costs; milestone acceptance delayed."
        )
    ]

    timeline_shifts = [
        TimelineShiftEntry(
            day=day,
            date=sim_date_str,
            label="SIMULATED EVENT: StratoNode Infrastructure Default",
            contract_id="QH-STRATO-2026-001",
            clause_ref="A1 §6.1 / A2 §2.1",
            status="simulated_event",
            financial_impact_usd=total_immediate,
            description=f"Day {day} ({sim_date_str}): StratoNode experiences catastrophic hardware/network insolvency. All instances offline."
        ),
        TimelineShiftEntry(
            day=day + 1,
            date=(sim_date + timedelta(days=1)).isoformat(),
            label="MANDATORY NOTICE: 4-Hour Incident Notification to Harbor Retail",
            contract_id="QH-HARBOR-2026-001",
            clause_ref="B1 §4.1",
            status="cure_deadline",
            financial_impact_usd=None,
            description="Crucial compliance window: Failure to notify nora.chen@harborretail.com within 4 hours triggers procedural default."
        ),
        TimelineShiftEntry(
            day=day + 15,
            date=(sim_date + timedelta(days=15)).isoformat(),
            label="DEADLINE: StratoNode Breach Notice & Emergency Cutover",
            contract_id="QH-STRATO-2026-001",
            clause_ref="A1 §6.2",
            status="cure_deadline",
            financial_impact_usd=emergency_cloud_migration,
            description="Formal termination notice served to StratoNode. Cloud workloads transitioned to backup provider."
        ),
        TimelineShiftEntry(
            day=day + 30,
            date=(sim_date + timedelta(days=30)).isoformat(),
            label="CRITICAL THRESHOLD: Harbor Retail 30-Day Cure Expiration",
            contract_id="QH-HARBOR-2026-001",
            clause_ref="B1 §8.1",
            status="default_trigger",
            financial_impact_usd=480000.0,
            description="If system reliability not certified by this date, Harbor acquires immediate right to terminate $1.44M agreement."
        )
    ]

    return WhatIfSimulationResult(
        scenario_id="vendor_default",
        title=f"What-If Simulation: StratoNode Default on Day {day} ({sim_date_str})",
        simulated_day=day,
        simulated_date=sim_date_str,
        target_contract="QH-STRATO-2026-001",
        target_entity="StratoNode LLC (Cloud Hosting)",
        baseline_exposure_usd=baseline_exp,
        simulated_exposure_usd=simulated_exp,
        delta_exposure_usd=delta_exp,
        immediate_penalties=immediate_penalties,
        cascade_effects=cascade_effects,
        severance_and_termination_costs=severance_and_costs,
        contract_portfolio_impacts=portfolio_statuses,
        norns_projected_timeline=timeline_shifts,
        executive_summary=(
            f"If StratoNode defaults on Day {day} ({sim_date_str}), immediate downstream contractual penalties "
            f"amount to ${total_immediate:,.0f} across Harbor Retail (B1) and Vantage Logistics (C1). "
            f"Cross-contract cascade exposure is estimated at ${total_cascade_risk:,.0f}, driven by Harbor's potential "
            f"30-day cure termination right under B1 §8.1. Total portfolio exposure escalates from "
            f"${baseline_exp:,.0f} to ${simulated_exp:,.0f} (+${delta_exp:,.0f})."
        ),
        recommended_mitigations=[
            "Immediately dispatch compliant B1 §4.1 incident notice to Harbor Retail within 4 hours to preserve procedural defense.",
            "Invoke B1 §11.1 Force Majeure reservation regarding upstream third-party utility disruption.",
            "Issue emergency cutover order to spin up standby container replicas on AWS/GCP.",
            "Offer Vantage Logistics a deferred Go-Live amendment paired with $1,200 fee credit to forestall setup fee refund demand."
        ]
    )


def _simulate_early_termination(day: int, sim_date: date, baseline_exp: float, req: WhatIfSimulationRequest) -> WhatIfSimulationResult:
    """Scenario: Early Termination of Product Y (Harbor Retail B1) on Day N."""
    sim_date_str = sim_date.isoformat()
    cause = req.termination_cause or "breach"

    # Contract started 2026-09-15. Ends 2029-09-14 (36 months).
    # Calculate remaining months from sim_date
    end_date = date(2029, 9, 14)
    days_remaining = max(0, (end_date - sim_date).days)
    months_remaining = round(days_remaining / 30.4375, 1)
    monthly_fee = 40000.0
    remaining_contract_val = round(months_remaining * monthly_fee, 2)

    immediate_penalties = [
        PenaltyDetail(
            category="Forfeited Future Contract ARR",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 Section B (Subscription Period)",
            verbatim_basis="Thirty-six (36) months from the Effective Date... Monthly Fee: $40,000.00.",
            amount_usd=remaining_contract_val,
            description=f"Irrevocable loss of {months_remaining} months of committed enterprise SaaS revenue.",
            severity="critical"
        ),
        PenaltyDetail(
            category="Unearned Prepayment Refund",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 Section C / §8.4",
            verbatim_basis="In the event of termination, Quillhub will refund any prepaid, unearned fees.",
            amount_usd=40000.0,
            description="Immediate statutory cash refund of active monthly fee collected in advance.",
            severity="high"
        )
    ]

    if cause == "convenience":
        early_buyout_fee = round(remaining_contract_val * 0.50, 2)
        immediate_penalties.append(
            PenaltyDetail(
                category="Contractual Early Buyout Liquidated Damages",
                target_contract="QH-HARBOR-2026-001",
                clause_ref="B1 §8.4 (Liquidated Early Termination)",
                verbatim_basis="Termination for convenience requires payment of fifty percent (50%) of remaining commitment.",
                amount_usd=early_buyout_fee,
                description="Contractual exit tariff assessed for unilateral termination without legal cause.",
                severity="critical"
            )
        )
    else:
        early_buyout_fee = 0.0

    # Cross-contract cascades
    cascade_effects = [
        CascadeEffect(
            source_contract="QH-HARBOR-2026-001",
            impacted_contract="QH-STRATO-2026-001",
            impacted_party="StratoNode LLC",
            relationship="upstream_dependency",
            trigger_clause="A1 Section B / A3 §3 (Hosting Lock-In)",
            projected_damage_usd=96000.0,
            description="Dedicated 10-node hosting cluster ($8,000/mo) becomes idle. Quillhub is locked until July 2028 with 12+ months remaining ($96,000 sunk cost).",
            mitigation_action="Exercise A3 §3 non-renewal notice or negotiate downsizing amendment under A1 §5."
        ),
        CascadeEffect(
            source_contract="QH-HARBOR-2026-001",
            impacted_contract="QH-VANTAGE-2026-001",
            impacted_party="Vantage Logistics Corp.",
            relationship="exclusivity_conflict",
            trigger_clause="B1 §6.1 (Territorial Exclusivity)",
            projected_damage_usd=-250000.0, # POSITIVE CASCADE BENEFIT (Eliminates risk!)
            description="POSITIVE RESOLUTION: Harbor's restrictive PNW grocery exclusivity (B1 §6.1) is immediately extinguished. Removes $250k latent litigation conflict with Vantage Logistics (C1 §4.1).",
            mitigation_action="Leverage freed territory to sign expanded high-tier 3PL accounts with Vantage Logistics."
        ),
        CascadeEffect(
            source_contract="QH-HARBOR-2026-001",
            impacted_contract="QH-PIXEL-2026-001",
            impacted_party="Pixelwright Interactive Studio",
            relationship="developer_pipeline",
            trigger_clause="D1 Exhibit A (M5 SOW Scope)",
            projected_damage_usd=12000.0,
            description="Harbor-specific retail analytics UI modules in M4/M5 are rendered obsolete, requiring SOW restructuring.",
            mitigation_action="Issue D1 change order redirecting remaining $20,000 milestone scope to Vantage Logistics workflows."
        )
    ]

    severance_and_costs = [
        SeveranceCostDetail(
            cost_type="severance_settlement",
            contract_id="QH-HARBOR-2026-001",
            amount_usd=50000.0,
            description="Dedicated customer success and support engineering transition buffer and severance allocation.",
            statutory_or_contractual_basis="Commercial Account Transition Policy"
        ),
        SeveranceCostDetail(
            cost_type="legal_arbitration_reserve",
            contract_id="QH-HARBOR-2026-001",
            amount_usd=30000.0,
            description="Outside counsel settlement escrow for mutual release and IP return agreement under B1 §10.",
            statutory_or_contractual_basis="B1 §10 (Confidentiality & Post-Termination Data Return)"
        )
    ]

    total_immediate = sum(p.amount_usd for p in immediate_penalties)
    total_severance = sum(s.amount_usd for s in severance_and_costs)
    
    # Net simulated exposure
    simulated_exp = round(baseline_exp + total_immediate + total_severance + 96000.0 - 250000.0, 2)
    simulated_exp = max(simulated_exp, total_immediate * 0.9)
    delta_exp = round(simulated_exp - baseline_exp, 2)

    portfolio_statuses = [
        ContractPortfolioStatus(
            contract_id="QH-HARBOR-2026-001",
            contract_title="Harbor Retail Enterprise SaaS Agreement (B1/B2)",
            party="Harbor Retail Inc.",
            status="terminated",
            role="Key Enterprise Customer",
            baseline_exposure_usd=6000.0,
            simulated_exposure_usd=remaining_contract_val + 40000.0,
            delta_usd=remaining_contract_val + 34000.0,
            key_clauses_triggered=["B1 Section B (36-Month Term)", "B1 §8.2 / §8.4 (Termination)", "B1 §10 (IP Return)"],
            notes=f"Terminated on Day {day}. {months_remaining} months of ARR forfeited ($40k/mo)."
        ),
        ContractPortfolioStatus(
            contract_id="QH-STRATO-2026-001",
            contract_title="StratoNode Cloud Hosting Agreement (A1/A2/A3)",
            party="StratoNode LLC",
            status="cascade_risk",
            role="Upstream Cloud Infrastructure",
            baseline_exposure_usd=2000.0,
            simulated_exposure_usd=98000.0,
            delta_usd=96000.0,
            key_clauses_triggered=["A1 Section B (24-Month Term)", "A3 §3 (60-Day Notice)"],
            notes="Over-provisioned hosting infrastructure must be downsized or subleased."
        ),
        ContractPortfolioStatus(
            contract_id="QH-VANTAGE-2026-001",
            contract_title="Vantage Logistics SaaS Agreement (C1)",
            party="Vantage Logistics Corp.",
            status="benefit",
            role="Logistics Expansion Customer",
            baseline_exposure_usd=0.0,
            simulated_exposure_usd=0.0,
            delta_usd=-250000.0,
            key_clauses_triggered=["C1 §4.1 (Exclusivity Grant)", "B1 §6.1 (Superseded Restriction)"],
            notes="POSITIVE IMPACT: Exclusivity barrier cleared. Vantage can expand without litigation hazard."
        ),
        ContractPortfolioStatus(
            contract_id="QH-PIXEL-2026-001",
            contract_title="Pixelwright Design & Engineering Services (D1)",
            party="Pixelwright Interactive Studio",
            status="unaffected",
            role="Frontend Development Agency",
            baseline_exposure_usd=20000.0,
            simulated_exposure_usd=20000.0,
            delta_usd=0.0,
            key_clauses_triggered=["D1 §3 (Change Orders)", "D1 Exhibit A"],
            notes="Milestone scope redirected to Vantage logistics UI."
        )
    ]

    timeline_shifts = [
        TimelineShiftEntry(
            day=day,
            date=sim_date_str,
            label="SIMULATED EVENT: Formal Early Termination of Harbor Retail Agreement",
            contract_id="QH-HARBOR-2026-001",
            clause_ref="B1 §8.2 / §8.4",
            status="simulated_event",
            financial_impact_usd=remaining_contract_val,
            description=f"Day {day} ({sim_date_str}): Harbor Retail agreement is terminated early. {months_remaining} months of ARR forfeited."
        ),
        TimelineShiftEntry(
            day=day + 15,
            date=(sim_date + timedelta(days=15)).isoformat(),
            label="DATA & IP TRANSITION: Deliver Client Data Archive",
            contract_id="QH-HARBOR-2026-001",
            clause_ref="B1 §10.3",
            status="cure_deadline",
            financial_impact_usd=15000.0,
            description="Mandatory 15-day compliance requirement to return Harbor customer routing databases and delete tenant volumes."
        ),
        TimelineShiftEntry(
            day=day + 30,
            date=(sim_date + timedelta(days=30)).isoformat(),
            label="HOSTING DOWNSIZE NOTICE: Issue A3 §3 Downsizing Notice to StratoNode",
            contract_id="QH-STRATO-2026-001",
            clause_ref="A3 §3",
            status="cure_deadline",
            financial_impact_usd=-48000.0,
            description="Submit formal reduction request to decommission 6 of 10 cloud server nodes to stop ARR bleed."
        )
    ]

    return WhatIfSimulationResult(
        scenario_id="early_termination",
        title=f"What-If Simulation: Early Termination of Harbor Retail (B1) on Day {day} ({sim_date_str})",
        simulated_day=day,
        simulated_date=sim_date_str,
        target_contract="QH-HARBOR-2026-001",
        target_entity="Harbor Retail Inc. (Product Y)",
        baseline_exposure_usd=baseline_exp,
        simulated_exposure_usd=simulated_exp,
        delta_exposure_usd=delta_exp,
        immediate_penalties=immediate_penalties,
        cascade_effects=cascade_effects,
        severance_and_termination_costs=severance_and_costs,
        contract_portfolio_impacts=portfolio_statuses,
        norns_projected_timeline=timeline_shifts,
        executive_summary=(
            f"Terminating Harbor Retail on Day {day} ({sim_date_str}) eliminates ${remaining_contract_val:,.0f} "
            f"in future contracted ARR across the remaining {months_remaining} months. "
            f"However, it simultaneously unblocks Vantage Logistics by eliminating the $250k territorial exclusivity conflict. "
            f"Net portfolio exposure shifts to ${simulated_exp:,.0f} (+${delta_exp:,.0f})."
        ),
        recommended_mitigations=[
            "Seek mutual separation agreement incorporating full mutual release of SLA claims (March $6k and April $40k overdue).",
            "Immediately tender Section 10 data return certificate to prevent confidentiality penalty claims.",
            "Serve StratoNode an immediate capacity downsizing amendment to recoup $48,000 in unneeded server hosting.",
            "Fast-track Vantage Logistics Phase 2 expansion into Oregon/Washington to replace lost retail ARR."
        ]
    )


def _simulate_developer_default(day: int, sim_date: date, baseline_exp: float, req: WhatIfSimulationRequest) -> WhatIfSimulationResult:
    """Scenario: Contractor Pixelwright (D1) defaults on Day N."""
    sim_date_str = sim_date.isoformat()
    immediate_penalties = [
        PenaltyDetail(
            category="Withheld Milestone Deliverable Fees",
            target_contract="QH-PIXEL-2026-001",
            clause_ref="D1 §4.2 / Exhibit A",
            verbatim_basis="M4 ($12,000) and M5 ($8,000) payable only upon acceptance.",
            amount_usd=-20000.0, # Negative penalty = cash saved
            description="Quillhub withholds remaining milestone fees from defaulting developer.",
            severity="medium"
        ),
        PenaltyDetail(
            category="Customer Launch Delay Credits",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 §4.3 (Enhancement Delivery Commitment)",
            verbatim_basis="Quillhub commits to delivery of quarterly feature enhancements.",
            amount_usd=25000.0,
            description="Harbor claims delayed feature rollout concession credit for delayed dispatch optimizer.",
            severity="high"
        )
    ]
    replacement_agency_premium = 38000.0
    severance_and_costs = [
        SeveranceCostDetail(
            cost_type="emergency_contractor_procurement",
            contract_id="QH-PIXEL-2026-001",
            amount_usd=replacement_agency_premium,
            description="Retaining expedited React/TypeScript engineering squad to complete M4/M5 code.",
            statutory_or_contractual_basis="Emergency Procurement & Code Audit"
        )
    ]
    cascade_effects = [
        CascadeEffect(
            source_contract="QH-PIXEL-2026-001",
            impacted_contract="QH-HARBOR-2026-001",
            impacted_party="Harbor Retail Inc.",
            relationship="downstream_customer",
            trigger_clause="B1 §4.3",
            projected_damage_usd=35000.0,
            description="Frontend delay pushes Route Optimizer deployment back 6 weeks.",
            mitigation_action="Deploy internal engineering patch to bridge core routing API."
        )
    ]
    simulated_exp = round(baseline_exp + 25000.0 + replacement_agency_premium - 20000.0, 2)
    delta_exp = round(simulated_exp - baseline_exp, 2)

    portfolio_statuses = [
        ContractPortfolioStatus(
            contract_id="QH-PIXEL-2026-001",
            contract_title="Pixelwright Design & Engineering Services (D1)",
            party="Pixelwright Interactive Studio",
            status="defaulted",
            role="Frontend Development Agency",
            baseline_exposure_usd=20000.0,
            simulated_exposure_usd=38000.0,
            delta_usd=18000.0,
            key_clauses_triggered=["D1 §2.2", "D1 §4.2", "D1 §8 (Indemnity)"],
            notes="Default on frontend deliverables. Replacement squad contracted."
        ),
        ContractPortfolioStatus(
            contract_id="QH-HARBOR-2026-001",
            contract_title="Harbor Retail Enterprise SaaS Agreement (B1/B2)",
            party="Harbor Retail Inc.",
            status="cascade_risk",
            role="Key Enterprise Customer",
            baseline_exposure_usd=6000.0,
            simulated_exposure_usd=31000.0,
            delta_usd=25000.0,
            key_clauses_triggered=["B1 §4.3"],
            notes="UI delay requires commercial accommodation."
        ),
        ContractPortfolioStatus(
            contract_id="QH-STRATO-2026-001",
            contract_title="StratoNode Cloud Hosting Agreement (A1/A2/A3)",
            party="StratoNode LLC",
            status="unaffected",
            role="Upstream Cloud Infrastructure",
            baseline_exposure_usd=2000.0,
            simulated_exposure_usd=2000.0,
            delta_usd=0.0,
            key_clauses_triggered=[],
            notes="Cloud hosting remains unaffected."
        ),
        ContractPortfolioStatus(
            contract_id="QH-VANTAGE-2026-001",
            contract_title="Vantage Logistics SaaS Agreement (C1)",
            party="Vantage Logistics Corp.",
            status="unaffected",
            role="Logistics Expansion Customer",
            baseline_exposure_usd=0.0,
            simulated_exposure_usd=0.0,
            delta_usd=0.0,
            key_clauses_triggered=[],
            notes="Vantage backend unaffected."
        )
    ]

    timeline_shifts = [
        TimelineShiftEntry(
            day=day,
            date=sim_date_str,
            label="SIMULATED EVENT: Pixelwright Developer Default / SOW Abandonment",
            contract_id="QH-PIXEL-2026-001",
            clause_ref="D1 §4.2",
            status="simulated_event",
            financial_impact_usd=replacement_agency_premium,
            description="Pixelwright fails to deliver M4 integration package. Breach notice issued."
        )
    ]

    return WhatIfSimulationResult(
        scenario_id="developer_default",
        title=f"What-If Simulation: Pixelwright Default on Day {day} ({sim_date_str})",
        simulated_day=day,
        simulated_date=sim_date_str,
        target_contract="QH-PIXEL-2026-001",
        target_entity="Pixelwright Interactive Studio",
        baseline_exposure_usd=baseline_exp,
        simulated_exposure_usd=simulated_exp,
        delta_exposure_usd=delta_exp,
        immediate_penalties=immediate_penalties,
        cascade_effects=cascade_effects,
        severance_and_termination_costs=severance_and_costs,
        contract_portfolio_impacts=portfolio_statuses,
        norns_projected_timeline=timeline_shifts,
        executive_summary=(
            f"If Pixelwright defaults on Day {day}, withholding M4/M5 milestones saves $20,000, "
            f"but hiring an emergency replacement squad costs $38,000 with $25,000 in customer delay credits. "
            f"Net portfolio exposure shifts to ${simulated_exp:,.0f} (+${delta_exp:,.0f})."
        ),
        recommended_mitigations=[
            "Issue immediate demand for IP assignment and source code repository transfer under D1 §5.",
            "Engage pre-vetted contractor squad to ingest code from branch 'release-v1'.",
            "Provide Harbor Retail with provisional API documentation to mitigate integration delay."
        ]
    )


def _simulate_insurance_lapse(day: int, sim_date: date, baseline_exp: float, req: WhatIfSimulationRequest) -> WhatIfSimulationResult:
    """Scenario: Insurance policy lapse on Day 106 (June 30)."""
    sim_date_str = sim_date.isoformat()
    harbor_termination_loss = 960000.0  # 24 months x $40,000 remaining
    immediate_penalties = [
        PenaltyDetail(
            category="Material Breach Contract Termination",
            target_contract="QH-HARBOR-2026-001",
            clause_ref="B1 §7.2 / §8.2",
            verbatim_basis="A lapse in required insurance coverage constitutes a material breach... Harbor may terminate immediately.",
            amount_usd=harbor_termination_loss,
            description="Harbor exercises immediate termination right following 15-day un-cured lapse notice.",
            severity="critical"
        )
    ]
    severance_and_costs = [
        SeveranceCostDetail(
            cost_type="emergency_reinstatement_premium",
            contract_id="QH-HARBOR-2026-001",
            amount_usd=28000.0,
            description="Retroactive policy reinstatement penalty surcharge by Meridian Mutual.",
            statutory_or_contractual_basis="Meridian Policy MML-2024-88714 Reinstatement Rider"
        )
    ]
    cascade_effects = [
        CascadeEffect(
            source_contract="QH-HARBOR-2026-001",
            impacted_contract="QH-VANTAGE-2026-001",
            impacted_party="Vantage Logistics Corp.",
            relationship="downstream_customer",
            trigger_clause="C1 §5.1 (Standard Insurance Covenant)",
            projected_damage_usd=144000.0,
            description="Vantage audits Quillhub certificate of insurance and demands escrow lock.",
            mitigation_action="Bind temporary 30-day binder with alternate carrier Lloyd's Syndicate."
        )
    ]
    simulated_exp = round(baseline_exp + harbor_termination_loss + 28000.0, 2)
    delta_exp = round(simulated_exp - baseline_exp, 2)

    portfolio_statuses = [
        ContractPortfolioStatus(
            contract_id="QH-HARBOR-2026-001",
            contract_title="Harbor Retail Enterprise SaaS Agreement (B1/B2)",
            party="Harbor Retail Inc.",
            status="breached",
            role="Key Enterprise Customer",
            baseline_exposure_usd=6000.0,
            simulated_exposure_usd=966000.0,
            delta_usd=960000.0,
            key_clauses_triggered=["B1 §7.1", "B1 §7.2", "B1 §8.2"],
            notes="Immediate material breach. 15-day cure window triggered."
        ),
        ContractPortfolioStatus(
            contract_id="QH-VANTAGE-2026-001",
            contract_title="Vantage Logistics SaaS Agreement (C1)",
            party="Vantage Logistics Corp.",
            status="cascade_risk",
            role="Logistics Expansion Customer",
            baseline_exposure_usd=0.0,
            simulated_exposure_usd=144000.0,
            delta_usd=144000.0,
            key_clauses_triggered=["C1 §5.1"],
            notes="Demands active Certificate of Insurance."
        ),
        ContractPortfolioStatus(
            contract_id="QH-STRATO-2026-001",
            contract_title="StratoNode Cloud Hosting Agreement (A1/A2/A3)",
            party="StratoNode LLC",
            status="unaffected",
            role="Upstream Cloud Infrastructure",
            baseline_exposure_usd=2000.0,
            simulated_exposure_usd=2000.0,
            delta_usd=0.0,
            key_clauses_triggered=[],
            notes="Cloud hosting unaffected."
        ),
        ContractPortfolioStatus(
            contract_id="QH-PIXEL-2026-001",
            contract_title="Pixelwright Design & Engineering Services (D1)",
            party="Pixelwright Interactive Studio",
            status="unaffected",
            role="Frontend Development Agency",
            baseline_exposure_usd=20000.0,
            simulated_exposure_usd=20000.0,
            delta_usd=0.0,
            key_clauses_triggered=[],
            notes="Contractor unaffected."
        )
    ]

    timeline_shifts = [
        TimelineShiftEntry(
            day=day,
            date=sim_date_str,
            label="CRITICAL LAPSE: Meridian Insurance Policies Expire",
            contract_id="QH-HARBOR-2026-001",
            clause_ref="B1 §7.1 / §7.2",
            status="default_trigger",
            financial_impact_usd=harbor_termination_loss,
            description="Policies MML-2024-88714 & 88715 expire without active renewal. Material breach under B1 §7.2."
        )
    ]

    return WhatIfSimulationResult(
        scenario_id="insurance_lapse",
        title=f"What-If Simulation: Insurance Policy Lapse on Day {day} ({sim_date_str})",
        simulated_day=day,
        simulated_date=sim_date_str,
        target_contract="QH-HARBOR-2026-001",
        target_entity="Harbor Retail Inc.",
        baseline_exposure_usd=baseline_exp,
        simulated_exposure_usd=simulated_exp,
        delta_exposure_usd=delta_exp,
        immediate_penalties=immediate_penalties,
        cascade_effects=cascade_effects,
        severance_and_termination_costs=severance_and_costs,
        contract_portfolio_impacts=portfolio_statuses,
        norns_projected_timeline=timeline_shifts,
        executive_summary=(
            f"Failing to renew insurance by June 30 triggers immediate material breach under B1 §7.2. "
            f"Harbor Retail acquires the unilateral right to terminate the remaining 24 months ($960,000 lost ARR). "
            f"Total portfolio exposure reaches ${simulated_exp:,.0f} (+${delta_exp:,.0f})."
        ),
        recommended_mitigations=[
            "Bind Meridian renewal quote immediately before June 25 deadline (E-16).",
            "Deliver updated Certificate of Insurance to Harbor Retail counsel Nora Chen before June 30."
        ]
    )

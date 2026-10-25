"""
Phase 2 Verification Tests: Multi-Agent Collaboration and Bounded Loops
Tests targeted clarification loops, adversarial dispute resolution,
timeline re-projection, and contract ID normalization.
"""

import pytest
from app.models.schemas import normalize_contract_id, to_prefixed_contract_id
from app.agents.thor import ThorAgent
from app.agents.norns import NornsAgent
from app.agents.loki import LokiAgent
from app.agents.heimdall import HeimdallAgent
from app.agents.tyr import TyrAgent
from app.agents.odin import OdinAgent
from app.agents.workflow import ContractWarRoomWorkflow


def test_contract_id_normalization():
    """Verify contract IDs are normalized consistently across endpoints and formats."""
    assert normalize_contract_id("cnt-A1") == "A1"
    assert normalize_contract_id("a1") == "A1"
    assert normalize_contract_id("CNT-A1") == "A1"
    assert normalize_contract_id("A1.txt") == "A1"
    assert normalize_contract_id("cnt-b1.pdf") == "B1"
    assert normalize_contract_id("  cnt-d1  ") == "D1"

    assert to_prefixed_contract_id("A1") == "cnt-A1"
    assert to_prefixed_contract_id("cnt-a1") == "cnt-A1"
    assert to_prefixed_contract_id("B1.txt") == "cnt-B1"


def test_targeted_clarification_loop():
    """Verify Loki requests clarification from Thor and Thor resolves ambiguity with hierarchy."""
    workflow = ContractWarRoomWorkflow()

    # Contract A1 text with ambiguous 90-day vs Amendment No. 1 60-day notice
    contract_text = (
        "CONTRACT ID: QH-STRATO-2026-001\n"
        "Section B (Subscription Period & Renewal): The Agreement will automatically renew unless notice given at least 90 days before expiration.\n"
        "Amendment No. 1 §3: The Non-Renewal Notice Period is changed from ninety (90) days to sixty (60) days before the end of the then-current Subscription Period.\n"
    )

    result = workflow.execute(
        doc_id="A1",
        contract_text=contract_text,
        clock_date="2027-01-15"
    )

    # Must contain real clarification loop records
    assert len(result.observability.clarification_records) > 0
    rec = result.observability.clarification_records[0]
    assert rec.current_round == 2
    assert rec.max_rounds == 2
    assert rec.status == "resolved"
    assert "Amendment No. 1" in rec.resolution or "hierarchy" in rec.resolution.lower() or "60" in rec.resolution

    # Verify log messages reflect the genuine multi-round progression
    stages = [log.get("stage") for log in result.logs]
    assert "clarification_round_1" in stages
    assert "clarification_round_1_response" in stages
    assert "clarification_round_2_eval" in stages


def test_adversarial_dispute_loop():
    """Verify Loki challenges Heimdall's telemetry and Tyr arbitrates in a 3-round dispute loop."""
    workflow = ContractWarRoomWorkflow()

    contract_text = (
        "CONTRACT ID: QH-STRATO-2026-SLA\n"
        "Provider Information: Legal Name: StratoNode Inc.\n"
        "Section 2.1: Provider will make the Cloud Service available at least 99.5%.\n"
        "Section 3.2: Written request within 15 days.\n"
    )

    # Event showing March outage met SLA (190 min downtime -> 99.57% uptime >= 99.5%)
    events = [
        {
            "event_id": "E-04",
            "timestamp": "2027-03-03T13:15:00Z",
            "subject": "Platform Status: Service restored in us-west-2a (190 minutes)",
            "body": "Calculated uptime for March is 99.57%, meeting StratoNode target."
        }
    ]

    result = workflow.execute(
        doc_id="A2",
        contract_text=contract_text,
        real_world_events=events,
        clock_date="2027-03-15"
    )

    # Contested claims in NO branch must enter dispute loops
    assert len(result.observability.dispute_records) > 0
    d_rec = result.observability.dispute_records[0]
    assert d_rec.current_round == 3
    assert d_rec.max_rounds == 3
    assert d_rec.status == "resolved"
    assert d_rec.binding_ruling != ""

    # Verify log messages demonstrate the 3 genuine rounds
    stages = [log.get("stage") for log in result.logs]
    assert "dispute_round_1" in stages
    assert "dispute_round_2" in stages
    assert "dispute_round_3_submit" in stages
    assert "dispute_round_3_ruling" in stages


def test_norns_temporal_update_on_clarification():
    """Verify Norns computes timeline based on clarified covenants."""
    thor = ThorAgent()
    norns = NornsAgent()

    text = (
        "CONTRACT ID: A1\n"
        "Section B: The Agreement will automatically renew unless notice given at least 90 days before expiration.\n"
        "Amendment No. 1 §3: The Non-Renewal Notice Period is changed from ninety (90) days to sixty (60) days before the end of the then-current Subscription Period.\n"
    )
    t_out = thor.extract(doc_id="A1", contract_text=text)

    # Clarify clause
    for cl in t_out.clauses:
        if cl.is_ambiguous:
            thor.clarify_clause("A1", cl, text, "Clarify notice days")

    n_out = norns.analyze_timeline(thor_output=t_out, current_clock="2027-01-15")
    assert len(n_out.timeline_items) > 0


def test_bounded_loop_limits_enforced():
    """Verify bounded loop safety: max rounds are strictly respected."""
    workflow = ContractWarRoomWorkflow()
    text = (
        "CONTRACT ID: A1\n"
        "Section B: The Agreement will automatically renew unless notice given at least 90 days before.\n"
    )
    res = workflow.execute(doc_id="A1", contract_text=text, clock_date="2027-01-15")

    for rec in res.observability.clarification_records:
        assert rec.current_round <= rec.max_rounds
        assert rec.max_rounds == 2

    for d_rec in res.observability.dispute_records:
        assert d_rec.current_round <= d_rec.max_rounds
        assert d_rec.max_rounds == 3

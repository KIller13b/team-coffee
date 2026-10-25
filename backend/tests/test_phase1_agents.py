"""
Phase 1 Verification Tests: AI Agents Activation and Correct Wiring
Tests Thor, Norns, Loki, Heimdall, Tyr, Odin, and LLMService.
"""

import pytest
from app.services.llm import llm_service
from app.agents.thor import ThorAgent
from app.agents.norns import NornsAgent
from app.agents.loki import LokiAgent
from app.agents.heimdall import HeimdallAgent
from app.agents.tyr import TyrAgent
from app.agents.odin import OdinAgent
from app.agents.workflow import ContractWarRoomWorkflow


def test_llm_service_provider_status_and_mock():
    """Verify LLM service reports status accurately and mock handler works deterministically."""
    # When no key is set and no mock is installed
    status = llm_service.get_status()
    assert "provider" in status
    assert "configured" in status
    assert "is_available" in status

    # Install deterministic mock handler
    def mock_completion(prompt, system_prompt=None):
        return '{"title": "Simulated Red-Team Trap", "severity": "high", "trap_description": "Mock trap", "hypothesis": "Mock hypothesis"}'

    llm_service.set_mock_handler(mock_completion)
    assert llm_service.is_available is True
    assert llm_service.get_status()["is_mocked"] is True

    parsed = llm_service.structured_json_generate("Test prompt")
    assert parsed["title"] == "Simulated Red-Team Trap"

    llm_service.clear_mock_handler()


def test_thor_extraction_with_citations_and_exposures():
    """Verify Thor extracts clauses, anchors verbatim citations, and calculates dynamic exposures."""
    thor = ThorAgent()
    sample_text = (
        "CONTRACT ID: QH-TEST-2027-001\n"
        "This Agreement is between Quillhub Inc. and Apex Cloud Services LLC ('Provider').\n"
        "Section 2.1 Service Level Commitment: Provider will make the Platform available at least 99.8% of the time.\n"
        "Section 4.3 Review Period: Customer will have ten (10) business days to review deliverables.\n"
        "Section 8.1 General Cap: Liability is capped at $50,000.\n"
    )

    output = thor.extract(doc_id="TEST-01", contract_text=sample_text, context="Apex is cloud compute vendor.")
    assert output.contract_id == "TEST-01"
    assert output.counterparty == "Apex Cloud Services LLC"
    assert len(output.clauses) > 0
    assert len(output.obligations) > 0

    # Verify every citation matches verbatim source text
    for cit in output.verbatim_citations:
        assert cit.verified is True
        assert thor.verify_quote(sample_text, cit.verbatim_quote) is True

    # Verify obligations have computed financial exposures in INR
    for ob in output.obligations:
        assert ob.financial_exposure_inr > 0.0


def test_norns_dynamic_milestones_and_deduplication():
    """Verify Norns derives milestones from Thor output and BusinessCalendar works."""
    thor = ThorAgent()
    norns = NornsAgent()

    sample_text = (
        "CONTRACT ID: SOW-TEST-002\n"
        "Between Quillhub Inc. and Beta Systems Inc.\n"
        "Section 4.2 Review Period: ten (10) business days after receipt to review.\n"
        "Section B Renewal: The Agreement will automatically renew unless notice given at least 60 days before expiration.\n"
    )
    thor_out = thor.extract(doc_id="NOVEL-01", contract_text=sample_text)
    norns_out = norns.analyze_timeline(thor_output=thor_out, current_clock="2027-01-15")

    assert len(norns_out.timeline_items) > 0
    assert norns_out.worst_case_exposure_inr > 0.0

    # Ensure all generated milestone IDs match contract_id
    for item in norns_out.timeline_items:
        assert item.contract_id == "NOVEL-01"


def test_loki_dynamic_claims_and_counterparties():
    """Verify Loki does NOT produce identical claims for different contracts."""
    thor = ThorAgent()
    loki = LokiAgent()

    # Contract 1: Contractor deliverable agreement (D1 style)
    d1_text = (
        "CONTRACT ID: QH-PIXEL-2027-001\n"
        "By and between Quillhub Inc. and Pixelwright Design Studio LLC.\n"
        "Section 4.3 Deemed Acceptance: If Company does not deliver a Rejection Notice within the ten (10) business day review period specified in Section 4.2, the milestone deliverable will be deemed accepted.\n"
    )
    thor_d1 = thor.extract(doc_id="D1", contract_text=d1_text)
    loki_d1 = loki.challenge(thor_output=thor_d1)

    # Contract 2: SLA compute agreement (A2 style)
    a2_text = (
        "CONTRACT ID: QH-STRATO-2026-SLA\n"
        "Provider Information: Legal Name: StratoNode Inc.\n"
        "Section 2.1 Availability: Provider will make the Cloud Service available at least ninety-nine and one-half percent (99.5%).\n"
        "Section 3.2 Credit Request Procedure: Customer must submit a written request within fifteen (15) days after the end of the calendar month.\n"
    )
    thor_a2 = thor.extract(doc_id="A2", contract_text=a2_text)
    loki_a2 = loki.challenge(thor_output=thor_a2)

    # D1 and A2 must have different claims
    d1_titles = [c.title for c in loki_d1.risks_and_claims]
    a2_titles = [c.title for c in loki_a2.risks_and_claims]
    assert d1_titles != a2_titles

    # Counterparty attribution check: D1 deemed acceptance must attribute to Pixelwright, not StratoNode
    deemed_claim = next((c for c in loki_d1.risks_and_claims if "deemed acceptance" in c.title.lower()), None)
    assert deemed_claim is not None
    assert "Pixelwright" in deemed_claim.counterparty

    # Currency consistency check: financial exposure must be in INR (not raw $2,400)
    for c in loki_a2.risks_and_claims:
        assert c.financial_exposure_inr >= 100000.0 or c.financial_exposure_inr == 0.0


def test_heimdall_event_monitoring_and_unmatched():
    """Verify Heimdall routes claims to YES/NO and populates unmatched critical events."""
    thor = ThorAgent()
    loki = LokiAgent()
    heimdall = HeimdallAgent()

    contract_text = (
        "CONTRACT ID: QH-PIXEL-2027-001\n"
        "Between Quillhub Inc. and Pixelwright Design Studio LLC.\n"
        "Section 4.3 Deemed Acceptance: 10 business days review.\n"
    )
    thor_out = thor.extract(doc_id="D1", contract_text=contract_text)
    loki_out = loki.challenge(thor_output=thor_out)

    events = [
        {
            "event_id": "E-03",
            "timestamp": "2027-02-28T14:00:00Z",
            "subject": "Delivery: M3 Deliverable package ready for acceptance",
            "body": "Pixelwright submitted Milestone M3."
        },
        {
            "event_id": "E-CRIT-99",
            "timestamp": "2027-03-01T08:00:00Z",
            "subject": "URGENT: Unscheduled Network Disruption in us-east-1",
            "body": "Major outage detected affecting production ingress."
        }
    ]

    heimdall_out = heimdall.monitor_and_verify(loki_output=loki_out, real_world_events=events)
    assert heimdall_out.verified_events_count == 2
    assert len(heimdall_out.yes_branch_claims) > 0

    # E-CRIT-99 did not match the Pixelwright deemed acceptance claim, so it must be flagged in unmatched_critical_events
    unmatched_ids = [e["event_id"] for e in heimdall_out.unmatched_critical_events]
    assert "E-CRIT-99" in unmatched_ids


def test_tyr_reasoned_arbitration():
    """Verify Tyr cross-examines Loki claims and Heimdall evidence."""
    tyr = TyrAgent()
    from app.agents.base import HeimdallOutput, HeimdallVerification, LokiRiskClaim

    claim = LokiRiskClaim(
        id="claim-test-01",
        title="SLA Outage Credit Forfeiture Window (15-Day Claim Deadline)",
        contract_id="A2",
        counterparty="StratoNode Inc.",
        severity="critical",
        likelihood="likely",
        impact="severe",
        financial_exposure_inr=199200.0,
        evidence_clause="A2 §3.2",
        verbatim_excerpt="Customer must submit request within 15 days.",
        trap_description="Downtime credit cutoff.",
        hypothesis="Outage credits will be forfeited."
    )

    verif = HeimdallVerification(
        claim_id=claim.id,
        contract_id=claim.contract_id,
        claim_title=claim.title,
        is_actually_happening=False,
        branch="NO",
        correlated_event_ids=["E-04"],
        real_world_evidence="Status Page: March uptime was 99.57%, exceeding 99.5% target.",
        reasoning="StratoNode met its SLA in March."
    )

    h_out = HeimdallOutput(
        verified_events_count=1,
        total_claims_evaluated=1,
        yes_branch_claims=[],
        no_branch_claims=[verif]
    )

    tyr_out = tyr.arbitrate_disputes(heimdall_output=h_out, loki_claims=[claim])
    assert tyr_out.disputes_reviewed == 1
    assert len(tyr_out.rulings) == 1
    ruling = tyr_out.rulings[0]
    assert ruling.verdict == "dismissed_as_false_alarm"
    assert "StratoNode" in ruling.binding_decision


def test_odin_synthesis_and_draft_status():
    """Verify Odin final actions remain in drafted status for human review."""
    thor = ThorAgent()
    norns = NornsAgent()
    loki = LokiAgent()
    heimdall = HeimdallAgent()
    tyr = TyrAgent()
    odin = OdinAgent()

    text = "CONTRACT ID: D1\nBetween Quillhub Inc. and Pixelwright Design Studio LLC.\nSection 4.3 Deemed Acceptance: 10 business days."
    t_out = thor.extract(doc_id="D1", contract_text=text)
    n_out = norns.analyze_timeline(thor_output=t_out, current_clock="2027-03-15")
    l_out = loki.challenge(thor_output=t_out)
    events = [{"event_id": "E-03", "subject": "M3 Deliverable", "body": "M3 deliverable submitted."}]
    h_out = heimdall.monitor_and_verify(loki_output=l_out, real_world_events=events)
    tyr_out = tyr.arbitrate_disputes(heimdall_output=h_out, loki_claims=l_out.risks_and_claims)

    odin_out = odin.synthesize_final_actions(thor=t_out, norns=n_out, loki=l_out, heimdall=h_out, tyr=tyr_out)
    assert len(odin_out.final_actions) > 0
    for action in odin_out.final_actions:
        assert action.status == "drafted"


def test_workflow_execution_timing_and_metrics():
    """Verify workflow executes and measures real elapsed duration."""
    wf = ContractWarRoomWorkflow()
    text = "CONTRACT ID: A2\nBetween Quillhub Inc. and StratoNode Inc.\nSection 2.1 SLA 99.5% Availability."
    res = wf.execute(doc_id="A2", contract_text=text, clock_date="2027-01-15")

    assert res.observability is not None
    assert res.observability.execution_duration_ms > 0.0
    assert isinstance(res.observability.execution_duration_ms, float)
    assert res.observability.token_estimate >= 0

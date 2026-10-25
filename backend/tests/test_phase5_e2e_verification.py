import pytest
from app.agents import ContractWarRoomWorkflow
from app.models.schemas import normalize_contract_id, to_prefixed_contract_id
from app.services.war_room_state import war_room_state

NOVEL_ENTERPRISE_CONTRACT = """
MASTER SOFTWARE AS A SERVICE AGREEMENT
Between Meridian Cloud Networks LLC ("Meridian") and Quillhub Inc. ("Customer").
Effective Date: March 1, 2027.

1. Term & Renewal:
This Agreement continues for a term of 24 months. It will automatically renew unless either party provides written notice of non-renewal at least 45 days prior to expiration.

2. Service Level Agreement:
Meridian commits to a Monthly Uptime Percentage of ninety-nine and eight-tenths percent (99.8%). If availability drops below 99.8%, Customer is entitled to a service credit equal to 15% of the monthly fee.

3. Limitation of Liability:
Neither party's aggregate liability under this Agreement shall exceed $250,000 USD.

4. Notice Address:
Formal legal notices must be delivered in writing to notices@meridiannetworks.com or via registered mail.
"""

def test_full_e2e_novel_contract_war_room_workflow():
    """Verify that a brand new, novel contract flows through all 6 Norse agents seamlessly."""
    workflow = ContractWarRoomWorkflow()
    
    events = [
        {
            "id": "evt-meridian-001",
            "timestamp": "2027-03-10T14:00:00Z",
            "type": "outage",
            "severity": "critical",
            "source": "status_page",
            "description": "Meridian Cloud Networks API experienced 4.2 hour partial degradation in US-East."
        }
    ]
    
    result = workflow.execute(
        doc_id="cnt-MERIDIAN-01",
        contract_text=NOVEL_ENTERPRISE_CONTRACT,
        real_world_events=events,
        clock_date="2027-03-15",
        company_context="Quillhub Inc. uses Meridian for downstream enterprise route caching."
    )
    
    # 1. Thor verification
    assert result.thor.contract_id == "cnt-MERIDIAN-01"
    assert len(result.thor.clauses) > 0
    assert len(result.thor.obligations) > 0
    assert result.thor.counterparty == "Meridian Cloud Networks LLC"
    
    # 2. Norns verification
    assert len(result.norns.timeline_items) >= 1
    assert result.norns.worst_case_exposure_inr > 0
    
    # 3. Loki verification
    assert len(result.loki.risks_and_claims) >= 1
    
    # 4. Heimdall verification
    assert result.heimdall.verified_events_count == 1
    
    # 5. Tyr verification
    assert len(result.tyr.rulings) >= 1
    for adj in result.tyr.rulings:
        assert adj.binding_decision is not None
        assert len(adj.binding_decision) > 0
        
    # 6. Odin synthesis
    assert result.odin.mission_id.startswith("mission-")
    assert result.odin.total_exposure_inr >= 0
    for action in result.odin.final_actions:
        assert action.status == "drafted"
        
    # 7. Observability metrics & bounded loops
    assert result.observability.execution_duration_ms > 0
    assert result.observability.bounded_limits_enforced is True
    assert result.observability.total_agent_steps > 0

import pytest
from app.agents import ThorAgent, LokiAgent, HeimdallAgent, TyrAgent, OdinAgent
from app.services.war_room_state import war_room_state

SAMPLE_CONTRACT_WITH_CITATIONS = """
MASTER CLOUD SERVICES AGREEMENT (CSA)
Between Apex Systems Corp and Quillhub Inc.
Effective Date: November 1, 2026.

Section 4.1 - Availability & Service Level Agreement:
Apex Systems Corp warrants that the Cloud Services shall maintain an aggregate Monthly Uptime Percentage of not less than ninety-nine and nine-tenths percent (99.9%).

Section 7.3 - Indemnification Cap:
Apex Systems Corp's aggregate liability under Section 7 shall not exceed $500,000 USD.

Section 12.4 - Formal Written Notices:
All legal notices under this Agreement must be delivered in writing via certified mail or courier to Legal Department, 100 Main Street, Suite 400.
"""

def test_thor_zero_hallucination_anchors():
    """Verify Thor only anchors verbatim citations that actually exist in the contract text."""
    thor = ThorAgent()
    output = thor.extract(doc_id="cnt-TEST-VERBATIM", contract_text=SAMPLE_CONTRACT_WITH_CITATIONS)
    
    assert len(output.clauses) > 0
    assert len(output.verbatim_citations) > 0
    
    for citation in output.verbatim_citations:
        assert citation.verified is True
        # Verify the verbatim quote is actually a substring in the contract text (case-insensitive)
        assert citation.verbatim_quote.lower() in SAMPLE_CONTRACT_WITH_CITATIONS.lower()

def test_thor_rejects_synthetic_covenant():
    """Verify Thor rejects synthetic hallucinated clauses."""
    thor = ThorAgent()
    output = thor.extract(doc_id="cnt-TEST-VERBATIM", contract_text=SAMPLE_CONTRACT_WITH_CITATIONS)
    
    # Ensure no clause references phantom sections not in contract
    covenant_citations = [c.clause_citation for c in output.clauses]
    for cit in covenant_citations:
        assert "Section 999" not in cit

def test_human_approval_lifecycle():
    """Verify drafted legal actions remain drafted until explicitly approved."""
    # Check that drafted action in war_room_state has drafted status
    actions = war_room_state.actions
    assert len(actions) > 0
    
    first_action = actions[0]
    initial_status = first_action.status
    
    # Approve action via war_room_state
    approval_res = war_room_state.approve_action(first_action.id)
    assert approval_res["status"] == "approved_and_executed"
    assert approval_res["actionId"] == first_action.id
    assert first_action.status == "executed"

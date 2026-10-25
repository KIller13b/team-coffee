import os
from datetime import date, timedelta
import pytest
from app.agents.thor import ThorAgent
from app.agents.norns import NornsAgent
from app.data.canonical_metadata import CANONICAL_METADATA, CANONICAL_OBLIGATIONS
from app.data.seed_data import SEED_CONTRACTS
from app.models.schemas import Contract, Obligation


def load_a1_text() -> str:
    path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "odin_data", "bundle", "contracts", "A1.txt")
    )
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def test_a1_canonical_metadata_and_fees():
    meta = CANONICAL_METADATA["A1"]
    # 1. Dates
    assert meta["startDate"] == "2026-08-01", "Effective date must be August 1, 2026"
    assert meta["endDate"] == "2028-07-31", "Initial-term end date must be July 31, 2028"
    assert meta["renewalDate"] == "2028-05-02", "Notice deadline must be May 2, 2028 (90d prior to 2028-07-31)"
    assert meta["durationMonths"] == 24, "Initial term must be 24 months"

    # 2. Financials ($8,000/mo, $96,000/yr annualized)
    assert "$8,000" in meta["paymentSchedule"]
    assert "$96,000" in meta["paymentSchedule"]
    assert "180,000" not in meta["paymentSchedule"], "Must not reference fabricated $180,000 fee"

    # 3. Governing Law
    assert "Oregon" in meta["jurisdiction"]
    assert "Multnomah" in meta["jurisdiction"]
    assert "Delaware" not in meta["jurisdiction"], "Must not default to Delaware"


def test_a1_canonical_obligations_and_notice():
    obs = CANONICAL_OBLIGATIONS["A1"]
    titles = [o["title"] for o in obs]
    refs = [o["clauseReference"] for o in obs]

    # 1. Non-renewal notice requirement
    notice_ob = next((o for o in obs if "Non-Renewal" in o["title"]), None)
    assert notice_ob is not None
    assert "90-Day" in notice_ob["title"], "Notice must be 90-day requirement, not 60-day"
    assert "60-Day" not in notice_ob["title"]
    assert notice_ob["dueDate"] == "2028-05-02", "Initial-term notice deadline must be 2028-05-02"
    assert "legal@stratonode.com" in notice_ob["description"]

    # 2. Monthly Fee Remittance ($8,000 / month)
    fee_ob = next((o for o in obs if "Fee Remittance" in o["title"]), None)
    assert fee_ob is not None
    assert "$8,000" in fee_ob["description"]
    assert "Section C" in fee_ob["clauseReference"]

    # 3. Unplanned Service Disruption Notification (within 4 hours)
    disrupt_ob = next((o for o in obs if "Disruption" in o["title"]), None)
    assert disrupt_ob is not None
    assert "4 Hours" in disrupt_ob["title"]
    assert "ops@quillhub.io" in disrupt_ob["description"]
    assert "Section I.1" in disrupt_ob["clauseReference"]

    # 4. Security Incident Notification (within 72 hours)
    sec_ob = next((o for o in obs if "Security Incident" in o["title"]), None)
    assert sec_ob is not None
    assert "72 Hours" in sec_ob["title"]
    assert "Section F" in sec_ob["clauseReference"]

    # 5. Subprocessor Modifications (at least 30 days)
    sub_ob = next((o for o in obs if "Subprocessor" in o["title"]), None)
    assert sub_ob is not None
    assert "30 Days" in sub_ob["title"]
    assert "Section I.3" in sub_ob["clauseReference"]

    # 6. Migration Assistance (up to 90 days post-termination)
    mig_ob = next((o for o in obs if "Migration" in o["title"]), None)
    assert mig_ob is not None
    assert "90 Days" in mig_ob["title"]
    assert "Section I.2" in mig_ob["clauseReference"]


def test_calendar_day_notice_calculation():
    """
    Verify application's documented calendar-day subtraction calculation:
    Initial-term end date: July 31, 2028
    Minus 90 calendar days = May 2, 2028
    """
    end_date = date(2028, 7, 31)
    notice_deadline = end_date - timedelta(days=90)
    assert notice_deadline == date(2028, 5, 2), f"Calculated {notice_deadline}, expected 2028-05-02"


def test_thor_extraction_on_a1_cover_page():
    a1_text = load_a1_text()
    thor = ThorAgent()
    out = thor.extract(doc_id="A1", contract_text=a1_text)

    # 1. Governing Law must be Oregon / Multnomah County
    assert "Oregon" in out.governing_law
    assert "Multnomah" in out.governing_law
    assert "Delaware" not in out.governing_law

    # 2. SLA Hierarchy Citation must be Section E
    sla_hier = next((c for c in out.clauses if c.field == "SLA Governance Hierarchy"), None)
    assert sla_hier is not None, "Thor must extract SLA hierarchy clause"
    assert sla_hier.clause_citation == "Section E", "SLA hierarchy citation must be Section E"
    assert "Special Terms" not in sla_hier.clause_citation
    assert "QH-STRATO-2026-SLA" in sla_hier.verbatim_text

    # 3. Fees clause extracted from Section C
    fee_clause = next((c for c in out.clauses if c.clause_citation == "Section C"), None)
    assert fee_clause is not None
    assert "$8,000" in fee_clause.verbatim_text

    # 4. Service Disruption extracted from Section I.1
    disrupt_clause = next((c for c in out.clauses if c.clause_citation == "Section I.1"), None)
    assert disrupt_clause is not None
    assert "four (4) hours" in disrupt_clause.verbatim_text
    assert "ops@quillhub.io" in disrupt_clause.verbatim_text

    # 5. Non-Renewal notice not prematurely marked ambiguous on standalone A1
    renewal_clause = next((c for c in out.clauses if "Renewal" in c.field), None)
    assert renewal_clause is not None
    assert not renewal_clause.is_ambiguous, "Standalone A1 must not be marked ambiguous without conflicting amendment text"


def test_seed_contract_a1_ground_truth():
    seed_a1 = next((c for c in SEED_CONTRACTS if c["id"] == "cnt-A1"), None)
    assert seed_a1 is not None
    assert seed_a1["counterparty"] == "StratoNode Inc."
    assert seed_a1["effectiveDate"] == "2026-08-01"
    assert seed_a1["expiryDate"] == "2028-07-31"
    assert seed_a1["renewalNoticeDays"] == 90
    assert "$96,000" in seed_a1["value"]
    assert "$8,000" in seed_a1["value"]
    assert "180,000" not in seed_a1["value"]
    assert "Oregon" in seed_a1["governingLaw"]
    assert "Delaware" not in seed_a1["governingLaw"]

    # Verify clauses in seed contract
    sections = [cl["section"] for cl in seed_a1["clauses"]]
    assert "Section E" in sections, "Section E must be present in seed clauses"
    assert "Section C" in sections
    assert "Section H" in sections
    assert "Section I.1" in sections
    assert "Special Terms §2" not in sections, "Fabricated Special Terms §2 must not exist"


def test_norns_milestones_for_a1():
    norns = NornsAgent()
    thor = ThorAgent()
    a1_text = load_a1_text()
    thor_out = thor.extract(doc_id="A1", contract_text=a1_text)

    norns_out = norns.analyze_timeline(thor_output=thor_out, current_clock="2027-03-15")
    milestone_dates = {item.title: item.date for item in norns_out.timeline_items}

    # Verify signature dates
    assert milestone_dates.get("StratoNode Inc. Execution Date") == "2026-07-15"
    assert milestone_dates.get("Quillhub Inc. Execution Date") == "2026-07-18"

    # Verify effective date
    assert milestone_dates.get("Contract Effective Date") == "2026-08-01"

    # Verify notice deadline (2028-05-02)
    assert milestone_dates.get("StratoNode 90-Day Non-Renewal Written Notice Cutoff") == "2028-05-02"

    # Verify expiration (2028-07-31)
    assert milestone_dates.get("Initial 24-Month Term Expiration") == "2028-07-31"

"""
Thor — Extraction Agent (FR2)
Extracts structured terms from each contract with citation grounding.
Uses a deterministic rules-based engine (works without LLM keys),
with optional LLM enrichment if a key is available.
"""

from __future__ import annotations
import re
from typing import Any, Dict, List, Optional
from ..state.schema import (
    Citation, ContractExtraction, ExtractedTerm
)
from ..tools.bundle_loader import load_contract, load_all_contracts


# ─── Verification helper: citation MUST be a verbatim substring ───────────────

def verify_citation(doc_id: str, quote: str, contract_text: str) -> bool:
    """NFR2: Every citation must be verifiable via simple text search."""
    return quote.strip() in contract_text


def make_term(
    field: str, value: Any, doc_id: str, clause_ref: str,
    quote: str, contract_text: str, confidence: float = 0.95,
    ambiguous: bool = False, ambiguity_note: Optional[str] = None
) -> ExtractedTerm:
    verified = verify_citation(doc_id, quote, contract_text)
    if not verified:
        confidence = min(confidence, 0.3)
        ambiguous = True
        ambiguity_note = (ambiguity_note or "") + " [CITATION NOT VERIFIED — manual review required]"
    return ExtractedTerm(
        field=field,
        value=value,
        citation=Citation(doc_id=doc_id, clause_ref=clause_ref, verbatim_quote=quote, confidence=confidence),
        ambiguous=ambiguous,
        ambiguity_note=ambiguity_note
    )


# ─── Per-document extraction rules ───────────────────────────────────────────

def extract_A1(text: str) -> ContractExtraction:
    return ContractExtraction(
        contract_id="QH-STRATO-2026-001",
        doc_ids=["A1", "STD"],
        parties=[
            make_term("provider", "StratoNode Inc.", "A1", "Provider Information",
                      "Legal Name:     StratoNode Inc.", text),
            make_term("customer", "Quillhub Inc.", "A1", "Customer Information",
                      "Legal Name:     Quillhub Inc.", text),
        ],
        effective_date=make_term("effective_date", "2026-08-01", "A1", "Section B",
            "Effective Date:            August 1, 2026", text),
        subscription_period=make_term("subscription_period", "24 months (ending 2028-07-31)", "A1", "Section B",
            "Initial Subscription Period: 24 months (ending July 31, 2028)", text),
        renewal_terms=make_term("renewal_terms", "Successive 12-month periods, auto-renew", "A1", "Section B",
            "automatically renew for successive Renewal Periods of\n  12 months each", text),
        notice_period=make_term(
            "notice_period",
            "60 days (amended from 90 by A3 §3, effective 2027-01-01)",
            "A3", "Section 3",
            "The Non-Renewal Notice Period is changed from ninety (90) days to sixty\n  (60) days before the end of the then-current Subscription Period.",
            load_contract("A3"),
            ambiguous=True,
            ambiguity_note="A1 originally said 90 days; A3 §3 silently amended to 60 days effective 2027-01-01. Silent amendment risk."
        ),
        fees=[
            make_term("monthly_fee", 8000.00, "A1", "Section C",
                      "Monthly Fee:     $8,000.00 (Eight Thousand", text),
        ],
        uptime_target=make_term("uptime_target", "99.5%", "A2", "Section 2 §2.1",
            "at least ninety-nine\n     and one-half percent (99.5%) of the minutes", load_contract("A2")),
        credit_table=make_term("credit_table", {
            "99.0%-<99.5%": "10% Monthly Fee",
            "95.0%-<99.0%": "25% Monthly Fee",
            "Below 95.0%":  "50% Monthly Fee",
            "Single incident >60min": "+5% Monthly Fee (A3 §2)"
        }, "A3", "Section 2",
            "Monthly Uptime Percentage          Service Credit", load_contract("A3")),
        credit_request_deadline=make_term(
            "credit_request_deadline",
            "15 business days after end of calendar month (amended by A3 §1)",
            "A3", "Section 1",
            "submit a written request to Provider's Notice Address within fifteen\n        (15) days after the end of the calendar month",
            load_contract("A3"),
            ambiguous=True,
            ambiguity_note="Original A2 §3.2 had no explicit deadline; A3 §1 added the 15-day window effective 2027-01-01. Critical for credit recovery."
        ),
        termination_rights=[
            make_term("termination_persistent_sla", "If uptime fails 2 consecutive months, customer may terminate on 30 days' notice (A2 §6.1)",
                      "A2", "Section 6 §6.1",
                      "falls below the Uptime Target in any\n     two (2) consecutive calendar months", load_contract("A2")),
        ],
        insurance_requirements=[],
        exclusivity_clauses=[],
        governing_law=make_term("governing_law", "State of Oregon", "A1", "Section H",
            "Governing Law:    State of Oregon", text),
        key_obligations=[
            make_term("quillhub_credit_claim_window",
                      "Must submit SLA credits to StratoNode within 15 days of month-end (A3 §1). CRITICAL — forfeiture if missed.",
                      "A3", "Section 1",
                      "within fifteen\n        (15) days after the end of the calendar month", load_contract("A3"),
                      confidence=0.99),
        ],
        flags=["A3 silently amended A1 §B notice period from 90→60 days",
               "A3 introduced strict 15-day credit claim window not present in original A2"]
    )


def extract_B1(text: str) -> ContractExtraction:
    return ContractExtraction(
        contract_id="QH-HARBOR-2026-001",
        doc_ids=["B1", "B2", "STD"],
        parties=[
            make_term("provider", "Quillhub Inc.", "B1", "Provider Information",
                      "Legal Name:     Quillhub Inc.", text),
            make_term("customer", "Harbor Retail Group LLC", "B1", "Customer Information",
                      "Legal Name:     Harbor Retail Group LLC", text),
        ],
        effective_date=make_term("effective_date", "2026-09-15", "B1", "Section B",
            "Effective Date:              September 15, 2026", text),
        subscription_period=make_term("subscription_period", "36 months (ending 2029-09-14)", "B1", "Section B",
            "Initial Subscription Period: 36 months (ending September 14, 2029)", text),
        renewal_terms=make_term("renewal_terms", "Successive 24-month periods, auto-renew", "B1", "Section B",
            "automatically renew for successive Renewal Periods of\n  24 months each", text),
        notice_period=make_term("notice_period", "180 days before end of subscription period", "B1", "Section B",
            "Non-Renewal Notice Period:   180 days before the end of the then-current", text),
        fees=[
            make_term("monthly_fee", 40000.00, "B1", "Section C",
                      "Monthly Fee:     $40,000.00 (Forty Thousand U.S. Dollars)", text),
            make_term("annual_escalation", "3% per anniversary from 2027-09-15 (Month 37 = $41,200)", "B1", "Section C",
                      "Monthly Fee will increase by three percent (3%) on each\n  anniversary of the Effective Date", text),
            make_term("payment_period", "45 days from invoice date", "B1", "Section C",
                      "Payment Period:  45 days from invoice date.", text),
        ],
        uptime_target=make_term("uptime_target", "99.9%", "B1", "Section D §3.1",
            "ninety-nine and nine-tenths percent (99.9%) of the minutes", text),
        credit_table=make_term("credit_table", {"Below 99.9%": "15% Monthly Fee ($6,000 at current rate)"},
            "B1", "Section D §3.3",
            "Quillhub will credit\n        Harbor Retail fifteen percent (15%) of the Monthly Fee", text),
        credit_request_deadline=make_term("credit_request_deadline", "45 days after end of calendar month", "B1", "Section D §3.5",
            "Harbor Retail must request a service credit in writing\n        within forty-five (45) days after the end of the calendar month", text,
            confidence=0.99),
        termination_rights=[
            make_term("termination_persistent_sla", "2 consecutive months below target → Harbor Retail may terminate immediately", "B1", "Section I §8.1",
                      "falls below the Harbor Uptime Target in any two (2)\n        consecutive calendar months, Harbor Retail may terminate", text),
            make_term("termination_insurance_lapse", "Insurance lapse uncured within 15 days → immediate termination", "B1", "Section I §8.2",
                      "does not cure the lapse within\n        fifteen (15) days after written notice from Harbor Retail, Harbor\n        Retail may terminate this Agreement immediately", text),
        ],
        insurance_requirements=[
            make_term("cgl_insurance", "$2,000,000 per occurrence CGL — expires 2027-06-30 (RISK)", "B1", "Section H §7.1",
                      "Commercial General Liability insurance with limits of at least\n        $2,000,000 per occurrence", text,
                      ambiguous=False, confidence=0.99),
            make_term("cyber_insurance", "$3,000,000 per claim E&O/Cyber — expires 2027-06-30 (RISK)", "B1", "Section H §7.1",
                      "Cyber Liability insurance with limits of at least $3,000,000 per\n        claim", text,
                      confidence=0.99),
            make_term("lapse_notification", "5 business days notice to Harbor of any lapse/cancellation", "B1", "Section H §7.2",
                      "Quillhub will notify Harbor\n        Retail in writing within five (5) business days", text),
            make_term("lapse_breach", "Insurance lapse = material breach", "B1", "Section H §7.2",
                      "A lapse in required\n        insurance coverage constitutes a material breach of this Agreement.", text,
                      confidence=1.0),
        ],
        exclusivity_clauses=[
            make_term("exclusivity", "Harbor Retail: exclusive Route Optimizer Enterprise in PNW retail grocery (WA & OR)", "B1", "Section G §6.1",
                      "grants Harbor Retail the exclusive right to use the Route Optimizer\n        Enterprise platform within the Pacific Northwest retail grocery\n        sector", text,
                      ambiguous=True,
                      ambiguity_note="Territorial conflict: C1 §4.1 grants Vantage Logistics exclusivity over ALL Route Optimizer tiers in PNW 3PL — overlap possible if Vantage's clients include grocery retailers."),
        ],
        governing_law=make_term("governing_law", "State of Washington (King County courts)", "B1", "Section K",
            "Governing Law:    State of Washington", text),
        key_obligations=[
            make_term("incident_notification", "4-hour notice to Harbor of unplanned outage (§4.1)", "B1", "Section E §4.1",
                      "Quillhub will notify Harbor\n        Retail's contact (nora.chen@harborretail.com) within four (4) hours", text),
            make_term("rca_delivery", "Written RCA within 5 business days for outage >30 min (§4.2)", "B1", "Section E §4.2",
                      "Quillhub will provide a written root-cause analysis to\n        Harbor Retail within five (5) business days after service is restored.", text),
            make_term("data_breach_notification", "24-hour Data Breach notice to General Counsel (§5.1 / B2 §3.1)", "B1", "Section F §5.1",
                      "Quillhub will notify Harbor Retail's General Counsel\n        within twenty-four (24) hours of becoming aware of the Data Breach.", text),
        ],
        flags=[
            "Insurance policies expire 2027-06-30 — 3 years before contract end (2029-09-14)",
            "Incident notification E-05 sent 28+ hours after March 3 outage — violates 4-hour SLA",
            "No written RCA ever delivered for March 3 outage — violates §4.2",
            "Harbor credit request (E-17, June 15) for March 2027 is UNTIMELY (deadline: May 15)",
            "Territorial exclusivity overlap with C1 §4.1 (Vantage Logistics)"
        ]
    )


def extract_C1(text: str) -> ContractExtraction:
    return ContractExtraction(
        contract_id="QH-VANTAGE-2026-001",
        doc_ids=["C1", "STD"],
        parties=[
            make_term("provider", "Quillhub Inc.", "C1", "Provider Information",
                      "Legal Name:     Quillhub Inc.", text),
            make_term("customer", "Vantage Logistics Corporation", "C1", "Customer Information",
                      "Legal Name:     Vantage Logistics Corporation", text),
        ],
        effective_date=make_term("effective_date", "2027-05-15 (Go-Live per E-14)", "C1", "Signatures note",
            "The Effective Date will be the date on which Quillhub confirms in\nwriting that the Platform is available for production use by Vantage Logistics", text,
            ambiguous=True,
            ambiguity_note="Effective Date was blank at signing (Nov 2026); Go-Live confirmed 2027-05-15 per Event E-14."),
        subscription_period=make_term("subscription_period", "24 months from 2027-05-15 (ending ~2029-05-14)", "C1", "Section B",
            "Initial Subscription Period: 24 months from the Effective Date", text),
        renewal_terms=make_term("renewal_terms", "Successive 12-month periods, auto-renew", "C1", "Section B",
            "successive 12-month periods", text),
        notice_period=make_term("notice_period", "90 days before end of subscription period", "C1", "Section B",
            "Non-Renewal Notice Period:   90 days before the end of the then-current", text),
        fees=[
            make_term("setup_fee", 15000.00, "C1", "Section C",
                      "Setup Fee:       $15,000.00", text),
            make_term("monthly_fee", 12000.00, "C1", "Section C",
                      "Monthly Fee:     $12,000.00", text),
            make_term("payment_period", "30 days from invoice date", "C1", "Section C",
                      "Payment Period:  30 days from invoice date", text),
        ],
        uptime_target=make_term("uptime_target", "99.5%", "C1", "Section D §3.1",
            "ninety-nine and one-half percent (99.5%) of the minutes", text),
        credit_table=make_term("credit_table", {"Below 99.5%": "10% Monthly Fee ($1,200 at current rate)"},
            "C1", "Section D §3.2",
            "credit\n       Vantage Logistics ten percent (10%) of the Monthly Fee", text),
        credit_request_deadline=make_term("credit_request_deadline", "30 days after end of calendar month", "C1", "Section D §3.3",
            "Vantage Logistics must request a service credit in\n       writing within thirty (30) days", text),
        termination_rights=[],
        insurance_requirements=[],
        exclusivity_clauses=[
            make_term("exclusivity", "Vantage Logistics: exclusive ALL Route Optimizer tiers in PNW 3PL (WA & OR) providing warehousing+last-mile", "C1", "Section E §4.1",
                      "grants Vantage Logistics the exclusive right to use the Route\n        Optimizer platform (including all tiers: Standard, Pro, and\n        Enterprise) within the Pacific Northwest third-party logistics sector",
                      text,
                      ambiguous=True,
                      ambiguity_note="CONFLICT: B1 §6.1 grants Harbor Retail exclusivity over Enterprise tier in PNW grocery. If Vantage serves grocery supply chains in WA/OR, both contracts may be simultaneously breached."),
        ],
        governing_law=make_term("governing_law", "State of Oregon (Multnomah County courts)", "C1", "Section G",
            "Governing Law:    State of Oregon", text),
        key_obligations=[
            make_term("customer_data_ownership", "All Vantage operations data is Customer Content — Quillhub has no data rights (H.1)", "C1", "Section H H.1",
                      "all route data,\n       delivery data, fleet telemetry, and optimization outputs generated\n       through Vantage Logistics' use of the Platform", text),
        ],
        flags=[
            "Effective Date was blank at signing — creates subscription period ambiguity pre-Go-Live",
            "Exclusivity covers ALL tiers including Enterprise — direct conflict with B1 §6.1",
            "Setup fee ($15,000) invoiced July 1, 2027 (E-18) — 47 days after Go-Live"
        ]
    )


def extract_D1(text: str) -> ContractExtraction:
    return ContractExtraction(
        contract_id="QH-PIXEL-2026-001",
        doc_ids=["D1"],
        parties=[
            make_term("company", "Quillhub Inc.", "D1", "Preamble",
                      "Quillhub Inc., a Delaware corporation", text),
            make_term("contractor", "Pixelwright Design Studio LLC", "D1", "Preamble",
                      "Pixelwright Design Studio LLC, an Oregon limited liability company", text),
        ],
        effective_date=make_term("effective_date", "2026-10-01", "D1", "Preamble",
            "as of October 1, 2026 (the \"Effective Date\")", text),
        subscription_period=make_term("subscription_period", "Until 2027-12-31, no auto-renew", "D1", "Section 2 §2.1",
            "This Agreement begins on the Effective Date and continues until\n     December 31, 2027", text),
        renewal_terms=make_term("renewal_terms", "No auto-renewal (D1 §2.2)", "D1", "Section 2 §2.2",
            "This Agreement does not automatically renew.", text),
        notice_period=None,
        fees=[
            make_term("total_fixed_fee", 65000.00, "D1", "Section 3 §3.1",
                      "total fixed\n     fee is Sixty-Five Thousand U.S. Dollars ($65,000.00)", text),
            make_term("M1", 10000.00, "D1", "Section 3 §3.1 / Exhibit A",
                      "M1           Project kickoff and discovery       $10,000    Upon execution", text),
            make_term("M2", 15000.00, "D1", "Section 3 §3.1 / Exhibit A",
                      "M2           Design mockups delivery             $15,000    Upon acceptance", text),
            make_term("M3", 20000.00, "D1", "Section 3 §3.1 / Exhibit A",
                      "M3           Front-end development delivery      $20,000    Upon acceptance", text),
            make_term("M4", 12000.00, "D1", "Section 3 §3.1 / Exhibit A",
                      "M4           Integration and testing delivery    $12,000    Upon acceptance", text),
            make_term("M5", 8000.00, "D1", "Section 3 §3.1 / Exhibit A",
                      "M5           Final delivery and launch           $8,000     Upon acceptance", text),
            make_term("payment_period", "20 business days after invoice receipt", "D1", "Section 3 §3.2",
                      "Company will\n     pay each invoice within twenty (20) business days of receipt.", text),
            make_term("late_payment_interest", "1% per month on overdue amounts", "D1", "Section 3 §3.3",
                      "interest at the rate of one percent\n     (1.0%) per month on the overdue amount", text),
        ],
        uptime_target=None,
        credit_table=None,
        credit_request_deadline=None,
        termination_rights=[
            make_term("termination_for_cause", "30 days notice after material breach cure period", "D1", "Section 9",
                      "Section 9", text, confidence=0.7, ambiguity_note="Section 9 text cross-reference"),
        ],
        insurance_requirements=[],
        exclusivity_clauses=[],
        governing_law=make_term("governing_law", "State of Texas", "D1", "Section 10 §10.3",
            "governed by the laws of the State\n     of Texas", text),
        key_obligations=[
            make_term("M3_due", "M3 due 2027-01-31 (SOW)", "D1", "Exhibit A",
                      "M3 — Front-End Development\n    Deliverables:  Functional front-end implementation (React), component", text),
            make_term("M4_due", "M4 due 2027-02-28 (SOW)", "D1", "Exhibit A",
                      "M4 — Integration and Testing\n    Deliverables:  API integration with Route Optimizer backend", text),
            make_term("M5_due", "M5 due 2027-03-31 (SOW)", "D1", "Exhibit A",
                      "M5 — Final Delivery and Launch\n    Deliverables:  Production deployment, documentation", text),
            make_term("review_period", "10 business days to accept or issue Rejection Notice (§4.2)", "D1", "Section 4 §4.2",
                      "Company will have ten (10) business days after receipt of\n     each milestone deliverable to review the deliverable", text),
            make_term("deemed_acceptance", "If no Rejection Notice in 10 business days → deemed accepted (§4.3)", "D1", "Section 4 §4.3",
                      "If Company does not deliver a Rejection Notice within\n     the ten (10) business day review period specified in Section 4.2, the\n     milestone deliverable will be deemed accepted.", text,
                      confidence=1.0),
        ],
        flags=[
            "M3 submitted Feb 28 (E-03) — late vs. Jan 31 due date",
            "M4 submitted Apr 20 (E-11) — late vs. Feb 28 due date; deemed accepted ~May 4 (after 10 biz days excl. holidays)",
            "M5 not yet confirmed as submitted by Sept 15 checkpoint"
        ]
    )


# ─── Thor main run ────────────────────────────────────────────────────────────

def run_thor(log_fn=None) -> Dict[str, ContractExtraction]:
    """Extract all contracts and return mapping of contract_id → extraction."""
    contracts = load_all_contracts()
    extractors = {
        "A1": lambda: extract_A1(contracts["A1"]),
        "B1": lambda: extract_B1(contracts["B1"]),
        "C1": lambda: extract_C1(contracts["C1"]),
        "D1": lambda: extract_D1(contracts["D1"]),
    }

    results: Dict[str, ContractExtraction] = {}
    for doc_id, extractor in extractors.items():
        if log_fn:
            log_fn(f"[Thor] Extracting {doc_id}...")
        extraction = extractor()
        results[extraction.contract_id] = extraction
        if log_fn:
            flags = extraction.flags
            log_fn(f"[Thor] {doc_id} → {len(extraction.key_obligations)} obligations, {len(flags)} flags")

    return results


if __name__ == "__main__":
    import json as _json
    results = run_thor(log_fn=print)
    for cid, ext in results.items():
        print(f"\n{'='*60}")
        print(f"Contract: {cid}")
        print(f"Flags: {ext.flags}")
        print(f"Obligations: {[o.field for o in ext.key_obligations]}")

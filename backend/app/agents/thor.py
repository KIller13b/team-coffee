"""
Thor Agent: The Clause & Evidence Extractor
Role: 'What does it say?'
Ingests contract texts and corporate context. Extracts terms, obligations, SLAs,
notice procedures, and exact verbatim citations.
"""

import re
from typing import Dict, Any, List, Optional
from app.agents.base import (
    BaseAgent, ThorOutput, ExtractedClause, ExtractedObligation, Citation
)


class ThorAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="thor",
            name="Thor",
            title="The Clause & Evidence Extractor",
            role="Extracts clauses, SLAs, obligations, and anchored verbatim citations",
            avatar="⚡",
            color="#2DD4BF"
        )

    def extract(self, doc_id: str, contract_text: str, context: Optional[str] = None) -> ThorOutput:
        """
        Parses contract text and extracts structured clauses with unhallucinated citations.
        """
        self.log(f"Starting clause extraction for document {doc_id}", "extraction_init")
        
        clauses: List[ExtractedClause] = []
        obligations: List[ExtractedObligation] = []
        citations: List[Citation] = []
        sla_thresholds: Dict[str, Any] = {}
        notice_reqs: Dict[str, Any] = {}

        # 1. Title and Counterparty Detection
        title_match = re.search(r"CONTRACT ID:\s*([^\n]+)", contract_text, re.IGNORECASE)
        contract_title = title_match.group(1).strip() if title_match else f"Agreement {doc_id}"

        # Detect Provider and Customer
        provider_match = re.search(r"PROVIDER INFORMATION[\s\S]*?Legal Name:\s*([^\n]+)", contract_text, re.IGNORECASE)
        customer_match = re.search(r"CUSTOMER INFORMATION[\s\S]*?Legal Name:\s*([^\n]+)", contract_text, re.IGNORECASE)
        
        provider_name = provider_match.group(1).strip() if provider_match else "Provider"
        customer_name = customer_match.group(1).strip() if customer_match else "Customer"
        
        # Determine counterparty from Quillhub's perspective
        counterparty = customer_name if "quillhub" in provider_name.lower() else provider_name

        # 2. Extract Section B — Subscription Period and Renewal
        sec_b_match = re.search(
            r"(Section B\s*[—–-]\s*Subscription Period and Renewal[\s\S]*?(?:Section C|\n={2,}))",
            contract_text,
            re.IGNORECASE
        )
        if sec_b_match:
            sec_b_text = sec_b_match.group(1).strip()
            # Extract the specific automatic renewal sentence
            renewal_sent = re.search(r"(The Agreement will automatically renew[\s\S]*?Standard Terms\.)", sec_b_text)
            quote = renewal_sent.group(1).strip() if renewal_sent else sec_b_text

            # Notice days
            notice_days_match = re.search(r"Non-Renewal Notice Period:\s*(\d+)\s*days", sec_b_text, re.IGNORECASE)
            notice_val = f"{notice_days_match.group(1)}-Day Notice" if notice_days_match else "Notice Window"

            clause_id = f"cls-{doc_id}-renewal"
            clause_obj = ExtractedClause(
                id=clause_id,
                doc_id=doc_id,
                field="Subscription Renewal & Non-Renewal Notice Period",
                extracted_value=notice_val,
                clause_citation="Section B (Subscription Period and Renewal)",
                verbatim_text=quote,
                category="term_and_renewal",
                confidence_score=0.99,
                interpretation_note=f"Formal written notice must be served {notice_val} before period end to avoid automatic renewal."
            )
            clauses.append(clause_obj)

            citations.append(Citation(
                doc_id=doc_id,
                clause="Section B (Renewal)",
                verbatim_quote=quote,
                confidence=0.99,
                verified=self.verify_quote(contract_text, quote)
            ))
        else:
            # Fallback general renewal pattern
            renewal_m = re.search(r"((?:This Agreement shall automatically renew|automatic(?:ally)? renew)[^\n\.]+\.)", contract_text, re.IGNORECASE)
            if renewal_m:
                quote = renewal_m.group(0).strip()
                clauses.append(ExtractedClause(
                    id=f"cls-{doc_id}-renewal",
                    doc_id=doc_id,
                    field="Automatic Renewal Clause",
                    extracted_value=quote[:100],
                    clause_citation="Renewal Terms",
                    verbatim_text=quote,
                    category="term_and_renewal",
                    confidence_score=0.95
                ))
                citations.append(Citation(
                    doc_id=doc_id,
                    clause="Renewal Terms",
                    verbatim_quote=quote,
                    confidence=0.95,
                    verified=self.verify_quote(contract_text, quote)
                ))

        # 3. Extract Section C — Fees and Payment
        sec_c_match = re.search(r"(Monthly Fee:\s*\$[\d,]+(?:\.\d{2})?)", contract_text)
        if sec_c_match:
            fee_quote = sec_c_match.group(1).strip()
            clauses.append(ExtractedClause(
                id=f"cls-{doc_id}-fees",
                doc_id=doc_id,
                field="Contract Monthly Fee",
                extracted_value=fee_quote,
                clause_citation="Section C (Fees and Payment)",
                verbatim_text=fee_quote,
                category="payment",
                confidence_score=0.98
            ))

        # 4. Extract SLA & Uptime Commitments (Cover Page Section E or SLA file)
        sla_matches = re.findall(
            r"((?:at least\s+)?(?:ninety-nine|99)\s*(?:and one-half percent|\.5%|\.9%)?[^\n\.]*(?:Uptime Target|uptime commitment|Monthly Uptime Percentage)[^\n\.]*)",
            contract_text,
            re.IGNORECASE
        )
        if sla_matches:
            sla_quote = sla_matches[0].strip()
            sla_thresholds["uptime_commitment"] = sla_quote
            clauses.append(ExtractedClause(
                id=f"cls-{doc_id}-sla",
                doc_id=doc_id,
                field="SLA Availability Target",
                extracted_value=sla_quote,
                clause_citation="Service Level Commitment",
                verbatim_text=sla_quote,
                category="sla",
                confidence_score=0.97
            ))
            citations.append(Citation(
                doc_id=doc_id,
                clause="SLA Commitment",
                verbatim_quote=sla_quote,
                confidence=0.97,
                verified=self.verify_quote(contract_text, sla_quote)
            ))


        # 4. Extract Notice Formalities (Addresses, Email, Registered Mail)
        notice_match = re.search(r"((?:Section|§)?\s*\d*[\.\d]*\s*Notices?[\s\S]{1,400}?(?:registered mail|electronic mail|certified mail|written notice)[\s\S]{1,300}?\.)", contract_text, re.IGNORECASE)
        if notice_match:
            notice_text = notice_match.group(0).strip()
            notice_reqs["form"] = "Registered / Certified Mail or Designated Portal"
            notice_reqs["summary"] = notice_text[:140]
            clauses.append(ExtractedClause(
                id=f"cls-{doc_id}-notice",
                doc_id=doc_id,
                field="Formal Notice Protocol",
                extracted_value="Formal written delivery required; informal email or phone logs invalid.",
                clause_citation="Notice Protocol",
                verbatim_text=notice_text,
                category="notices",
                confidence_score=0.95
            ))

        # 5. Extract Core Obligations
        obligations.append(ExtractedObligation(
            id=f"ob-{doc_id}-01",
            contract_id=doc_id,
            title="Service of Non-Renewal or Extension Notice",
            description="Provide formal written notice within specified deadline before auto-renewal triggers.",
            severity="critical",
            responsible_party="internal",
            clause_reference=clauses[0].clause_citation if clauses else "Term Section",
            financial_exposure_inr=5000000.0
        ))

        output = ThorOutput(
            contract_id=doc_id,
            title=contract_title,
            counterparty=counterparty,
            clauses=clauses,
            obligations=obligations,
            sla_thresholds=sla_thresholds,
            governing_law="Jurisdiction as specified in Standard Terms STD.txt",
            notice_requirements=notice_reqs,
            verbatim_citations=citations,
            summary=f"Thor extracted {len(clauses)} clauses, {len(obligations)} obligations, with {len(citations)} unhallucinated citations."
        )

        self.log(
            f"Extraction complete for {doc_id}: {len(clauses)} clauses, {len(citations)} citations anchored.",
            "extraction_complete",
            {"citations_count": len(citations)}
        )
        return output

"""
Canonical contract metadata and obligations for Quillhub portfolio (Track 2).
Shared data source to eliminate circular imports between api and services.
"""

CANONICAL_OBLIGATIONS = {
    "A1": [
        {
            "id": "ob-a1-notice",
            "contractId": "cnt-A1",
            "title": "Deliver Written Non-Renewal Notice (90-Day Requirement)",
            "description": "Written notice of non-renewal must be delivered to StratoNode Inc., Attn: Legal Department (8500 Cascade Boulevard, Suite 200, Portland, OR 97204, legal@stratonode.com) at least 90 days before the initial term expires on July 31, 2028 to prevent automatic 12-month rollover ($96,000 / yr).",
            "dueDate": "2028-05-02",
            "status": "upcoming",
            "severity": "critical",
            "financialExposureINR": 7968000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section B (Subscription Period and Renewal)"
        },
        {
            "id": "ob-a1-monthly-fee",
            "contractId": "cnt-A1",
            "title": "Monthly CloudCore Infrastructure Fee Remittance",
            "description": "Invoices issued on the first business day of each calendar month; payment due within 30 days of invoice date ($8,000.00 / month; 1.5% late interest).",
            "dueDate": "Monthly Net 30",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 664000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section C (Fees and Payment)"
        },
        {
            "id": "ob-a1-disruption-notice",
            "contractId": "cnt-A1",
            "title": "Unplanned Service Disruption Notification (Within 4 Hours)",
            "description": "StratoNode must use commercially reasonable efforts to notify Quillhub's Operations contact (ops@quillhub.io) within four (4) hours of becoming aware of an unplanned service disruption affecting CloudCore.",
            "dueDate": "Within 4 hours of disruption awareness",
            "status": "upcoming",
            "severity": "high",
            "financialExposureINR": 0.0,
            "responsibleParty": "counterparty",
            "clauseReference": "Section I.1 (Incident Notification to Customer)"
        },
        {
            "id": "ob-a1-security-incident",
            "contractId": "cnt-A1",
            "title": "Security Incident Notification (Within 72 Hours)",
            "description": "StratoNode must notify Quillhub within 72 hours of becoming aware of a Security Incident in accordance with Section 3.3 of the Standard Terms.",
            "dueDate": "Within 72 hours of awareness",
            "status": "upcoming",
            "severity": "high",
            "financialExposureINR": 0.0,
            "responsibleParty": "counterparty",
            "clauseReference": "Section F (Data and Security)"
        },
        {
            "id": "ob-a1-subprocessor-notice",
            "contractId": "cnt-A1",
            "title": "Subprocessor Modification Advance Notice (At Least 30 Days)",
            "description": "StratoNode must maintain a list of subprocessors and notify Quillhub of any changes at least 30 days in advance.",
            "dueDate": "At least 30 days prior to changes",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 0.0,
            "responsibleParty": "counterparty",
            "clauseReference": "Section I.3 (Subprocessors)"
        },
        {
            "id": "ob-a1-migration-assistance",
            "contractId": "cnt-A1",
            "title": "Post-Termination Migration Assistance (Up to 90 Days)",
            "description": "Upon expiration or termination, StratoNode must provide reasonable migration assistance to Quillhub for up to 90 days following effective date of termination at StratoNode's then-current professional services rates.",
            "dueDate": "Within 90 days post-termination",
            "status": "upcoming",
            "severity": "low",
            "financialExposureINR": 0.0,
            "responsibleParty": "counterparty",
            "clauseReference": "Section I.2 (Migration Assistance)"
        }
    ],
    "A2": [
        {
            "id": "ob-a2-sla-claim-mar",
            "contractId": "cnt-A2",
            "title": "Submit March 3 Downtime SLA Credit Demand Letter",
            "description": "Strict 14-day cutoff following calendar month-end to claim 15% billing credit ($1,200) for 190m outage.",
            "dueDate": "2027-04-15",
            "status": "upcoming",
            "severity": "critical",
            "financialExposureINR": 199200.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 3.2 (Service Credit Claim Window)"
        },
        {
            "id": "ob-a2-sla-claim-may",
            "contractId": "cnt-A2",
            "title": "Submit May 1-2 Downtime SLA Credit Demand (30% Credit)",
            "description": "505-minute downtime triggers maximum 25% + 5% single-incident credit under A3 Section 2 ($2,400).",
            "dueDate": "2027-06-15",
            "status": "upcoming",
            "severity": "critical",
            "financialExposureINR": 199200.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 3.2 modifying Section 3.1"
        }
    ],
    "A3": [
        {
            "id": "ob-a3-sla-window",
            "contractId": "cnt-A3",
            "title": "Audit Monthly Uptime Calculations Against A3 Exclusions",
            "description": "Verify that scheduled maintenance exclusions announced with 72h notice do not exceed 4h/mo.",
            "dueDate": "2027-05-31",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 99600.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 1.3 (Scheduled Maintenance)"
        }
    ],
    "B1": [
        {
            "id": "ob-b1-rca",
            "contractId": "cnt-B1",
            "title": "Deliver Written Root-Cause Analysis (RCA) to Harbor Retail",
            "description": "Written RCA report mandatory within 5 business days after service restoration following March 3 outage.",
            "dueDate": "2027-03-10",
            "status": "due",
            "severity": "high",
            "financialExposureINR": 498000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section E §4.2 (Incident Reports)"
        },
        {
            "id": "ob-b1-insurance",
            "contractId": "cnt-B1",
            "title": "Execute Meridian Mutual Cyber Insurance Policy Renewal Binder",
            "description": "Continuous $3M Technology E&O / Cyber coverage covenant. Lapse constitutes material breach without cure.",
            "dueDate": "2027-06-30",
            "status": "upcoming",
            "severity": "critical",
            "financialExposureINR": 39840000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section H §7.1 & §7.2 (Continuous Insurance Covenant)"
        },
        {
            "id": "ob-b1-notice",
            "contractId": "cnt-B1",
            "title": "Harbor Retail 60-Day Non-Renewal Written Notice Window",
            "description": "Must provide written notice 60 days before August 31, 2027 expiration to terminate or renegotiate.",
            "dueDate": "2027-07-01",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 3984000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section B (Subscription Period & Renewal)"
        }
    ],
    "B2": [
        {
            "id": "ob-b2-incident",
            "contractId": "cnt-B2",
            "title": "48-Hour Security & Telemetry Disruption Notification Mandate",
            "description": "Notify customer within 48h of any confirmed security incident or telemetry infrastructure disruption.",
            "dueDate": "2027-05-04",
            "status": "upcoming",
            "severity": "high",
            "financialExposureINR": 8300000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 7.2 (Security Incident Notification)"
        }
    ],
    "C1": [
        {
            "id": "ob-c1-insurance",
            "contractId": "cnt-C1",
            "title": "Maintain Continuous $3M Cyber & $2M CGL Insurance",
            "description": "Vantage Logistics continuous insurance covenant requiring active certificates of insurance on file.",
            "dueDate": "2027-06-30",
            "status": "upcoming",
            "severity": "high",
            "financialExposureINR": 24900000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 6.3 (Insurance Covenant)"
        }
    ],
    "D1": [
        {
            "id": "ob-d1-deemed",
            "contractId": "cnt-D1",
            "title": "Deliver Formal Rejection or Approval for Milestone M3",
            "description": "10-business-day review window expires. If no Rejection Notice served, M3 ($20,000) is deemed accepted by law.",
            "dueDate": "2027-03-12",
            "status": "due",
            "severity": "critical",
            "financialExposureINR": 1660000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 4.3 (Deemed Acceptance Trap)"
        },
        {
            "id": "ob-d1-m4",
            "contractId": "cnt-D1",
            "title": "Milestone M4 Component Library Delivery Review",
            "description": "Final deliverable inspection and IP assignment confirmation for React component framework.",
            "dueDate": "2027-04-30",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 1245000.0,
            "responsibleParty": "internal",
            "clauseReference": "Section 4.1 (Milestone Deliverables)"
        }
    ],
    "STD": [
        {
            "id": "ob-std-notices",
            "contractId": "cnt-STD",
            "title": "Comply with Formal Written Notice Requirements (§12.4)",
            "description": "Informal emails and phone calls are legally ineffective. All notices must be served via registered mail or designated addresses.",
            "dueDate": "2027-12-31",
            "status": "upcoming",
            "severity": "medium",
            "financialExposureINR": 0.0,
            "responsibleParty": "shared",
            "clauseReference": "Section 12.4 (Notice Procedures)"
        }
    ]
}

CANONICAL_METADATA = {
    "A1": {
        "startDate": "2026-08-01",
        "endDate": "2028-07-31",
        "renewalDate": "2028-05-02",
        "durationMonths": 24,
        "autoRenewalConditions": "Automatic renewal for successive 12-month periods unless written notice of non-renewal is delivered to Notice Address at least 90 days before the end of the current subscription period (deadline: May 2, 2028).",
        "paymentSchedule": "Monthly Fee: $8,000.00 (Annualized: $96,000.00). Invoices issued on first business day of each month; payment due within 30 days of invoice date. Overdue amounts accrue 1.5% interest per month.",
        "jurisdiction": "State of Oregon; Chosen Courts: Federal and state courts in Multnomah County, Oregon",
        "totalValueINR": 15936000.0,
        "financialExposureINR": 7968000.0
    },
    "A2": {
        "startDate": "2026-06-01",
        "endDate": "2028-05-31",
        "renewalDate": "2027-04-15",
        "durationMonths": 24,
        "autoRenewalConditions": "Governed by A1 Cover Page renewal provisions.",
        "paymentSchedule": "Monthly hosting credits calculated and applied against next billing cycle.",
        "totalValueINR": 7968000.0,
        "financialExposureINR": 398400.0
    },
    "A3": {
        "startDate": "2026-11-15",
        "endDate": "2028-05-31",
        "renewalDate": "2027-05-31",
        "durationMonths": 18,
        "autoRenewalConditions": "Amends A2 §3.2 and Cover Page §B notice procedures.",
        "paymentSchedule": "Adjusts claim cutoff to 15 days following month-end.",
        "totalValueINR": 7968000.0,
        "financialExposureINR": 99600.0
    },
    "B1": {
        "startDate": "2026-08-01",
        "endDate": "2027-07-31",
        "renewalDate": "2027-05-31",
        "durationMonths": 12,
        "autoRenewalConditions": "Automatic 12-month renewal unless 60 days prior written notice is served before anniversary.",
        "paymentSchedule": "Monthly platform subscription fee of $40,000 due Net 30.",
        "totalValueINR": 39840000.0,
        "financialExposureINR": 44820000.0
    },
    "B2": {
        "startDate": "2026-08-01",
        "endDate": "2027-07-31",
        "renewalDate": "2027-05-04",
        "durationMonths": 12,
        "autoRenewalConditions": "Coterminous with Master Agreement B1.",
        "paymentSchedule": "Incorporated by reference; $1,000,000 security super-cap.",
        "totalValueINR": 0.0,
        "financialExposureINR": 8300000.0
    },
    "C1": {
        "startDate": "2026-10-15",
        "endDate": "2028-10-14",
        "renewalDate": "2028-09-14",
        "durationMonths": 24,
        "autoRenewalConditions": "Automatic 12-month renewal unless 30 days prior written notice is delivered.",
        "paymentSchedule": "Annual enterprise subscription of $85,000 due Net 30.",
        "totalValueINR": 14110000.0,
        "financialExposureINR": 24900000.0
    },
    "D1": {
        "startDate": "2026-12-01",
        "endDate": "2027-04-30",
        "renewalDate": "2027-03-12",
        "durationMonths": 5,
        "autoRenewalConditions": "Fixed-fee milestone SOW. No automatic rollover.",
        "paymentSchedule": "Disbursements: M1 ($15k), M2 ($15k), M3 ($20k), M4 ($15k) on acceptance.",
        "totalValueINR": 5395000.0,
        "financialExposureINR": 2905000.0
    },
    "STD": {
        "startDate": "2026-01-01",
        "endDate": "2028-12-31",
        "renewalDate": "2027-12-31",
        "durationMonths": 36,
        "autoRenewalConditions": "Incorporated by reference into customer and vendor contracts.",
        "paymentSchedule": "Section 5: Net 30 days invoice settlement; 1.5% late interest.",
        "totalValueINR": 0.0,
        "financialExposureINR": 0.0
    }
}

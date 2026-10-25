"""
Ground-truth Quillhub seed data directly extracted from canonical bundle files:
- contracts/A1.txt, A2.txt, A3.txt, B1.txt, B2.txt, C1.txt, D1.txt, STD.txt
- company/context.txt
- events/events_drop1.jsonl, events_drop2.jsonl
- clock.json
"""

SEED_CONTRACTS = [
    {
        "id": "cnt-A1",
        "title": "Cloud Service Agreement Cover Page (QH-STRATO-2026-001)",
        "counterparty": "StratoNode Inc.",
        "contractType": "Master Cloud Infrastructure Agreement",
        "status": "active",
        "value": "$96,000 / yr ($8,000 / mo)",
        "effectiveDate": "2026-08-01",
        "expiryDate": "2028-07-31",
        "autoRenew": True,
        "renewalNoticeDays": 90,
        "governingLaw": "State of Oregon (Multnomah County)",
        "jurisdiction": "State of Oregon; Federal & State Courts in Multnomah County, Oregon",
        "clausesCount": 12,
        "criticalObligationsCount": 2,
        "verifiedCitationsCount": 12,
        "description": "StratoNode CloudCore infrastructure agreement for Quillhub Route Optimizer. Invoiced monthly at $8,000 with 90-day written non-renewal notice requirement.",
        "clauses": [
            {
                "id": "cls-a1-service",
                "section": "Section A",
                "title": "Cloud Service Description",
                "text": "The Cloud Service is StratoNode CloudCore, a managed cloud infrastructure platform providing compute, storage, network, and monitoring services. Quillhub will use StratoNode CloudCore to host and operate its Route Optimizer application.",
                "type": "scope",
                "isFlagged": False
            },
            {
                "id": "cls-a1-term",
                "section": "Section B",
                "title": "Subscription Period and Renewal",
                "text": "Initial Subscription Period: 24 months (ending July 31, 2028). Renewal Period: successive 12-month periods. Non-Renewal Notice Period: 90 days before the end of the then-current Subscription Period. The Agreement will automatically renew for successive Renewal Periods of 12 months each, unless either party delivers written notice of non-renewal to the other party's Notice Address at least 90 days before the end of the then-current Subscription Period.",
                "type": "obligation",
                "isFlagged": True
            },
            {
                "id": "cls-a1-fees",
                "section": "Section C",
                "title": "Fees and Payment Terms",
                "text": "Monthly Fee: $8,000.00 (Eight Thousand U.S. Dollars). Payment Process: Invoicing. StratoNode will issue invoices on the first business day of each calendar month for that month's Fee. Payment Period: 30 days from invoice date. Overdue amounts accrue interest at 1.5% per month.",
                "type": "payment",
                "isFlagged": False
            },
            {
                "id": "cls-a1-support",
                "section": "Section D",
                "title": "Technical Support",
                "text": "Support Tier: Business Support. Support Hours: Monday through Friday, 8:00 AM – 6:00 PM Pacific Time. Response Targets: Severity 1 (service down): 1 hour; Severity 2: 4 hours; Severity 3: 1 business day; Severity 4: 2 business days. Response targets are commercially reasonable objectives, not contractual commitments.",
                "type": "sla",
                "isFlagged": False
            },
            {
                "id": "cls-a1-sla-hierarchy",
                "section": "Section E",
                "title": "Service Level Agreement Hierarchy",
                "text": "The Cloud Service is subject to the Service Level Agreement attached hereto as a separate document titled \"StratoNode CloudCore — Service Level Agreement\" (document QH-STRATO-2026-SLA), which is incorporated into this Agreement by reference. In the event of a conflict between this Cover Page and the SLA, the SLA controls with respect to uptime commitments and service credits.",
                "type": "compliance",
                "isFlagged": False
            },
            {
                "id": "cls-a1-security",
                "section": "Section F",
                "title": "Data and Security",
                "text": "Data Location: United States (us-west-2 and us-east-1 regions). Encryption at Rest: AES-256. Encryption in Transit: TLS 1.2 or higher. Backup Frequency: Daily automated snapshots, retained for 30 days. Security Incident Notification: In accordance with Section 3.3 of the Standard Terms, StratoNode will notify Quillhub within 72 hours of becoming aware of a Security Incident.",
                "type": "compliance",
                "isFlagged": True
            },
            {
                "id": "cls-a1-liability",
                "section": "Section G",
                "title": "Liability & General Cap",
                "text": "General Cap Amount: The total Fees paid or payable by Customer in the twelve (12) months immediately preceding the claim. Unlimited Claims: Breach of Section 10 (Confidentiality); Customer's breach of Section 2.1 (Restrictions).",
                "type": "liability",
                "isFlagged": False
            },
            {
                "id": "cls-a1-gov-law",
                "section": "Section H",
                "title": "Governing Law & Chosen Courts",
                "text": "Governing Law: State of Oregon. Chosen Courts: Federal and state courts located in Multnomah County, Oregon.",
                "type": "legal",
                "isFlagged": False
            },
            {
                "id": "cls-a1-disruption",
                "section": "Section I.1",
                "title": "Service Disruption Notification",
                "text": "If StratoNode experiences an unplanned service disruption affecting the Cloud Service, StratoNode will use commercially reasonable efforts to notify Quillhub's Operations contact (ops@quillhub.io) within four (4) hours of becoming aware of the disruption.",
                "type": "obligation",
                "isFlagged": True
            },
            {
                "id": "cls-a1-migration",
                "section": "Section I.2",
                "title": "Migration Assistance",
                "text": "Upon expiration or termination of this Agreement, StratoNode will provide reasonable migration assistance to Quillhub for a period of up to 90 days following the effective date of termination, at StratoNode's then-current professional services rates.",
                "type": "obligation",
                "isFlagged": False
            },
            {
                "id": "cls-a1-subprocessors",
                "section": "Section I.3",
                "title": "Subprocessor Changes",
                "text": "StratoNode may use subprocessors to deliver the Cloud Service. StratoNode will maintain a list of subprocessors and notify Quillhub of any changes at least 30 days in advance.",
                "type": "compliance",
                "isFlagged": False
            },
            {
                "id": "cls-a1-signatures",
                "section": "Signatures",
                "title": "Execution and Signatures",
                "text": "FOR STRATONODE INC.: Jordan Hale, VP Sales, Date: July 15, 2026. FOR QUILLHUB INC.: Marcus Ellison, VP of Legal & Compliance, Date: July 18, 2026.",
                "type": "legal",
                "isFlagged": False
            }
        ]
    },
    {
        "id": "cnt-A2",
        "title": "StratoNode CloudCore Service Level Agreement",
        "counterparty": "StratoNode Inc.",
        "contractType": "Service Level Agreement (SLA)",
        "status": "critical",
        "value": "30% Fee Credit Max",
        "effectiveDate": "2026-06-01",
        "expiryDate": "2028-05-31",
        "autoRenew": True,
        "renewalNoticeDays": 14,
        "governingLaw": "State of Delaware",
        "clausesCount": 6,
        "criticalObligationsCount": 3,
        "verifiedCitationsCount": 4,
        "description": "Governs availability guarantees, outage penalties, and credit claim procedures for cloud compute.",
        "clauses": [
            {
                "id": "cls-a2-avail",
                "section": "Section 2.1",
                "title": "Availability Commitment",
                "text": "StratoNode will use commercially reasonable efforts to make CloudCore Compute available with a Monthly Uptime Percentage of at least 99.5% during any calendar month.",
                "type": "sla",
                "isFlagged": True
            },
            {
                "id": "cls-a2-window",
                "section": "Section 3.2",
                "title": "Service Credit Claim Window (14-Day Limit)",
                "text": "To receive a Service Credit, Customer must submit a claim in writing to StratoNode within fourteen (14) calendar days following the end of the calendar month in which the incident occurred, or within fourteen (14) calendar days of the incident itself, whichever is earlier. Failure to submit such claim within the applicable window shall constitute a waiver of the Service Credit.",
                "type": "obligation",
                "isFlagged": True
            },
            {
                "id": "cls-a2-tier",
                "section": "Section 3.1",
                "title": "Credit Tiers",
                "text": "Monthly Uptime < 99.5% and >= 95.0% entitles Customer to a 15% Service Credit applied against subsequent billing cycles.",
                "type": "penalty",
                "isFlagged": False
            }
        ]
    },
    {
        "id": "cnt-A3",
        "title": "Amendment No. 1 to Service Level Agreement",
        "counterparty": "StratoNode Inc.",
        "contractType": "SLA Amendment",
        "status": "active",
        "value": "Refines A2 Exclusions",
        "effectiveDate": "2026-11-15",
        "expiryDate": "2028-05-31",
        "autoRenew": True,
        "renewalNoticeDays": 0,
        "governingLaw": "State of Delaware",
        "clausesCount": 3,
        "criticalObligationsCount": 1,
        "verifiedCitationsCount": 2,
        "description": "Amends scheduled maintenance exclusion rules under CloudCore SLA.",
        "clauses": [
            {
                "id": "cls-a3-maint",
                "section": "Section 1.3",
                "title": "Scheduled Downtime Notice Requirement",
                "text": "Scheduled Maintenance announced with at least seventy-two (72) hours prior notice shall not be counted as Downtime, provided such maintenance does not exceed four (4) hours in any calendar month.",
                "type": "compliance",
                "isFlagged": False
            }
        ]
    },
    {
        "id": "cnt-B1",
        "title": "Cloud Service Agreement — Harbor Retail Solutions",
        "counterparty": "Harbor Retail Solutions LLC",
        "contractType": "Enterprise Customer Agreement",
        "status": "critical",
        "value": "$120,000 / yr",
        "effectiveDate": "2026-09-01",
        "expiryDate": "2027-08-31",
        "autoRenew": True,
        "renewalNoticeDays": 30,
        "governingLaw": "State of New York",
        "clausesCount": 12,
        "criticalObligationsCount": 4,
        "verifiedCitationsCount": 5,
        "description": "Quillhub's largest enterprise retail customer with strict 99.9% uptime commitment.",
        "clauses": [
            {
                "id": "cls-b1-uptime",
                "section": "Section 4.1",
                "title": "Service Level Warranty & Immediate Termination Right",
                "text": "Quillhub warrants that the Service will achieve a Monthly Uptime Percentage of at least 99.9% during each calendar month. In the event Monthly Uptime falls below 99.5% in any single month, Customer may terminate this Agreement immediately for cause upon written notice and receive a pro-rata refund of prepaid fees.",
                "type": "sla",
                "isFlagged": True
            },
            {
                "id": "cls-b1-cap",
                "section": "Special Terms §4",
                "title": "Aggregate Liability Cap",
                "text": "Each party's maximum aggregate liability arising out of or related to this Agreement shall be capped at two times (2x) the fees paid or payable by Customer in the preceding twelve (12) months ($240,000).",
                "type": "liability",
                "isFlagged": True
            }
        ]
    },
    {
        "id": "cnt-B2",
        "title": "Data Processing and Security Addendum (DPA)",
        "counterparty": "Harbor Retail Solutions LLC",
        "contractType": "Data Protection Addendum",
        "status": "active",
        "value": "$1,000,000 Super-Cap",
        "effectiveDate": "2026-09-01",
        "expiryDate": "2027-08-31",
        "autoRenew": True,
        "renewalNoticeDays": 0,
        "governingLaw": "State of New York",
        "clausesCount": 9,
        "criticalObligationsCount": 2,
        "verifiedCitationsCount": 3,
        "description": "Governs handling of retail delivery telemetry, driver data, and 48-hour incident reporting.",
        "clauses": [
            {
                "id": "cls-b2-notice",
                "section": "Section 7.2",
                "title": "48-Hour Incident Notification Mandate",
                "text": "Provider shall notify Customer in writing without undue delay and in any event within forty-eight (48) hours of becoming aware of any confirmed Security Incident or material infrastructure disruption affecting Customer Data.",
                "type": "obligation",
                "isFlagged": True
            }
        ]
    },
    {
        "id": "cnt-C1",
        "title": "Cloud Service Agreement — Vantage Logistics Corp.",
        "counterparty": "Vantage Logistics Corp.",
        "contractType": "Logistics Customer Agreement",
        "status": "active",
        "value": "$85,000 / yr",
        "effectiveDate": "2026-10-15",
        "expiryDate": "2028-10-14",
        "autoRenew": True,
        "renewalNoticeDays": 30,
        "governingLaw": "State of Texas",
        "clausesCount": 7,
        "criticalObligationsCount": 2,
        "verifiedCitationsCount": 3,
        "description": "Mid-market trucking and fleet dispatch customer operating under Route Optimizer Pro.",
        "clauses": [
            {
                "id": "cls-c1-ins",
                "section": "Section 6.3",
                "title": "Continuous Insurance Covenant",
                "text": "Vendor shall maintain at its own expense Commercial General Liability insurance of not less than $2,000,000 and Technology Errors & Omissions / Cyber Liability of not less than $3,000,000 throughout the Term.",
                "type": "compliance",
                "isFlagged": True
            }
        ]
    },
    {
        "id": "cnt-D1",
        "title": "Independent Contractor Agreement — Pixelwright Design",
        "counterparty": "Pixelwright Design Studio LLC",
        "contractType": "Subcontractor / Development SOW",
        "status": "critical",
        "value": "$100,000 Milestone Total",
        "effectiveDate": "2026-12-01",
        "expiryDate": "2027-04-30",
        "autoRenew": False,
        "renewalNoticeDays": 0,
        "governingLaw": "State of California",
        "clausesCount": 8,
        "criticalObligationsCount": 3,
        "verifiedCitationsCount": 4,
        "description": "Contractor developing React front-end component library under Milestones M1 through M4.",
        "clauses": [
            {
                "id": "cls-d1-deemed",
                "section": "Section 3.2",
                "title": "14-Day Deemed Acceptance Trap",
                "text": "Client shall have fourteen (14) business days following receipt of each Deliverable to inspect and accept or reject the Deliverable. If Client fails to provide written notice of rejection detailing non-conformities within said 14 business days, the Deliverable shall be deemed accepted and Contractor may invoice the applicable milestone fee ($25,000 per milestone).",
                "type": "obligation",
                "isFlagged": True
            }
        ]
    },
    {
        "id": "cnt-STD",
        "title": "Common Paper Cloud Service Agreement Standard Terms 2.0",
        "counterparty": "Quillhub Master Terms",
        "contractType": "Canonical Standard Terms",
        "status": "active",
        "value": "Incorporated by Reference",
        "effectiveDate": "2026-01-01",
        "expiryDate": "2028-12-31",
        "autoRenew": False,
        "renewalNoticeDays": 0,
        "governingLaw": "State of Delaware",
        "clausesCount": 16,
        "criticalObligationsCount": 1,
        "verifiedCitationsCount": 4,
        "description": "Standard terms incorporated by reference across all Quillhub customer agreements.",
        "clauses": [
            {
                "id": "cls-std-liab",
                "section": "Section 8.2",
                "title": "Mutual Consequential Damages Waiver",
                "text": "Neither party shall be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenues, data, or business opportunities, regardless of legal theory.",
                "type": "liability",
                "isFlagged": False
            }
        ]
    }
]

SEED_RISKS = [
    {
        "id": "rsk-001",
        "title": "Upstream/Downstream SLA Mismatch",
        "severity": "critical",
        "category": "Cross-Contract Collision",
        "contractId": "cnt-A2",
        "counterparty": "StratoNode vs. Harbor Retail",
        "summary": "Quillhub guarantees 99.9% uptime to Harbor Retail (B1 §4.1) but only receives 99.5% from StratoNode (A2 §2.1). An outage exceeding 43 minutes breaches Harbor Retail while StratoNode owes negligible credit.",
        "financialExposure": "$120,000 (Immediate Contract Termination Risk)",
        "actionRequired": "Negotiate SLA alignment or procure hot-failover multi-region infrastructure.",
        "identifiedBy": "Loki",
        "verifiedBy": "Heimdall",
        "citation": "A2 §2.1 vs B1 §4.1"
    },
    {
        "id": "rsk-002",
        "title": "StratoNode March 3 Outage Refund Forfeiture Window",
        "severity": "critical",
        "category": "Active Notice Deadline",
        "contractId": "cnt-A2",
        "counterparty": "StratoNode Inc.",
        "summary": "190-minute complete outage occurred March 3 in us-west-2 (Event E-04). Section 3.2 requires written claim within 14 calendar days (March 17). Today is March 15: exactly 48 hours remaining before unrecoverable loss of $4,500 credit.",
        "financialExposure": "$4,500 (15% Service Credit)",
        "actionRequired": "Dispatch formal SLA Service Credit claim demand letter to billing-claims@stratonode.com immediately.",
        "identifiedBy": "The Norns",
        "verifiedBy": "Heimdall (Event E-04)",
        "citation": "A2 §3.2 & Event E-04"
    },
    {
        "id": "rsk-003",
        "title": "Pixelwright Milestone M3 Deemed Acceptance Clock",
        "severity": "high",
        "category": "Contractor Trap",
        "contractId": "cnt-D1",
        "counterparty": "Pixelwright Design Studio LLC",
        "summary": "Pixelwright submitted Milestone M3 on Feb 28 (Event E-03). Under Section 3.2, failure to reject within 14 business days deems code accepted. Window expires March 18. Staging tests show 32 broken hooks and 84.2% test coverage (below 90% threshold).",
        "financialExposure": "$25,000 (Automatic Payment Liability)",
        "actionRequired": "Send formal Notice of Deficiency and Conditional Testing Extension before March 18.",
        "identifiedBy": "Loki",
        "verifiedBy": "Heimdall (Event E-03)",
        "citation": "D1 §3.2"
    },
    {
        "id": "rsk-004",
        "title": "Corporate Cyber Liability Policy Lapse",
        "severity": "high",
        "category": "Insurance Covenant Breach",
        "contractId": "cnt-C1",
        "counterparty": "Meridian Mutual / Harbor & Vantage",
        "summary": "Meridian Mutual Cyber Policy MML-2024-88715 expires June 30, 2027. Both customer contracts (B1 §8.1, C1 §6.3) mandate continuous $3M cyber liability coverage. Operating post-June 30 without renewal binder causes immediate material breach.",
        "financialExposure": "$3,000,000 (Loss of Coverage)",
        "actionRequired": "Bind renewal terms and issue ACORD certificates before July 1, 2027.",
        "identifiedBy": "Thor",
        "verifiedBy": "The Norns (Clock CP-3)",
        "citation": "context.txt & C1 §6.3"
    }
]

SEED_AGENTS = [
    {
        "id": "odin",
        "name": "Odin",
        "title": "The Supreme Orchestrator & Allfather",
        "role": "Synthesizes council intelligence and drafts prioritized, citation-backed legal actions",
        "avatar": "👑",
        "color": "#60A5FA",
        "status": "ready",
        "activeTasks": ["Synthesizing Portfolio Risk Report", "Drafting CEO Action Items"],
        "model": "Claude 3.5 Sonnet / High-Level Arbiter"
    },
    {
        "id": "thor",
        "name": "Thor",
        "title": "The Clause & Evidence Extractor",
        "role": "Extracts terms, obligations, SLAs, and verbatim unhallucinated citations",
        "avatar": "⚡",
        "color": "#2DD4BF",
        "status": "ready",
        "activeTasks": ["Parsing contracts A1–D1", "Verifying exact text anchors"],
        "model": "Deterministic Verbatim Parser"
    },
    {
        "id": "norns",
        "name": "The Norns",
        "title": "The Temporal Destiny & Timeline Engine",
        "role": "Tracks calendar commitments, upcoming notice countdowns, and worst-case dollar liabilities",
        "avatar": "⏳",
        "color": "#C084FC",
        "status": "ready",
        "activeTasks": ["Computing 48h StratoNode cutoff", "Tracking March 18 Pixelwright deadline"],
        "model": "Date-Math Engine + Holidays Calendar"
    },
    {
        "id": "loki",
        "name": "Loki",
        "title": "The Adversarial Red-Team Counsel",
        "role": "Hunts for cross-contract contradictions, territorial traps, and exposure loopholes",
        "avatar": "😈",
        "color": "#F87171",
        "status": "ready",
        "activeTasks": ["Analyzing StratoNode vs Harbor SLA gap", "Identifying deemed acceptance risk"],
        "model": "Adversarial Legal Reasoner"
    },
    {
        "id": "heimdall",
        "name": "Heimdall",
        "title": "The Real-World Event Sentinel",
        "role": "Ingests live operational logs (events_drop1.jsonl), filters noise, and verifies breach reality",
        "avatar": "👁️",
        "color": "#34D399",
        "status": "ready",
        "activeTasks": ["Auditing March 3 190-min outage in E-04", "Verifying customer email E-05"],
        "model": "Event Stream Correlator"
    },
    {
        "id": "tyr",
        "name": "Tyr",
        "title": "The Binding Arbiter & Action Drafter",
        "role": "Resolves Loki/Heimdall disagreements and generates ready-to-send formal notice instruments",
        "avatar": "⚖️",
        "color": "#FBBF24",
        "status": "ready",
        "activeTasks": ["Drafting StratoNode $4,500 Demand", "Drafting M3 Rejection Notice"],
        "model": "Legal Instrument Generator"
    }
]

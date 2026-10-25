from app.models.schemas import (
    Contract, Risk, AgentInfo, AgentMessage, WorkflowStep, TimelineEvent, ContractReport
)

SEED_CONTRACTS = [
    {
        "id": "cnt-001",
        "title": "Cloud Infrastructure & Managed Services Agreement",
        "counterparty": "Apex Cloud Systems Pvt. Ltd.",
        "contractType": "Cloud Infrastructure & Hosting",
        "status": "active",
        "analysisStatus": "flagged",
        "riskLevel": "high",
        "startDate": "2025-01-01",
        "endDate": "2026-12-31",
        "renewalDate": "2026-11-15",
        "durationMonths": 24,
        "jurisdiction": "Bangalore, India (Arbitration and Conciliation Act 1996)",
        "totalValueINR": 24000000.0,
        "financialExposureINR": 3600000.0,
        "autoRenewalConditions": "Automatic 12-month renewal unless 45 days written notice is served via registered mail prior to renewal anniversary.",
        "paymentSchedule": "Quarterly advance payments of ₹60,00,000 due within 15 days of invoice date.",
        "confidenceScore": 0.94,
        "summary": "Core multi-region hybrid cloud deployment agreement. Contains stringent termination notice periods and conflicting data localization liabilities.",
        "tags": ["Cloud", "High Exposure", "Auto-Renewal Window", "Arbitration Risk"],
        "relatedContractIds": ["cnt-002", "cnt-005"],
        "clauses": [
            {
                "id": "cls-001-1",
                "contractId": "cnt-001",
                "field": "Auto-Renewal & Notice Window",
                "extractedValue": "45-Day Prior Written Notice Required",
                "clauseCitation": "Section 14.2 (Term and Expiration)",
                "confidenceScore": 0.97,
                "extractedBy": "thor",
                "category": "renewal",
                "verbatimText": "This Agreement shall automatically renew for successive terms of twelve (12) months unless either party gives written notice of non-renewal at least forty-five (45) days prior to the expiration of the Initial Term or any Renewal Term.",
                "interpretationNote": "Notice deadline is 15 November 2026. Failure to dispatch notice locks organization into additional ₹2.40 Cr liability."
            }
        ],
        "obligations": [
            {
                "id": "ob-001-1",
                "contractId": "cnt-001",
                "title": "Serve Non-Renewal Notice or File Extension Amendment",
                "description": "Send registered legal dispatch to Apex Cloud prior to the 45-day cutoff to avoid unintended 12-month rollover.",
                "dueDate": "2026-11-15",
                "status": "due",
                "severity": "critical",
                "financialExposureINR": 24000000.0,
                "responsibleParty": "internal",
                "clauseReference": "Section 14.2"
            }
        ]
    },
    {
        "id": "cnt-002",
        "title": "Enterprise ERP Solution Master License & Support",
        "counterparty": "Vanguard Enterprise Tech India Ltd.",
        "contractType": "Master Services Agreement (MSA)",
        "status": "active",
        "analysisStatus": "pending_arbitration",
        "riskLevel": "critical",
        "startDate": "2024-03-15",
        "endDate": "2027-03-14",
        "renewalDate": "2027-02-14",
        "durationMonths": 36,
        "jurisdiction": "Mumbai, India (Bombay High Court exclusive)",
        "totalValueINR": 52000000.0,
        "financialExposureINR": 8500000.0,
        "autoRenewalConditions": "Manual renegotiation required 90 days before expiration; automatic transition to month-to-month at +25% premium.",
        "paymentSchedule": "Annual license fee of ₹1,60,00,000 paid semi-annually in advance.",
        "confidenceScore": 0.96,
        "summary": "Core ERP system for financial accounting and inventory. Contains a cross-contract termination conflict with Apex Cloud hosting schedule.",
        "tags": ["Core Platform", "Critical Dependency", "Cross-Contract Conflict"],
        "relatedContractIds": ["cnt-001"],
        "clauses": [
            {
                "id": "cls-002-1",
                "contractId": "cnt-002",
                "field": "Cross-Default & Third-Party Host Mandate",
                "extractedValue": "Host migration requires 90-day certified architectural review",
                "clauseCitation": "Section 9.3 (Infrastructure Prerequisites)",
                "confidenceScore": 0.94,
                "extractedBy": "thor",
                "category": "termination",
                "verbatimText": "Customer shall not relocate or migrate the installed Software instances to an alternative hosting infrastructure without ninety (90) days prior written submission of architectural compatibility certifications to Vanguard.",
                "interpretationNote": "Collides with Apex Cloud’s 45-day non-renewal clause: terminating Apex Cloud without 90-day Vanguard notice creates an operational breach."
            }
        ],
        "obligations": [
            {
                "id": "ob-002-1",
                "contractId": "cnt-002",
                "title": "Submit Hosting Architecture Change Notice to Vanguard",
                "description": "Provide 90-day migration notification if Apex Cloud contract is not renewed.",
                "dueDate": "2026-11-05",
                "status": "due",
                "severity": "critical",
                "financialExposureINR": 4000000.0,
                "responsibleParty": "internal",
                "clauseReference": "Section 9.3"
            }
        ]
    }
]

SEED_RISKS = [
    {
        "id": "rsk-001",
        "title": "Cross-Contract Notice Collision: Apex Cloud Termination vs Vanguard ERP Prerequisite",
        "contractId": "cnt-001",
        "contractName": "Cloud Infrastructure & Managed Services Agreement",
        "counterparty": "Apex Cloud Systems Pvt. Ltd.",
        "severity": "critical",
        "likelihood": "imminent",
        "impact": "catastrophic",
        "financialExposureINR": 8500000.0,
        "status": "arbitrated",
        "evidenceClause": "Apex Section 14.2 collides with Vanguard Section 9.3",
        "verbatimExcerpt": "Apex requires 45-day non-renewal notice (due 15 Nov 2026), but Vanguard ERP mandates 90-day prior written architectural submission before migrating off certified infrastructure.",
        "explanation": "Terminating Apex Cloud without Vanguard’s 90-day prior certification leaves the enterprise in direct breach of the Vanguard ERP MSA.",
        "recommendedNextStep": "Tyr Ruling: Do not issue unilateral cancellation to Apex Cloud yet. File an urgent 3-month contract extension rider with Apex while submitting the Vanguard architectural review package.",
        "identifiedBy": "loki",
        "disputedBy": "thor",
        "arbitratedBy": "tyr",
        "arbitrationVerdict": "Tyr determined that the cross-contract conflict exposes ₹85,00,000 in immediate damages. A 90-day extension bridge agreement is mandatory before any migration cutover.",
        "createdAt": "2026-10-24T08:30:00Z",
        "crossContractConflict": {
            "conflictingContractId": "cnt-002",
            "conflictingContractName": "Enterprise ERP Solution Master License & Support",
            "conflictingClauseCitation": "Section 9.3 (Infrastructure Prerequisites)",
            "conflictSummary": "Vanguard requires 90 days notice for hosting infrastructure relocation, whereas Apex Cloud requires 45 days notice for non-renewal."
        }
    }
]

SEED_AGENTS = [
    {
        "id": "odin",
        "name": "Odin",
        "title": "Supreme Orchestrator",
        "role": "Orchestrates the workflow and delegates tasks",
        "avatar": "👑",
        "color": "#60A5FA",
        "status": "running",
        "currentTask": "Synthesizing cross-contract conflict resolution for Apex Cloud & Vanguard ERP",
        "latestActivity": "Coordinating multi-agent deliberation on upcoming November 15 renewal cutoff",
        "completedTasksCount": 142,
        "totalProcessedCount": 156,
        "lastActiveTimestamp": "2026-10-25T12:24:00Z",
        "responsibilities": [
            "Deconstruct organizational queries into multi-agent subtasks",
            "Manage agent lifecycle, concurrency, and dependency pipelines"
        ],
        "inputSummary": "Ingests raw contract portfolios, ERP procurement feeds, and user simulation requests.",
        "outputSummary": "Dispatches execution instructions to Thor, Norns, Loki, Heimdall, and routes impasses to Tyr.",
        "evidenceReferences": ["Task-ORD-8812", "Portfolio-Scan-Q4"]
    },
    {
        "id": "thor",
        "name": "Thor",
        "title": "Clause & Evidence Extractor",
        "role": "Extracts contract terms and supporting evidence",
        "avatar": "⚡",
        "color": "#2DD4BF",
        "status": "completed",
        "currentTask": "Completed verbatim extraction of 42 clauses across 10 master agreements",
        "latestActivity": "Extracted Section 14.2 (Apex Cloud) and Section 9.3 (Vanguard ERP) with 97% confidence",
        "completedTasksCount": 384,
        "totalProcessedCount": 384,
        "lastActiveTimestamp": "2026-10-25T12:18:00Z",
        "responsibilities": [
            "Parse unstructured contract PDFs into structured semantic clause models",
            "Anchor each extracted field to verbatim text"
        ],
        "inputSummary": "OCR text streams, digital PDF contracts, amendments.",
        "outputSummary": "Structured clause entities with verbatim citation anchors.",
        "evidenceReferences": ["Apex-Cloud-Contract:p.14-15", "Vanguard-MSA:p.9"]
    },
    {
        "id": "norns",
        "name": "Norns",
        "title": "Timeline & Obligation Oracle",
        "role": "Builds obligation timelines and worst-case projections",
        "avatar": "⏳",
        "color": "#A855F7",
        "status": "running",
        "currentTask": "Simulating worst-case penalty cascades across 6-month scrub horizon",
        "latestActivity": "Calculated ₹1.67 Cr cumulative penalty exposure under +3 month simulated clock",
        "completedTasksCount": 219,
        "totalProcessedCount": 228,
        "lastActiveTimestamp": "2026-10-25T12:22:00Z",
        "responsibilities": [
            "Weave recurring and discrete obligations into unified temporal graphs",
            "Execute Monte Carlo and deterministic worst-case penalty projections"
        ],
        "inputSummary": "Extracted clauses, calendar milestones, payment terms.",
        "outputSummary": "Chronological timeline events, overdue risk alerts.",
        "evidenceReferences": ["Timeline-Graph-v4", "Cascade-Matrix-2026"]
    },
    {
        "id": "loki",
        "name": "Loki",
        "title": "Adversarial Risk Challenger",
        "role": "Challenges contract interpretations and identifies hidden risks",
        "avatar": "🔥",
        "color": "#F87171",
        "status": "waiting",
        "currentTask": "Awaiting Tyr verification on Vanguard ERP cross-default challenge",
        "latestActivity": "Flagged ₹85L cross-contract liability trap between Apex Cloud non-renewal and Vanguard MSA",
        "completedTasksCount": 167,
        "totalProcessedCount": 174,
        "lastActiveTimestamp": "2026-10-25T12:20:00Z",
        "responsibilities": [
            "Execute red-team adversarial legal reasoning against naive contract readings",
            "Identify cross-contract clause collisions and unstated dependencies"
        ],
        "inputSummary": "Multi-contract clause pairs, historical enforcement precedents.",
        "outputSummary": "Adversarial risk challenges, severity escalations.",
        "evidenceReferences": ["Collision-Apex-Vanguard", "Audit-Exposure-Vanguard"]
    },
    {
        "id": "heimdall",
        "name": "Heimdall",
        "title": "External Sentinel & Fact-Checker",
        "role": "Monitors events and verifies risk claims",
        "avatar": "👁️",
        "color": "#38BDF8",
        "status": "completed",
        "currentTask": "Verified absence of formal cancellation dispatches in enterprise ERP and mail gateways",
        "latestActivity": "Audited JNPT customs port strike status; confirmed 72-hour dwell time breach at Nhava Sheva",
        "completedTasksCount": 298,
        "totalProcessedCount": 301,
        "lastActiveTimestamp": "2026-10-25T12:21:00Z",
        "responsibilities": [
            "Ingest enterprise event streams (SAP ERP, Jira, Outlook, DocuSign)",
            "Cross-reference external legal bulletins, regulatory circulars"
        ],
        "inputSummary": "External APIs, enterprise mail servers, shipping port telemetry.",
        "outputSummary": "Fact-verification receipts, evidentiary confirmations.",
        "evidenceReferences": ["Mail-Log-Audit-1012", "JNPT-Port-Advisory-221"]
    },
    {
        "id": "tyr",
        "name": "Tyr",
        "title": "Arbiter & Prescriptive Strategist",
        "role": "Resolves disagreements and prepares recommended actions",
        "avatar": "⚖️",
        "color": "#FBBF24",
        "status": "running",
        "currentTask": "Drafting conclusive executive ruling and action plan for Apex-Vanguard impasse",
        "latestActivity": "Rendered binding decision: Halt unilateral termination; execute 3-month bridge rider",
        "completedTasksCount": 112,
        "totalProcessedCount": 115,
        "lastActiveTimestamp": "2026-10-25T12:25:00Z",
        "responsibilities": [
            "Adjudicate deadlocks and competing interpretations between Thor, Loki, and Norns",
            "Formulate actionable, legally defensible, and audited recommendations"
        ],
        "inputSummary": "Adversarial challenges from Loki, evidence bundles from Thor/Heimdall.",
        "outputSummary": "Definitive rulings, prioritized action checklists.",
        "evidenceReferences": ["Ruling-TYR-2026-08", "Action-Directive-P1"]
    }
]

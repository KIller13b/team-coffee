from pydantic import BaseModel, model_validator
from typing import List, Optional, Literal

RiskLevel = Literal['low', 'medium', 'high', 'critical']
ContractStatus = Literal['active', 'under_review', 'expiring_soon', 'terminated', 'disputed', 'critical']
AnalysisStatus = Literal['completed', 'processing', 'pending_arbitration', 'flagged']
AgentStatus = Literal['idle', 'running', 'completed', 'waiting', 'failed']


def normalize_contract_id(cid: str) -> str:
    """
    Normalizes contract ID across endpoints, database records, and agent messages.
    Converts 'cnt-A1', 'a1', 'cnt-a1', 'A1.txt' to canonical uppercase base key 'A1'.
    """
    if not cid:
        return ""
    clean = cid.strip()
    if clean.lower().endswith(".txt") or clean.lower().endswith(".pdf"):
        clean = clean.rsplit(".", 1)[0]
    if clean.lower().startswith("cnt-"):
        clean = clean[4:]
    return clean.upper()


def to_prefixed_contract_id(cid: str) -> str:
    """Returns canonical prefixed contract ID (e.g. 'cnt-A1')."""
    norm = normalize_contract_id(cid)
    return f"cnt-{norm}" if norm else ""


class ContractClause(BaseModel):
    id: str
    contractId: str = ""
    field: str = ""
    extractedValue: str = ""
    clauseCitation: str = ""
    confidenceScore: float = 0.95
    verbatimText: str = ""
    extractedBy: Literal['thor', 'odin'] = 'thor'
    category: str = "general"
    interpretationNote: Optional[str] = None
    section: Optional[str] = None
    title: Optional[str] = None
    text: Optional[str] = None
    type: Optional[str] = None
    isFlagged: Optional[bool] = False
    isAmbiguous: Optional[bool] = False
    ambiguityReason: Optional[str] = None
    ambiguityStatus: Optional[str] = None

    @model_validator(mode="after")
    def sync_compatibility_fields(self):
        if not self.field and self.title:
            self.field = self.title
        if not self.title and self.field:
            self.title = self.field
        if not self.clauseCitation and self.section:
            self.clauseCitation = self.section
        if not self.section and self.clauseCitation:
            self.section = self.clauseCitation
        if not self.verbatimText and self.text:
            self.verbatimText = self.text
        if not self.text and self.verbatimText:
            self.text = self.verbatimText
        if not self.extractedValue:
            self.extractedValue = self.verbatimText or self.text or self.title or ""
        if not self.verbatimText and self.extractedValue:
            self.verbatimText = self.extractedValue
        if not self.text and self.extractedValue:
            self.text = self.extractedValue
        if self.category == "general" and self.type:
            self.category = self.type
        if not self.type and self.category:
            self.type = self.category
        return self

class Obligation(BaseModel):
    id: str
    contractId: str = ""
    title: str = ""
    description: str = ""
    dueDate: str = ""
    status: Literal['upcoming', 'due', 'overdue', 'completed'] = 'upcoming'
    severity: RiskLevel = 'medium'
    financialExposureINR: float = 0.0
    responsibleParty: Literal['internal', 'counterparty', 'shared'] = 'counterparty'
    clauseReference: str = ""

class Contract(BaseModel):
    id: str
    title: str
    counterparty: str = "Unknown"
    contractType: str = "Cloud Service Agreement"
    status: ContractStatus = "active"
    analysisStatus: AnalysisStatus = "completed"
    riskLevel: RiskLevel = "medium"
    startDate: str = "2026-08-01"
    endDate: str = "2027-07-31"
    renewalDate: str = "2027-06-01"
    durationMonths: int = 12
    jurisdiction: str = "State of Delaware"
    totalValueINR: float = 0.0
    financialExposureINR: float = 0.0
    autoRenewalConditions: str = ""
    paymentSchedule: str = ""
    confidenceScore: float = 0.95
    summary: str = ""
    tags: List[str] = []
    relatedContractIds: Optional[List[str]] = None
    clauses: List[ContractClause] = []
    obligations: List[Obligation] = []
    # Seed data compatibility fields
    value: Optional[str] = None
    effectiveDate: Optional[str] = None
    expiryDate: Optional[str] = None
    autoRenew: Optional[bool] = None
    renewalNoticeDays: Optional[int] = None
    governingLaw: Optional[str] = None
    clausesCount: Optional[int] = None
    criticalObligationsCount: Optional[int] = None
    verifiedCitationsCount: Optional[int] = None
    description: Optional[str] = None

    @model_validator(mode="after")
    def sync_contract_fields(self):
        if not self.startDate and self.effectiveDate:
            self.startDate = self.effectiveDate
        if not self.endDate and self.expiryDate:
            self.endDate = self.expiryDate
        if not self.summary and self.description:
            self.summary = self.description
        if not self.autoRenewalConditions:
            if self.autoRenew:
                self.autoRenewalConditions = f"Automatic renewal unless {self.renewalNoticeDays or 30} days prior written notice is delivered."
            else:
                self.autoRenewalConditions = "Standard term expiration; non-renewing without mutual written agreement."
        if not self.paymentSchedule:
            self.paymentSchedule = "Net 30 calendar days from invoice receipt via wire transfer."
        return self

class CrossContractConflict(BaseModel):
    conflictingContractId: str
    conflictingContractName: str
    conflictingClauseCitation: str
    conflictSummary: str

class Risk(BaseModel):
    id: str
    title: str
    contractId: str = ""
    contractName: str = ""
    counterparty: str = "Unknown"
    severity: RiskLevel = "medium"
    likelihood: Literal['unlikely', 'possible', 'likely', 'imminent'] = "likely"
    impact: Literal['low', 'moderate', 'severe', 'catastrophic'] = "severe"
    financialExposureINR: float = 0.0
    status: Literal['open', 'investigating', 'arbitrated', 'mitigated', 'accepted'] = "open"
    evidenceClause: str = ""
    verbatimExcerpt: str = ""
    explanation: str = ""
    recommendedNextStep: str = ""
    identifiedBy: str = "loki"
    createdAt: str = "2027-01-15T00:00:00Z"
    disputedBy: Optional[str] = None
    arbitratedBy: Optional[Literal['tyr']] = None
    arbitrationVerdict: Optional[str] = None
    crossContractConflict: Optional[CrossContractConflict] = None
    # Compatibility fields for seed data
    category: Optional[str] = None
    summary: Optional[str] = None
    financialExposure: Optional[str] = None
    actionRequired: Optional[str] = None
    verifiedBy: Optional[str] = None
    citation: Optional[str] = None

    @model_validator(mode="after")
    def sync_risk_fields(self):
        if not self.explanation and self.summary:
            self.explanation = self.summary
        if not self.recommendedNextStep and self.actionRequired:
            self.recommendedNextStep = self.actionRequired
        if not self.evidenceClause and self.citation:
            self.evidenceClause = self.citation
        if not self.verbatimExcerpt:
            self.verbatimExcerpt = self.evidenceClause or self.citation or (self.explanation[:140] if self.explanation else "")
        if self.identifiedBy:
            val = str(self.identifiedBy).lower()
            if "loki" in val:
                self.identifiedBy = "loki"
            elif "norn" in val:
                self.identifiedBy = "norns"
            elif "thor" in val:
                self.identifiedBy = "thor"
            elif "heimdall" in val:
                self.identifiedBy = "heimdall"
            elif "tyr" in val:
                self.identifiedBy = "tyr"
            elif "odin" in val:
                self.identifiedBy = "odin"
        if not self.contractName:
            names = {
                "cnt-A1": "StratoNode CloudCore Cover Page",
                "cnt-A2": "StratoNode CloudCore SLA",
                "cnt-A3": "StratoNode Amendment No. 1",
                "cnt-B1": "Harbor Retail Solutions Cloud Service Agreement",
                "cnt-B2": "Harbor Retail DPA",
                "cnt-C1": "Vantage Logistics Agreement",
                "cnt-D1": "Pixelwright Contractor SOW",
                "cnt-STD": "Common Paper Standard Terms",
            }
            self.contractName = names.get(self.contractId, self.contractId)
        if self.financialExposureINR == 0.0 and self.financialExposure:
            import re
            m = re.search(r"\$([0-9,]+)", self.financialExposure)
            if m:
                val = float(m.group(1).replace(",", ""))
                self.financialExposureINR = val * 83.0
        if not self.crossContractConflict and self.category == "Cross-Contract Collision":
            self.crossContractConflict = CrossContractConflict(
                conflictingContractId="cnt-B1",
                conflictingContractName="Harbor Retail Group Cloud Service Agreement",
                conflictingClauseCitation="Section 4.1",
                conflictSummary="StratoNode 99.5% compute SLA leaves 40x liability gap under Harbor Retail 99.9% uptime commitment."
            )
        return self

class AgentInfo(BaseModel):
    id: str
    name: str
    title: str
    role: str
    avatar: str
    color: str
    status: str = "running"
    currentTask: str = "Analyzing contracts"
    latestActivity: str = "Executing risk evaluation"
    completedTasksCount: int = 100
    totalProcessedCount: int = 100
    responsibilities: List[str] = []
    inputSummary: str = ""
    outputSummary: str = ""
    evidenceReferences: List[str] = []
    lastActiveTimestamp: Optional[str] = "2027-01-15T12:00:00Z"
    activeTasks: Optional[List[str]] = None
    model: Optional[str] = None

class AgentMessage(BaseModel):
    id: str
    agentId: str
    agentName: str
    stage: str
    timestamp: str
    title: str
    message: str
    contractId: Optional[str] = None
    contractName: Optional[str] = None
    clauseReference: Optional[str] = None
    verbatimEvidence: Optional[str] = None
    disagreementLevel: Optional[str] = None
    requiresHumanReview: Optional[bool] = None
    tags: Optional[List[str]] = None

class WorkflowStep(BaseModel):
    id: str
    stepNumber: int
    agentId: str
    title: str
    description: str
    status: str
    timestamp: str

class TimelineEvent(BaseModel):
    id: str
    contractId: str
    contractName: str
    counterparty: str
    title: str
    date: str
    type: str
    severity: RiskLevel
    status: str
    description: str
    clauseCitation: str
    penaltyAmountINR: Optional[float] = None
    noticePeriodDays: Optional[int] = None
    isWorstCaseProjection: Optional[bool] = None

class RecommendedAction(BaseModel):
    id: str
    priority: str
    title: str
    description: str
    contractId: str
    contractName: str
    deadline: str
    actionOwner: str
    financialImpactINR: float
    arbitrationVerdictRef: str
    status: str

class ContractReport(BaseModel):
    id: str
    title: str
    generatedAt: str
    scope: str
    totalContractsEvaluated: int
    totalExposureINR: float
    criticalRisksCount: int
    highRisksCount: int
    worstCasePenaltiesINR: float
    evidenceSummary: str
    verifiedByAgents: List[str]
    recommendedActions: List[RecommendedAction]
    contractId: Optional[str] = None

from pydantic import BaseModel, model_validator
from typing import List, Optional, Literal

RiskLevel = Literal['low', 'medium', 'high', 'critical']
ContractStatus = Literal['active', 'under_review', 'expiring_soon', 'terminated', 'disputed', 'critical']
AnalysisStatus = Literal['completed', 'processing', 'pending_arbitration', 'flagged']
AgentStatus = Literal['idle', 'running', 'completed', 'waiting', 'failed']

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

    @model_validator(mode="after")
    def sync_compatibility_fields(self):
        if not self.field and self.title:
            self.field = self.title
        if not self.clauseCitation and self.section:
            self.clauseCitation = self.section
        if not self.verbatimText and self.text:
            self.verbatimText = self.text
        if not self.extractedValue:
            self.extractedValue = self.text or self.title or ""
        if self.category == "general" and self.type:
            self.category = self.type
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

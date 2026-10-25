from pydantic import BaseModel
from typing import List, Optional, Literal

RiskLevel = Literal['low', 'medium', 'high', 'critical']
ContractStatus = Literal['active', 'under_review', 'expiring_soon', 'terminated', 'disputed']
AnalysisStatus = Literal['completed', 'processing', 'pending_arbitration', 'flagged']
AgentStatus = Literal['idle', 'running', 'completed', 'waiting', 'failed']

class ContractClause(BaseModel):
    id: str
    contractId: str
    field: str
    extractedValue: str
    clauseCitation: str
    confidenceScore: float
    verbatimText: str
    extractedBy: Literal['thor', 'odin']
    category: str
    interpretationNote: Optional[str] = None

class Obligation(BaseModel):
    id: str
    contractId: str
    title: str
    description: str
    dueDate: str
    status: Literal['upcoming', 'due', 'overdue', 'completed']
    severity: RiskLevel
    financialExposureINR: float
    responsibleParty: Literal['internal', 'counterparty', 'shared']
    clauseReference: str

class Contract(BaseModel):
    id: str
    title: str
    counterparty: str
    contractType: str
    status: ContractStatus
    analysisStatus: AnalysisStatus
    riskLevel: RiskLevel
    startDate: str
    endDate: str
    renewalDate: str
    durationMonths: int
    jurisdiction: str
    totalValueINR: float
    financialExposureINR: float
    autoRenewalConditions: str
    paymentSchedule: str
    confidenceScore: float
    summary: str
    tags: List[str] = []
    relatedContractIds: Optional[List[str]] = None
    clauses: List[ContractClause] = []
    obligations: List[Obligation] = []

class CrossContractConflict(BaseModel):
    conflictingContractId: str
    conflictingContractName: str
    conflictingClauseCitation: str
    conflictSummary: str

class Risk(BaseModel):
    id: str
    title: str
    contractId: str
    contractName: str
    counterparty: str
    severity: RiskLevel
    likelihood: Literal['unlikely', 'possible', 'likely', 'imminent']
    impact: Literal['low', 'moderate', 'severe', 'catastrophic']
    financialExposureINR: float
    status: Literal['open', 'investigating', 'arbitrated', 'mitigated', 'accepted']
    evidenceClause: str
    verbatimExcerpt: str
    explanation: str
    recommendedNextStep: str
    identifiedBy: Literal['loki', 'heimdall', 'norns', 'thor']
    createdAt: str
    disputedBy: Optional[str] = None
    arbitratedBy: Optional[Literal['tyr']] = None
    arbitrationVerdict: Optional[str] = None
    crossContractConflict: Optional[CrossContractConflict] = None

class AgentInfo(BaseModel):
    id: str
    name: str
    title: str
    role: str
    avatar: str
    color: str
    status: AgentStatus
    currentTask: str
    latestActivity: str
    completedTasksCount: int
    totalProcessedCount: int
    responsibilities: List[str]
    inputSummary: str
    outputSummary: str
    evidenceReferences: List[str]
    lastActiveTimestamp: str

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

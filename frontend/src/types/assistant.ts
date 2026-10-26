export type QueryCategory =
  | 'sla_calculation'
  | 'financial_recovery'
  | 'breach_investigation'
  | 'contradiction_detection'
  | 'obligation_tracking'
  | 'clause_lookup'
  | 'what_if_simulation'
  | 'general_inquiry';

export type ClaimVerificationStatus = 'confirmed' | 'contradicted' | 'unverified' | 'disputed';
export type MaterialityLevel = 'none' | 'immaterial' | 'potential_default' | 'material_breach' | 'critical';

export interface CitationSource {
  id: string;
  sourceType: 'contract_clause' | 'company_record' | 'event_log' | 'monitoring_report';
  contractId?: string;
  contractName?: string;
  sectionOrClause?: string;
  documentId?: string;
  pageOrParagraph?: string;
  eventOrRecordId?: string;
  date?: string;
  verbatimExcerpt: string;
  confidence: number;
}

export interface ClaimWithEvidence {
  id: string;
  conclusion: string;
  category: string;
  status: ClaimVerificationStatus;
  materiality: MaterialityLevel;
  contractProvision?: string;
  supportingEvidence: CitationSource[];
  counterEvidence: CitationSource[];
  missingEvidenceRequired: string[];
  reasoning: string;
}

export interface CalculationBreakdown {
  calculationType: 'sla_uptime' | 'customer_credit' | 'vendor_recovery' | 'recovery_gap' | 'termination_liability';
  periodLabel: string;
  inputs: Record<string, string | number>;
  formulaApplied: string;
  steps: {
    description: string;
    result: string | number;
  }[];
  customerCreditsOwedUSD: number;
  customerCreditsOwedINR: number;
  vendorCreditsRecoverableUSD: number;
  vendorCreditsRecoverableINR: number;
  unrecoveredExposureUSD: number;
  unrecoveredExposureINR: number;
  governingSlaCitation: string;
  assumptions: string[];
  missingInputs: string[];
}

export interface AgentStageTrace {
  agentId: 'thor' | 'norns' | 'loki' | 'heimdall' | 'tyr' | 'odin';
  agentName: string;
  role: string;
  status: 'completed' | 'degraded' | 'skipped' | 'failed';
  executionDurationMs: number;
  summary: string;
  claimsCount: number;
  findings: Record<string, any>;
  errors?: string[];
}

export interface AgentDebateItem {
  id: string;
  topic: string;
  lokiChallenge: string;
  lokiEvidenceCitation: string;
  heimdallVerification: string;
  heimdallStatus: 'YES' | 'NO' | 'PARTIAL';
  correlatedEvents: string[];
  tyrVerdict: string;
  tyrLegalBasis: string;
}

export interface StructuredAnswer {
  summary: string;
  directAnswer: string;
  queryIntent: {
    category: QueryCategory;
    targetContracts: string[];
    targetEvents: string[];
    targetDateOrPeriod?: string;
    isOutageRelated: boolean;
  };
  claims: ClaimWithEvidence[];
  calculation?: CalculationBreakdown;
  agentTraces: AgentStageTrace[];
  debateItems: AgentDebateItem[];
  citations: CitationSource[];
  contradictions: {
    contractualTerm: string;
    conflictingRecord: string;
    conflictExplanation: string;
    severity: 'high' | 'medium' | 'low';
    citation: string;
  }[];
  assumptions: string[];
  missingInformation: string[];
  suggestedFollowUps: string[];
  deepLinks: {
    label: string;
    type: 'contract' | 'timeline' | 'sandbox' | 'risk';
    targetId: string;
    url: string;
  }[];
}

export interface AssistantQueryRequest {
  query: string;
  conversationId?: string;
  history?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
  activeContractId?: string;
  activeClockDate?: string;
}

export interface StoredInvestigationSummary {
  id: string;
  query: string;
  timestamp: string;
  durationMs: number;
  summary: string;
  targetContracts: string[];
  claimsCount: number;
  hasCalculation: boolean;
}

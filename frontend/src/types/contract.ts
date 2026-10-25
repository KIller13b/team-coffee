export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ContractStatus = 'active' | 'under_review' | 'expiring_soon' | 'terminated' | 'disputed'
export type AnalysisStatus = 'completed' | 'processing' | 'pending_arbitration' | 'flagged'

export interface ContractClause {
  id: string
  contractId: string
  field: string
  extractedValue: string
  clauseCitation: string
  confidenceScore: number // 0 to 1
  verbatimText: string
  extractedBy: 'thor' | 'odin'
  category: 'payment' | 'renewal' | 'termination' | 'penalty' | 'liability' | 'confidentiality' | 'sla'
  interpretationNote?: string
}

export interface Obligation {
  id: string
  contractId: string
  title: string
  description: string
  dueDate: string
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  severity: RiskLevel
  financialExposureINR: number
  responsibleParty: 'internal' | 'counterparty' | 'shared'
  clauseReference: string
}

export interface Contract {
  id: string
  title: string
  counterparty: string
  contractType: string
  status: ContractStatus
  analysisStatus: AnalysisStatus
  riskLevel: RiskLevel
  startDate: string
  endDate: string
  renewalDate: string
  durationMonths: number
  jurisdiction: string
  totalValueINR: number
  financialExposureINR: number
  autoRenewalConditions: string
  paymentSchedule: string
  confidenceScore: number
  clauses: ContractClause[]
  obligations: Obligation[]
  relatedContractIds?: string[]
  tags: string[]
  summary: string
}

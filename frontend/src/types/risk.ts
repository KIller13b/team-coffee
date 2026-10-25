import { RiskLevel } from './contract'
export type { RiskLevel } from './contract'

export type RiskStatus = 'open' | 'investigating' | 'arbitrated' | 'mitigated' | 'accepted'

export interface Risk {
  id: string
  title: string
  contractId: string
  contractName: string
  counterparty: string
  severity: RiskLevel
  likelihood: 'unlikely' | 'possible' | 'likely' | 'imminent'
  impact: 'low' | 'moderate' | 'severe' | 'catastrophic'
  financialExposureINR: number
  status: RiskStatus
  evidenceClause: string
  verbatimExcerpt: string
  explanation: string
  recommendedNextStep: string
  identifiedBy: 'loki' | 'heimdall' | 'norns' | 'thor'
  disputedBy?: string
  arbitratedBy?: 'tyr'
  arbitrationVerdict?: string
  createdAt: string
  crossContractConflict?: {
    conflictingContractId: string
    conflictingContractName: string
    conflictingClauseCitation: string
    conflictSummary: string
  }
}

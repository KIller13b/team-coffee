export interface RecommendedAction {
  id: string
  priority: 'p1' | 'p2' | 'p3'
  title: string
  description: string
  contractId: string
  contractName: string
  deadline: string
  actionOwner: string
  financialImpactINR: number
  arbitrationVerdictRef: string
  status: 'pending_approval' | 'in_progress' | 'executed'
}

export interface ContractReport {
  id: string
  title: string
  generatedAt: string
  scope: 'company_wide' | 'single_contract' | 'cross_conflict'
  contractId?: string
  totalContractsEvaluated: number
  totalExposureINR: number
  criticalRisksCount: number
  highRisksCount: number
  recommendedActions: RecommendedAction[]
  worstCasePenaltiesINR: number
  evidenceSummary: string
  verifiedByAgents: string[]
}

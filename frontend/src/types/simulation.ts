export type ScenarioType = 'vendor_default' | 'early_termination' | 'milestone_failure';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';
export type CostSource = 'contract_term' | 'statutory_rule' | 'user_assumption';
export type DependencyType = 'upstream' | 'downstream' | 'addendum' | 'dependency';

export interface ScenarioParams {
  defaultDate?: string;
  outageDurationHours?: number;
  curePeriodDays?: number;
  effectiveDate?: string;
  noticeDate?: string;
  reason?: 'convenience' | 'cause';
  milestoneId?: string;
  milestoneTitle?: string;
  delayDays?: number;
  isCritical?: boolean;
  customAssumptions?: string[];
  notes?: string;
}

export interface SimulationRequest {
  contractId: string;
  simulationDate: string;
  scenarioType: ScenarioType;
  params?: ScenarioParams;
  mockMode?: boolean;
}

export interface CostBreakdownItem {
  id: string;
  category: 'direct_penalty' | 'termination_liability' | 'prepaid_loss' | 'downstream_sla_breach' | 'downstream_replacement_cost' | 'unaccrued_saving';
  amountINR: number;
  description: string;
  clauseCitation?: string;
  isEstimated: boolean;
  source: CostSource;
  contractId: string;
}

export interface CascadingEffectItem {
  affectedContractId: string;
  affectedContractTitle: string;
  counterparty: string;
  relationshipType: DependencyType;
  impactDescription: string;
  exposureINR: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  clauseCitation?: string;
  isDirectBreach: boolean;
}

export interface SimulatedTimelineEvent {
  id: string;
  contractId: string;
  contractName: string;
  counterparty: string;
  title: string;
  date: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  penaltyAmountINR?: number;
  description: string;
  clauseCitation: string;
  isSimulatedTrigger?: boolean;
}

export interface DataQualityReport {
  hasSufficientData: boolean;
  confidenceScore: number;
  missingFields: string[];
  unverifiedTerms: string[];
  assumptions: string[];
  warnings: string[];
}

export interface SimulationResult {
  simulationId: string;
  status: 'success' | 'insufficient_data';
  timestamp: string;
  isMock: boolean;
  scenarioType: ScenarioType;
  simulationDate: string;
  baseline: {
    contractId: string;
    contractTitle: string;
    counterparty: string;
    baselineExposureINR: number;
    baselineMilestonesCount: number;
    baselineOverdueCount: number;
    riskLevel: string;
  };
  simulated: {
    eventDate: string;
    directFinancialImpactINR: number;
    downstreamFinancialImpactINR: number;
    totalExposureINR: number;
    deltaExposureINR: number;
    costBreakdown: CostBreakdownItem[];
    cascadingEffects: CascadingEffectItem[];
    simulatedTimelineEvents: SimulatedTimelineEvent[];
  };
  comparison: {
    exposureDeltaINR: number;
    riskLevelBefore: string;
    riskLevelAfter: string;
    criticalBreachesCount: number;
    totalAffectedContractsCount: number;
  };
  dataQuality: DataQualityReport;
}

export interface ScenarioTemplate {
  id: string;
  scenarioType: ScenarioType;
  name: string;
  description: string;
  defaultParams: ScenarioParams;
}

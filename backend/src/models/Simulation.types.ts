import { z } from 'zod';

export type ScenarioType = 'vendor_default' | 'early_termination' | 'milestone_failure';
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unverified';
export type CostSource = 'contract_term' | 'statutory_rule' | 'user_assumption';
export type DependencyType = 'upstream' | 'downstream' | 'addendum' | 'dependency';

export const ScenarioParamsSchema = z.object({
  // Vendor default parameters
  defaultDate: z.string().optional(),
  outageDurationHours: z.number().nonnegative().optional(),
  curePeriodDays: z.number().nonnegative().optional(),

  // Early termination parameters
  effectiveDate: z.string().optional(),
  noticeDate: z.string().optional(),
  reason: z.enum(['convenience', 'cause']).optional(),

  // Milestone failure parameters
  milestoneId: z.string().optional(),
  milestoneTitle: z.string().optional(),
  delayDays: z.number().nonnegative().optional(),
  isCritical: z.boolean().optional(),

  // Custom user overrides or assumptions
  customAssumptions: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type ScenarioParams = z.infer<typeof ScenarioParamsSchema>;

export const SimulationRequestSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  simulationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Simulation date must be in YYYY-MM-DD format'),
  scenarioType: z.enum(['vendor_default', 'early_termination', 'milestone_failure']),
  params: ScenarioParamsSchema.optional().default({}),
  mockMode: z.boolean().optional().default(false),
});

export type SimulationRequest = z.infer<typeof SimulationRequestSchema>;

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
  confidenceScore: number; // 0.0 - 1.0
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

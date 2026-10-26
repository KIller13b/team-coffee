import { apiRequest } from './apiClient';
import {
  SimulationRequest,
  SimulationResult,
  ScenarioTemplate,
} from '../types/simulation';

const DEFAULT_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'tpl-vendor-default',
    scenarioType: 'vendor_default',
    name: 'Major Infrastructure Outage (Vendor Default)',
    description:
      'Simulate an unplanned critical cloud compute service outage exceeding SLA commitments, and trace downstream enterprise customer breaches.',
    defaultParams: {
      outageDurationHours: 24,
      curePeriodDays: 0,
    },
  },
  {
    id: 'tpl-early-termination-conv',
    scenarioType: 'early_termination',
    name: 'Early Termination for Convenience',
    description:
      'Evaluate immediate financial exposure, required notice period liabilities, and downstream vendor replacement obligations.',
    defaultParams: {
      reason: 'convenience',
    },
  },
  {
    id: 'tpl-milestone-delay',
    scenarioType: 'milestone_failure',
    name: 'Milestone Deliverable Failure & Deemed Acceptance',
    description:
      'Simulate deliverable non-acceptance past the inspection window and analyze deemed acceptance fee or delay damage triggers.',
    defaultParams: {
      delayDays: 30,
      isCritical: true,
    },
  },
];

export const simulationApiService = {
  /**
   * Fetch preconfigured scenario templates
   */
  async getScenarioTemplates(): Promise<ScenarioTemplate[]> {
    try {
      const res = await apiRequest<{ templates: ScenarioTemplate[] }>(
        '/simulation/scenarios',
        {},
        () => ({ templates: DEFAULT_TEMPLATES })
      );
      return res.data?.templates || DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  },

  /**
   * Run a What-If scenario simulation
   */
  async runSimulation(req: SimulationRequest): Promise<SimulationResult> {
    const res = await apiRequest<SimulationResult>(
      '/simulation/what-if',
      {
        method: 'POST',
        body: JSON.stringify(req),
      },
      () => createFallbackMockResult(req)
    );
    return res.data;
  },

  /**
   * Get downstream dependencies for a contract
   */
  async getDependencies(contractId: string): Promise<any> {
    try {
      const res = await apiRequest<any>(`/simulation/dependencies/${contractId}`);
      return res.data;
    } catch {
      return { dependenciesCount: 0, dependents: [] };
    }
  },
};

/**
 * Fallback generator if backend is temporarily disconnected
 */
function createFallbackMockResult(req: SimulationRequest): SimulationResult {
  const direct = 250000;
  const downstream = 750000;
  const total = direct + downstream;
  return {
    simulationId: `sim-fallback-${Date.now()}`,
    status: 'success',
    timestamp: new Date().toISOString(),
    isMock: true,
    scenarioType: req.scenarioType,
    simulationDate: req.simulationDate,
    baseline: {
      contractId: req.contractId,
      contractTitle: `Contract (${req.contractId})`,
      counterparty: 'Fallback Counterparty Inc.',
      baselineExposureINR: 500000,
      baselineMilestonesCount: 3,
      baselineOverdueCount: 0,
      riskLevel: 'medium',
    },
    simulated: {
      eventDate: req.params?.defaultDate || req.simulationDate,
      directFinancialImpactINR: direct,
      downstreamFinancialImpactINR: downstream,
      totalExposureINR: total,
      deltaExposureINR: total - 500000,
      costBreakdown: [
        {
          id: 'fallback-cost-1',
          category: 'direct_penalty',
          amountINR: direct,
          description: 'Client-side fallback simulated direct penalty',
          clauseCitation: 'Section 4.1',
          isEstimated: true,
          source: 'user_assumption',
          contractId: req.contractId,
        },
      ],
      cascadingEffects: [
        {
          affectedContractId: 'cnt-B1',
          affectedContractTitle: 'Downstream Customer Agreement',
          counterparty: 'Harbor Retail Solutions LLC',
          relationshipType: 'downstream',
          impactDescription: 'Cascading customer SLA uptime breach',
          exposureINR: downstream,
          severity: 'critical',
          clauseCitation: 'SLA §4.1',
          isDirectBreach: true,
        },
      ],
      simulatedTimelineEvents: [
        {
          id: 'fallback-evt-1',
          contractId: req.contractId,
          contractName: 'Primary Contract',
          counterparty: 'Counterparty',
          title: `Simulated ${req.scenarioType.replace('_', ' ')} trigger`,
          date: req.simulationDate,
          type: 'penalty_trigger',
          severity: 'critical',
          status: 'overdue',
          penaltyAmountINR: direct,
          description: 'Fallback simulated milestone trigger',
          clauseCitation: 'SLA Terms',
          isSimulatedTrigger: true,
        },
      ],
    },
    comparison: {
      exposureDeltaINR: total - 500000,
      riskLevelBefore: 'medium',
      riskLevelAfter: 'critical',
      criticalBreachesCount: 1,
      totalAffectedContractsCount: 2,
    },
    dataQuality: {
      hasSufficientData: true,
      confidenceScore: 0.5,
      missingFields: [],
      unverifiedTerms: ['Offline fallback adapter activated'],
      assumptions: ['SYNTHETIC FALLBACK SIMULATION — NOT A VERIFIED FINANCIAL OUTCOME'],
      warnings: ['Offline fallback adapter active: connect backend for live contractual calculations'],
    },
  };
}

import { Contract } from '../types/contract'
import { Risk } from '../types/risk'
import { AgentInfo, AgentMessage, WorkflowStep } from '../types/agent'
import { TimelineEvent } from '../types/timeline'
import { ExternalEvent } from '../types/event'
import { ContractReport, RecommendedAction } from '../types/report'

import { MOCK_CONTRACTS } from '../data/mockContracts'
import { MOCK_RISKS } from '../data/mockRisks'
import { MOCK_AGENTS, MOCK_AGENT_MESSAGES, MOCK_WORKFLOW_STEPS } from '../data/mockAgents'
import { MOCK_TIMELINE_EVENTS } from '../data/mockTimeline'
import { MOCK_EXTERNAL_EVENTS } from '../data/mockEvents'
import { MOCK_REPORTS } from '../data/mockReports'
import { apiRequest } from './apiClient'

// In-memory state for local additions (e.g. uploading contracts or changing action status)
let contractsState = [...MOCK_CONTRACTS]
let risksState = [...MOCK_RISKS]
let reportsState = [...MOCK_REPORTS]

export const contractsService = {
  // Contracts
  async getContracts(): Promise<Contract[]> {
    const res = await apiRequest<Contract[]>('/contracts', {}, () => contractsState)
    return res.data
  },

  async getContractById(id: string): Promise<Contract | null> {
    const res = await apiRequest<Contract | null>(`/contracts/${id}`, {}, () => {
      return contractsState.find((c) => c.id === id) || null
    })
    return res.data
  },

  async addContract(newContract: Partial<Contract>): Promise<Contract> {
    const contract: Contract = {
      id: `cnt-${Date.now().toString(36)}`,
      title: newContract.title || 'Untitled Agreement',
      counterparty: newContract.counterparty || 'External Entity Ltd.',
      contractType: newContract.contractType || 'Master Services Agreement (MSA)',
      status: 'under_review',
      analysisStatus: 'processing',
      riskLevel: newContract.riskLevel || 'medium',
      startDate: newContract.startDate || '2026-11-01',
      endDate: newContract.endDate || '2027-10-31',
      renewalDate: newContract.renewalDate || '2027-09-30',
      durationMonths: 12,
      jurisdiction: newContract.jurisdiction || 'Bangalore, India',
      totalValueINR: newContract.totalValueINR || 12000000,
      financialExposureINR: 1500000,
      autoRenewalConditions: '30 days prior written notice required to prevent automated 12-month rollover.',
      paymentSchedule: 'Net 30 days invoice settlement.',
      confidenceScore: 0.91,
      summary: newContract.summary || 'Uploaded document queued for Thor parsing and Loki risk analysis.',
      tags: ['Uploaded Document', 'Thor Queued', 'Pending Verification'],
      clauses: [
        {
          id: `cls-${Date.now()}-1`,
          contractId: `cnt-${Date.now().toString(36)}`,
          field: 'Uploaded Document Notice Term',
          extractedValue: '30 Days Prior Notice Required',
          clauseCitation: 'Section 4.1 (Term)',
          confidenceScore: 0.89,
          extractedBy: 'thor',
          category: 'renewal',
          verbatimText: 'Either party may terminate by delivering 30 days prior written notice before anniversary.',
          interpretationNote: 'Standard unilateral termination clause.',
        },
      ],
      obligations: [
        {
          id: `ob-${Date.now()}-1`,
          contractId: `cnt-${Date.now().toString(36)}`,
          title: 'Complete Thor Clause Verification Audit',
          description: 'Review OCR clause segmentation and verify indemnification thresholds.',
          dueDate: '2026-11-15',
          status: 'upcoming',
          severity: 'medium',
          financialExposureINR: 1500000,
          responsibleParty: 'internal',
          clauseReference: 'Section 4.1',
        },
      ],
    }

    contractsState = [contract, ...contractsState]
    return contract
  },

  // Risks
  async getRisks(): Promise<Risk[]> {
    const res = await apiRequest<Risk[]>('/risks', {}, () => risksState)
    return res.data
  },

  async getRiskById(id: string): Promise<Risk | null> {
    const res = await apiRequest<Risk | null>(`/risks/${id}`, {}, () => {
      return risksState.find((r) => r.id === id) || null
    })
    return res.data
  },

  // Agents
  async getAgents(): Promise<AgentInfo[]> {
    const res = await apiRequest<AgentInfo[]>('/agents', {}, () => MOCK_AGENTS)
    return res.data
  },

  async getAgentMessages(): Promise<AgentMessage[]> {
    const res = await apiRequest<AgentMessage[]>('/agents/messages', {}, () => MOCK_AGENT_MESSAGES)
    return res.data
  },

  async getWorkflowSteps(): Promise<WorkflowStep[]> {
    const res = await apiRequest<WorkflowStep[]>('/workflow/steps', {}, () => MOCK_WORKFLOW_STEPS)
    return res.data
  },

  // Timeline
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    const res = await apiRequest<TimelineEvent[]>('/timeline/events', {}, () => MOCK_TIMELINE_EVENTS)
    return res.data
  },

  // External Events (Heimdall)
  async getExternalEvents(): Promise<ExternalEvent[]> {
    const res = await apiRequest<ExternalEvent[]>('/events/external', {}, () => MOCK_EXTERNAL_EVENTS)
    return res.data
  },

  // Reports
  async getReports(): Promise<ContractReport[]> {
    const res = await apiRequest<ContractReport[]>('/reports', {}, () => reportsState)
    return res.data
  },

  async updateActionStatus(actionId: string, status: RecommendedAction['status']): Promise<void> {
    reportsState = reportsState.map((rep) => ({
      ...rep,
      recommendedActions: rep.recommendedActions.map((act) =>
        act.id === actionId ? { ...act, status } : act
      ),
    }))
  },
}

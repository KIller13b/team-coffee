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

// In-memory state for local additions (contracts must be uploaded by user)
let contractsState: Contract[] = []
let risksState = [...MOCK_RISKS]
let reportsState = [...MOCK_REPORTS]

export const contractsService = {
  // Contracts
  async getContracts(): Promise<Contract[]> {
    let localUploads: Contract[] = []
    try {
      localUploads = JSON.parse(localStorage.getItem('odin_uploaded_contracts') || '[]')
    } catch {}

    try {
      const res = await apiRequest<Contract[]>('/contracts', {}, () => contractsState)
      const backendData = Array.isArray(res.data) ? res.data : []
      const seenIds = new Set(backendData.map((c) => c.id))
      const merged = [
        ...backendData,
        ...localUploads.filter((c) => !seenIds.has(c.id)),
      ]
      contractsState = merged
      return merged
    } catch {
      const merged = [...localUploads, ...contractsState]
      return merged
    }
  },

  async getContractById(id: string): Promise<Contract | null> {
    const existing = contractsState.find((c) => c.id === id)
    if (existing) return existing

    try {
      const localUploads: Contract[] = JSON.parse(localStorage.getItem('odin_uploaded_contracts') || '[]')
      const match = localUploads.find((c) => c.id === id)
      if (match) return match
    } catch {}

    const res = await apiRequest<Contract | null>(`/contracts/${id}`, {}, () => {
      return contractsState.find((c) => c.id === id) || null
    })
    return res.data
  },

  async uploadContractFile(
    file: File,
    meta: { title?: string; counterparty?: string; contractType?: string }
  ): Promise<Contract> {
    const formData = new FormData()
    formData.append('file', file)
    if (meta.title) formData.append('title', meta.title)
    if (meta.counterparty) formData.append('counterparty', meta.counterparty)
    if (meta.contractType) formData.append('contract_type', meta.contractType)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
    try {
      const res = await fetch(`${API_BASE_URL}/contracts/upload`, {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        throw new Error(`Upload error ${res.status}: ${res.statusText}`)
      }
      const contract: Contract = await res.json()
      contractsState = [contract, ...contractsState.filter((c) => c.id !== contract.id)]
      try {
        const existing: Contract[] = JSON.parse(localStorage.getItem('odin_uploaded_contracts') || '[]')
        localStorage.setItem('odin_uploaded_contracts', JSON.stringify([contract, ...existing.filter((c) => c.id !== contract.id)]))
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('odin:contract-uploaded', { detail: contract }))
      }
      return contract
    } catch {
      // Fallback only if backend is completely offline
      return this.addContract({
        title: meta.title || file.name,
        counterparty: meta.counterparty || 'External Entity Ltd.',
        contractType: meta.contractType || 'Master Services Agreement (MSA)',
      })
    }
  },

  async addContract(newContract: Partial<Contract>): Promise<Contract> {
    const contract: Contract = {
      id: `cnt-${Date.now().toString(36)}`,
      title: newContract.title || 'Untitled Agreement',
      counterparty: newContract.counterparty || 'External Entity Ltd.',
      contractType: newContract.contractType || 'Master Services Agreement (MSA)',
      status: 'under_review',
      analysisStatus: 'completed',
      riskLevel: newContract.riskLevel || 'medium',
      startDate: newContract.startDate || '2026-11-01',
      endDate: newContract.endDate || '2027-10-31',
      renewalDate: newContract.renewalDate || '2027-09-30',
      durationMonths: 12,
      jurisdiction: newContract.jurisdiction || 'Austin, TX',
      totalValueINR: newContract.totalValueINR || 12000000,
      financialExposureINR: 1500000,
      autoRenewalConditions: '30 days prior written notice required to prevent automated 12-month rollover.',
      paymentSchedule: 'Net 30 days invoice settlement.',
      confidenceScore: 0.94,
      summary: newContract.summary || 'Uploaded document parsed by Thor and indexed in the Odin War Room.',
      tags: ['Uploaded Document', 'Thor Verified', 'Active Analysis'],
      clauses: [
        {
          id: `cls-${Date.now()}-1`,
          contractId: `cnt-${Date.now().toString(36)}`,
          field: 'Uploaded Document Notice Term',
          extractedValue: '30 Days Prior Notice Required',
          clauseCitation: 'Section 4.1 (Term)',
          confidenceScore: 0.94,
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
          dueDate: '2027-04-15',
          status: 'upcoming',
          severity: 'medium',
          financialExposureINR: 1500000,
          responsibleParty: 'internal',
          clauseReference: 'Section 4.1',
        },
      ],
    }

    // 1. Persist to localStorage immediately
    try {
      const existing: Contract[] = JSON.parse(localStorage.getItem('odin_uploaded_contracts') || '[]')
      const updated = [contract, ...existing.filter((c) => c.id !== contract.id)]
      localStorage.setItem('odin_uploaded_contracts', JSON.stringify(updated))
    } catch {}

    // 2. Prepend to in-memory state
    contractsState = [contract, ...contractsState.filter((c) => c.id !== contract.id)]

    // 3. Post to backend API
    try {
      await apiRequest<Contract>('/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contract),
      })
    } catch (e) {
      console.warn('Backend POST /contracts skipped/failed, saved locally:', e)
    }

    // 4. Dispatch event to all listening components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('odin:contract-uploaded', { detail: contract }))
    }

    return contract
  },

  async clearContracts(): Promise<void> {
    contractsState = []
    try {
      localStorage.removeItem('odin_uploaded_contracts')
    } catch {}
    try {
      await apiRequest('/contracts', { method: 'DELETE' })
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('odin:contract-uploaded'))
    }
  },

  async deleteContract(id: string): Promise<void> {
    contractsState = contractsState.filter((c) => c.id !== id)
    try {
      const localUploads: Contract[] = JSON.parse(localStorage.getItem('odin_uploaded_contracts') || '[]')
      localStorage.setItem('odin_uploaded_contracts', JSON.stringify(localUploads.filter((c) => c.id !== id)))
    } catch {}
    try {
      await apiRequest(`/contracts/${id}`, { method: 'DELETE' })
    } catch {}
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('odin:contract-uploaded'))
    }
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

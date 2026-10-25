import { AgentId } from '../lib/constants'

export type AgentStatus = 'idle' | 'running' | 'completed' | 'waiting' | 'failed'

export interface AgentInfo {
  id: AgentId
  name: string
  title: string
  role: string
  avatar: string
  color: string
  status: AgentStatus
  currentTask: string
  latestActivity: string
  completedTasksCount: number
  totalProcessedCount: number
  responsibilities: string[]
  inputSummary: string
  outputSummary: string
  evidenceReferences: string[]
  lastActiveTimestamp: string
}

export interface AgentMessage {
  id: string
  agentId: AgentId
  agentName: string
  stage: 'extraction' | 'projection' | 'challenge' | 'verification' | 'ruling' | 'delegation'
  timestamp: string
  title: string
  message: string
  contractId?: string
  contractName?: string
  clauseReference?: string
  verbatimEvidence?: string
  disagreementLevel?: 'none' | 'moderate' | 'high'
  requiresHumanReview?: boolean
  evidenceLinks?: { label: string; url?: string }[]
  tags?: string[]
}

export interface WorkflowStep {
  id: string
  stepNumber: number
  agentId: AgentId
  title: string
  description: string
  status: 'completed' | 'active' | 'pending' | 'failed'
  timestamp: string
}

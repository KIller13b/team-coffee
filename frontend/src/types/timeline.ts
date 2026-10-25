import { RiskLevel } from './contract'

export type TimelineEventType = 
  | 'payment_deadline'
  | 'renewal_window'
  | 'termination_notice'
  | 'penalty_trigger'
  | 'audit_milestone'
  | 'sla_evaluation'

export interface TimelineEvent {
  id: string
  contractId: string
  contractName: string
  counterparty: string
  title: string
  date: string // ISO string
  type: TimelineEventType
  severity: RiskLevel
  status: 'upcoming' | 'due' | 'overdue' | 'completed'
  penaltyAmountINR?: number
  noticePeriodDays?: number
  description: string
  clauseCitation: string
  isWorstCaseProjection?: boolean
}

export interface TimelineSimulationState {
  simulatedDate: string // ISO string
  offsetMonths: number
  totalProjectedPenaltyINR: number
  overdueCount: number
  dueCount: number
  upcomingCount: number
}

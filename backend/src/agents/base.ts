export interface Citation {
  doc_id: string;
  clause: string;
  verbatim_quote: string;
  confidence: number;
  verified: boolean;
}

export interface ExtractedClause {
  id: string;
  doc_id: string;
  field: string;
  extracted_value: string;
  clause_citation: string;
  verbatim_text: string;
  category: string;
  confidence_score: number;
  interpretation_note?: string;
  is_ambiguous: boolean;
  ambiguity_reason?: string;
  ambiguity_status?: string;
}

export interface ExtractedObligation {
  id: string;
  contract_id: string;
  title: string;
  description: string;
  due_date?: string;
  frequency?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  responsible_party: 'internal' | 'counterparty' | 'shared';
  clause_reference: string;
  financial_exposure_inr: number;
}

export interface ThorOutput {
  contract_id: string;
  title: string;
  counterparty: string;
  clauses: ExtractedClause[];
  obligations: ExtractedObligation[];
  sla_thresholds: Record<string, any>;
  governing_law?: string;
  notice_requirements?: Record<string, any>;
  verbatim_citations: Citation[];
  summary: string;
}

export interface NornsTimelineItem {
  id: string;
  date: string;
  title: string;
  type: 'deadline' | 'renewal_window' | 'cure_period' | 'milestone' | 'payment';
  contract_id: string;
  description: string;
  clause_citation: string;
  penalty_exposure_inr: number;
  is_worst_case: boolean;
  status: 'pending' | 'approaching' | 'breached' | 'satisfied';
}

export interface NornsOutput {
  clock_checkpoint: string;
  timeline_items: NornsTimelineItem[];
  upcoming_deadlines_30d: NornsTimelineItem[];
  worst_case_exposure_inr: number;
  auto_renewal_deadlines: Record<string, any>[];
  analysis_notes: string;
}

export interface LokiRiskClaim {
  id: string;
  title: string;
  contract_id: string;
  counterparty: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'unlikely' | 'possible' | 'likely' | 'imminent';
  impact: 'low' | 'moderate' | 'severe' | 'catastrophic';
  financial_exposure_inr: number;
  evidence_clause: string;
  verbatim_excerpt: string;
  trap_description: string;
  cross_contract_conflict?: Record<string, string>;
  hypothesis: string;
}

export interface LokiOutput {
  risks_and_claims: LokiRiskClaim[];
  cross_contract_collisions: Record<string, any>[];
  cross_contract_conflicts?: Record<string, any>[];
  total_exposure_inr: number;
  critique_summary: string;
}

export interface HeimdallVerification {
  claim_id: string;
  contract_id: string;
  claim_title: string;
  is_actually_happening: boolean;
  branch: 'YES' | 'NO';
  correlated_event_ids: string[];
  real_world_evidence: string;
  severity_adjustment?: string;
  materialized_financial_impact_inr: number;
  reasoning: string;
}

export interface HeimdallOutput {
  verified_events_count: number;
  total_claims_evaluated: number;
  yes_branch_claims: HeimdallVerification[];
  no_branch_claims: HeimdallVerification[];
  unmatched_critical_events: Record<string, any>[];
  monitoring_summary: string;
}

export interface TyrArbitrationRuling {
  ruling_id: string;
  claim_id: string;
  contract_id: string;
  verdict: 'upheld_as_latent_risk' | 'dismissed_as_false_alarm' | 'negotiate_bridge_amendment' | 'formal_cure_required';
  binding_decision: string;
  legal_basis_clause: string;
  recommended_mitigation: string;
  required_notice_procedure?: string;
  financial_impact_inr: number;
}

export interface TyrOutput {
  disputes_reviewed: number;
  rulings: TyrArbitrationRuling[];
  dismissed_alarms_count: number;
  latent_risks_count: number;
  arbitration_summary: string;
}

export interface FinalActionItem {
  id: string;
  priority: 'P1_URGENT' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';
  action_type: 'SLA_CREDIT_CLAIM' | 'CURE_NOTICE' | 'BRIDGE_EXTENSION' | 'TERMINATION_NOTICE' | 'INTERNAL_CORRECTION';
  title: string;
  target_counterparty: string;
  contract_id: string;
  deadline: string;
  responsible_agent: string;
  financial_impact_inr: number;
  citation?: Citation;
  draft_letter: string;
  status: 'drafted' | 'ready_for_dispatch' | 'executed';
}

export interface OdinSynthesisOutput {
  mission_id: string;
  generated_at: string;
  total_exposure_inr: number;
  active_breaches_count: number;
  adjudicated_risks_count: number;
  executive_summary: string;
  final_actions: FinalActionItem[];
  agent_contributions: Record<string, any>;
}

export interface WorkflowExecutionResult {
  workflow_id: string;
  contract_id: string;
  contract_title: string;
  started_at: string;
  completed_at: string;
  thor: ThorOutput;
  norns: NornsOutput;
  loki: LokiOutput;
  heimdall: HeimdallOutput;
  tyr: TyrOutput;
  odin: OdinSynthesisOutput;
  logs: Record<string, any>[];
  observability?: Record<string, any>;
}

export abstract class BaseAgent {
  public logs: Record<string, any>[] = [];

  constructor(
    public readonly agentId: string,
    public readonly name: string,
    public readonly title: string,
    public readonly role: string,
    public readonly avatar: string,
    public readonly color: string
  ) {}

  public log(message: string, stage: string, data?: Record<string, any>): Record<string, any> {
    const entry = {
      timestamp: new Date().toISOString(),
      agent_id: this.agentId,
      agent_name: this.name,
      stage,
      message,
      data: data || {},
    };
    this.logs.push(entry);
    return entry;
  }

  public verifyQuote(text: string, quote: string): boolean {
    if (!quote || !text) return false;
    const cleanText = text.replace(/\s+/g, ' ').toLowerCase();
    const cleanQuote = quote.replace(/\s+/g, ' ').toLowerCase();
    return cleanText.includes(cleanQuote);
  }
}

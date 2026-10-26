import React, { useState } from 'react'
import { 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  Radio, 
  Scale, 
  Crown, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Terminal,
  Activity
} from 'lucide-react'
import { Citation, MoneyBadge, SeverityBadge } from '../Shared'

export function AgentCouncilCanvas({ analysis, onNavigateToTimeline, onNavigateToContracts }) {
  const [selectedAgent, setSelectedAgent] = useState('loki') // default to red-team for immediate drama

  if (!analysis) return null

  const extractions = analysis.extractions || {}
  const lokiAttacks = analysis.loki_output?.attacks || []
  const heimdallAlerts = analysis.heimdall_output?.active_alerts || []
  const tyrActions = analysis.tyr_output?.actions || []
  const tyrRulings = analysis.tyr_output?.rulings || []
  const nornsTimeline = analysis.norns_output?.timeline || []
  const worstCase = analysis.norns_output?.worst_case
  const agentMessages = analysis.agent_messages || []

  const AGENTS = [
    {
      id: 'thor',
      name: 'Thor',
      role: 'Extraction & Grounding',
      icon: BookOpen,
      color: '#0891b2', // cyan-600
      lightBg: '#ecfeff',
      status: 'Verified',
      statusType: 'success',
      metric: `8 Documents Extracted`,
      submetric: `${Object.values(extractions).reduce((acc, c) => acc + (c.flags?.length || 0), 0)} ambiguity flags`,
      description: 'Parses legal terms, fees, SLAs, and insurance conditions with 100% verbatim citation verification.'
    },
    {
      id: 'norns',
      name: 'Norns',
      role: 'Timeline & Exposure',
      icon: Clock,
      color: '#7c3aed', // violet-600
      lightBg: '#f5f3ff',
      status: 'Projected',
      statusType: 'info',
      metric: `${nornsTimeline.length} Chronological Deadlines`,
      submetric: worstCase ? `$${(worstCase.total_exposure_usd / 1000).toFixed(0)}k Max Exposure` : 'Calculated',
      description: 'Maps contract lifecycle, notices, cure windows, and calculates worst-case financial liabilities.'
    },
    {
      id: 'loki',
      name: 'Loki',
      role: 'Adversarial Red-Team',
      icon: ShieldAlert,
      color: '#e11d48', // rose-600
      lightBg: '#fff1f2',
      status: 'Adversarial Vector Found',
      statusType: 'critical',
      metric: `${lokiAttacks.length} Attack Vectors`,
      submetric: `${lokiAttacks.filter(a => a.severity === 'critical').length} Critical Defaults`,
      description: 'Red-teams counterparty maneuvers, uncovers insurance lapses, and spots unrecoverable SLA liability gaps.'
    },
    {
      id: 'heimdall',
      name: 'Heimdall',
      role: 'Event Stream & Breach Watch',
      icon: Radio,
      color: '#2563eb', // blue-600
      lightBg: '#eff6ff',
      status: 'Monitoring Drops',
      statusType: 'warning',
      metric: `${heimdallAlerts.length} Active Operational Alerts`,
      submetric: `${analysis.heimdall_output?.event_analyses?.length || 0} Events Evaluated`,
      description: 'Monitors real-time business events, detects late breach notices, and checks actual uptime against SLA pledges.'
    },
    {
      id: 'tyr',
      name: 'Tyr',
      role: 'Adjudication & Action',
      icon: Scale,
      color: '#059669', // emerald-600
      lightBg: '#ecfdf5',
      status: 'Remedies Formulated',
      statusType: 'success',
      metric: `${tyrActions.length} Binding Actions Drafted`,
      submetric: `${tyrRulings.length} Legal Rulings`,
      description: 'Adjudicates competing agent claims, resolves SLA disputes, and drafts legally enforceable notices.'
    },
    {
      id: 'odin',
      name: 'Odin',
      role: 'Allfather Orchestrator',
      icon: Crown,
      color: '#d97706', // amber-600
      lightBg: '#fffbeb',
      status: 'Consensus Reached',
      statusType: 'gold',
      metric: `Session: ${analysis.session_id}`,
      submetric: `Checkpoint: ${analysis.current_checkpoint}`,
      description: 'Coordinates workstreams, reconciles agent disagreements, enforces loop limits, and generates synthesis report.'
    }
  ]

  const currentAgent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0]
  const relevantLogs = agentMessages.filter(m => m.agent?.toLowerCase() === selectedAgent)

  return (
    <div className="workspace-panel p-6 my-6 border border-slate-200 bg-white shadow-sm rounded-2xl">
      {/* Light Mode Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-signal-beacon" />
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans flex items-center gap-2">
              Agent Collaboration & Reasoning Pipeline
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Loop Consensus
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive multi-agent network tracking evidence discovery, adversarial challenge, and resolution.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-600" /> Grounding
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600" /> Red-Team Conflict
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" /> Adjudication
          </span>
        </div>
      </div>

      {/* Connected Agent Pipeline Graph */}
      <div className="py-6 overflow-x-auto">
        <div className="min-w-[860px] flex items-center justify-between relative px-4">
          {/* Connecting Flow Track */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-cyan-400/40 via-rose-400/50 to-emerald-400/50 rounded-full z-0" />

          {AGENTS.map((agent, index) => {
            const Icon = agent.icon
            const isSelected = selectedAgent === agent.id

            return (
              <div key={agent.id} className="relative z-10 flex flex-col items-center">
                {/* Node Button */}
                <button
                  onClick={() => setSelectedAgent(agent.id)}
                  style={{
                    borderColor: isSelected ? agent.color : '#e2e8f0',
                    backgroundColor: isSelected ? agent.lightBg : '#ffffff',
                    boxShadow: isSelected ? `0 4px 18px -2px ${agent.color}35` : '0 1px 3px 0 rgba(0,0,0,0.05)',
                  }}
                  className={`w-28 p-3 rounded-xl border text-left transition-all duration-200 group relative ${
                    isSelected ? 'scale-105 ring-2' : 'hover:border-slate-300 hover:scale-102 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold"
                      style={{ backgroundColor: `${agent.color}18`, color: agent.color }}
                    >
                      <Icon size={16} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-medium">0{index + 1}</span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 font-sans">{agent.name}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{agent.role}</div>

                  <div className="mt-2 pt-2 border-t border-slate-200/80">
                    <div className="text-[10px] font-mono font-bold text-slate-700 truncate">
                      {agent.metric.split(' ')[0]} {agent.metric.split(' ')[1]}
                    </div>
                  </div>

                  {/* Active Indicator Pulse */}
                  {isSelected && (
                    <div 
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                      style={{ backgroundColor: agent.color }}
                    />
                  )}
                </button>

                {/* Conflict / Synthesis Junction labels */}
                {index === 2 && (
                  <div className="absolute -bottom-6 text-[10px] font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 whitespace-nowrap shadow-2xs">
                    ⚡ Adversarial Test
                  </div>
                )}
                {index === 4 && (
                  <div className="absolute -bottom-6 text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap shadow-2xs">
                    ⚖ Legal Remedy
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Selected Agent Deep-Dive Panel (Light Mode) */}
      <div className="mt-6 pt-6 border-t border-slate-200 bg-slate-50/70 rounded-xl p-5 border border-slate-200/70">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Agent Profile & Summary */}
          <div className="lg:w-1/3 space-y-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: `${currentAgent.color}20`, color: currentAgent.color }}
              >
                <currentAgent.icon size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {currentAgent.name}
                  <span className="text-xs font-mono font-normal text-slate-500">
                    ({currentAgent.role})
                  </span>
                </h4>
                <div className="text-xs font-mono font-semibold" style={{ color: currentAgent.color }}>
                  ● {currentAgent.status}
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans">
              {currentAgent.description}
            </p>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Key Metric:</span>
                <span className="text-slate-900 font-bold">{currentAgent.metric}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Sub-finding:</span>
                <span className="text-slate-700 font-medium">{currentAgent.submetric}</span>
              </div>
            </div>

            {/* Quick Action Navigation */}
            {selectedAgent === 'thor' && (
              <button 
                onClick={onNavigateToContracts}
                className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <span>Inspect Contracts & Grounded Terms</span>
                <ChevronRight size={14} />
              </button>
            )}
            {selectedAgent === 'norns' && (
              <button 
                onClick={onNavigateToTimeline}
                className="w-full text-xs font-medium py-2 px-3 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200 flex items-center justify-center gap-2 transition-colors shadow-2xs"
              >
                <span>View Complete Investigation Timeline</span>
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          {/* Agent Evidence & Output View */}
          <div className="lg:w-2/3 border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 pb-2 border-b border-slate-200">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Terminal size={14} className="text-indigo-600" />
                Live Agent Output & Grounded Findings
              </span>
              <span>{relevantLogs.length} audit entries</span>
            </div>

            {/* Content varies by agent */}
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {/* Loki Red-Team Attacks */}
              {selectedAgent === 'loki' && (
                lokiAttacks.map((atk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-rose-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-rose-800 font-mono">
                        [{atk.attack_id}] {atk.title}
                      </div>
                      <SeverityBadge severity={atk.severity} />
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      {atk.attack_path}
                    </p>
                    {atk.citations?.map((c, i) => (
                      <div key={i} className="pt-1">
                        <Citation citation={c} />
                      </div>
                    ))}
                  </div>
                ))
              )}

              {/* Tyr Adjudication & Rulings */}
              {selectedAgent === 'tyr' && (
                tyrActions.map((act, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-emerald-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-emerald-800 font-mono">
                        [{act.action_id}] {act.title}
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                        {act.action_type}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {act.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                      <span>Target: <strong className="text-slate-700">{act.target_entity}</strong></span>
                      <span>Deadline: <strong className="text-slate-700">{act.deadline || 'Immediate'}</strong></span>
                    </div>
                  </div>
                ))
              )}

              {/* Heimdall Alerts */}
              {selectedAgent === 'heimdall' && (
                heimdallAlerts.map((alt, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-blue-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-blue-800 font-mono">
                        [{alt.alert_id}] {alt.title}
                      </div>
                      <SeverityBadge severity={alt.severity} />
                    </div>
                    <p className="text-slate-600 text-xs">{alt.summary}</p>
                    <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-100">
                      Trigger: <strong className="text-slate-700">{alt.trigger_event}</strong> • Contract: <strong className="text-slate-700">{alt.contract_id}</strong>
                    </div>
                  </div>
                ))
              )}

              {/* Thor Extractions summary */}
              {selectedAgent === 'thor' && (
                Object.entries(extractions).map(([docId, ext]) => (
                  <div key={docId} className="p-3.5 rounded-xl bg-white border border-cyan-200 text-xs space-y-2 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-800">{docId}: {ext.contract_id}</span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">{ext.doc_ids?.join(', ')}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                      <div>Uptime Target: <span className="font-bold text-slate-900">{ext.uptime_target?.value || 'N/A'}</span></div>
                      <div>Claim Deadline: <span className="font-bold text-slate-900">{ext.credit_request_deadline?.value || 'N/A'}</span></div>
                    </div>
                  </div>
                ))
              )}

              {/* Norns Timeline entries */}
              {selectedAgent === 'norns' && (
                nornsTimeline.slice(0, 4).map((entry, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-white border border-purple-200 text-xs space-y-1 shadow-2xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-purple-800">{entry.date} — {entry.label}</span>
                      <span className="text-amber-700 font-bold">${entry.financial_exposure?.toLocaleString() || '0'}</span>
                    </div>
                    <p className="text-slate-600 text-xs">{entry.description}</p>
                  </div>
                ))
              )}

              {/* Odin Orchestrator synthesis */}
              {selectedAgent === 'odin' && (
                <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs space-y-3 shadow-2xs">
                  <div className="font-bold text-amber-800 font-mono">
                    Consensus State: COMPLETED (Iteration {analysis.iteration_count} of {analysis.max_iterations})
                  </div>
                  <pre className="text-slate-700 text-xs whitespace-pre-wrap font-sans leading-relaxed">
                    {analysis.company_risk_report?.executive_summary}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

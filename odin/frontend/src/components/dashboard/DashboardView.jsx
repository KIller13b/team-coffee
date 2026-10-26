import React, { useState } from 'react'
import { 
  AlertTriangle, 
  ShieldAlert, 
  Radio, 
  Scale, 
  Clock, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  UserCheck,
  FileSignature,
  Check,
  Copy,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { AgentCouncilCanvas } from './AgentCouncilCanvas'
import { WhatIfStrategySandbox } from './WhatIfStrategySandbox'
import { SeverityBadge, MoneyBadge, AgentBadge, Citation } from '../Shared'

function StatCard({ title, value, subtitle, icon: Icon, colorClass, borderClass, onClick }) {
  return (
    <div 
      onClick={onClick}
      className={`workspace-panel p-5 cursor-pointer transition-all hover:scale-[1.01] hover:shadow-elevated ${borderClass || ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{value}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  )
}

export function DashboardView({ store }) {
  const { analysis, setActivePage, setSelectedContractId } = store
  const [activeCategory, setActiveCategory] = useState('human_approval') // 'human_approval' | 'breaches'
  const [approvedActionIds, setApprovedActionIds] = useState(new Set())
  const [expandedActionId, setExpandedActionId] = useState(null)
  const [copiedActionId, setCopiedActionId] = useState(null)

  if (!analysis) {
    return (
      <div className="text-center py-24">
        <div className="text-slate-400 font-mono mb-2">No active analysis session</div>
        <p className="text-xs text-slate-500">Click "Run Analysis" in the top bar to initialize the multi-agent council.</p>
      </div>
    )
  }

  const attacks = analysis.loki_output?.attacks || []
  const criticalAttacks = attacks.filter(a => a.severity === 'critical')
  const highAttacks = attacks.filter(a => a.severity === 'high')
  const alerts = analysis.heimdall_output?.active_alerts || []
  const actions = analysis.tyr_output?.actions || []
  const humanApprovalNeeded = actions.filter(a => a.requires_human_approval)
  const worstCaseExposure = analysis.norns_output?.worst_case?.total_exposure_usd || 0
  const contractsCount = 8
  const recentLogs = (analysis.agent_messages || []).slice(-8).reverse()

  const handleToggleApprove = (actionId) => {
    setApprovedActionIds(prev => {
      const next = new Set(prev)
      if (next.has(actionId)) {
        next.delete(actionId)
      } else {
        next.add(actionId)
      }
      return next
    })
  }

  const handleCopyNotice = (actionId, text) => {
    navigator.clipboard.writeText(text || '')
    setCopiedActionId(actionId)
    setTimeout(() => setCopiedActionId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner — Analysis Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Council Active
            </span>
            <span className="text-xs font-mono text-slate-400">
              Session #{analysis.session_id}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Quillhub Contract Intelligence & Exposure War Room
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Temporal Clock: <span className="font-semibold text-slate-700">{analysis.current_checkpoint}</span> • Workstreams: <span className="font-semibold text-slate-700">WS-A, WS-B, WS-C, WS-D, WS-X</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('council')}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5"
          >
            <span>Ask Council Chatbot</span>
            <ArrowUpRight size={14} />
          </button>
          <button
            onClick={() => setActivePage('contracts')}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
          >
            <span>All Contracts ({contractsCount})</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Human Approval Needed"
          value={humanApprovalNeeded.length}
          subtitle={`${actions.length - humanApprovalNeeded.length} autonomous legal remedies`}
          icon={UserCheck}
          colorClass="bg-amber-50 text-amber-600"
          borderClass={activeCategory === 'human_approval' ? 'ring-2 ring-amber-500 border-amber-300' : 'hover:border-amber-300'}
          onClick={() => setActiveCategory('human_approval')}
        />
        <StatCard
          title="Critical Default Vectors"
          value={criticalAttacks.length}
          subtitle={`${highAttacks.length} additional high-severity risks`}
          icon={AlertTriangle}
          colorClass="bg-rose-50 text-rose-600"
          borderClass={activeCategory === 'breaches' ? 'ring-2 ring-rose-500 border-rose-300' : 'hover:border-rose-300'}
          onClick={() => setActiveCategory('breaches')}
        />
        <StatCard
          title="Active Breach Alerts"
          value={alerts.length}
          subtitle="Real-time event stream monitoring"
          icon={Radio}
          colorClass="bg-blue-50 text-blue-600"
          borderClass="hover:border-blue-300"
          onClick={() => setActivePage('timeline')}
        />
        <StatCard
          title="Worst-Case Exposure"
          value={`$${(worstCaseExposure / 1000).toFixed(0)}k`}
          subtitle="Contractual liability across all terms"
          icon={Clock}
          colorClass="bg-purple-50 text-purple-600"
          borderClass="hover:border-purple-300"
          onClick={() => setActivePage('timeline')}
        />
      </div>

      {/* The Visual Centerpiece: Agent Collaboration Canvas */}
      <AgentCouncilCanvas 
        analysis={analysis} 
        onNavigateToTimeline={() => setActivePage('timeline')}
        onNavigateToContracts={() => setActivePage('contracts')}
      />

      {/* Advanced Visualization & Analytics: What-If Strategy Sandbox */}
      <WhatIfStrategySandbox store={store} />

      {/* Two Column Section: Categories (Human Approval Needed / Breaches) & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Categorized Priority Queue */}
        <div className="lg:col-span-7 space-y-4">
          <div className="workspace-panel p-5">
            {/* Category Selector Tabs */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveCategory('human_approval')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeCategory === 'human_approval'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <UserCheck size={15} className="text-amber-600" />
                  <span>Human Approval Needed</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'human_approval' ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {humanApprovalNeeded.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveCategory('breaches')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors ${
                    activeCategory === 'breaches'
                      ? 'bg-rose-100 text-rose-900 border border-rose-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <ShieldAlert size={15} className="text-rose-600" />
                  <span>Critical Breaches</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeCategory === 'breaches' ? 'bg-rose-200 text-rose-900' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {criticalAttacks.length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] font-mono text-slate-400">
                {activeCategory === 'human_approval' ? 'Executive Sign-Off Queue' : 'Ground Truth Cited'}
              </span>
            </div>

            {/* CATEGORY 1: HUMAN APPROVAL NEEDED */}
            {activeCategory === 'human_approval' && (
              <div className="space-y-4 divide-y divide-slate-100">
                {humanApprovalNeeded.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No actions currently pending human sign-off.
                  </div>
                ) : (
                  humanApprovalNeeded.map((act) => {
                    const isApproved = approvedActionIds.has(act.action_id)
                    const isExpanded = expandedActionId === act.action_id

                    return (
                      <div key={act.action_id} className="pt-4 first:pt-0 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                [{act.action_id}]
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {act.action_type?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1">
                                ⚠ HUMAN APPROVAL NEEDED
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900">
                              {act.subject || act.title}
                            </h4>
                          </div>

                          {/* Approval Status Pill */}
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shrink-0">
                              <Check size={13} className="text-emerald-600" />
                              Approved by Counsel
                            </span>
                          ) : (
                            <button
                              onClick={() => handleToggleApprove(act.action_id)}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0 flex items-center gap-1.5 active:scale-95"
                            >
                              <FileSignature size={13} />
                              <span>Approve & Authorize</span>
                            </button>
                          )}
                        </div>

                        {/* Recipient & Summary */}
                        <div className="text-xs text-slate-600 leading-relaxed">
                          To: <strong className="text-slate-800">{act.to_party}</strong> • From: <strong className="text-slate-800">{act.from_party}</strong>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
                          {act.description}
                        </p>

                        {/* Toggle Formal Draft Notice */}
                        <div className="pt-1">
                          <button
                            onClick={() => setExpandedActionId(isExpanded ? null : act.action_id)}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                          >
                            <span>{isExpanded ? 'Hide Draft Legal Notice' : 'View Full Draft Notice for Review'}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono space-y-3">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
                                <span>FORMAL LEGAL INSTRUMENT DRAFT:</span>
                                <button
                                  onClick={() => handleCopyNotice(act.action_id, act.body)}
                                  className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                                >
                                  {copiedActionId === act.action_id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                  <span>{copiedActionId === act.action_id ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <pre className="whitespace-pre-wrap leading-relaxed text-slate-200 font-mono text-[11px] max-h-60 overflow-y-auto">
                                {act.body}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* Citations */}
                        {act.citations?.map((c, idx) => (
                          <Citation key={idx} citation={c} />
                        ))}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* CATEGORY 2: TOP PRIORITY BREACHES */}
            {activeCategory === 'breaches' && (
              <div className="space-y-4 divide-y divide-slate-100">
                {criticalAttacks.slice(0, 3).map((atk) => (
                  <div key={atk.attack_id} className="pt-4 first:pt-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          [{atk.attack_id}]
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800">
                          {atk.title}
                        </h4>
                      </div>
                      <SeverityBadge severity={atk.severity} />
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {atk.attack_path}
                    </p>

                    {atk.citations?.map((c, idx) => (
                      <Citation key={idx} citation={c} />
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Multi-Agent Decision Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="workspace-panel p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Inter-Agent Consensus Trail
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Live Audit
              </span>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <AgentBadge agent={log.agent} />
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Recent'}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-mono text-[11px]">
                    {log.message}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActivePage('timeline')}
              className="mt-4 w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-center"
            >
              View Full Investigation Timeline
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

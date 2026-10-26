import React from 'react'
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
  TrendingDown
} from 'lucide-react'
import { AgentCouncilCanvas } from './AgentCouncilCanvas'
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
  const worstCaseExposure = analysis.norns_output?.worst_case?.total_exposure_usd || 0
  const contractsCount = Object.keys(analysis.extractions || {}).length
  const recentLogs = (analysis.agent_messages || []).slice(-8).reverse()

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
            <span>Ask Agent Council</span>
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
          title="Critical Default Vectors"
          value={criticalAttacks.length}
          subtitle={`${highAttacks.length} additional high-severity risks`}
          icon={AlertTriangle}
          colorClass="bg-rose-50 text-rose-600"
          borderClass="hover:border-rose-300"
          onClick={() => setActivePage('timeline')}
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
          title="Binding Legal Remedies"
          value={actions.length}
          subtitle={`${actions.filter(a => a.requires_human_approval).length} notices require executive signature`}
          icon={Scale}
          colorClass="bg-emerald-50 text-emerald-600"
          borderClass="hover:border-emerald-300"
          onClick={() => setActivePage('timeline')}
        />
        <StatCard
          title="Worst-Case Exposure"
          value={`$${(worstCaseExposure / 1000).toFixed(0)}k`}
          subtitle="Contractual liability across all terms"
          icon={Clock}
          colorClass="bg-amber-50 text-amber-600"
          borderClass="hover:border-amber-300"
          onClick={() => setActivePage('timeline')}
        />
      </div>

      {/* The Visual Centerpiece: Agent Collaboration Canvas */}
      <AgentCouncilCanvas 
        analysis={analysis} 
        onNavigateToTimeline={() => setActivePage('timeline')}
        onNavigateToContracts={() => setActivePage('contracts')}
      />

      {/* Two Column Section: Critical Findings & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Top Priority Breaches & Adjudication */}
        <div className="lg:col-span-7 space-y-4">
          <div className="workspace-panel p-5">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Top Priority Breaches & Vulnerabilities
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Ground Truth Cited
              </span>
            </div>

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

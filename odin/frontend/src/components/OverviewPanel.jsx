import React from 'react'
import { AlertTriangle, Shield, Zap, TrendingDown, FileText, Clock } from 'lucide-react'
import { SeverityBadge, MoneyBadge } from './Shared'

function StatCard({ icon: Icon, label, value, sub, color = 'text-war-cyan' }) {
  return (
    <div className="card p-4 flex items-start gap-3">
      <div className={`mt-0.5 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className={`text-2xl font-bold font-mono ${color}`}>{value}</div>
        <div className="text-war-muted text-xs">{label}</div>
        {sub && <div className="text-war-muted text-xs mt-0.5 opacity-60">{sub}</div>}
      </div>
    </div>
  )
}

export function OverviewPanel({ analysis }) {
  if (!analysis) return null

  const attacks = analysis.loki_output?.attacks || []
  const events = analysis.heimdall_output?.active_alerts || []
  const actions = analysis.tyr_output?.actions || []
  const exposure = analysis.norns_output?.worst_case?.total_exposure_usd || 0
  const critical = attacks.filter(a => a.severity === 'critical').length
  const urgentActions = actions.filter(a => a.requires_human_approval).length

  const summary = analysis.company_risk_report?.executive_summary || ''

  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <StatCard icon={AlertTriangle} label="Critical Risks" value={critical} color="text-red-400" sub="Immediate action" />
        <StatCard icon={TrendingDown} label="Total Attacks" value={attacks.length} color="text-orange-400" sub={`${critical} crit / ${attacks.filter(a=>a.severity==='high').length} high`} />
        <StatCard icon={Zap} label="Active Alerts" value={events.length} color="text-yellow-400" sub="From event feed" />
        <StatCard icon={Shield} label="Actions Drafted" value={actions.length} color="text-war-cyan" sub={`${urgentActions} need approval`} />
        <StatCard icon={FileText} label="Contracts Analyzed" value={Object.keys(analysis.extractions || {}).length} color="text-purple-400" />
        <StatCard icon={Clock} label="Exposure" value={`$${(exposure/1000).toFixed(0)}K`} color="text-war-gold" sub="Worst-case" />
      </div>

      {/* Executive summary */}
      <div className="card">
        <div className="card-header">
          <span className="text-war-cyan font-mono font-bold text-sm">⚔ EXECUTIVE SUMMARY — CHECKPOINT {analysis.current_checkpoint}</span>
          <span className="badge-info text-xs">Odin Synthesis</span>
        </div>
        <div className="p-4">
          <pre className="text-war-text text-xs leading-relaxed whitespace-pre-wrap font-mono">
            {summary}
          </pre>
        </div>
      </div>

      {/* Critical attacks quick view */}
      <div className="card">
        <div className="card-header">
          <span className="text-red-400 font-mono font-bold text-sm">🔴 CRITICAL RISKS</span>
        </div>
        <div className="divide-y divide-war-border">
          {attacks.filter(a => a.severity === 'critical').map(attack => (
            <div key={attack.attack_id} className="p-4">
              <div className="flex items-start gap-3">
                <SeverityBadge severity={attack.severity} />
                <div className="flex-1">
                  <div className="text-war-text font-mono text-xs font-bold mb-1">
                    [{attack.attack_id}] {attack.title}
                  </div>
                  <div className="text-war-muted text-xs leading-relaxed line-clamp-3">
                    {attack.attack_path}
                  </div>
                  {attack.citations?.slice(0,1).map((c, i) => (
                    <div key={i} className="mt-2 text-xs">
                      <span className="badge-info">{c.doc_id}</span>
                      <span className="text-war-cyan ml-2">{c.clause_ref}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worst case projection */}
      {analysis.norns_output?.worst_case && (
        <div className="card border-war-gold/30">
          <div className="card-header">
            <span className="text-war-gold font-mono font-bold text-sm">⚠ WORST-CASE FINANCIAL PROJECTION</span>
            <MoneyBadge amount={analysis.norns_output.worst_case.total_exposure_usd} />
          </div>
          <div className="p-4 text-war-muted text-xs leading-relaxed">
            {analysis.norns_output.worst_case.scenario}
          </div>
        </div>
      )}
    </div>
  )
}

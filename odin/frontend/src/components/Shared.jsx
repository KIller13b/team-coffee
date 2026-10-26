import React, { useState } from 'react'
import { Check, Copy, ExternalLink, ShieldAlert, Sparkles } from 'lucide-react'

export function SeverityBadge({ severity, className = '' }) {
  const norm = (severity || 'info').toLowerCase()
  const badgeMap = {
    critical: 'badge-critical',
    high: 'badge-high',
    medium: 'badge-medium',
    low: 'badge-low',
    info: 'badge-info',
  }

  const dotMap = {
    critical: 'bg-rose-600',
    high: 'bg-amber-600',
    medium: 'bg-yellow-600',
    low: 'bg-emerald-600',
    info: 'bg-blue-600',
  }

  return (
    <span className={`${badgeMap[norm] || 'badge-neutral'} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotMap[norm] || 'bg-slate-400'}`} />
      <span className="uppercase tracking-wider font-semibold text-[11px]">{norm}</span>
    </span>
  )
}

export function StatusBadge({ status, className = '' }) {
  const norm = (status || 'upcoming').toLowerCase()
  const map = {
    critical: 'bg-rose-100 text-rose-800 border-rose-300',
    overdue: 'bg-red-100 text-red-800 border-red-300 font-bold',
    due: 'bg-blue-100 text-blue-800 border-blue-300',
    upcoming: 'bg-slate-100 text-slate-800 border-slate-300',
    past: 'bg-slate-50 text-slate-500 border-slate-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  }

  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-mono border ${map[norm] || 'bg-slate-100 text-slate-600 border-slate-200'} ${className}`}>
      {status}
    </span>
  )
}

export function MoneyBadge({ amount, prefix = '', className = '' }) {
  if (amount == null) return null
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount)

  return (
    <span className={`font-mono font-semibold text-slate-900 tracking-tight ${className}`}>
      {prefix}{formatted}
    </span>
  )
}

export function AgentBadge({ agent, showRole = false, className = '' }) {
  const key = (agent || 'odin').toLowerCase()
  const agentDefs = {
    odin: { label: 'ODIN', role: 'Orchestrator', bg: 'bg-amber-500/10 text-amber-500 border-amber-500/30' },
    thor: { label: 'THOR', role: 'Extraction', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
    norns: { label: 'NORNS', role: 'Timeline', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
    loki: { label: 'LOKI', role: 'Red-Team', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
    heimdall: { label: 'HEIMDALL', role: 'Event Watcher', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
    tyr: { label: 'TYR', role: 'Adjudicator', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  }

  const def = agentDefs[key] || { label: agent?.toUpperCase(), role: 'Council', bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30' }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono border ${def.bg} ${className}`}>
      <span className="font-bold">{def.label}</span>
      {showRole && <span className="opacity-60 text-[10px]">({def.role})</span>}
    </span>
  )
}

export function Citation({ citation }) {
  const [copied, setCopied] = useState(false)
  if (!citation) return null

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.verbatim_quote || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const confPct = Math.round((citation.confidence || 0) * 100)

  return (
    <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs transition-colors hover:border-slate-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 font-mono font-bold text-[11px]">
            {citation.doc_id}
          </span>
          <span className="font-mono text-cyan-700 font-medium text-[12px]">
            {citation.clause_ref}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
            <span>Confidence:</span>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${confPct >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${confPct}%` }}
              />
            </div>
            <span className="font-semibold text-slate-700">{confPct}%</span>
          </div>
          <button 
            onClick={handleCopy}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            title="Copy verbatim quote"
          >
            {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
          </button>
        </div>
      </div>
      <blockquote className="border-l-2 border-cyan-500 pl-3 py-0.5 text-slate-700 text-xs italic font-serif leading-relaxed bg-white/60 rounded-r">
        "{citation.verbatim_quote}"
      </blockquote>
    </div>
  )
}

export function LoadingSpinner({ label = 'Executing Multi-Agent Reasoning Pipeline...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-slate-500">
      <div className="relative">
        <div className="w-12 h-12 border-3 border-slate-200 border-t-cyan-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-600">
          ⚔
        </div>
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 font-mono">Thor, Loki, Heimdall, Tyr & Norns in session</p>
      </div>
    </div>
  )
}

export function EmptyState({ title = 'No data available', message, action }) {
  return (
    <div className="text-center py-16 px-4 bg-white border border-slate-200 rounded-xl max-w-md mx-auto my-8">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
        <ShieldAlert size={20} />
      </div>
      <h4 className="text-sm font-semibold text-slate-900 mb-1">{title}</h4>
      {message && <p className="text-xs text-slate-500 mb-4">{message}</p>}
      {action}
    </div>
  )
}

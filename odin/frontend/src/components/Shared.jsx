import React from 'react'

const SEVERITY_STYLES = {
  critical: 'badge-critical',
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

const STATUS_STYLES = {
  overdue: 'text-red-400',
  critical: 'text-orange-400',
  upcoming: 'text-yellow-400',
  due: 'text-cyan-400',
  past: 'text-war-muted',
}

export function SeverityBadge({ severity }) {
  return (
    <span className={SEVERITY_STYLES[severity] || 'badge-info'}>
      {severity?.toUpperCase() || 'INFO'}
    </span>
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`text-xs font-mono font-bold ${STATUS_STYLES[status] || 'text-war-muted'}`}>
      {status?.toUpperCase()}
    </span>
  )
}

export function Citation({ citation }) {
  if (!citation) return null
  return (
    <div className="mt-2 p-2 bg-war-bg border border-war-border rounded text-xs">
      <div className="flex gap-2 items-center mb-1">
        <span className="badge-info">{citation.doc_id}</span>
        <span className="text-war-cyan font-mono">{citation.clause_ref}</span>
        <span className="text-war-muted ml-auto">conf: {Math.round((citation.confidence || 0) * 100)}%</span>
      </div>
      <blockquote className="text-war-muted italic border-l-2 border-war-cyan pl-2 whitespace-pre-wrap leading-relaxed">
        "{citation.verbatim_quote}"
      </blockquote>
    </div>
  )
}

export function MoneyBadge({ amount, prefix = '' }) {
  if (amount == null) return null
  const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  return (
    <span className="text-war-gold font-mono font-bold">{prefix}{formatted}</span>
  )
}

export function AgentBadge({ agent }) {
  const colors = {
    odin: 'text-war-cyan border-war-cyan',
    thor: 'text-yellow-400 border-yellow-400',
    norns: 'text-purple-400 border-purple-400',
    loki: 'text-orange-400 border-orange-400',
    heimdall: 'text-blue-400 border-blue-400',
    tyr: 'text-green-400 border-green-400',
  }
  const name = agent?.toLowerCase() || 'odin'
  return (
    <span className={`text-xs font-mono border px-1.5 py-0.5 rounded ${colors[name] || 'text-war-muted border-war-muted'}`}>
      {agent?.toUpperCase()}
    </span>
  )
}

export function LoadingSpinner({ label = 'Running analysis...' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-war-muted">
      <div className="w-12 h-12 border-2 border-war-cyan border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-mono animate-pulse">{label}</p>
    </div>
  )
}

export function EmptyState({ message = 'No data available' }) {
  return (
    <div className="text-center py-16 text-war-muted text-sm font-mono">
      <div className="text-4xl mb-4">⚔</div>
      {message}
    </div>
  )
}

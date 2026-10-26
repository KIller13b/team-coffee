import React, { useState } from 'react'
import { StatusBadge, Citation, MoneyBadge } from './Shared'

function TimelineBar({ entries }) {
  const statusColor = {
    overdue: 'bg-red-500',
    critical: 'bg-orange-500',
    due: 'bg-cyan-500',
    upcoming: 'bg-yellow-500/60',
    past: 'bg-war-muted/30',
  }

  return (
    <div className="flex items-center gap-1 h-2 my-2">
      {entries.map((e, i) => (
        <div
          key={i}
          title={`${e.date}: ${e.label}`}
          className={`h-2 flex-1 rounded-full ${statusColor[e.status] || 'bg-war-muted/20'} cursor-pointer hover:opacity-80`}
        />
      ))}
    </div>
  )
}

function TimelineEntry({ entry }) {
  const [open, setOpen] = useState(false)
  const statusDot = {
    overdue: '🔴',
    critical: '🟠',
    due: '🔵',
    upcoming: '🟡',
    past: '⚫',
  }

  return (
    <div className="border-b border-war-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2.5 text-left flex items-start gap-3 hover:bg-war-accent/10 transition-colors"
      >
        <span className="text-sm mt-0.5">{statusDot[entry.status] || '⚫'}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-war-muted font-mono text-xs">{entry.date}</span>
            <StatusBadge status={entry.status} />
            {entry.financial_exposure && <MoneyBadge amount={entry.financial_exposure} />}
          </div>
          <div className="text-war-text text-xs font-bold mt-0.5">{entry.label}</div>
        </div>
        <span className="badge-info text-xs shrink-0">{entry.contract_id?.replace('QH-','').split('-')[0]}</span>
      </button>

      {open && (
        <div className="px-4 pb-3 space-y-2 bg-war-bg/50">
          <div className="text-xs text-war-muted leading-relaxed">{entry.description}</div>
          <div className="text-xs text-war-cyan font-mono">{entry.clause_ref}</div>
          {entry.citations?.map((c, i) => <Citation key={i} citation={c} />)}
        </div>
      )}
    </div>
  )
}

export function NornsPanel({ analysis }) {
  const norns = analysis?.norns_output
  if (!norns) return <div className="text-war-muted p-8 text-center">No timeline data</div>

  const timeline = norns.timeline || []
  const [filter, setFilter] = useState('all')

  const filters = ['all', 'overdue', 'critical', 'upcoming', 'past']
  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.status === filter)

  const counts = {}
  filters.forEach(f => counts[f] = f === 'all' ? timeline.length : timeline.filter(e => e.status === f).length)

  return (
    <div className="space-y-4">
      {/* Visual timeline bar */}
      <div className="card p-4">
        <div className="text-war-purple font-mono font-bold text-sm mb-2">⏱ NORNS — Timeline Visual</div>
        <div className="text-war-muted text-xs mb-3">
          Checkpoint: <span className="text-war-cyan">{norns.clock_position}</span>
          &nbsp;·&nbsp;
          Worst-case exposure: <span className="text-war-gold font-bold">${norns.worst_case?.total_exposure_usd?.toLocaleString()}</span>
        </div>
        <TimelineBar entries={timeline} />
        <div className="flex gap-4 text-xs text-war-muted mt-2">
          <span>🔴 Overdue</span>
          <span>🟠 Critical</span>
          <span>🔵 Due</span>
          <span>🟡 Upcoming</span>
          <span>⚫ Past</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
              filter === f ? 'bg-war-blue text-white border-war-blue' : 'border-war-border text-war-muted hover:border-war-cyan'
            }`}
          >
            {f.toUpperCase()} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div className="card">
        <div className="divide-y divide-war-border/50">
          {filtered.map((entry, i) => <TimelineEntry key={i} entry={entry} />)}
        </div>
      </div>

      {/* Worst case */}
      <div className="card border-war-gold/30">
        <div className="card-header">
          <span className="text-war-gold font-mono font-bold text-sm">⚠ WORST-CASE PROJECTION</span>
          <MoneyBadge amount={norns.worst_case?.total_exposure_usd} />
        </div>
        <div className="p-4 text-war-muted text-xs leading-relaxed whitespace-pre-wrap">
          {norns.worst_case?.scenario}
        </div>
        <div className="px-4 pb-3 text-xs text-war-muted/50 italic">{norns.worst_case?.notes}</div>
      </div>
    </div>
  )
}

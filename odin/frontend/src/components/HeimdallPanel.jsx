import React, { useState } from 'react'
import { StatusBadge, Citation } from './Shared'

function EventCard({ ev }) {
  const [open, setOpen] = useState(false)
  if (ev.noise) return null

  const sevColor = {
    critical: 'border-l-red-500',
    high: 'border-l-orange-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-green-500',
  }

  return (
    <div className={`card mb-2 border-l-2 ${sevColor[ev.severity_alert] || 'border-l-war-border'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-3 text-left flex items-start gap-3 hover:bg-war-accent/10 transition-colors"
      >
        <div className="shrink-0 mt-0.5">
          <span className="text-war-muted font-mono text-xs">{ev.event_id}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <StatusBadge status={ev.severity_alert} />
            <span className="text-war-muted text-xs font-mono">{ev.timestamp?.slice(0, 10)}</span>
          </div>
          <div className="text-war-text text-xs font-bold">{ev.subject}</div>
          {ev.affected_contracts?.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
              {ev.affected_contracts.map(c => (
                <span key={c} className="badge-info">{c.replace('QH-', '').replace('-2026-001', '')}</span>
              ))}
            </div>
          )}
        </div>
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-3 border-t border-war-border pt-3">
          {ev.alert_message && (
            <pre className="text-war-text text-xs leading-relaxed whitespace-pre-wrap font-mono bg-war-bg p-3 rounded border border-war-border">
              {ev.alert_message}
            </pre>
          )}
          {ev.loki_challenge && (
            <div className="p-2 bg-orange-500/10 border border-orange-500/30 rounded text-xs text-orange-300">
              <span className="font-bold">⚔ Heimdall↔Loki: </span>{ev.loki_challenge}
            </div>
          )}
          {ev.affected_clauses?.length > 0 && (
            <div className="text-xs text-war-muted">
              <span className="font-bold">Clauses: </span>{ev.affected_clauses.join(' · ')}
            </div>
          )}
          {ev.citations?.map((c, i) => <Citation key={i} citation={c} />)}
        </div>
      )}
    </div>
  )
}

export function HeimdallPanel({ analysis }) {
  const events = analysis?.heimdall_output?.event_analyses || []
  const alerts = analysis?.heimdall_output?.active_alerts || []
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll ? events : alerts

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <span className="text-blue-400 font-mono font-bold text-sm">
            👁 HEIMDALL — Event Monitor ({alerts.length} active alerts / {events.filter(e=>!e.noise).length} total)
          </span>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-xs font-mono text-war-muted hover:text-war-cyan border border-war-border px-2 py-1 rounded transition-colors"
          >
            {showAll ? 'Show alerts only' : 'Show all events'}
          </button>
        </div>
        {events.filter(e=>e.noise).length > 0 && (
          <div className="px-4 py-2 text-xs text-war-muted border-b border-war-border">
            {events.filter(e=>e.noise).length} noise events filtered (e.g. marketing newsletters)
          </div>
        )}
      </div>

      {displayed.map(ev => <EventCard key={ev.event_id} ev={ev} />)}
    </div>
  )
}

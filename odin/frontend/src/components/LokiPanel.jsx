import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { SeverityBadge, Citation } from './Shared'

function AttackCard({ attack }) {
  const [open, setOpen] = useState(false)
  const statusColor = {
    verified: 'text-green-400',
    refuted: 'text-red-400',
    pending: 'text-yellow-400',
    disputed: 'text-orange-400',
  }

  return (
    <div className={`card mb-3 ${attack.severity === 'critical' ? 'border-red-500/30' : attack.severity === 'high' ? 'border-orange-500/20' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full card-header text-left hover:bg-war-accent/20 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          <SeverityBadge severity={attack.severity} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-war-muted text-xs font-mono">[{attack.attack_id}]</span>
              <span className={`text-xs font-mono ${statusColor[attack.status] || 'text-war-muted'}`}>
                ● {attack.status?.toUpperCase()}
              </span>
            </div>
            <div className="text-war-text text-xs font-bold">{attack.title}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4 shrink-0">
          <span className={`text-xs font-mono ${attack.likelihood === 'certain' ? 'text-red-400' : 'text-yellow-400'}`}>
            {attack.likelihood}
          </span>
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {open && (
        <div className="p-4 space-y-4 border-t border-war-border">
          <div>
            <div className="text-war-muted text-xs mb-2 font-mono">ATTACK PATH:</div>
            <pre className="text-war-text text-xs leading-relaxed whitespace-pre-wrap font-mono bg-war-bg p-3 rounded border border-war-border">
              {attack.attack_path}
            </pre>
          </div>

          {attack.citations?.length > 0 && (
            <div>
              <div className="text-war-muted text-xs mb-2 font-mono">EVIDENCE ({attack.citations.length} citation{attack.citations.length !== 1 ? 's' : ''}):</div>
              {attack.citations.map((c, i) => <Citation key={i} citation={c} />)}
            </div>
          )}

          {attack.cross_contract_refs?.length > 0 && (
            <div className="flex gap-2 items-center text-xs">
              <span className="text-war-muted">Cross-contract refs:</span>
              {attack.cross_contract_refs.map(r => (
                <span key={r} className="badge-info">{r}</span>
              ))}
            </div>
          )}

          {attack.clarification_needed && (
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300">
              <div className="font-bold mb-1">⚠ CLARIFICATION NEEDED (→ Thor):</div>
              {attack.clarification_question}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function LokiPanel({ analysis }) {
  const attacks = analysis?.loki_output?.attacks || []
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = attacks.filter(a => {
    if (filter !== 'all' && a.severity !== filter) return false
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    all: attacks.length,
    critical: attacks.filter(a => a.severity === 'critical').length,
    high: attacks.filter(a => a.severity === 'high').length,
    medium: attacks.filter(a => a.severity === 'medium').length,
    low: attacks.filter(a => a.severity === 'low').length,
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <span className="text-orange-400 font-mono font-bold text-sm">⚔ LOKI — Adversarial Review ({attacks.length} findings)</span>
        </div>
        <div className="p-3 flex gap-2 flex-wrap border-b border-war-border">
          {Object.entries(counts).map(([key, count]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-xs font-mono px-3 py-1 rounded border transition-all ${
                filter === key
                  ? 'bg-war-blue text-white border-war-blue'
                  : 'border-war-border text-war-muted hover:border-war-cyan'
              }`}
            >
              {key.toUpperCase()} ({count})
            </button>
          ))}
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter attacks..."
            className="ml-auto text-xs bg-war-bg border border-war-border rounded px-2 py-1 text-war-text placeholder-war-muted focus:outline-none focus:border-war-cyan"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8 text-war-muted text-sm">No matching attacks</div>
      ) : (
        filtered.map(attack => <AttackCard key={attack.attack_id} attack={attack} />)
      )}
    </div>
  )
}

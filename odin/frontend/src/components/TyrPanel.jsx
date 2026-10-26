import React, { useState } from 'react'
import { ClipboardCopy, CheckCircle, AlertCircle } from 'lucide-react'
import { Citation } from './Shared'

function RulingCard({ ruling }) {
  const verdictColor = {
    loki_sustained: 'text-orange-400',
    heimdall_sustained: 'text-blue-400',
    split: 'text-yellow-400',
    deferred: 'text-war-muted',
  }
  const verdictLabel = {
    loki_sustained: '⚔ LOKI SUSTAINED',
    heimdall_sustained: '👁 HEIMDALL SUSTAINED',
    split: '⚖ SPLIT RULING',
    deferred: '⏸ DEFERRED',
  }

  return (
    <div className="card mb-2">
      <div className="p-3 flex items-start gap-3">
        <span className="badge-info text-xs shrink-0">{ruling.ruling_id}</span>
        <div className="flex-1">
          <div className={`text-xs font-mono font-bold ${verdictColor[ruling.verdict]}`}>
            {verdictLabel[ruling.verdict] || ruling.verdict}
          </div>
          <div className="text-war-muted text-xs mt-1 leading-relaxed">{ruling.rationale}</div>
        </div>
      </div>
    </div>
  )
}

function ActionCard({ action }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const typeColor = {
    credit_rejection: 'text-red-400',
    credit_claim: 'text-green-400',
    escalation_memo: 'text-orange-400',
    clarification_request: 'text-blue-400',
    breach_cure_notice: 'text-red-400',
    renewal_notice: 'text-yellow-400',
    amendment_proposal: 'text-purple-400',
    termination_notice: 'text-red-500',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(action.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`card mb-3 ${action.requires_human_approval ? 'border-yellow-500/30' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full card-header text-left hover:bg-war-accent/20 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono font-bold ${typeColor[action.action_type] || 'text-war-muted'}`}>
              [{action.action_id}] {action.action_type?.replace(/_/g, ' ').toUpperCase()}
            </span>
            {action.requires_human_approval && (
              <span className="text-xs text-yellow-400 border border-yellow-400/40 px-1.5 py-0.5 rounded font-mono">
                ⚠ HUMAN APPROVAL
              </span>
            )}
            <span className="text-war-muted text-xs ml-auto">
              conf: {Math.round((action.confidence || 0) * 100)}%
            </span>
          </div>
          <div className="text-war-text text-xs font-bold">{action.subject}</div>
          <div className="text-war-muted text-xs mt-0.5">
            To: {action.to_party?.slice(0, 60)}{action.to_party?.length > 60 ? '...' : ''}
          </div>
        </div>
      </button>

      {open && (
        <div className="p-4 border-t border-war-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-war-muted">
              <div><span className="text-war-cyan">TO:</span> {action.to_party}</div>
              <div><span className="text-war-cyan">FROM:</span> {action.from_party}</div>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-mono text-war-cyan border border-war-cyan/40 px-2 py-1 rounded hover:bg-war-cyan/10 transition-colors"
            >
              {copied ? <CheckCircle size={12} /> : <ClipboardCopy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          <pre className="text-war-text text-xs leading-relaxed whitespace-pre-wrap font-mono bg-war-bg p-4 rounded border border-war-border max-h-80 overflow-y-auto">
            {action.body}
          </pre>

          {action.citations?.map((c, i) => <Citation key={i} citation={c} />)}

          {action.requires_human_approval && (
            <div className="flex gap-2">
              <button className="flex-1 py-2 text-xs font-mono bg-green-600/20 text-green-400 border border-green-500/40 rounded hover:bg-green-600/30 transition-colors">
                ✓ APPROVE & SEND
              </button>
              <button className="flex-1 py-2 text-xs font-mono bg-red-600/10 text-red-400 border border-red-500/30 rounded hover:bg-red-600/20 transition-colors">
                ✗ REJECT
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function TyrPanel({ analysis }) {
  const tyr = analysis?.tyr_output
  const rulings = tyr?.rulings || []
  const actions = tyr?.actions || []
  const [tab, setTab] = useState('actions')

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <span className="text-green-400 font-mono font-bold text-sm">⚖ TYR — Arbitration & Actions</span>
          <div className="flex gap-2">
            <span className="badge-info">{rulings.length} rulings</span>
            <span className="badge-info">{actions.length} actions</span>
          </div>
        </div>
        <div className="flex border-b border-war-border">
          {['actions', 'rulings'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-mono transition-colors ${
                tab === t ? 'text-war-cyan border-b-2 border-war-cyan bg-war-accent/20' : 'text-war-muted hover:text-war-text'
              }`}
            >
              {t.toUpperCase()} ({t === 'actions' ? actions.length : rulings.length})
            </button>
          ))}
        </div>
      </div>

      {tab === 'actions' && (
        <div>
          {actions.filter(a => a.requires_human_approval).length > 0 && (
            <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-yellow-300 flex items-center gap-2">
              <AlertCircle size={14} />
              {actions.filter(a => a.requires_human_approval).length} action(s) require human approval before sending
            </div>
          )}
          {actions.map(a => <ActionCard key={a.action_id} action={a} />)}
        </div>
      )}

      {tab === 'rulings' && (
        <div>
          {rulings.map(r => <RulingCard key={r.ruling_id} ruling={r} />)}
        </div>
      )}
    </div>
  )
}

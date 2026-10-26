import React, { useState } from 'react'
import { Citation } from './Shared'

function ContractCard({ contract }) {
  const [open, setOpen] = useState(false)
  const ext = contract.extraction

  return (
    <div className="card mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full card-header text-left hover:bg-war-accent/20 transition-colors"
      >
        <div>
          <div className="text-war-cyan font-mono font-bold text-sm">{contract.contract_id}</div>
          <div className="text-war-muted text-xs mt-0.5">{contract.title}</div>
        </div>
        <div className="flex gap-2 items-center">
          {ext?.flags?.length > 0 && (
            <span className="badge-high">{ext.flags.length} flags</span>
          )}
          <span className="badge-info">{ext?.doc_ids?.join(', ')}</span>
        </div>
      </button>

      {open && (
        <div className="p-4 border-t border-war-border space-y-4">
          {/* Parties */}
          <div>
            <div className="text-war-muted text-xs font-mono mb-2">PARTIES:</div>
            <div className="grid grid-cols-2 gap-2">
              {ext?.parties?.map((p, i) => (
                <div key={i} className="text-xs bg-war-bg p-2 rounded border border-war-border">
                  <div className="text-war-cyan text-xs">{p.field?.toUpperCase()}</div>
                  <div className="text-war-text font-bold">{String(p.value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Key terms */}
          <div>
            <div className="text-war-muted text-xs font-mono mb-2">KEY TERMS:</div>
            <div className="space-y-2">
              {[
                { label: 'Effective Date', term: ext?.effective_date },
                { label: 'Subscription Period', term: ext?.subscription_period },
                { label: 'Notice Period', term: ext?.notice_period },
                { label: 'Uptime Target', term: ext?.uptime_target },
                { label: 'Credit Claim Deadline', term: ext?.credit_request_deadline },
                { label: 'Governing Law', term: ext?.governing_law },
              ].filter(x => x.term).map(({ label, term }) => (
                <div key={label} className="flex gap-2 text-xs">
                  <span className="text-war-muted w-36 shrink-0">{label}:</span>
                  <span className={`text-war-text flex-1 ${term.ambiguous ? 'text-yellow-400' : ''}`}>
                    {String(term.value)}
                    {term.ambiguous && <span className="ml-2 text-yellow-500">⚠ AMBIGUOUS</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Fees */}
          {ext?.fees?.length > 0 && (
            <div>
              <div className="text-war-muted text-xs font-mono mb-2">FEES:</div>
              <div className="space-y-1">
                {ext.fees.map((f, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span className="text-war-muted w-36 shrink-0">{f.field?.replace(/_/g,' ')}:</span>
                    <span className="text-war-gold font-mono font-bold">
                      {typeof f.value === 'number' ? `$${f.value.toLocaleString()}` : String(f.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Flags */}
          {ext?.flags?.length > 0 && (
            <div>
              <div className="text-war-muted text-xs font-mono mb-2">⚠ FLAGS:</div>
              <ul className="space-y-1">
                {ext.flags.map((flag, i) => (
                  <li key={i} className="text-xs text-yellow-400 flex gap-2">
                    <span className="shrink-0">•</span>{flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Obligations */}
          {ext?.key_obligations?.length > 0 && (
            <div>
              <div className="text-war-muted text-xs font-mono mb-2">KEY OBLIGATIONS:</div>
              <div className="space-y-2">
                {ext.key_obligations.map((ob, i) => (
                  <div key={i} className="text-xs">
                    <div className="text-war-cyan font-mono">{ob.field?.replace(/_/g,' ')}</div>
                    <div className="text-war-text mt-0.5">{String(ob.value)}</div>
                    <Citation citation={ob.citation} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ThorPanel({ analysis }) {
  const reports = analysis?.company_risk_report?.contract_reports || []

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="card-header">
          <span className="text-yellow-400 font-mono font-bold text-sm">⚡ THOR — Contract Extractions ({reports.length} contracts)</span>
        </div>
      </div>
      {reports.map(r => <ContractCard key={r.contract_id} contract={r} />)}
    </div>
  )
}

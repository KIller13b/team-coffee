import React, { useState } from 'react'
import { Terminal, Shield, MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { AgentBadge } from './Shared'

export function AuditLogPanel({ analysis }) {
  const [filterAgent, setFilterAgent] = useState('all')
  const messages = analysis?.agent_messages || []
  const workstreams = analysis?.workstreams || []

  const agents = ['all', 'Odin', 'Thor', 'Norns', 'Loki', 'Heimdall', 'Tyr']

  const filtered = filterAgent === 'all'
    ? messages
    : messages.filter(m => m.agent?.toLowerCase() === filterAgent.toLowerCase())

  return (
    <div className="space-y-4">
      {/* Workstreams */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Shield className="text-war-cyan" size={16} />
            <span className="text-war-cyan font-mono font-bold text-sm">
              ODIN WORKSTREAMS & MULTI-AGENT WORK PLAN (FR1.2 & FR1.3)
            </span>
          </div>
          <span className="badge-info">{workstreams.length} Workstreams</span>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
          {workstreams.map(ws => (
            <div key={ws.workstream_id} className="p-3 bg-war-bg rounded border border-war-border space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs font-bold text-war-cyan">{ws.workstream_id}</span>
                <span className="text-green-400 font-mono text-xs flex items-center gap-1">
                  <CheckCircle2 size={12} /> {ws.status.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-war-muted">
                {ws.contract_ids.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log / Agent Message Stream */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-2">
            <Terminal className="text-green-400" size={16} />
            <span className="text-green-400 font-mono font-bold text-sm">
              OBSERVABILITY & AGENT DISPATCH AUDIT STREAM (NFR4)
            </span>
          </div>
          <div className="flex gap-1">
            {agents.map(a => (
              <button
                key={a}
                onClick={() => setFilterAgent(a)}
                className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                  filterAgent === a ? 'bg-war-blue text-white border-war-blue' : 'border-war-border text-war-muted hover:text-war-text'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 bg-war-bg font-mono text-xs max-h-[500px] overflow-y-auto space-y-2">
          {filtered.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-3 p-1.5 hover:bg-war-surface/40 rounded transition-colors">
              <span className="text-war-muted shrink-0 text-[11px] mt-0.5">
                {msg.timestamp?.slice(11, 19) || '00:00:00'}
              </span>
              <AgentBadge agent={msg.agent} />
              <span className="text-war-text leading-relaxed flex-1">
                {msg.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

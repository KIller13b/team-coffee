import React from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { AgentInfo, AgentMessage } from '../../types/agent'
import { formatDate } from '../../lib/formatters'
import { CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

interface AgentDetailDrawerProps {
  agent: AgentInfo | null
  onClose: () => void
  agentMessages?: AgentMessage[]
}

export const AgentDetailDrawer: React.FC<AgentDetailDrawerProps> = ({
  agent,
  onClose,
  agentMessages = [],
}) => {
  if (!agent) return null

  const relatedMessages = agentMessages.filter((m) => m.agentId === agent.id)

  return (
    <Drawer
      isOpen={Boolean(agent)}
      onClose={onClose}
      title={`${agent.name} — ${agent.title}`}
      subtitle={agent.role}
      width="lg"
    >
      <div className="space-y-6">
        {/* Header Hero */}
        <div className="p-4 rounded-xl bg-[#10263B] border border-[#1D344B] flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#0D2033] border border-teal-500/30 flex items-center justify-center text-3xl shrink-0 shadow-lg">
            {agent.avatar}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-bold text-[#F1F5F9]">{agent.name}</h4>
              <Badge variant="teal" size="sm" dot>
                {agent.status.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
              {agent.currentTask}
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#94A3B8]">
              <span>
                Completed Tasks:{' '}
                <strong className="text-[#F1F5F9] font-mono">
                  {agent.completedTasksCount}
                </strong>
              </span>
              <span>
                Processed:{' '}
                <strong className="text-[#F1F5F9] font-mono">
                  {agent.totalProcessedCount}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Core Responsibilities */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Core Agentic Responsibilities
          </h5>
          <ul className="space-y-1.5">
            {agent.responsibilities.map((resp, i) => (
              <li
                key={i}
                className="text-xs text-[#F1F5F9] p-2 rounded-lg bg-[#0D2033] border border-[#1D344B]/70 flex items-start gap-2"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Input & Output Contracts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#0D2033] border border-[#1D344B]">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
              Ingestion Stream
            </span>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {agent.inputSummary}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#0D2033] border border-[#1D344B]">
            <span className="text-[10px] uppercase font-bold text-[#64748B] block mb-1">
              Output Artifact
            </span>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {agent.outputSummary}
            </p>
          </div>
        </div>

        {/* Evidence References */}
        <div>
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            Linked Evidence Keys & Audit Coordinates
          </h5>
          <div className="flex flex-wrap gap-2">
            {agent.evidenceReferences.map((ref, idx) => (
              <span
                key={idx}
                className="text-[11px] font-mono bg-[#10263B] text-teal-300 px-2.5 py-1 rounded-md border border-[#1D344B]"
              >
                {ref}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Debate Messages */}
        {relatedMessages.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Recent Agent Dispatches in Consensus Loop
            </h5>
            <div className="space-y-2">
              {relatedMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 rounded-lg bg-[#0D2033] border border-[#1D344B] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F1F5F9]">{msg.title}</span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {formatDate(msg.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="text-[#94A3B8] leading-relaxed">{msg.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Action */}
        <div className="pt-2">
          <Link to={`/agents?agent=${agent.id}`} onClick={onClose}>
            <Button variant="secondary" className="w-full text-xs" icon={<ArrowRight className="w-3.5 h-3.5" />}>
              Open in Multi-Agent Debate Arena
            </Button>
          </Link>
        </div>
      </div>
    </Drawer>
  )
}

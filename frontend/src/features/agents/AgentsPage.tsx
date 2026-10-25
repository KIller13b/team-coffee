import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Bot,
  Scale,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { LoadingState } from '../../components/ui/LoadingState'
import { WorkflowGraph } from './WorkflowGraph'
import { AgentDetailDrawer } from './AgentDetailDrawer'
import { contractsService } from '../../services/contractsService'
import { AgentInfo, AgentMessage, WorkflowStep } from '../../types/agent'
import { AGENT_ROLES, AgentId } from '../../lib/constants'
import { formatDate } from '../../lib/formatters'

export const AgentsPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const agentParam = searchParams.get('agent') as AgentId | null

  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null)
  const [activeTab, setActiveTab] = useState<'debate' | 'graph' | 'pipeline'>('debate')
  const [filterAgent, setFilterAgent] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [agentsData, messagesData, stepsData] = await Promise.all([
          contractsService.getAgents(),
          contractsService.getAgentMessages(),
          contractsService.getWorkflowSteps(),
        ])
        setAgents(agentsData)
        setMessages(messagesData)
        setWorkflowSteps(stepsData)

        if (agentParam) {
          const matched = agentsData.find((a) => a.id === agentParam)
          if (matched) setSelectedAgent(matched)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [agentParam])

  if (isLoading) {
    return <LoadingState message="Connecting to Odin multi-agent consensus bus..." />
  }

  const filteredMessages = messages.filter((m) => {
    if (filterAgent === 'all') return true
    return m.agentId === filterAgent
  })

  return (
    <div className="space-y-6">
      {/* Multi-Agent Overview Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-[#F1F5F9] tracking-tight">
              Odin Autonomous Agent Cluster
            </h2>
          </div>
          <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            All 6 Agents Synchronized
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              interactive
              onClick={() => setSelectedAgent(agent)}
              className="p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-2xl shrink-0">{agent.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#F1F5F9] truncate">{agent.name}</h4>
                      <p className="text-[10px] text-[#94A3B8] truncate">
                        {agent.title}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      agent.status === 'running'
                        ? 'bg-teal-400 animate-pulse'
                        : agent.status === 'waiting'
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    }`}
                  />
                </div>

                <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {agent.currentTask}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-[#1D344B]/60 flex items-center justify-between text-[10px] text-[#64748B]">
                <span>Done: <strong className="text-[#F1F5F9] font-mono">{agent.completedTasksCount}</strong></span>
                <span className="text-teal-400 font-medium">Inspect →</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-[#1D344B] pb-1 text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('debate')}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'debate'
                ? 'bg-[#10263B] text-teal-300 border-b-2 border-teal-400'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0D2033]'
            }`}
          >
            Live Debate & Consensus Arena ({messages.length})
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'graph'
                ? 'bg-[#10263B] text-teal-300 border-b-2 border-teal-400'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0D2033]'
            }`}
          >
            Agent Topology Graph (React Flow)
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors cursor-pointer ${
              activeTab === 'pipeline'
                ? 'bg-[#10263B] text-teal-300 border-b-2 border-teal-400'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0D2033]'
            }`}
          >
            Sequential Execution Pipeline
          </button>
        </div>

        {activeTab === 'debate' && (
          <div className="flex items-center gap-2">
            <span className="text-[#94A3B8] text-xs">Filter Speaker:</span>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-1 focus:outline-none focus:border-teal-400"
            >
              <option value="all">All Agents</option>
              <option value="odin">Odin (Orchestration)</option>
              <option value="thor">Thor (Extraction)</option>
              <option value="norns">Norns (Timeline)</option>
              <option value="loki">Loki (Challenger)</option>
              <option value="heimdall">Heimdall (Sentinel)</option>
              <option value="tyr">Tyr (Arbiter)</option>
            </select>
          </div>
        )}
      </div>

      {/* Tab Content 1: Live Debate Feed */}
      {activeTab === 'debate' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#081727] border border-[#1D344B] flex items-center justify-between text-xs text-[#94A3B8]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>
                Demonstration Dispute Thread: <strong>Apex Cloud 45-day Non-Renewal vs Vanguard ERP 90-day Prerequisite</strong>
              </span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Disagreement Arbitrated by Tyr
            </span>
          </div>

          <div className="space-y-4">
            {filteredMessages.map((msg) => {
              const agentMeta = AGENT_ROLES[msg.agentId]
              const isTyrRuling = msg.agentId === 'tyr'
              const isLokiChallenge = msg.agentId === 'loki'

              return (
                <div
                  key={msg.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isTyrRuling
                      ? 'bg-gradient-to-r from-[#10263B] via-[#0D2033] to-[#122b40] border-amber-500/50 shadow-lg shadow-amber-950/20'
                      : isLokiChallenge
                      ? 'bg-[#0D2033] border-red-500/40'
                      : 'bg-[#0D2033] border-[#1D344B]'
                  }`}
                >
                  {/* Speaker Header */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{agentMeta?.avatar}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#F1F5F9]">
                            {msg.agentName}
                          </h4>
                          <span className="text-[10px] text-[#94A3B8]">
                            • {agentMeta?.title}
                          </span>
                          {msg.disagreementLevel && msg.disagreementLevel !== 'none' && (
                            <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/10 px-1.5 py-0.2 rounded border border-red-500/20">
                              {msg.disagreementLevel} Controversy
                            </span>
                          )}
                          {isTyrRuling && (
                            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                              <Scale className="w-3 h-3" /> Conclusive Arbiter Ruling
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#64748B] font-mono">
                          Stage: {msg.stage.toUpperCase()} • {formatDate(msg.timestamp, 'HH:mm:ss')}
                        </span>
                      </div>
                    </div>

                    <Badge agent={msg.agentId} size="xs">
                      {msg.agentId.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Title & Message Body */}
                  <div className="space-y-2 pl-9">
                    <h5 className="text-xs font-semibold text-[#F1F5F9]">
                      {msg.title}
                    </h5>

                    <p className="text-xs text-[#F1F5F9] leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </p>

                    {/* Verbatim Anchor Evidence if present */}
                    {msg.verbatimEvidence && (
                      <div className="mt-2 p-3 rounded-lg bg-[#081727] border border-teal-500/30 text-xs font-mono text-teal-200 leading-relaxed">
                        <span className="text-[10px] text-[#64748B] block mb-1 uppercase font-bold font-sans">
                          Evidence Anchor ({msg.clauseReference}):
                        </span>
                        "{msg.verbatimEvidence}"
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1D344B]/40 text-[10.5px] text-[#64748B] flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        {msg.contractName && (
                          <span>Target: <strong className="text-[#94A3B8]">{msg.contractName}</strong></span>
                        )}
                        {msg.requiresHumanReview && (
                          <span className="text-amber-400 font-semibold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                            Requires Human Signoff
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {msg.tags?.map((t, idx) => (
                          <span key={idx} className="bg-[#10263B] text-[#94A3B8] px-1.5 py-0.2 rounded font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Topology Graph */}
      {activeTab === 'graph' && (
        <WorkflowGraph
          onSelectAgent={(agentId) => {
            const matched = agents.find((a) => a.id === agentId)
            if (matched) setSelectedAgent(matched)
          }}
        />
      )}

      {/* Tab Content 3: Sequential Pipeline */}
      {activeTab === 'pipeline' && (
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Autonomous Consensus Pipeline Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            {workflowSteps.map((step) => {
              const agentMeta = AGENT_ROLES[step.agentId]
              return (
                <div key={step.id} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-teal-500/15 border border-teal-500/30 flex items-center justify-center font-mono font-bold text-teal-300 text-xs shrink-0">
                    {step.stepNumber}
                  </div>
                  <div className="flex-1 p-3.5 rounded-xl bg-[#10263B] border border-[#1D344B]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{agentMeta?.avatar}</span>
                        <h4 className="text-xs font-bold text-[#F1F5F9]">
                          {step.title}
                        </h4>
                        <span className="text-[10px] text-[#94A3B8]">
                          ({agentMeta?.name})
                        </span>
                      </div>
                      <Badge variant="teal" size="xs">
                        COMPLETED
                      </Badge>
                    </div>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Agent Detail Drawer */}
      <AgentDetailDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agentMessages={messages}
      />
    </div>
  )
}

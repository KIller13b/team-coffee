import React from 'react'
import { Link } from 'react-router-dom'
import { Bot, ArrowRight, Play, CheckCircle2, Clock, PauseCircle, AlertOctagon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { AgentInfo } from '../../types/agent'

interface AgentStatusGridProps {
  agents: AgentInfo[]
  onSelectAgent?: (agent: AgentInfo) => void
}

export const AgentStatusGrid: React.FC<AgentStatusGridProps> = ({ agents, onSelectAgent }) => {
  const getStatusIcon = (status: AgentInfo['status']) => {
    switch (status) {
      case 'running':
        return <Play className="w-2.5 h-2.5 text-teal-400 animate-pulse fill-teal-400 shrink-0" />
      case 'completed':
        return <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
      case 'waiting':
        return <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" />
      case 'idle':
        return <PauseCircle className="w-2.5 h-2.5 text-slate-400 shrink-0" />
      case 'failed':
        return <AlertOctagon className="w-2.5 h-2.5 text-red-400 shrink-0" />
    }
  }

  const getStatusBadge = (status: AgentInfo['status']) => {
    switch (status) {
      case 'running':
        return 'text-teal-300 bg-teal-500/15 border-teal-500/30'
      case 'completed':
        return 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30'
      case 'waiting':
        return 'text-amber-300 bg-amber-500/15 border-amber-500/30'
      case 'idle':
        return 'text-slate-300 bg-slate-500/15 border-slate-500/30'
      case 'failed':
        return 'text-red-300 bg-red-500/15 border-red-500/30'
    }
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <Bot className="w-4 h-4 text-blue-400" />
          Multi-Agent Mesh Telemetry & Live Status
        </CardTitle>
        <Link
          to="/agents"
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors shrink-0"
        >
          Agent Workflow & Debate
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-4">
        {/* 3x2 responsive grid so each card has ample horizontal breathing room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {agents.map((agent) => (
            <Link
              key={agent.id}
              to={`/agents?agent=${agent.id}`}
              onClick={(e) => {
                if (onSelectAgent) {
                  e.preventDefault()
                  onSelectAgent(agent)
                }
              }}
              className="p-3.5 rounded-xl bg-[#10263B]/60 hover:bg-[#10263B] border border-[#1D344B] hover:border-teal-500/40 transition-all flex flex-col justify-between group min-w-0"
            >
              <div>
                {/* Header row: avatar + titles + status badge */}
                <div className="flex items-start justify-between gap-2.5 mb-2.5">
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-lg bg-[#081727] border border-[#1D344B] flex items-center justify-center text-lg shrink-0 group-hover:border-teal-500/40 transition-colors">
                      {agent.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#F1F5F9] group-hover:text-teal-300 transition-colors truncate">
                        {agent.name}
                      </h4>
                      <p className="text-[10.5px] text-[#94A3B8] truncate leading-tight mt-0.5">
                        {agent.title}
                      </p>
                    </div>
                  </div>

                  {/* Status badge pill */}
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border shrink-0 whitespace-nowrap leading-none ${getStatusBadge(
                      agent.status
                    )}`}
                  >
                    {getStatusIcon(agent.status)}
                    <span className="capitalize">{agent.status}</span>
                  </span>
                </div>

                {/* Current task description */}
                <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">
                  {agent.currentTask}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2.5 border-t border-[#1D344B]/40 flex items-center justify-between text-[10.5px] text-[#64748B]">
                <span>
                  Tasks Done: <strong className="text-[#F1F5F9] font-mono">{agent.completedTasksCount}</strong>
                </span>
                <span className="text-teal-400 font-medium group-hover:underline flex items-center gap-0.5">
                  Inspect →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

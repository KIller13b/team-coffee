import React from 'react';
import {
  Flame,
  Eye,
  Scale,
  Layers,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import {
  AgentStageTrace,
  AgentDebateItem,
} from '../../../types/assistant';

interface AgentDebateViewProps {
  agentTraces: AgentStageTrace[];
  debateItems: AgentDebateItem[];
}

export const AgentDebateView: React.FC<AgentDebateViewProps> = ({
  agentTraces,
  debateItems,
}) => {
  const agentIcons: Record<string, string> = {
    thor: '⚡',
    norns: '⏳',
    loki: '🔥',
    heimdall: '👁️',
    tyr: '⚖️',
    odin: '👑',
  };

  const agentBorderColors: Record<string, string> = {
    thor: 'border-teal-500/40 bg-teal-500/10 text-teal-300',
    norns: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    loki: 'border-red-500/40 bg-red-500/10 text-red-400',
    heimdall: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    tyr: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    odin: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  };

  return (
    <div className="space-y-5">
      {/* 1. Multi-Agent Sequential Execution Pipeline */}
      <Card className="border-[#1D344B]">
        <CardHeader className="border-b border-[#1D344B]/60 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-teal-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
              Multi-Agent Investigation Pipeline (Actual Measured Execution)
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-teal-300 px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
            6 Specialized Roles
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {agentTraces.map((trace) => {
              const icon = agentIcons[trace.agentId] || '🤖';
              const colorClass = agentBorderColors[trace.agentId] || 'border-teal-500/30';

              return (
                <div
                  key={trace.agentId}
                  className="p-3 rounded-xl bg-[#081727] border border-[#1D344B] hover:border-teal-500/30 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{icon}</span>
                      <div>
                        <h5 className="text-xs font-bold text-[#F1F5F9]">{trace.agentName}</h5>
                        <span className="text-[9.5px] text-[#64748B] block truncate max-w-[140px]">
                          {trace.role}
                        </span>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 font-semibold">
                      {trace.executionDurationMs}ms
                    </span>
                  </div>

                  <p className="text-[11px] text-[#94A3B8] leading-relaxed">
                    {trace.summary}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-[#64748B] pt-1 border-t border-[#1D344B]/40">
                    <span className="text-teal-400">Status: {trace.status}</span>
                    <span>{trace.claimsCount} Findings</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. Red-Team Adversarial Debate & Binding Rulings */}
      <Card className="border-[#1D344B] overflow-hidden">
        <CardHeader className="bg-[#081727] border-b border-[#1D344B] pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-400" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
              Agent Deliberation & Arbitration Directives
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
            {debateItems.length} Key Debates
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {debateItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#94A3B8]">
              No active disputes requiring arbitration for this query.
            </div>
          ) : (
            debateItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#0D2033] border border-[#1D344B] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#1D344B]/60">
                  <h4 className="text-xs font-bold text-[#F1F5F9] font-mono">
                    Topic: {item.topic}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                    Events: {item.correlatedEvents.join(', ') || 'N/A'}
                  </span>
                </div>

                {/* Loki Adversarial Challenge */}
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <Flame className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10.5px] font-bold text-red-300 uppercase tracking-wider font-mono">
                      Loki — Adversarial Red-Team Challenge:
                    </span>
                  </div>
                  <p className="text-xs text-[#E2E8F0] leading-relaxed">
                    {item.lokiChallenge}
                  </p>
                  <span className="text-[10px] text-[#94A3B8] font-mono block">
                    Attack Citation: {item.lokiEvidenceCitation}
                  </span>
                </div>

                {/* Heimdall Sentinel Fact Check */}
                <div className="p-3 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10.5px] font-bold text-blue-300 uppercase tracking-wider font-mono">
                      Heimdall — Sentinel Event Log Verification ({item.heimdallStatus}):
                    </span>
                  </div>
                  <p className="text-xs text-[#E2E8F0] leading-relaxed">
                    {item.heimdallVerification}
                  </p>
                </div>

                {/* Tyr Binding Arbitration Verdict */}
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10.5px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
                      Tyr — Binding Arbitration Ruling:
                    </span>
                  </div>
                  <p className="text-xs text-[#E2E8F0] font-medium leading-relaxed">
                    {item.tyrVerdict}
                  </p>
                  <span className="text-[10px] text-teal-300 font-mono block">
                    Governing Legal Authority: {item.tyrLegalBasis}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

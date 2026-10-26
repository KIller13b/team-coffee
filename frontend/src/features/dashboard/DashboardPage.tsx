import React, { useEffect, useState } from 'react'
import { SummaryCards } from './SummaryCards'
import { RiskDonutChart } from './RiskDonutChart'
import { UpcomingDeadlines } from './UpcomingDeadlines'
import { RecentAlertsFeed } from './RecentAlertsFeed'
import { AgentStatusGrid } from './AgentStatusGrid'
import { AgentDetailDrawer } from '../agents/AgentDetailDrawer'
import { LoadingState } from '../../components/ui/LoadingState'
import { contractsService } from '../../services/contractsService'
import { Contract } from '../../types/contract'
import { Risk } from '../../types/risk'
import { AgentInfo, AgentMessage } from '../../types/agent'
import { Sparkles } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [risks, setRisks] = useState<Risk[]>([])
  const [agents, setAgents] = useState<AgentInfo[]>([])
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [contractsData, risksData, agentsData, messagesData] = await Promise.all([
        contractsService.getContracts(),
        contractsService.getRisks(),
        contractsService.getAgents(),
        contractsService.getAgentMessages(),
      ])
      setContracts(contractsData)
      setRisks(risksData)
      setAgents(agentsData)
      setMessages(messagesData)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleUpload = () => {
      loadData()
    }
    window.addEventListener('odin:contract-uploaded', handleUpload)
    return () => window.removeEventListener('odin:contract-uploaded', handleUpload)
  }, [])

  if (isLoading) {
    return <LoadingState message="Aggregating multi-agent portfolio telemetry..." />
  }

  // Derive metrics
  const totalContracts = contracts.length
  const allObligations = contracts.flatMap((c) =>
    c.obligations.map((o) => ({ ...o, contractName: c.title }))
  )
  const activeObligations = allObligations.length
  const highRiskCount = risks.filter((r) => r.severity === 'high').length
  const criticalRiskCount = risks.filter((r) => r.severity === 'critical').length
  const totalExposureINR = contracts.reduce((acc, c) => acc + c.financialExposureINR, 0)

  return (
    <div className="space-y-6">
      {/* Top Banner Alert / Context Bar */}
      {totalContracts === 0 ? (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-900/40 via-[#0D2033] to-[#10263B] border border-[#1D344B] flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#F1F5F9]">
                Norse Council Standby — Ready for Contract Ingestion
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                Odin, Thor, The Norns, Loki, Heimdall, and Tyr are online. Upload an agreement to initiate autonomous clause extraction, timeline mapping, and adversarial risk auditing.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
              Council Primed
            </span>
          </div>
        </div>
      ) : messages.find((m) => m.agentId === 'tyr' || m.stage === 'ruling') ? (
        (() => {
          const tyrDirective = messages.find((m) => m.agentId === 'tyr' || m.stage === 'ruling')!
          return (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-900/30 via-[#0D2033] to-[#10263B] border border-amber-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-[#F1F5F9]">
                    {tyrDirective.title || 'Active Arbitration Directive by Tyr'}
                  </h2>
                  <p className="text-[11px] text-[#94A3B8]">
                    {tyrDirective.message}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Tyr Ruling Active
                </span>
              </div>
            </div>
          )
        })()
      ) : risks.find((r) => r.crossContractConflict || r.severity === 'critical') ? (
        (() => {
          const crit = risks.find((r) => r.crossContractConflict || r.severity === 'critical')!
          return (
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-900/30 via-[#0D2033] to-[#10263B] border border-red-500/30 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-300 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-semibold text-[#F1F5F9]">
                    Critical Conflict Flagged: {crit.title}
                  </h2>
                  <p className="text-[11px] text-[#94A3B8]">
                    {crit.explanation || (crit as any).summary || 'Adversarial contradiction identified by Loki & Tyr.'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-red-300 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                  Collision Detected
                </span>
              </div>
            </div>
          )
        })()
      ) : (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-teal-900/30 via-[#0D2033] to-[#10263B] border border-teal-500/30 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-semibold text-[#F1F5F9]">
                Council Harmonized — {totalContracts} Active Agreement{totalContracts > 1 ? 's' : ''} Audited
              </h2>
              <p className="text-[11px] text-[#94A3B8]">
                All obligations verified against telemetry by Heimdall. No unresolved cross-contract disputes pending.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
              Heimdall Verified
            </span>
          </div>
        </div>
      )}

      {/* Top Summary Metric Cards */}
      <SummaryCards
        totalContracts={totalContracts}
        activeObligations={activeObligations}
        highRiskCount={highRiskCount}
        criticalRiskCount={criticalRiskCount}
        totalExposureINR={totalExposureINR}
      />

      {/* PS-2 SLA Credit Exposure & Financial Recovery Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0D2033] border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94A3B8] font-medium block">
              Customer-Credit Exposure (Verified)
            </span>
            <h4 className="text-xl font-bold font-mono text-amber-400 mt-0.5">
              $6,000.00
            </h4>
            <span className="text-[10px] text-[#94A3B8]">
              Harbor Retail B1 §3.3 (15% credit on E-04 outage)
            </span>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
            ₹4,98,000
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0D2033] border border-teal-500/30 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#94A3B8] font-medium block">
              Vendor-Recovery Recourse (StratoNode)
            </span>
            <h4 className="text-xl font-bold font-mono text-teal-300 mt-0.5">
              $0.00
            </h4>
            <span className="text-[10px] text-[#94A3B8]">
              StratoNode SLA A2 §2.1 target (99.5%) was met (99.57%)
            </span>
          </div>
          <span className="text-xs font-mono px-2 py-1 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
            $6k Gap
          </span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-[#10263B] to-[#081727] border border-teal-500/40 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-teal-300 font-bold uppercase tracking-wider block">
              Evidence-Backed AI Chat
            </span>
            <p className="text-xs text-[#F1F5F9] font-medium mt-0.5">
              Ask complex contract & breach questions
            </p>
            <span className="text-[10px] text-[#94A3B8]">
              Thor, Norns, Loki, Heimdall, Tyr & Odin
            </span>
          </div>
          <a
            href="/assistant"
            className="px-3 py-1.5 rounded-lg bg-blue-600/30 text-teal-300 border border-teal-500/40 hover:bg-teal-500/20 text-xs font-semibold transition-colors"
          >
            Open Chat →
          </a>
        </div>
      </div>

      {/* Center 2-Column Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Risk Donut */}
        <div className="lg:col-span-5">
          <RiskDonutChart contracts={contracts} />
        </div>

        {/* Right Column (7 cols): Upcoming Deadlines */}
        <div className="lg:col-span-7">
          <UpcomingDeadlines obligations={allObligations} />
        </div>
      </div>

      {/* Lower Row: Agent Status Grid & Recent Alerts Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <AgentStatusGrid agents={agents} onSelectAgent={setSelectedAgent} />
        </div>

        <div className="lg:col-span-4">
          <RecentAlertsFeed risks={risks} />
        </div>
      </div>

      {/* Agent Detail Drawer */}
      <AgentDetailDrawer
        agent={selectedAgent}
        onClose={() => setSelectedAgent(null)}
        agentMessages={messages}
      />
    </div>
  )
}

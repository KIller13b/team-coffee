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
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 via-[#0D2033] to-[#10263B] border border-blue-500/30 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-[#F1F5F9]">
              Active Arbitration Directive by Tyr
            </h2>
            <p className="text-[11px] text-[#94A3B8]">
              StratoNode SLA discrepancy quarantined by Tyr to protect Harbor Retail downstream warranties.
              Bridge extension addendum and high-availability failover active.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
            Heimdall Verified
          </span>
        </div>
      </div>

      {/* Top Summary Metric Cards */}
      <SummaryCards
        totalContracts={totalContracts}
        activeObligations={activeObligations}
        highRiskCount={highRiskCount}
        criticalRiskCount={criticalRiskCount}
        totalExposureINR={totalExposureINR}
      />

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

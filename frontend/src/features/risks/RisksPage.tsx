import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  Search,
  ShieldAlert,
  GitCommit,
  ChevronRight,
  Scale,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { RiskDetailDrawer } from './RiskDetailDrawer'
import { contractsService } from '../../services/contractsService'
import { Risk } from '../../types/risk'
import { Contract } from '../../types/contract'
import { formatINR } from '../../lib/formatters'

export const RisksPage: React.FC = () => {
  const [searchParams] = useSearchParams()
  const initialRiskId = searchParams.get('id')

  const [risks, setRisks] = useState<Risk[]>([])
  const [contracts, setContracts] = useState<Contract[]>([])
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [contractFilter, setContractFilter] = useState<string>('all')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [risksData, contractsData] = await Promise.all([
          contractsService.getRisks(),
          contractsService.getContracts(),
        ])
        setRisks(risksData)
        setContracts(contractsData)

        if (initialRiskId) {
          const match = risksData.find((r) => r.id === initialRiskId)
          if (match) setSelectedRisk(match)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [initialRiskId])

  if (isLoading) {
    return <LoadingState message="Scanning contract portfolio for hidden liabilities and collisions..." />
  }

  // Summary Metrics
  const criticalCount = risks.filter((r) => r.severity === 'critical').length
  const highCount = risks.filter((r) => r.severity === 'high').length
  const crossCollisionCount = risks.filter((r) => Boolean(r.crossContractConflict)).length
  const totalExposureINR = risks.reduce((acc, r) => acc + r.financialExposureINR, 0)

  // Filter list
  const filteredRisks = risks.filter((r) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      (r.title || '').toLowerCase().includes(q) ||
      (r.explanation || (r as any).summary || '').toLowerCase().includes(q) ||
      (r.contractName || '').toLowerCase().includes(q) ||
      (r.counterparty || '').toLowerCase().includes(q)

    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter
    const matchesContract = contractFilter === 'all' || r.contractId === contractFilter

    return matchesSearch && matchesSeverity && matchesStatus && matchesContract
  })

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0D2033] border-red-500/30">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Critical & High Risks</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-2xl font-bold text-red-400 font-mono mt-1">
            {criticalCount + highCount}
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            {criticalCount} critical liabilities flagged by Loki
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Cross-Contract Collisions</span>
            <GitCommit className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-2xl font-bold text-amber-400 font-mono mt-1">
            {crossCollisionCount}
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Opposing termination notice timelines
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Arbitrated by Tyr</span>
            <Scale className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-2xl font-bold text-teal-300 font-mono mt-1">
            {risks.filter((r) => r.status === 'arbitrated').length}
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Binding operational rulings rendered
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between text-xs text-[#94A3B8]">
            <span>Total Risk Exposure</span>
            <span className="font-mono text-xs text-amber-400">INR</span>
          </div>
          <h3 className="text-2xl font-bold text-[#F1F5F9] font-mono mt-1">
            {formatINR(totalExposureINR, true)}
          </h3>
          <p className="text-[11px] text-[#94A3B8] mt-1">
            Quantified liability exposure across portfolio
          </p>
        </Card>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#081727] p-3.5 rounded-xl border border-[#1D344B]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search risks, clause terms, or explanations..."
            className="w-full pl-9 pr-3 py-2 bg-[#10263B] border border-[#1D344B] rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="arbitrated">Arbitrated by Tyr</option>
            <option value="mitigated">Mitigated</option>
          </select>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-2 max-w-[200px] truncate focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Contracts</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#0D2033] text-[#F1F5F9]">
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Risks List Cards */}
      {filteredRisks.length === 0 ? (
        <EmptyState
          title="No Risks Found"
          description="No risks matched your active filters. Try broadening your search or resetting filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('')
            setSeverityFilter('all')
            setStatusFilter('all')
            setContractFilter('all')
          }}
        />
      ) : (
        <div className="space-y-3">
          {filteredRisks.map((risk) => {
            const isCollision = Boolean(risk.crossContractConflict)

            return (
              <Card
                key={risk.id}
                interactive
                onClick={() => setSelectedRisk(risk)}
                className={`p-5 transition-all ${
                  risk.severity === 'critical'
                    ? 'border-red-500/40 hover:border-red-400/70'
                    : risk.severity === 'high'
                    ? 'border-orange-500/30 hover:border-orange-400/60'
                    : 'border-[#1D344B]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isCollision ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                          <GitCommit className="w-3.5 h-3.5" />
                          CROSS-CONTRACT COLLISION
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          CONTRACTUAL RISK
                        </span>
                      )}

                      <Badge risk={risk.severity} size="xs" dot>
                        {risk.severity.toUpperCase()}
                      </Badge>

                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#081727] text-[#94A3B8] border border-[#1D344B]">
                        Status: {risk.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F1F5F9] hover:text-teal-300 transition-colors">
                      {risk.title}
                    </h3>

                    <p className="text-xs text-[#94A3B8] line-clamp-2 leading-relaxed">
                      {risk.explanation || (risk as any).summary || 'Contractual liability analyzed by Loki.'}
                    </p>
                  </div>

                  <div className="flex items-center lg:flex-col items-end justify-between border-t lg:border-t-0 pt-2 lg:pt-0 border-[#1D344B]/60 lg:pl-6 shrink-0 min-w-[160px]">
                    <div className="text-right">
                      <span className="text-[10.5px] text-[#94A3B8] block">Financial Exposure</span>
                      <span className="text-base font-bold text-amber-400 font-mono">
                        {formatINR(risk.financialExposureINR, true)}
                      </span>
                    </div>

                    <span className="text-[11px] text-teal-400 mt-2 flex items-center gap-1 font-medium">
                      Inspect Evidence & Ruling
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1D344B]/60 text-[11px] text-[#64748B] flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-[#94A3B8]">
                      Contract: <strong>{risk.contractName || risk.contractId}</strong>
                    </span>
                    <span>•</span>
                    <span>Citation: <strong className="text-teal-300 font-mono">{risk.evidenceClause || (risk as any).citation || 'Verified Section'}</strong></span>
                  </div>
                  <span className="font-mono text-[#64748B]">
                    Flagged by Agent {(risk.identifiedBy || 'loki').toUpperCase()}
                  </span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Risk Detail Drawer */}
      <RiskDetailDrawer
        risk={selectedRisk}
        onClose={() => setSelectedRisk(null)}
      />
    </div>
  )
}

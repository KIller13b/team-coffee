import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  ChevronRight,
} from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { LoadingState } from '../../components/ui/LoadingState'
import { ContractUploadModal } from '../../components/contracts/ContractUploadModal'
import { contractsService } from '../../services/contractsService'
import { Contract, RiskLevel } from '../../types/contract'
import { formatDate, formatINR } from '../../lib/formatters'

export const ContractsListPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRisk, setSelectedRisk] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'title' | 'risk' | 'renewalDate' | 'exposure'>('risk')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const loadContracts = async () => {
    try {
      setIsLoading(true)
      const data = await contractsService.getContracts()
      setContracts(data)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadContracts()

    const handleUpload = () => {
      loadContracts()
    }
    window.addEventListener('odin:contract-uploaded', handleUpload)
    return () => window.removeEventListener('odin:contract-uploaded', handleUpload)
  }, [])

  // Filter & Sort
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractType.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRisk = selectedRisk === 'all' || c.riskLevel === selectedRisk
    const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus

    return matchesSearch && matchesRisk && matchesStatus
  })

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === 'renewalDate') return new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime()
    if (sortBy === 'exposure') return b.financialExposureINR - a.financialExposureINR
    if (sortBy === 'risk') {
      const weight: Record<RiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 }
      return weight[b.riskLevel] - weight[a.riskLevel]
    }
    return 0
  })

  if (isLoading) {
    return <LoadingState message="Fetching enterprise contract repository..." />
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#081727] p-3.5 rounded-xl border border-[#1D344B]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by contract name, vendor, or category..."
            className="w-full pl-9 pr-3 py-2 bg-[#10263B] border border-[#1D344B] rounded-lg text-xs text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-teal-400"
          />
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-400"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#10263B] border border-[#1D344B] text-xs text-[#94A3B8] rounded-lg px-2.5 py-2 focus:outline-none focus:border-teal-400"
          >
            <option value="risk">Sort by Risk Severity</option>
            <option value="renewalDate">Sort by Renewal Date</option>
            <option value="exposure">Sort by Financial Exposure</option>
            <option value="title">Sort by Title</option>
          </select>

          {/* Add Contract Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsUploadOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Add Contract
          </Button>
        </div>
      </div>

      {/* Contract Count Stats */}
      <div className="flex items-center justify-between text-xs text-[#94A3B8] px-1">
        <span>
          Showing <strong className="text-[#F1F5F9]">{sortedContracts.length}</strong> of{' '}
          <strong className="text-[#F1F5F9]">{contracts.length}</strong> contracts
        </span>
        <span className="font-mono text-[11px] text-teal-300">
          All documents indexed with Thor verbatim verification
        </span>
      </div>

      {/* Contracts Table */}
      {sortedContracts.length === 0 ? (
        <EmptyState
          title="No contracts found"
          description="No contracts match your search and filter criteria. Try clearing filters or upload a new contract."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('')
            setSelectedRisk('all')
            setSelectedStatus('all')
          }}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#1D344B] bg-[#081727]/70 text-[#94A3B8] uppercase tracking-wider font-semibold text-[10.5px]">
                  <th className="py-3 px-4">Contract & Counterparty</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Term Duration</th>
                  <th className="py-3 px-4">Renewal Notice</th>
                  <th className="py-3 px-4">Exposure</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1D344B]/60 text-[#F1F5F9]">
                {sortedContracts.map((contract) => (
                  <tr
                    key={contract.id}
                    className="hover:bg-[#10263B]/50 transition-colors group"
                  >
                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/contracts/${contract.id}`}
                        className="font-semibold text-[#F1F5F9] group-hover:text-teal-300 transition-colors block truncate"
                      >
                        {contract.title}
                      </Link>
                      <span className="text-[11px] text-[#94A3B8] truncate block">
                        {contract.counterparty}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#94A3B8] truncate max-w-[180px]">
                      {contract.contractType}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-[#94A3B8]">
                      {formatDate(contract.startDate, 'MMM yyyy')} – {formatDate(contract.endDate, 'MMM yyyy')}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono text-[11px] text-[#F1F5F9]">
                        {formatDate(contract.renewalDate)}
                      </span>
                      {new Date(contract.renewalDate) <= new Date('2026-11-15') && (
                        <span className="block text-[10px] text-amber-400 font-semibold">
                          Imminent Window
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-medium text-[#F1F5F9]">
                      {formatINR(contract.financialExposureINR, true)}
                    </td>

                    <td className="py-3 px-4">
                      <Badge risk={contract.riskLevel} size="xs" dot>
                        {contract.riskLevel}
                      </Badge>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          contract.analysisStatus === 'flagged'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : contract.analysisStatus === 'pending_arbitration'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {contract.analysisStatus.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link to={`/contracts/${contract.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-teal-300 hover:text-white">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Upload Modal */}
      <ContractUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={loadContracts}
      />
    </div>
  )
}

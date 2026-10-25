import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Scale,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { ProgressBar } from '../../components/ui/ProgressBar'
import { ClauseDetailDrawer } from './ClauseDetailDrawer'
import { LoadingState } from '../../components/ui/LoadingState'
import { EmptyState } from '../../components/ui/EmptyState'
import { contractsService } from '../../services/contractsService'
import { Contract, ContractClause } from '../../types/contract'
import { formatDate, formatINR, formatConfidence } from '../../lib/formatters'

export const ContractDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [contract, setContract] = useState<Contract | null>(null)
  const [allContracts, setAllContracts] = useState<Contract[]>([])
  const [activeTab, setActiveTab] = useState<'overview' | 'clauses' | 'obligations' | 'timeline' | 'related'>('overview')
  const [selectedClause, setSelectedClause] = useState<ContractClause | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        if (id) {
          const [c, all] = await Promise.all([
            contractsService.getContractById(id),
            contractsService.getContracts(),
          ])
          setContract(c)
          setAllContracts(all)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (isLoading) {
    return <LoadingState message="Extracting contract clauses and obligations..." />
  }

  if (!contract) {
    return (
      <EmptyState
        title="Contract Not Found"
        description="The requested contract does not exist or has not yet been processed by Odin."
        actionLabel="Back to Contracts"
        onAction={() => window.history.back()}
      />
    )
  }

  const relatedContracts = allContracts.filter(
    (c) => contract.relatedContractIds?.includes(c.id) || c.relatedContractIds?.includes(contract.id)
  )

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/contracts"
          className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#F1F5F9] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Contracts</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-[#081727] border border-[#1D344B]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg lg:text-xl font-bold text-[#F1F5F9] tracking-tight">
                {contract.title}
              </h2>
              <Badge risk={contract.riskLevel} size="sm" dot>
                {contract.riskLevel.toUpperCase()} RISK
              </Badge>
              <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                {contract.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#94A3B8] flex-wrap">
              <span className="flex items-center gap-1.5 text-[#F1F5F9]">
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                {contract.counterparty}
              </span>
              <span>•</span>
              <span className="text-[#94A3B8]">{contract.contractType}</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono text-teal-300">
                <Scale className="w-3.5 h-3.5" />
                {contract.jurisdiction}
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 border-t lg:border-t-0 lg:border-l border-[#1D344B] pt-3 lg:pt-0 lg:pl-6 text-xs">
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Total Value</span>
              <span className="text-sm font-bold text-[#F1F5F9] font-mono">
                {formatINR(contract.totalValueINR, true)}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Exposure At Risk</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {formatINR(contract.financialExposureINR, true)}
              </span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Thor Confidence</span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                {formatConfidence(contract.confidenceScore)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#1D344B] overflow-x-auto pb-1 text-xs">
        {[
          { key: 'overview', label: 'Overview & Metadata' },
          { key: 'clauses', label: `Extracted Clauses (${contract.clauses?.length || 0})` },
          { key: 'obligations', label: `Obligations (${contract.obligations?.length || 0})` },
          { key: 'timeline', label: 'Timeline Milestones' },
          { key: 'related', label: `Related Contracts (${relatedContracts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? 'bg-[#10263B] text-teal-300 border-b-2 border-teal-400'
                : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#0D2033]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary & Scope</CardTitle>
                <span className="text-xs text-[#94A3B8] font-mono">ID: {contract.id}</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-[#F1F5F9] leading-relaxed">
                  {contract.summary || 'Verified document indexed into the Odin Multi-Agent War Room.'}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(contract.tags || []).map((tag, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2 py-0.5 rounded bg-[#10263B] text-teal-300 border border-[#1D344B]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Key Commercial Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Core Governance & Renewal Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-[#F1F5F9] mb-1">
                    Auto-Renewal Conditions
                  </h4>
                  <div className="p-3 rounded-lg bg-[#10263B] border border-[#1D344B] text-[#94A3B8] leading-relaxed font-mono">
                    {contract.autoRenewalConditions || 'No automatic renewal covenants detected.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#F1F5F9] mb-1">
                    Payment & Billing Terms
                  </h4>
                  <div className="p-3 rounded-lg bg-[#10263B] border border-[#1D344B] text-[#94A3B8] leading-relaxed font-mono">
                    {contract.paymentSchedule || 'Standard billing terms apply / not specified.'}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Metadata Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Temporal Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-[#1D344B]/60">
                  <span className="text-[#94A3B8]">Effective Start Date</span>
                  <span className="font-mono text-[#F1F5F9]">{formatDate(contract.startDate)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1D344B]/60">
                  <span className="text-[#94A3B8]">Expiration Date</span>
                  <span className="font-mono text-[#F1F5F9]">{formatDate(contract.endDate)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1D344B]/60">
                  <span className="text-[#94A3B8]">Notice Cutoff Date</span>
                  <span className="font-mono text-amber-400 font-semibold">{formatDate(contract.renewalDate)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#94A3B8]">Total Term Duration</span>
                  <span className="font-mono text-[#F1F5F9]">{contract.durationMonths} Months</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Agentic Verification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#94A3B8]">Extraction Confidence</span>
                    <span className="font-mono text-teal-300 font-semibold">
                      {formatConfidence(contract.confidenceScore)}
                    </span>
                  </div>
                  <ProgressBar value={contract.confidenceScore * 100} color="teal" size="sm" />
                </div>
                <p className="text-[11px] text-[#64748B] leading-relaxed pt-1">
                  Verified with optical character extraction checksum against master contract repository.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Extracted Clauses */}
      {activeTab === 'clauses' && (
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Extracted Contract Clauses & Evidence</CardTitle>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Click any clause row to inspect verbatim evidence citations and AI-generated interpretations.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(!contract.clauses || contract.clauses.length === 0) ? (
              <div className="p-6">
                <EmptyState
                  title="No Clauses Extracted"
                  description={
                    contract.tags?.includes('Non-Contractual')
                      ? 'Zero commercial clauses detected. Verified as non-contractual content under Zero Hallucination policy (NFR2).'
                      : 'No clauses have been extracted for this document yet.'
                  }
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1D344B] bg-[#081727]/70 text-[#94A3B8] uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Field / Covenant</th>
                      <th className="py-3 px-4">Extracted Value</th>
                      <th className="py-3 px-4">Clause Citation</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Thor Confidence</th>
                      <th className="py-3 px-4 text-right">Evidence Anchor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D344B]/60 text-[#F1F5F9]">
                    {contract.clauses.map((clause) => (
                      <tr
                        key={clause.id}
                        onClick={() => setSelectedClause(clause)}
                        className="hover:bg-[#10263B]/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-semibold text-[#F1F5F9] group-hover:text-teal-300">
                          {clause.field || (clause as any).title || 'Contract Covenant'}
                        </td>
                        <td className="py-3 px-4 max-w-xs text-[#94A3B8] truncate">
                          {clause.extractedValue || (clause as any).text || (clause as any).title || 'Extracted term'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-teal-300">
                          {clause.clauseCitation || (clause as any).section || 'Referenced Section'}
                        </td>
                        <td className="py-3 px-4 capitalize text-[#94A3B8]">
                          {clause.category || (clause as any).type || 'General'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] text-[#F1F5F9]">
                              {formatConfidence(clause.confidenceScore)}
                            </span>
                            <div className="w-12">
                              <ProgressBar value={clause.confidenceScore * 100} size="xs" color="teal" />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClause(clause);
                            }}
                            className="text-[11px] text-teal-400 hover:text-teal-300 hover:underline cursor-pointer py-1 px-2.5 rounded bg-teal-500/10 border border-teal-500/30 font-medium transition-colors"
                          >
                            View Citation →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Obligations */}
      {activeTab === 'obligations' && (
        <div className="space-y-4">
          {(!contract.obligations || contract.obligations.length === 0) ? (
            <EmptyState
              title="No Active Obligations"
              description={
                contract.tags?.includes('Non-Contractual')
                  ? 'Zero legal obligations or liability covenants found in non-contractual document.'
                  : 'No operational obligations or upcoming compliance deadlines detected.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.obligations.map((ob) => (
                <Card key={ob.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-[#F1F5F9]">{ob.title}</h4>
                    <Badge risk={ob.severity} size="xs" dot>
                      {ob.severity}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {ob.description}
                  </p>
                  <div className="pt-2 border-t border-[#1D344B]/60 flex items-center justify-between text-[11px] text-[#94A3B8]">
                    <span>Due Date: <strong className="text-[#F1F5F9] font-mono">{formatDate(ob.dueDate)}</strong></span>
                    <span>Exposure: <strong className="text-amber-400 font-mono">{formatINR(ob.financialExposureINR, true)}</strong></span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Timeline */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Contract Obligation Milestones</CardTitle>
            <Link to="/timeline" className="text-xs text-teal-400 hover:underline">
              Launch Interactive Timeline Simulator →
            </Link>
          </div>
          {(!contract.obligations || contract.obligations.length === 0) ? (
            <div className="py-12 text-center text-xs text-[#94A3B8]">
              <Clock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-[#F1F5F9]">No Temporal Milestones</p>
              <p className="text-[11px] text-[#64748B] mt-1">
                This document does not contain time-bound notice cutoffs or payment triggers.
              </p>
            </div>
          ) : (
            <div className="relative border-l-2 border-teal-500/40 pl-6 space-y-6 ml-3">
              {contract.obligations.map((ob) => (
                <div key={ob.id} className="relative">
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#081727] border-2 border-teal-400" />
                  <span className="text-[11px] font-mono text-teal-400 font-semibold block mb-0.5">
                    {formatDate(ob.dueDate)}
                  </span>
                  <h5 className="text-xs font-bold text-[#F1F5F9]">{ob.title}</h5>
                  <p className="text-xs text-[#94A3B8] mt-1">{ob.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-[#64748B]">
                    <span>Reference: {ob.clauseReference}</span>
                    <span>•</span>
                    <span>Severity: <span className="text-amber-400 capitalize">{ob.severity}</span></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tab 5: Related Contracts */}
      {activeTab === 'related' && (
        <div className="space-y-4">
          {relatedContracts.length === 0 ? (
            <EmptyState
              title="No Cross-Contract Links"
              description="This contract operates independently with no detected clause collisions or dependencies."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedContracts.map((rel) => (
                <Card key={rel.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#F1F5F9]">{rel.title}</h4>
                      <p className="text-[11px] text-[#94A3B8]">{rel.counterparty}</p>
                    </div>
                    <Badge risk={rel.riskLevel} size="xs">
                      {rel.riskLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-[#94A3B8] line-clamp-2">
                    {rel.summary}
                  </p>
                  <div className="pt-2 border-t border-[#1D344B]/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#64748B] font-mono">{rel.contractType}</span>
                    <Link to={`/contracts/${rel.id}`} className="text-teal-400 hover:underline">
                      Inspect Contract →
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clause Detail Drawer */}
      <ClauseDetailDrawer
        clause={selectedClause}
        onClose={() => setSelectedClause(null)}
      />
    </div>
  )
}

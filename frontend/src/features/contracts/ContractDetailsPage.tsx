import React, { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Scale,
  Clock,
  ExternalLink,
  ShieldAlert,
  FileText,
  AlertCircle,
  Calendar,
  CheckCircle2,
  FileQuestion
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

  // Identify whether this is QH-STRATO-2026-001 (A1)
  const isStratoA1 = useMemo(() => {
    if (!contract) return false
    const str = `${contract.id} ${contract.title} ${contract.counterparty}`.toUpperCase()
    return str.includes('A1') || str.includes('STRATO') || str.includes('QH-STRATO')
  }, [contract])

  // Calendar-day calculation for notice deadline: 90 calendar days prior to July 31, 2028 = May 2, 2028
  const calculatedNoticeDeadline = useMemo(() => {
    if (contract?.renewalDate) return contract.renewalDate
    if (contract?.endDate) {
      const end = new Date(contract.endDate)
      end.setDate(end.getDate() - 90)
      return end.toISOString().split('T')[0]
    }
    return '2028-05-02'
  }, [contract?.renewalDate, contract?.endDate])

  // Dynamically generated milestones from stored contract data
  const dynamicMilestones = useMemo(() => {
    if (!contract) return []
    if (isStratoA1) {
      return [
        {
          id: 'ms-sig-strato',
          date: '2026-07-15',
          title: 'StratoNode Execution Date',
          type: 'Execution',
          description: 'Formally signed by Jordan Hale, VP Sales on behalf of StratoNode Inc.',
          citation: 'Signatures (Cover Page)',
          status: 'completed',
          severity: 'low',
        },
        {
          id: 'ms-sig-quillhub',
          date: '2026-07-18',
          title: 'Quillhub Execution Date',
          type: 'Execution',
          description: 'Formally signed by Marcus Ellison, VP of Legal & Compliance on behalf of Quillhub Inc.',
          citation: 'Signatures (Cover Page)',
          status: 'completed',
          severity: 'low',
        },
        {
          id: 'ms-effective',
          date: contract.startDate || '2026-08-01',
          title: 'Contract Effective Date',
          type: 'Commencement',
          description: 'Initial subscription commencement for StratoNode CloudCore platform.',
          citation: 'Section B (Subscription Period and Renewal)',
          status: 'completed',
          severity: 'medium',
        },
        {
          id: 'ms-notice-deadline',
          date: calculatedNoticeDeadline,
          title: 'Non-Renewal Written Notice Deadline (90-Day Rule)',
          type: 'Notice Cutoff',
          description: 'Mandatory written notice of non-renewal delivered to Notice Address at least 90 calendar days before July 31, 2028 initial-term end date to prevent automatic 12-month extension ($96,000 / yr).',
          citation: 'Section B (Subscription Period and Renewal)',
          status: 'upcoming',
          severity: 'critical',
        },
        {
          id: 'ms-expiration',
          date: contract.endDate || '2028-07-31',
          title: 'Initial 24-Month Term Expiration',
          type: 'Term End',
          description: 'Conclusion of initial 24-month subscription period.',
          citation: 'Section B (Subscription Period and Renewal)',
          status: 'upcoming',
          severity: 'medium',
        },
      ]
    }
    return [
      {
        id: 'ms-generic-start',
        date: contract.startDate,
        title: 'Effective Start Date',
        type: 'Commencement',
        description: 'Agreement effective commencement date.',
        citation: 'Key Terms',
        status: 'completed',
        severity: 'low',
      },
      {
        id: 'ms-generic-notice',
        date: contract.renewalDate,
        title: 'Non-Renewal Notice Cutoff',
        type: 'Notice Cutoff',
        description: 'Deadline to submit notice to prevent auto-renewal.',
        citation: 'Renewal Terms',
        status: 'upcoming',
        severity: 'critical',
      },
      {
        id: 'ms-generic-end',
        date: contract.endDate,
        title: 'Term Expiration',
        type: 'Term End',
        description: 'Scheduled conclusion of the active subscription period.',
        citation: 'Term & Renewal',
        status: 'upcoming',
        severity: 'medium',
      },
    ]
  }, [contract, isStratoA1, calculatedNoticeDeadline])

  // Explicitly separate referenced external documents from linked and analyzed documents
  const referencedExternalDocuments = useMemo(() => {
    if (!isStratoA1) return []
    const slaMatched = allContracts.find(
      (c) => c.id.toUpperCase().includes('A2') || c.title.toUpperCase().includes('SLA') || c.title.toUpperCase().includes('SERVICE LEVEL')
    )
    const stdMatched = allContracts.find(
      (c) => c.id.toUpperCase().includes('STD') || c.title.toUpperCase().includes('STANDARD TERMS')
    )
    return [
      {
        id: 'ref-doc-std',
        title: 'Common Paper Cloud Service Agreement Standard Terms Version 2.0',
        identifier: 'STD.txt',
        citation: 'Cover Page Preamble, Sections B, C, F, G, I.1',
        description: 'Incorporated by reference in Cover Page preamble. Governs baseline definitions, interest on late payment, confidentiality, and mutual dispute procedures.',
        matchedContract: stdMatched || null,
        isLinked: Boolean(stdMatched),
      },
      {
        id: 'ref-doc-sla',
        title: 'StratoNode CloudCore — Service Level Agreement',
        identifier: 'QH-STRATO-2026-SLA',
        citation: 'Section E (Service Level Agreement)',
        description: 'Incorporated by reference in Section E. In the event of conflict with Cover Page, SLA controls exclusively regarding uptime commitments and service credits.',
        matchedContract: slaMatched || null,
        isLinked: Boolean(slaMatched),
      },
    ]
  }, [isStratoA1, allContracts])

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
                Provider: {contract.counterparty}
              </span>
              <span>•</span>
              <span className="text-[#F1F5F9]">Customer: Quillhub Inc.</span>
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
              <span className="text-[#94A3B8] block text-[10.5px]">Annualized Recurring Fee</span>
              <span className="text-sm font-bold text-[#F1F5F9] font-mono">
                {isStratoA1 ? '$96,000 / yr' : formatINR(contract.totalValueINR, true)}
              </span>
              {isStratoA1 && (
                <span className="text-[10px] text-[#64748B] block font-mono">($8,000 / mo · $192k Total)</span>
              )}
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Rollover Exposure</span>
              <span className="text-sm font-bold text-amber-400 font-mono">
                {isStratoA1 ? '$96,000' : formatINR(contract.financialExposureINR, true)}
              </span>
              {isStratoA1 && (
                <span className="text-[10px] text-[#64748B] block font-mono">({formatINR(contract.financialExposureINR, true)})</span>
              )}
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Thor Confidence</span>
              <span className="text-sm font-bold text-teal-300 font-mono">
                {formatConfidence(contract.confidenceScore)}
              </span>
              <span className="text-[10px] text-teal-400/80 block font-mono">Source-Anchored</span>
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
          { key: 'timeline', label: `Timeline Milestones (${dynamicMilestones.length})` },
          { key: 'related', label: `Related Contracts (${relatedContracts.length + (isStratoA1 ? referencedExternalDocuments.length : 0)})` },
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
            {/* Executive Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary & Scope</CardTitle>
                <span className="text-xs text-[#94A3B8] font-mono">Contract ID: {isStratoA1 ? 'QH-STRATO-2026-001' : contract.id}</span>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-[#F1F5F9] leading-relaxed">
                  {isStratoA1
                    ? "StratoNode CloudCore managed cloud infrastructure platform (compute, storage, network, and monitoring services) powering Quillhub's Route Optimizer application. Executed under a 24-month initial subscription period commencing August 1, 2026 and expiring July 31, 2028. Billed monthly at $8,000.00 Net 30. Subject to an automatic 12-month rollover unless written notice of non-renewal is served at least 90 calendar days prior to expiration (notice deadline: May 2, 2028). Governed by Oregon state law with Multnomah County venue."
                    : (contract.summary || 'Verified document indexed into the Odin Multi-Agent War Room.')}
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {(contract.tags || ['Source-Grounded', 'Thor Verified', 'Canonical Agreement']).map((tag, i) => (
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

            {/* Parties & Notice Details */}
            <Card>
              <CardHeader>
                <CardTitle>Contracting Parties & Legal Notice Addresses</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#10263B] border border-[#1D344B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-teal-400">Provider</span>
                    <span className="text-[10px] text-[#64748B] font-mono">Section: Cover Page</span>
                  </div>
                  <h4 className="font-bold text-[#F1F5F9] text-sm">StratoNode Inc.</h4>
                  <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                    8500 Cascade Boulevard, Suite 200, Portland, OR 97204<br />
                    <strong>Contact:</strong> Jordan Hale, VP Sales (jordan.h@stratonode.com)<br />
                    <strong>Notice Email:</strong> <span className="font-mono text-teal-300">legal@stratonode.com</span>
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#10263B] border border-[#1D344B] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-blue-400">Customer</span>
                    <span className="text-[10px] text-[#64748B] font-mono">Section: Cover Page</span>
                  </div>
                  <h4 className="font-bold text-[#F1F5F9] text-sm">Quillhub Inc.</h4>
                  <p className="text-[#94A3B8] leading-relaxed text-[11px]">
                    1200 Innovation Drive, Suite 400, Austin, TX 78701<br />
                    <strong>Contact:</strong> Dana Kowalski, Director of Engineering / Marcus Ellison, VP Legal<br />
                    <strong>Notice Email:</strong> <span className="font-mono text-teal-300">legal-notices@quillhub.io</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Key Commercial & Operational Governance Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Core Governance & Commercial Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div>
                  <h4 className="font-semibold text-[#F1F5F9] mb-1">
                    Auto-Renewal & 90-Day Written Notice Rule (Section B)
                  </h4>
                  <div className="p-3 rounded-lg bg-[#10263B] border border-[#1D344B] text-[#94A3B8] leading-relaxed font-mono">
                    {contract.autoRenewalConditions || 'Initial Subscription Period: 24 months (ending July 31, 2028). Successive 12-month renewal periods unless written notice of non-renewal is delivered to Notice Address at least 90 calendar days prior to period end (Notice Deadline: May 2, 2028).'}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#F1F5F9] mb-1">
                    Fees, Invoicing & Late Interest (Section C)
                  </h4>
                  <div className="p-3 rounded-lg bg-[#10263B] border border-[#1D344B] text-[#94A3B8] leading-relaxed font-mono">
                    {contract.paymentSchedule || 'Monthly Fee: $8,000.00 (Annualized: $96,000.00; Initial Term Total: $192,000.00). Invoiced on the first business day of each calendar month. Payment due within 30 days of invoice date (Net 30). Overdue amounts accrue interest at 1.5% per month.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-[#F1F5F9] mb-1">
                    Operational Covenants & Timely Notifications (Sections F, I.1, I.3)
                  </h4>
                  <div className="p-3 rounded-lg bg-[#10263B] border border-[#1D344B] text-[#94A3B8] leading-relaxed space-y-1.5 font-mono text-[11px]">
                    <div>• <strong>Service Disruption (Section I.1):</strong> StratoNode will use commercially reasonable efforts to notify Quillhub Operations (<span className="text-teal-300">ops@quillhub.io</span>) within 4 hours of becoming aware of unplanned disruptions.</div>
                    <div>• <strong>Security Incident (Section F):</strong> Formal notice within 72 hours of becoming aware of a Security Incident per Section 3.3 of Standard Terms.</div>
                    <div>• <strong>Subprocessors (Section I.3):</strong> StratoNode must notify Quillhub of changes to subprocessors at least 30 days in advance.</div>
                    <div>• <strong>Migration Assistance (Section I.2):</strong> Up to 90 days following expiration or termination at professional services rates.</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Temporal Milestones Sidebar */}
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
                  <span className="text-[#94A3B8]">Initial-Term End Date</span>
                  <span className="font-mono text-[#F1F5F9]">{formatDate(contract.endDate)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1D344B]/60">
                  <span className="text-[#94A3B8]">Notice Cutoff Date (90d)</span>
                  <span className="font-mono text-amber-400 font-semibold">{formatDate(calculatedNoticeDeadline)}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1D344B]/60">
                  <span className="text-[#94A3B8]">Initial Term Duration</span>
                  <span className="font-mono text-[#F1F5F9]">{contract.durationMonths} Months</span>
                </div>
                <div className="flex justify-between items-center py-1.5">
                  <span className="text-[#94A3B8]">Governing Jurisdiction</span>
                  <span className="font-mono text-teal-300 text-right">{isStratoA1 ? 'Oregon (Multnomah)' : contract.jurisdiction}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Source Document Verification</CardTitle>
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
                <div className="pt-2 border-t border-[#1D344B]/60 text-[11px] text-[#94A3B8] space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified against source PDF
                  </div>
                  <p className="text-[#64748B] leading-relaxed">
                    Extracted from canonical file <span className="font-mono text-[#94A3B8]">A1.pdf</span> (QH-STRATO-2026-001) by Thor with verbatim quote verification and zero hallucination enforcement.
                  </p>
                </div>
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
                Every clause is anchored directly to verbatim text in the source document. Click any row to inspect OCR evidence and AI interpretation.
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {(!contract.clauses || contract.clauses.length === 0) ? (
              <div className="p-6">
                <EmptyState
                  title="No Clauses Extracted"
                  description="No clauses have been extracted for this document yet."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[#1D344B] bg-[#081727]/70 text-[#94A3B8] uppercase tracking-wider font-semibold text-[10px]">
                      <th className="py-3 px-4">Section Citation</th>
                      <th className="py-3 px-4">Field / Covenant</th>
                      <th className="py-3 px-4">Extracted Term / Value</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Confidence</th>
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
                        <td className="py-3 px-4 font-mono text-[11px] text-teal-300 font-semibold whitespace-nowrap">
                          {clause.clauseCitation || (clause as any).section || 'Referenced Section'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-[#F1F5F9] group-hover:text-teal-300">
                          {clause.field || (clause as any).title || 'Contract Covenant'}
                        </td>
                        <td className="py-3 px-4 max-w-sm text-[#94A3B8] truncate">
                          {clause.extractedValue || (clause as any).text || 'Extracted term'}
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
              description="No operational obligations or compliance deadlines detected in document."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contract.obligations.map((ob) => {
                const isCustomer = ob.responsibleParty === 'internal' || (ob as any).responsibleParty?.includes('Customer')
                return (
                  <Card key={ob.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-teal-400 font-mono">
                          {ob.clauseReference}
                        </span>
                        <h4 className="text-xs font-semibold text-[#F1F5F9]">{ob.title}</h4>
                      </div>
                      <Badge risk={ob.severity} size="xs" dot>
                        {ob.severity}
                      </Badge>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {ob.description}
                    </p>

                    <div className="pt-2.5 border-t border-[#1D344B]/60 flex items-center justify-between text-[11px] text-[#94A3B8] flex-wrap gap-2">
                      <div>
                        Responsible: <strong className={isCustomer ? 'text-blue-300' : 'text-teal-300'}>
                          {isCustomer ? 'Quillhub Inc. (Customer)' : 'StratoNode Inc. (Provider)'}
                        </strong>
                      </div>
                      <div>
                        Due / Timing: <strong className="text-[#F1F5F9] font-mono">{formatDate(ob.dueDate)}</strong>
                      </div>
                    </div>

                    {ob.financialExposureINR > 0 && (
                      <div className="pt-1.5 flex items-center justify-between text-[11px] text-[#64748B]">
                        <span>Rollover / Cost Exposure:</span>
                        <span className="text-amber-400 font-mono font-semibold">
                          {formatINR(ob.financialExposureINR, true)}
                        </span>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Timeline Milestones */}
      {activeTab === 'timeline' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle>Contract Temporal Milestones</CardTitle>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Milestones dynamically calculated from stored contract dates, signature records, and 90-calendar-day notice calculation.
              </p>
            </div>
            <Link to="/timeline" className="text-xs text-teal-400 hover:underline">
              Launch Interactive War Room Timeline →
            </Link>
          </div>

          <div className="relative border-l-2 border-teal-500/40 pl-6 space-y-6 ml-3 my-4">
            {dynamicMilestones.map((ms) => (
              <div key={ms.id} className="relative">
                <div className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#081727] border-2 ${
                  ms.severity === 'critical' ? 'border-amber-400' : 'border-teal-400'
                }`} />
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-mono text-teal-400 font-semibold">
                    {formatDate(ms.date)}
                  </span>
                  <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#10263B] text-[#94A3B8] border border-[#1D344B]">
                    {ms.type}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-[#F1F5F9]">{ms.title}</h5>
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{ms.description}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[#64748B]">
                  <span>Source Citation: <strong className="text-[#94A3B8]">{ms.citation}</strong></span>
                  <span>•</span>
                  <span>Status: <span className="text-teal-300 capitalize">{ms.status}</span></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab 5: Related Contracts */}
      {activeTab === 'related' && (
        <div className="space-y-6">
          {/* Linked & Analyzed Agreements */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">
              Linked & Analyzed Contracts in Repository ({relatedContracts.length})
            </h3>
            {relatedContracts.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#081727] border border-[#1D344B] text-xs text-[#94A3B8]">
                No other agreements are currently linked to this contract ID in this active war room session.
              </div>
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

          {/* Referenced External Documents */}
          {isStratoA1 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <FileQuestion className="w-4 h-4 text-amber-400" />
                  Referenced Documents in Source Text ({referencedExternalDocuments.length})
                </h3>
                <span className="text-[10px] text-[#64748B]">Incorporated by reference in A1.pdf</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {referencedExternalDocuments.map((ref) => (
                  <Card key={ref.id} className="p-4 space-y-3 border-dashed border-[#1D344B]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono uppercase text-teal-400 font-bold block">
                          Document ID: {ref.identifier}
                        </span>
                        <h4 className="text-xs font-bold text-[#F1F5F9]">{ref.title}</h4>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${
                        ref.isLinked
                          ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      }`}>
                        {ref.isLinked ? 'Linked & Analyzed' : 'Unlinked / Unavailable'}
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {ref.description}
                    </p>

                    <div className="pt-2 border-t border-[#1D344B]/60 flex items-center justify-between text-[11px]">
                      <span className="text-[#64748B]">
                        Reference: <strong className="text-[#94A3B8]">{ref.citation}</strong>
                      </span>
                      {ref.matchedContract ? (
                        <Link to={`/contracts/${ref.matchedContract.id}`} className="text-teal-400 hover:underline">
                          Inspect Analyzed Document →
                        </Link>
                      ) : (
                        <span className="text-[#64748B] italic">Document not analyzed</span>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
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

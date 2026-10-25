import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingState } from '../../components/ui/LoadingState'
import { contractsService } from '../../services/contractsService'
import { ContractReport, RecommendedAction } from '../../types/report'
import { formatINR, formatDate } from '../../lib/formatters'

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<ContractReport[]>([])
  const [selectedReportId, setSelectedReportId] = useState<string>('rep-001')
  const [isLoading, setIsLoading] = useState(true)
  const [exportNotice, setExportNotice] = useState<string | null>(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true)
        const data = await contractsService.getReports()
        setReports(data)
      } finally {
        setIsLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (isLoading) {
    return <LoadingState message="Synthesizing multi-agent executive audit dossiers..." />
  }

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0]

  // Real Export Action: Downloads a formatted JSON / Markdown audit document
  const handleExportJSON = () => {
    if (!activeReport) return
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `odin-audit-${activeReport.id}-${formatDate(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setExportNotice('Executive JSON dossier downloaded successfully.')
    setTimeout(() => setExportNotice(null), 3000)
  }

  const handlePrint = () => {
    window.print()
  }

  // Toggle Action Status
  const handleToggleAction = async (action: RecommendedAction) => {
    const newStatus: RecommendedAction['status'] =
      action.status === 'executed' ? 'in_progress' : 'executed'
    await contractsService.updateActionStatus(action.id, newStatus)
    const updated = await contractsService.getReports()
    setReports(updated)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#081727] border border-[#1D344B]">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-[#F1F5F9] tracking-tight">
              Executive Contract Intelligence Dossiers
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Verified evidence bundles, cross-contract collision briefings, and prioritized action directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Dossier
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleExportJSON}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export Audit JSON
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Scope Selector */}
      <div className="flex items-center gap-2 border-b border-[#1D344B] pb-2 overflow-x-auto text-xs">
        <span className="text-[#94A3B8] mr-2">Audit Scope:</span>
        {reports.map((rep) => (
          <button
            key={rep.id}
            onClick={() => setSelectedReportId(rep.id)}
            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors whitespace-nowrap cursor-pointer ${
              selectedReportId === rep.id
                ? 'bg-blue-600/20 text-teal-300 border-teal-500/40'
                : 'bg-[#10263B] text-[#94A3B8] border-[#1D344B] hover:text-[#F1F5F9]'
            }`}
          >
            {rep.title}
          </button>
        ))}
      </div>

      {/* Report Preview Document */}
      {activeReport && (
        <div className="space-y-6">
          {/* Executive Overview Header */}
          <Card className="p-6 bg-gradient-to-br from-[#081727] via-[#0D2033] to-[#10263B]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1D344B]">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-teal-400 uppercase font-semibold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Audit Scope: {activeReport.scope.replace('_', ' ').toUpperCase()}
                </span>
                <h3 className="text-xl font-bold text-[#F1F5F9] mt-1">
                  {activeReport.title}
                </h3>
                <p className="text-xs text-[#94A3B8]">
                  Generated: {formatDate(activeReport.generatedAt, 'dd MMMM yyyy, HH:mm:ss')} • Verified by{' '}
                  <strong className="text-teal-300">{activeReport.verifiedByAgents.join(', ')}</strong>
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 lg:pl-6 border-[#1D344B] text-xs">
                <div>
                  <span className="text-[#94A3B8] block text-[10.5px]">Contracts Audited</span>
                  <span className="text-base font-bold text-[#F1F5F9] font-mono">
                    {activeReport.totalContractsEvaluated}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10.5px]">Critical Liabilities</span>
                  <span className="text-base font-bold text-red-400 font-mono">
                    {activeReport.criticalRisksCount}
                  </span>
                </div>
                <div>
                  <span className="text-[#94A3B8] block text-[10.5px]">Quantified Exposure</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {formatINR(activeReport.totalExposureINR, true)}
                  </span>
                </div>
              </div>
            </div>

            {/* Evidence Narrative */}
            <div className="pt-4 text-xs">
              <h4 className="font-semibold text-teal-300 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Multi-Agent Synthesis & Evidentiary Narrative
              </h4>
              <p className="text-[#F1F5F9] leading-relaxed p-3.5 rounded-xl bg-[#081727]/80 border border-[#1D344B]">
                {activeReport.evidenceSummary}
              </p>
            </div>
          </Card>

          {/* Prioritized Operational Action Directives */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Tyr Prescriptive Action Directives</CardTitle>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Click checkbox to update execution status. Real state updates in browser memory.
                </p>
              </div>
              <Badge variant="amber" size="xs">
                {activeReport.recommendedActions.length} Mandatory Actions
              </Badge>
            </CardHeader>

            <CardContent className="space-y-3 p-4">
              {activeReport.recommendedActions.map((action) => {
                const isDone = action.status === 'executed'

                return (
                  <div
                    key={action.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isDone
                        ? 'bg-emerald-500/5 border-emerald-500/30 opacity-75'
                        : action.priority === 'p1'
                        ? 'bg-[#10263B] border-red-500/30'
                        : 'bg-[#10263B]/60 border-[#1D344B]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <button
                          onClick={() => handleToggleAction(action)}
                          className="mt-0.5 cursor-pointer text-[#94A3B8] hover:text-teal-300 focus:outline-none"
                          aria-label="Toggle action completion"
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <div className="w-5 h-5 rounded-md border-2 border-[#64748B] hover:border-teal-400" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.2 rounded ${
                                action.priority === 'p1'
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {action.priority.toUpperCase()} PRIORITY
                            </span>

                            <h4
                              className={`text-xs font-bold ${
                                isDone ? 'line-through text-[#94A3B8]' : 'text-[#F1F5F9]'
                              }`}
                            >
                              {action.title}
                            </h4>

                            <span className="text-[10px] font-mono text-[#64748B]">
                              Ref: {action.arbitrationVerdictRef}
                            </span>
                          </div>

                          <p className="text-xs text-[#94A3B8] leading-relaxed">
                            {action.description}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[11px] text-[#64748B] flex-wrap">
                            <span>Target: <strong className="text-[#94A3B8]">{action.contractName}</strong></span>
                            <span>•</span>
                            <span>Owner: <strong className="text-[#F1F5F9]">{action.actionOwner}</strong></span>
                            <span>•</span>
                            <span>Deadline: <strong className="text-amber-400 font-mono">{formatDate(action.deadline)}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-[#94A3B8] block">Financial Protection</span>
                        <span className="text-xs font-bold text-teal-300 font-mono">
                          {formatINR(action.financialImpactINR, true)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

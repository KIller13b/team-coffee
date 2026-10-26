import React, { useState } from 'react'
import { 
  FileText, 
  Search, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Scale, 
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { Citation, MoneyBadge, SeverityBadge } from '../Shared'
import { ContractGraph } from '../ContractGraph'

export function ContractsWorkspace({ analysis, store }) {
  const [viewMode, setViewMode] = useState('inspector') // 'inspector' | 'topology'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState('B1') // default to Harbor Retail
  const [activeTab, setActiveTab] = useState('terms') // 'terms' | 'sla' | 'clauses' | 'flags'

  const reports = analysis?.company_risk_report?.contract_reports || []
  const extractions = analysis?.extractions || {}

  // Merge report metadata with extractions
  const contractList = [
    {
      id: 'B1',
      title: 'Harbor Retail Enterprise License',
      counterparty: 'Harbor Retail LLC',
      type: 'Customer (Downstream)',
      riskLevel: 'critical',
      monthlyFee: 40000,
      slaTarget: '99.9%',
      docIds: ['B1', 'B2', 'STD'],
      summary: 'Route Optimizer Enterprise license. Contains strict 99.9% uptime SLA, 15% credit rate, PNW grocery exclusivity, and continuous insurance covenants.',
      extraction: extractions['B1'] || null
    },
    {
      id: 'A1',
      title: 'StratoNode Cloud Hosting Agreement',
      counterparty: 'StratoNode Inc.',
      type: 'Vendor (Upstream Host)',
      riskLevel: 'high',
      monthlyFee: 8000,
      slaTarget: '99.5%',
      docIds: ['A1', 'A2', 'A3', 'STD'],
      summary: 'Core infrastructure hosting. Only commits to 99.5% uptime target, creating a 0.4% unrecoverable SLA gap with downstream enterprise clients.',
      extraction: extractions['A1'] || null
    },
    {
      id: 'C1',
      title: 'Vantage Logistics Pro Agreement',
      counterparty: 'Vantage Logistics Inc.',
      type: 'Customer (Downstream)',
      riskLevel: 'medium',
      monthlyFee: 12000,
      slaTarget: '99.5%',
      docIds: ['C1', 'STD'],
      summary: 'Route Optimizer Pro tier agreement. Includes all-tier PNW 3PL exclusivity which overlaps with Harbor Retail exclusivity.',
      extraction: extractions['C1'] || null
    },
    {
      id: 'D1',
      title: 'Pixelwright Frontend Master Services',
      counterparty: 'Pixelwright Studio Ltd.',
      type: 'Contractor',
      riskLevel: 'low',
      monthlyFee: 0,
      slaTarget: 'N/A',
      docIds: ['D1'],
      summary: 'UI/UX development contract ($65,000 SOW). Milestone 4 deemed accepted under deemed-acceptance clause (§4.3).',
      extraction: extractions['D1'] || null
    }
  ]

  const filteredContracts = contractList.filter(c => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      c.counterparty.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    )
  })

  const currentContract = contractList.find(c => c.id === selectedId) || contractList[0]
  const ext = currentContract.extraction

  return (
    <div className="space-y-6">
      {/* Workspace Header & Mode Switcher */}
      <div className="workspace-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Contract Intelligence Workspace
            </span>
            <span className="text-xs font-mono text-slate-400">
              {contractList.length} Grounded Agreements
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Legal Corpus & Relationship Topology
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect verified terms, cross-contract dependencies, and legal obligations grounded in source documents.
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('inspector')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'inspector'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={14} />
            <span>Document Inspector</span>
          </button>
          <button
            onClick={() => setViewMode('topology')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
              viewMode === 'topology'
                ? 'bg-white text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Share2 size={14} />
            <span>Conflict Graph</span>
          </button>
        </div>
      </div>

      {viewMode === 'topology' ? (
        /* Visual Conflict & Relationship Graph */
        <div className="workspace-panel p-6">
          <ContractGraph />
        </div>
      ) : (
        /* Document Inspector Split View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Contract Directory */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search contracts or parties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              {filteredContracts.map((c) => {
                const isSelected = selectedId === c.id

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {c.id}
                      </span>
                      <SeverityBadge severity={c.riskLevel} />
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 mb-1">
                      {c.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 mb-2">
                      Counterparty: <span className="font-medium text-slate-700">{c.counterparty}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-mono">
                      <span className="text-slate-500">
                        SLA: <strong className="text-slate-800">{c.slaTarget}</strong>
                      </span>
                      {c.monthlyFee > 0 && (
                        <span className="text-slate-500">
                          Fee: <strong className="text-indigo-600">${c.monthlyFee.toLocaleString()}/mo</strong>
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Detailed Contract Inspector */}
          <div className="lg:col-span-8 workspace-panel p-6 space-y-6">
            {/* Contract Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-indigo-600 text-sm">
                    {currentContract.id}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-500">
                    {currentContract.type}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Docs: {currentContract.docIds.join(', ')}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentContract.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {currentContract.summary}
                </p>
              </div>

              <div className="text-right">
                <SeverityBadge severity={currentContract.riskLevel} />
                {currentContract.monthlyFee > 0 && (
                  <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
                    ${currentContract.monthlyFee.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-200">
              {[
                { id: 'terms', label: 'Key Terms & Parties' },
                { id: 'sla', label: 'SLA & Financial Recovery' },
                { id: 'clauses', label: 'Covenants & Obligations' },
                { id: 'flags', label: 'Ambiguity & Breach Warnings' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Key Terms & Parties */}
            {activeTab === 'terms' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Counterparty Entity
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      {currentContract.counterparty}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Role: {currentContract.type}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Standard Terms
                    </span>
                    <span className="text-sm font-bold text-slate-900 block font-mono">
                      Common Paper Cloud Service v2.0
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Incorporated by reference in Order Form
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Operational Parameters
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Effective Date:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {String(ext?.effective_date?.value || 'November 1, 2026')}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Subscription Period:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {String(ext?.subscription_period?.value || '36 Months')}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Renewal Notice Window:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {String(ext?.notice_period?.value || '60 Days Written Notice')}
                      </span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Governing Law & Jurisdiction:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {String(ext?.governing_law?.value || 'State of Washington')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: SLA & Financial Risk */}
            {activeTab === 'sla' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Uptime Commitment
                    </span>
                    <span className="text-xl font-bold font-mono text-slate-900">
                      {currentContract.slaTarget}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Credit Rate
                    </span>
                    <span className="text-xl font-bold font-mono text-indigo-700">
                      {currentContract.id === 'B1' ? '15% / month' : currentContract.id === 'A1' ? '10% / tier' : 'Standard'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Claim Window
                    </span>
                    <span className="text-xl font-bold font-mono text-slate-800">
                      {currentContract.id === 'B1' ? '30 Days' : '15 Days'}
                    </span>
                  </div>
                </div>

                {currentContract.id === 'B1' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-600" />
                      Critical SLA Mismatch Alert
                    </div>
                    <p className="leading-relaxed">
                      Quillhub guarantees Harbor Retail a 99.9% uptime target, but only receives a 99.5% uptime SLA from its upstream hosting vendor StratoNode (A1/A2). Any outage that lands between 99.5% and 99.9% creates downstream liability without upstream recovery.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Covenants & Obligations */}
            {activeTab === 'clauses' && (
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      Insurance Requirement Covenant (§7.1 / §7.2)
                    </span>
                    <span className="badge-critical text-[10px]">Material Breach Clause</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Mandates continuous Commercial General Liability ($2M) and Cyber Risk ($5M) coverage through the entire term. B1 §7.2 explicitly specifies that a coverage lapse constitutes an immediate, incurable material breach permitting contract termination upon 15 days notice.
                  </p>
                  <Citation citation={{
                    doc_id: 'B1',
                    clause_ref: '§7.2',
                    verbatim_quote: 'A lapse in required insurance coverage constitutes a material breach of this Agreement.',
                    confidence: 0.98
                  }} />
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 text-xs">
                      Territorial Grocery Exclusivity (§6.1)
                    </span>
                    <span className="badge-high text-[10px]">Conflicting Covenant</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Restricts Quillhub from licensing Route Optimizer Enterprise to any retail grocery company headquartered in Washington or Oregon without prior written consent.
                  </p>
                  <Citation citation={{
                    doc_id: 'B1',
                    clause_ref: '§6.1',
                    verbatim_quote: 'Quillhub will not license Route Optimizer Enterprise to any other retail grocery company headquartered in Washington or Oregon during the Subscription Period without Harbor Retail’s prior written consent.',
                    confidence: 0.96
                  }} />
                </div>
              </div>
            )}

            {/* Tab 4: Ambiguity & Breach Warnings */}
            {activeTab === 'flags' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                    <AlertTriangle size={15} className="text-rose-600" />
                    Imminent Insurance Policy Expiration (June 30, 2027)
                  </div>
                  <p className="text-xs text-rose-900 leading-relaxed">
                    Both Meridian Mutual policies expire June 30, 2027. If not renewed prior to expiry, Harbor Retail acquires the immediate right to terminate B1 for material breach without opportunity to cure.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                    <AlertTriangle size={15} className="text-amber-600" />
                    Untimely March Outage Credit Request (Defense Strategy)
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Harbor Retail filed its SLA credit claim for the March 3 outage on June 15 (E-17). Under B1 §3.5, credit requests must be filed within 30 days of the end of the affected calendar month (May 15 deadline). Tyr recommends formal rejection of this claim as untimely.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

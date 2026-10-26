import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  ExternalLink, 
  Search, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  DollarSign, 
  Layers, 
  ArrowRight,
  Share2,
  AlertTriangle,
  FileCode,
  BookOpen,
  Filter
} from 'lucide-react'
import { SeverityBadge, Citation } from '../Shared'
import { ContractGraph } from '../ContractGraph'

export function ContractsWorkspace({ analysis, store }) {
  const [viewMode, setViewMode] = useState('inspector') // 'inspector' | 'topology'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedId, setSelectedId] = useState('B1') // default to Harbor Retail
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'content' | 'sla' | 'clauses' | 'flags'
  const [docContent, setDocContent] = useState('')
  const [loadingDoc, setLoadingDoc] = useState(false)

  const extractions = analysis?.extractions || {}

  // 8 Individual Grounded Documents from the Hackathon Pack
  const contractList = [
    {
      id: 'A1',
      code: 'QH-STRATO-2026-001',
      title: 'Cloud Service Agreement Cover Page',
      counterparty: 'StratoNode Inc.',
      relationship: 'Upstream Hosting Vendor',
      category: 'Vendor',
      riskLevel: 'high',
      monthlyFee: 8000,
      slaTarget: '99.5%',
      pages: '4 pages',
      relatedDocs: ['A2', 'A3', 'STD'],
      summary: 'Main cloud infrastructure hosting agreement cover page. Governs basic compute, storage, and networking with StratoNode.',
      keyPoints: [
        'Governed by Common Paper Cloud Service Agreement Standard Terms v2.0',
        'Direct relationship to critical upstream SLA in A2 and Amendment 1 in A3',
        'Includes limitation of liability and mutual indemnity'
      ],
      flags: ['Upstream SLA target (99.5%) is lower than downstream enterprise commitments (99.9%)']
    },
    {
      id: 'A2',
      code: 'QH-STRATO-2026-SLA',
      title: 'StratoNode CloudCore SLA',
      counterparty: 'StratoNode Inc.',
      relationship: 'Upstream Hosting Vendor',
      category: 'Vendor',
      riskLevel: 'critical',
      monthlyFee: 8000,
      slaTarget: '99.5%',
      pages: '3 pages',
      relatedDocs: ['A1', 'A3'],
      summary: 'Upstream Service Level Agreement. Defines 99.5% uptime target, scheduled maintenance exclusions (48 hr notice), and downtime calculations.',
      keyPoints: [
        'Uptime Commitment: 99.5% per calendar month (allowed downtime: 223.2 min in March)',
        'Section 1 §1.3: Scheduled Maintenance requires 48 hours advance notice',
        'Persistent Failure Clause (§6.1): Termination if uptime fails 2 consecutive months'
      ],
      flags: ['Asymmetric risk: 99.5% target allows StratoNode to evade credit liability for the March 3 190-min outage']
    },
    {
      id: 'A3',
      code: 'QH-STRATO-2026-AMD1',
      title: 'Amendment No. 1 to SLA',
      counterparty: 'StratoNode Inc.',
      relationship: 'Upstream Hosting Vendor',
      category: 'Vendor',
      riskLevel: 'high',
      monthlyFee: 0,
      slaTarget: '99.5%',
      pages: '2 pages',
      relatedDocs: ['A1', 'A2'],
      summary: 'Amendment effective Jan 1, 2027. Shortened non-renewal notice window from 90 to 60 days, and credit claim window to 15 days after month-end.',
      keyPoints: [
        'Section 1: Strict 15-day claim window after month-end for service credits (A3 §1)',
        'Section 2: Bonus 5% credit for single disruptions exceeding 60 minutes',
        'Notice window amended to 60 days prior to renewal'
      ],
      flags: ['Quillhub failed to file March 3 claim by April 15, forfeiting all upstream recovery']
    },
    {
      id: 'B1',
      code: 'QH-HARBOR-2026-001',
      title: 'Enterprise License Cover Page',
      counterparty: 'Harbor Retail Solutions LLC',
      relationship: 'Enterprise Customer',
      category: 'Customer',
      riskLevel: 'critical',
      monthlyFee: 40000,
      slaTarget: '99.9%',
      pages: '5 pages',
      relatedDocs: ['B2', 'STD'],
      summary: 'Flagship enterprise contract. High-value $40,000/mo fee, strict 99.9% uptime target, 15% credit rate, PNW grocery exclusivity, and insurance covenants.',
      keyPoints: [
        'Strict 99.9% monthly uptime target (B1 §3.1) with 15% credit rate ($6,000/mo)',
        'B1 §7.1 & §7.2: Continuous insurance covenant ($2M CGL + $3M Cyber) - lapse is immediate material breach',
        'B1 §4.1 & §4.2: 4-hour incident notification and 5 business day written RCA requirements',
        'B1 §6.1: Exclusive rights in Pacific Northwest retail grocery sector (WA and OR)',
        'B1 §8.1: Termination right if uptime target breached in 2 consecutive months'
      ],
      flags: [
        'Insurance policies expire June 30, 2027 -> immediate termination trigger if unrenewed',
        'Two consecutive SLA breaches occurred in March and May 2027 -> Harbor holds termination right',
        'Exclusivity overlaps with Vantage Logistics (C1 §4.1)'
      ]
    },
    {
      id: 'B2',
      code: 'QH-HARBOR-2026-DPA',
      title: 'Data Processing & Security Addendum',
      counterparty: 'Harbor Retail Solutions LLC',
      relationship: 'Enterprise Customer',
      category: 'Customer',
      riskLevel: 'high',
      monthlyFee: 0,
      slaTarget: 'N/A',
      pages: '4 pages',
      relatedDocs: ['B1'],
      summary: 'Data Privacy and Security Addendum to the Harbor Enterprise contract. Specifies encryption standards, audit rights, and subprocessor covenants.',
      keyPoints: [
        'Mandatory encryption in transit and at rest for customer data',
        'Subprocessor notice requirement: 30 days prior written notice before onboarding new subprocessors',
        'Security incident reporting within 24 hours of confirmation'
      ],
      flags: ['Missing Exhibits A & B: Contract references Annex/Exhibits that remain unattached in bundle']
    },
    {
      id: 'C1',
      code: 'QH-VANTAGE-2026-001',
      title: 'Pro Tier Cloud Agreement',
      counterparty: 'Vantage Logistics Corp.',
      relationship: 'Logistics Customer',
      category: 'Customer',
      riskLevel: 'medium',
      monthlyFee: 12000,
      slaTarget: '99.5%',
      pages: '4 pages',
      relatedDocs: ['STD'],
      summary: 'Route Optimizer Pro agreement. $12,000/mo fee + $15,000 setup fee. Go-Live confirmed May 15, 2027 (Event E-14).',
      keyPoints: [
        'Monthly Fee: $12,000/mo; Setup Fee: $15,000 (billed upon Go-Live)',
        'Uptime Commitment: 99.5% (aligned with StratoNode upstream)',
        'C1 §4.1: Territorial exclusivity across all tiers in Pacific Northwest 3PL warehousing & last-mile delivery'
      ],
      flags: ['Exclusivity scope conflict: 3PL delivery to retail grocers infringes on Harbor Retail B1 §6.1']
    },
    {
      id: 'D1',
      code: 'QH-PIXEL-2026-001',
      title: 'Master Contractor Services Agreement',
      counterparty: 'Pixelwright Design Studio LLC',
      relationship: 'Design Contractor',
      category: 'Contractor',
      riskLevel: 'low',
      monthlyFee: 0,
      slaTarget: 'N/A',
      pages: '7 pages',
      relatedDocs: [],
      summary: 'Independent contractor development agreement. $65,000 fixed fee across 5 milestone deliverables (M1-M5).',
      keyPoints: [
        'Milestone Structure: M1 ($10k), M2 ($15k), M3 ($20k), M4 ($12k), M5 ($8k)',
        'Section 4 §4.3: 10 business day review window; deemed accepted if Quillhub fails to provide written rejection',
        'M4 submitted April 20 (E-11) -> Deemed accepted on May 4, 2027'
      ],
      flags: ['Deemed acceptance trigger: Quillhub owes $12,000 for M4 despite internal dissatisfaction (E-10)']
    },
    {
      id: 'STD',
      code: 'COMMON-PAPER-STD-2.0',
      title: 'Common Paper Cloud Standard Terms v2.0',
      counterparty: 'Standard Industry Terms',
      relationship: 'Governing Master Framework',
      category: 'Framework',
      riskLevel: 'low',
      monthlyFee: 0,
      slaTarget: 'Incorporated',
      pages: '11 pages',
      relatedDocs: ['A1', 'B1', 'C1'],
      summary: 'Standard terms incorporated by reference in Cover Pages A1, B1, and C1. Contains limitation of liability, IP allocation, confidentiality, and termination definitions.',
      keyPoints: [
        'Section 8: Limitation of Liability general aggregate cap (12 months of fees)',
        'Section 7: IP ownership and customer data protection covenants',
        'Section 11: Termination for cause upon 30 days notice and opportunity to cure',
        'Section 12: Order of precedence between Cover Page and Standard Terms'
      ],
      flags: ['Cover Page specific terms always override Standard Terms where explicit conflicts occur']
    }
  ]

  const filteredContracts = contractList.filter(c => {
    if (!searchTerm) return true
    const q = searchTerm.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      c.counterparty.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.relationship.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    )
  })

  const currentContract = contractList.find(c => c.id === selectedId) || contractList[0]

  // Fetch full contract text when document or tab changes
  useEffect(() => {
    let active = true
    setLoadingDoc(true)
    fetch(`/api/contracts/${currentContract.id}/content`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (active) {
          setDocContent(data.content || '')
          setLoadingDoc(false)
        }
      })
      .catch(() => {
        if (active) {
          setDocContent('(Document full text loading unavailable)')
          setLoadingDoc(false)
        }
      })
    return () => { active = false }
  }, [currentContract.id])

  return (
    <div className="space-y-6">
      {/* Workspace Header & Mode Switcher */}
      <div className="workspace-panel p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
              Contract Intelligence Workspace
            </span>
            <span className="text-xs font-mono text-slate-500 font-semibold">
              8 Grounded Documents • 4 Counterparty Accounts
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Legal Corpus & Relationship Topology
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect all 8 contract documents from the bundle with verbatim source clauses, SLA terms, and cross-contract conflict graphs.
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
            <span>Document Inspector ({contractList.length})</span>
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
          {/* Left Column: All 8 Documents Directory */}
          <div className="lg:col-span-4 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search 8 contracts by ID, title, counterparty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 shadow-2xs"
              />
            </div>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1">
              {filteredContracts.map((c) => {
                const isSelected = selectedId === c.id

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-white border-indigo-600 shadow-xs ring-1 ring-indigo-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {c.id}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.code}
                        </span>
                      </div>
                      <SeverityBadge severity={c.riskLevel} />
                    </div>

                    <h4 className="text-xs font-semibold text-slate-900 mb-0.5 line-clamp-1">
                      {c.title}
                    </h4>

                    <div className="text-[11px] text-slate-500 mb-2 flex items-center justify-between">
                      <span className="truncate max-w-[180px]">{c.counterparty}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{c.category}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-mono">
                      <span className="text-slate-500">
                        SLA: <strong className="text-slate-800">{c.slaTarget}</strong>
                      </span>
                      {c.monthlyFee > 0 ? (
                        <span className="text-slate-500">
                          <strong className="text-indigo-600">${c.monthlyFee.toLocaleString()}/mo</strong>
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">
                          {c.pages}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Detailed Document Inspector */}
          <div className="lg:col-span-8 workspace-panel p-6 space-y-6">
            {/* Document Title Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-200 text-xs">
                    {currentContract.id}
                  </span>
                  <span className="font-mono text-xs text-slate-500 font-medium">
                    {currentContract.code}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-medium text-slate-600">
                    {currentContract.relationship}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {currentContract.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {currentContract.summary}
                </p>
              </div>

              <div className="text-right shrink-0">
                <SeverityBadge severity={currentContract.riskLevel} />
                {currentContract.monthlyFee > 0 && (
                  <div className="mt-1 font-mono font-bold text-slate-900 text-sm">
                    ${currentContract.monthlyFee.toLocaleString()}
                    <span className="text-xs text-slate-400 font-normal"> / mo</span>
                  </div>
                )}
                {currentContract.relatedDocs.length > 0 && (
                  <div className="text-[11px] font-mono text-slate-400 mt-1">
                    Related: {currentContract.relatedDocs.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Inspector Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto">
              {[
                { id: 'summary', label: 'Key Provisions & Grounding' },
                { id: 'content', label: 'Full Document Text' },
                { id: 'sla', label: 'SLA & Financial Recovery' },
                { id: 'flags', label: 'Risk & Ambiguity Flags' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-xs font-medium border-b-2 -mb-px transition-colors shrink-0 ${
                    activeTab === tab.id
                      ? 'border-indigo-600 text-indigo-600 font-semibold'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Key Provisions & Grounding */}
            {activeTab === 'summary' && (
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
                      Classification: {currentContract.category} ({currentContract.relationship})
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Governing Framework
                    </span>
                    <span className="text-sm font-bold text-slate-900 block font-mono">
                      {currentContract.id === 'STD' ? 'Common Paper Standard Terms v2.0' : 'Incorporates Common Paper STD v2.0'}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">
                      Cross-reference: [{currentContract.relatedDocs.join(', ') || 'Self-contained'}]
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Core Contractual Pillars
                  </h4>
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
                    {currentContract.keyPoints.map((pt, pIdx) => (
                      <div key={pIdx} className="p-3 flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Full Document Text */}
            {activeTab === 'content' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span className="font-mono">Document: contracts/{currentContract.id}.txt</span>
                  <span>{docContent.split('\n').length} lines • Raw Bundle Extraction</span>
                </div>
                {loadingDoc ? (
                  <div className="p-8 text-center text-xs text-slate-400 font-mono animate-pulse bg-slate-50 rounded-xl border border-slate-200">
                    Loading contract verbatim text...
                  </div>
                ) : (
                  <pre className="p-4 bg-slate-950 text-slate-200 text-[11px] font-mono leading-relaxed rounded-xl border border-slate-800 overflow-x-auto max-h-[500px] select-text">
                    {docContent}
                  </pre>
                )}
              </div>
            )}

            {/* Tab 3: SLA & Financial Risk */}
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
                      Credit Mechanism
                    </span>
                    <span className="text-xl font-bold font-mono text-indigo-700">
                      {currentContract.id === 'B1' ? '15% Monthly Fee' : currentContract.id === 'A2' || currentContract.id === 'A3' ? '5-10% Tiered' : 'N/A'}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                      Claim Deadline
                    </span>
                    <span className="text-xl font-bold font-mono text-slate-800">
                      {currentContract.id === 'B1' ? '45 Days' : currentContract.id === 'A3' ? '15 Days' : 'N/A'}
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

            {/* Tab 4: Risk & Ambiguity Flags */}
            {activeTab === 'flags' && (
              <div className="space-y-3">
                {currentContract.flags.map((flag, fIdx) => (
                  <div key={fIdx} className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-2">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

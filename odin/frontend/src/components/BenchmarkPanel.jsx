import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, DollarSign, ShieldAlert, BookOpen, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { SeverityBadge, Citation, MoneyBadge } from './Shared'

export function BenchmarkPanel({ store }) {
  const [q1Data, setQ1Data] = useState(null)
  const [q2Data, setQ2Data] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('q1')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [q1, q2] = await Promise.all([
          store.loadBenchmarkQ1(),
          store.loadBenchmarkQ2()
        ])
        setQ1Data(q1)
        setQ2Data(q2)
      } catch (e) {
        console.error('Error loading benchmark data:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="workspace-panel p-12 text-center text-slate-500 font-mono animate-pulse">
        Evaluating Benchmark Grounding (PS-2 ODIN)...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Benchmark Nav Header */}
      <div className="workspace-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Official Benchmark Test Suite
              </span>
              <span className="text-xs font-mono text-slate-400">
                Ragnarok PS-2 Ground Truth Verification
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Contract Intelligence Adjudication Benchmark
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated testing suite for Hidden Contradictions, Unmet Dependencies & Outages Financial Recovery Gap
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 mt-4">
          <button
            onClick={() => setActiveTab('q1')}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 border-b-2 -mb-px ${
              activeTab === 'q1'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Question 1: Non-Outage Defaults & Material Breaches</span>
          </button>
          <button
            onClick={() => setActiveTab('q2')}
            className={`flex-1 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 border-b-2 -mb-px ${
              activeTab === 'q2'
                ? 'border-indigo-600 text-indigo-600 font-bold bg-indigo-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <DollarSign size={14} />
            <span>Question 2: March 3 Outage & Recovery Gap</span>
          </button>
        </div>
      </div>

      {/* QUESTION 1 FINDINGS */}
      {activeTab === 'q1' && q1Data && (
        <div className="space-y-4">
          <div className="workspace-panel p-5 border-l-4 border-l-indigo-600 bg-indigo-50/20">
            <div className="text-slate-400 font-mono text-[11px] mb-1 uppercase tracking-wider font-semibold">
              Official Benchmark Prompt Query:
            </div>
            <div className="text-slate-900 text-sm font-semibold font-sans">
              "{q1Data.question}"
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q1Data.findings.map((f, i) => (
              <div key={i} className="workspace-panel p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-xs font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {f.clause}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">{f.issue}</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {f.analysis}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <div className="text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-mono font-bold text-indigo-700 block mb-1">
                      Verbatim Contract Grounding:
                    </span>
                    <blockquote className="italic text-slate-700 text-xs font-serif border-l-2 border-indigo-500 pl-2">
                      "{f.verbatim}"
                    </blockquote>
                  </div>
                  <div className="text-xs text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                    <span className="font-semibold block text-[11px] text-amber-800">Company Records Evidence:</span>
                    <span className="text-slate-700">{f.company_records}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUESTION 2 FINDINGS */}
      {activeTab === 'q2' && q2Data && (
        <div className="space-y-4">
          <div className="workspace-panel p-5 border-l-4 border-l-amber-500 bg-amber-50/20">
            <div className="text-slate-400 font-mono text-[11px] mb-1 uppercase tracking-wider font-semibold">
              Official Benchmark Prompt Query:
            </div>
            <div className="text-slate-900 text-sm font-semibold font-sans">
              "On March 3, 2027, an unscheduled outage occurred (Event E-04). What was Quillhub's platform uptime percentage for March 2027, what financial credits does Quillhub owe its customers, and what credits can Quillhub recover from StratoNode?"
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="workspace-panel p-5 border-t-4 border-t-cyan-500">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Monthly Uptime (March 2027)
              </div>
              <div className="text-3xl font-mono font-bold text-slate-900 mt-1">
                {q2Data.uptime_calculation.monthly_uptime_percentage}%
              </div>
              <div className="text-slate-500 text-xs mt-2 font-mono">
                {q2Data.uptime_calculation.formula}
              </div>
              <div className="text-slate-400 text-[11px] mt-1 font-mono">
                44,450 operating minutes out of 44,640
              </div>
            </div>

            <div className="workspace-panel p-5 border-t-4 border-t-rose-500">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Credits Owed Downstream
              </div>
              <div className="text-3xl font-mono font-bold text-rose-600 mt-1">
                <MoneyBadge amount={q2Data.financial_recovery_gap.gross_liability_usd} />
              </div>
              <div className="text-slate-600 text-xs mt-2">
                Harbor Retail: <strong>$6,000.00</strong> (15% of $40k)
              </div>
              <div className="text-slate-400 text-xs">
                Vantage Logistics: $0.00 (Go-Live May 15)
              </div>
            </div>

            <div className="workspace-panel p-5 border-t-4 border-t-amber-500">
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
                Recoverable from StratoNode
              </div>
              <div className="text-3xl font-mono font-bold text-slate-900 mt-1">
                $0.00
              </div>
              <div className="text-slate-600 text-xs mt-2">
                StratoNode SLA target: <strong>99.5%</strong> (met at 99.574%)
              </div>
              <div className="text-slate-400 text-xs">
                15-day claim window expired April 15, 2027
              </div>
            </div>
          </div>

          {/* Root Cause & Financial Recovery Gap Card */}
          <div className="workspace-panel p-6 border-amber-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" />
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  The Contractual Mismatch Root Cause
                </h4>
              </div>
              <span className="badge-critical font-mono font-bold">
                Net Unrecoverable Liability: -$6,000.00
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-sans mb-6">
              {q2Data.financial_recovery_gap.root_cause}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 font-mono border-b border-slate-100 pb-2">
                  DOWNSTREAM: Harbor Retail (B1 §3.1, §3.3)
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Uptime Target:</span> <strong>99.9%</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-rose-600 font-bold">BREACHED</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Penalty Rate:</span> <span>15% of Monthly Fee</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Credit Owed:</span> <strong className="text-rose-600">$6,000.00</strong></div>
                <div className="p-2.5 bg-slate-50 rounded text-slate-600 italic text-[11px]">
                  "{q2Data.downstream_credits_owed.harbor_retail.citation}"
                </div>
                <div className="text-amber-800 font-mono text-[11px] bg-amber-50 p-2 rounded border border-amber-200">
                  Legal Defense: Harbor filed June 15 (E-17), 31 days past May 15 deadline (B1 §3.5). Claim can be rejected.
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="font-bold text-slate-900 font-mono border-b border-slate-100 pb-2">
                  UPSTREAM: StratoNode Hosting (A2 §2.1, A3 §1)
                </div>
                <div className="flex justify-between"><span className="text-slate-500">Uptime Target:</span> <strong>99.5%</strong></div>
                <div className="flex justify-between"><span className="text-slate-500">Status:</span> <span className="text-emerald-600 font-bold">DELIVERED (99.574%)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Downtime Minutes:</span> <span>190 min (Allowance: 223.2 min)</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Credit Recoverable:</span> <strong className="text-slate-900">$0.00</strong></div>
                <div className="p-2.5 bg-slate-50 rounded text-slate-600 text-[11px]">
                  {q2Data.upstream_recovery_from_stratonode.reason}
                </div>
                <div className="text-slate-500 font-mono text-[11px] bg-slate-50 p-2 rounded border border-slate-200">
                  Status: 15-day claim window expired April 15, 2027.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

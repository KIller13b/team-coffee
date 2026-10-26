import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, DollarSign, ShieldAlert, BookOpen, Clock } from 'lucide-react'
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
      <div className="card p-8 text-center text-war-muted font-mono animate-pulse">
        Evaluating Benchmark Grounding (PS-2 ODIN)...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card border-war-cyan/30">
        <div className="card-header bg-war-accent/20">
          <div>
            <div className="text-war-cyan font-mono font-bold text-sm">
              🎯 PS-2 ODIN OFFICIAL BENCHMARK VERIFICATION
            </div>
            <div className="text-war-muted text-xs mt-0.5">
              Automated testing suite for Hidden Contradictions, Unmet Dependencies & Outages Financial Recovery Gap
            </div>
          </div>
          <div className="flex gap-2">
            <span className="badge-info">Test 1: Breaches & Dependencies</span>
            <span className="badge-info">Test 2: SLA Recovery Gap</span>
          </div>
        </div>

        <div className="flex border-b border-war-border">
          <button
            onClick={() => setActiveTab('q1')}
            className={`flex-1 py-3 text-xs font-mono transition-colors border-r border-war-border flex items-center justify-center gap-2 ${
              activeTab === 'q1' ? 'text-war-cyan border-b-2 border-b-war-cyan bg-war-accent/20 font-bold' : 'text-war-muted hover:text-war-text'
            }`}
          >
            <ShieldAlert size={14} />
            QUESTION 1: HARBOR DEFAULT & MATERIAL BREACH (NON-OUTAGE)
          </button>
          <button
            onClick={() => setActiveTab('q2')}
            className={`flex-1 py-3 text-xs font-mono transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'q2' ? 'text-war-gold border-b-2 border-b-war-gold bg-war-accent/20 font-bold' : 'text-war-muted hover:text-war-text'
            }`}
          >
            <DollarSign size={14} />
            QUESTION 2: MARCH 3 OUTAGE & THE FINANCIAL RECOVERY GAP
          </button>
        </div>
      </div>

      {activeTab === 'q1' && q1Data && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-l-war-cyan bg-war-surface">
            <div className="text-war-muted font-mono text-xs mb-1">PROMPT QUERY (PS-2 ODIN):</div>
            <div className="text-war-text text-sm font-bold font-mono">
              "{q1Data.question}"
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {q1Data.findings.map((f, i) => (
              <div key={i} className="card p-4 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <SeverityBadge severity={f.severity} />
                    <span className="text-xs font-mono text-war-cyan">{f.clause}</span>
                  </div>
                  <div className="text-war-text text-sm font-bold mb-2">{f.issue}</div>
                  <div className="text-war-muted text-xs leading-relaxed mb-3">
                    {f.analysis}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-war-border">
                  <div className="text-xs bg-war-bg p-2 rounded border border-war-border">
                    <span className="text-war-cyan font-mono block mb-1">Verbatim Grounding:</span>
                    <span className="italic text-war-text text-xs">"{f.verbatim}"</span>
                  </div>
                  <div className="text-xs text-war-gold bg-war-gold/10 p-2 rounded border border-war-gold/30">
                    <span className="font-bold block">Company Records:</span>
                    <span>{f.company_records}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'q2' && q2Data && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-l-war-gold bg-war-surface">
            <div className="text-war-muted font-mono text-xs mb-1">PROMPT QUERY (PS-2 ODIN):</div>
            <div className="text-war-text text-sm font-bold font-mono">
              "On March 3, 2027, an unscheduled outage occurred (Event E-04). What was Quillhub's platform uptime percentage for March 2027, what financial credits does Quillhub owe its customers, and what credits can Quillhub recover from StratoNode?"
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 border-l-4 border-l-cyan-400">
              <div className="text-war-muted text-xs font-mono">PLATFORM UPTIME (MARCH 2027)</div>
              <div className="text-3xl font-mono font-bold text-war-cyan mt-1">
                {q2Data.uptime_calculation.monthly_uptime_percentage}%
              </div>
              <div className="text-war-muted text-xs mt-2 font-mono">
                {q2Data.uptime_calculation.formula}
              </div>
              <div className="text-war-muted text-xs mt-1">
                (44,450 operating minutes out of 44,640)
              </div>
            </div>

            <div className="card p-4 border-l-4 border-l-red-400">
              <div className="text-war-muted text-xs font-mono">CREDITS OWED TO CUSTOMERS</div>
              <div className="text-3xl font-mono font-bold text-red-400 mt-1">
                <MoneyBadge amount={q2Data.financial_recovery_gap.gross_liability_usd} />
              </div>
              <div className="text-war-muted text-xs mt-2">
                Harbor Retail: $6,000 (15% of $40k)
              </div>
              <div className="text-war-muted text-xs">
                Vantage Logistics: $0.00 (Service not yet live)
              </div>
            </div>

            <div className="card p-4 border-l-4 border-l-orange-400">
              <div className="text-war-muted text-xs font-mono">RECOVERABLE FROM STRATONODE</div>
              <div className="text-3xl font-mono font-bold text-war-gold mt-1">
                $0.00
              </div>
              <div className="text-war-muted text-xs mt-2">
                StratoNode SLA target: 99.5% (met at 99.574%)
              </div>
              <div className="text-war-muted text-xs">
                15-day notice window closed April 15, 2027
              </div>
            </div>
          </div>

          {/* Detailed breakdown & The Financial Recovery Gap */}
          <div className="card border-war-gold/40">
            <div className="card-header bg-war-gold/10">
              <span className="text-war-gold font-mono font-bold text-sm">
                ⚡ THE FINANCIAL RECOVERY GAP ROOT CAUSE ANALYSIS
              </span>
              <span className="badge-critical font-bold">
                NET LOSS: -$6,000.00
              </span>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-war-text text-xs leading-relaxed font-mono bg-war-bg p-3 rounded border border-war-border">
                {q2Data.financial_recovery_gap.root_cause}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-war-surface rounded border border-war-border text-xs space-y-2">
                  <div className="font-bold text-war-cyan font-mono border-b border-war-border pb-1">
                    DOWNSTREAM: Harbor Retail (B1 §3.1, §3.3)
                  </div>
                  <div><span className="text-war-muted">Uptime Target:</span> 99.9%</div>
                  <div><span className="text-war-muted">Status:</span> <span className="text-red-400 font-bold">BREACHED</span> (99.574% &lt; 99.9%)</div>
                  <div><span className="text-war-muted">Penalty Rate:</span> 15% of Monthly Fee</div>
                  <div><span className="text-war-muted">Monthly Fee:</span> $40,000.00</div>
                  <div><span className="text-war-muted">Credit Owed:</span> <span className="text-red-400 font-bold">$6,000.00</span></div>
                  <div className="p-2 bg-war-bg rounded text-war-muted italic">
                    "{q2Data.downstream_credits_owed.harbor_retail.citation}"
                  </div>
                  <div className="text-yellow-400 font-mono mt-1">
                    Defense: Harbor's request was filed June 15 (E-17), 31 days past 45-day deadline (May 15).
                  </div>
                </div>

                <div className="p-3 bg-war-surface rounded border border-war-border text-xs space-y-2">
                  <div className="font-bold text-war-cyan font-mono border-b border-war-border pb-1">
                    UPSTREAM: StratoNode Hosting (A2 §2.1, A3 §1)
                  </div>
                  <div><span className="text-war-muted">Uptime Target:</span> 99.5%</div>
                  <div><span className="text-war-muted">Status:</span> <span className="text-green-400 font-bold">MET</span> (99.574% &ge; 99.5%)</div>
                  <div><span className="text-war-muted">Downtime Minutes:</span> 190 min (Allowance: 223.2 min)</div>
                  <div><span className="text-war-muted">Credit Recoverable:</span> <span className="text-war-gold font-bold">$0.00</span></div>
                  <div><span className="text-war-muted">15-Day Claim Deadline:</span> April 15, 2027 (Expired)</div>
                  <div className="p-2 bg-war-bg rounded text-war-muted">
                    {q2Data.upstream_recovery_from_stratonode.reason}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

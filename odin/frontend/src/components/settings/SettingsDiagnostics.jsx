import React, { useState, useEffect } from 'react'
import { 
  Sliders, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  HardDrive,
  Info
} from 'lucide-react'

export function SettingsDiagnostics({ store }) {
  const { checkpoints, currentCheckpoint, setCheckpoint, runAnalysis, systemHealth, checkHealth } = store
  const [testingHealth, setTestingHealth] = useState(false)
  const [iterations, setIterations] = useState(3)
  const [diagnosticsResult, setDiagnosticsResult] = useState(null)

  useEffect(() => {
    runDiagnosticTest()
  }, [])

  const runDiagnosticTest = async () => {
    setTestingHealth(true)
    const t0 = performance.now()
    const results = {
      health: { ok: false, latency: 0 },
      checkpoints: { ok: false, count: 0 },
      contracts: { ok: false, count: 0 },
    }

    try {
      const res1 = await fetch('/health')
      results.health.ok = res1.ok
      results.health.latency = Math.round(performance.now() - t0)
    } catch (e) {
      results.health.ok = false
    }

    try {
      const res2 = await fetch('/api/checkpoints')
      if (res2.ok) {
        const d = await res2.json()
        results.checkpoints.ok = true
        results.checkpoints.count = d.checkpoints?.length || 0
      }
    } catch (e) {
      results.checkpoints.ok = false
    }

    try {
      const res3 = await fetch('/api/contracts')
      if (res3.ok) {
        const d = await res3.json()
        results.contracts.ok = true
        results.contracts.count = Object.keys(d.contracts || d || {}).length
      }
    } catch (e) {
      results.contracts.ok = false
    }

    setDiagnosticsResult(results)
    setTestingHealth(false)
    store.checkHealth()
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Settings Header */}
      <div className="workspace-panel p-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            System Preferences & Environment
          </span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Settings & Backend Diagnostics
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify live backend connectivity, manage temporal clock checkpoints, and inspect council agent parameters.
        </p>
      </div>

      {/* 1. Live Backend Connectivity & Diagnostics */}
      <div className="workspace-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Backend API Diagnostics
            </h3>
          </div>
          <button
            onClick={runDiagnosticTest}
            disabled={testingHealth}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={testingHealth ? 'animate-spin' : ''} />
            <span>{testingHealth ? 'Probing API...' : 'Re-test Endpoints'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Health probe */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-600">GET /health</span>
              {diagnosticsResult?.health?.ok ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={14} /> 200 OK
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                  <XCircle size={14} /> Offline
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Latency: <strong className="text-slate-800 font-mono">{diagnosticsResult?.health?.latency || 0} ms</strong>
            </div>
          </div>

          {/* Checkpoints probe */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-600">GET /api/checkpoints</span>
              {diagnosticsResult?.checkpoints?.ok ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={14} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                  <XCircle size={14} /> Failed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Checkpoints: <strong className="text-slate-800 font-mono">{diagnosticsResult?.checkpoints?.count || 3} available</strong>
            </div>
          </div>

          {/* Contracts probe */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-slate-600">GET /api/contracts</span>
              {diagnosticsResult?.contracts?.ok ? (
                <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                  <CheckCircle2 size={14} /> Manifest Loaded
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-rose-600 font-medium">
                  <XCircle size={14} /> Failed
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              Corpus: <strong className="text-slate-800 font-mono">Pack / odin_dev_pack</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Analysis & Temporal Clock Parameters */}
      <div className="workspace-panel p-6 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Clock size={18} className="text-purple-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Temporal Clock & Orchestration Preferences
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Active Simulated Checkpoint (Clock Date)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {checkpoints.map((cp, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCheckpoint(idx)
                    store.loadAnalysis(idx)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    currentCheckpoint === idx
                      ? 'border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-mono text-xs font-bold text-slate-900 mb-0.5">
                    Checkpoint {idx + 1}
                  </div>
                  <div className="font-mono text-xs text-indigo-700 font-medium">
                    {cp.date}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Max Orchestration Feedback Loops: <span className="font-mono text-indigo-600">{iterations}</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={iterations}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1">
              <span>1 loop (fast extraction)</span>
              <span>3 loops (standard consensus)</span>
              <span>5 loops (deep red-team)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Agent Architecture & Provenance */}
      <div className="workspace-panel p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <ShieldCheck size={18} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Data Integrity & Provenance Guarantees
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600">Verification Policy:</span>
            <span className="font-mono font-medium text-slate-800">
              NFR2 Zero-Hallucination Verbatim Verification (Strict Substring Matching)
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600">Inference Engine:</span>
            <span className="font-mono font-medium text-slate-800">
              Deterministic Rules Engine + Groq LLM Reasoning (when key configured)
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600">Bundle Source:</span>
            <span className="font-mono font-medium text-slate-800">
              Pack / odin_dev_pack / bundle
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-600">Council Version:</span>
            <span className="font-mono font-medium text-slate-800">
              Odin v1.0.0 (Track 2 Contract Intelligence)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

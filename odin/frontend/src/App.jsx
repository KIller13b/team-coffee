import React, { useEffect } from 'react'
import { useStore } from './stores/warRoomStore'
import { Navigation } from './components/shell/Navigation'
import { DashboardView } from './components/dashboard/DashboardView'
import { InvestigationTimeline } from './components/timeline/InvestigationTimeline'
import { ContractsWorkspace } from './components/contracts/ContractsWorkspace'
import { CouncilWorkspace } from './components/council/CouncilWorkspace'
import { SettingsDiagnostics } from './components/settings/SettingsDiagnostics'
import { LoadingSpinner } from './components/Shared'
import { AlertCircle } from 'lucide-react'

export default function App() {
  const store = useStore()
  const { 
    activePage, 
    analysis, 
    loading, 
    error, 
    loadCheckpoints, 
    loadAnalysis, 
    checkHealth,
    currentCheckpoint,
    setSelectedContractId,
    setActivePage
  } = store

  useEffect(() => {
    loadCheckpoints()
    loadAnalysis(1) // default to Checkpoint 2 (June 1, 2027)
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Persistent Navigation Shell */}
      <Navigation store={store} loading={loading} />

      {/* Main Workspace Surface */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span><strong>Analysis Engine Error:</strong> {error}</span>
            </div>
            <button 
              onClick={() => store.loadAnalysis(currentCheckpoint)}
              className="font-semibold underline hover:text-rose-950"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <LoadingSpinner label="Agent Council In Session — Synthesizing Findings..." />
        ) : (
          <>
            {activePage === 'dashboard' && <DashboardView store={store} />}
            {activePage === 'timeline' && (
              <InvestigationTimeline 
                analysis={analysis} 
                store={store}
                onSelectContract={(id) => {
                  setSelectedContractId(id)
                  setActivePage('contracts')
                }} 
              />
            )}
            {activePage === 'contracts' && <ContractsWorkspace analysis={analysis} store={store} />}
            {activePage === 'council' && <CouncilWorkspace store={store} />}
            {activePage === 'settings' && <SettingsDiagnostics store={store} />}
          </>
        )}
      </main>

      {/* Refined Enterprise Status Bar */}
      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-3 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Odin Council: OPERATIONAL
          </span>
          <span className="text-slate-300">•</span>
          <span>Session: <strong className="font-mono text-slate-700">{analysis?.session_id || 'IDLE'}</strong></span>
          <span className="text-slate-300">•</span>
          <span>Clock: <strong className="font-mono text-slate-700">{analysis?.current_checkpoint || '2027-06-01'}</strong></span>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
          <span>Common Paper STD v2.0 Grounded</span>
          <span>•</span>
          <span className="text-indigo-600 font-semibold">NFR2 Zero-Hallucination Mode</span>
        </div>
      </footer>
    </div>
  )
}

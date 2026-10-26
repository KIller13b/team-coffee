import React, { useEffect } from 'react'
import { useStore } from './stores/warRoomStore'
import { Header } from './components/Header'
import { OverviewPanel } from './components/OverviewPanel'
import { BenchmarkPanel } from './components/BenchmarkPanel'
import { ChatPanel } from './components/ChatPanel'
import { ContractGraph } from './components/ContractGraph'
import { LokiPanel } from './components/LokiPanel'
import { HeimdallPanel } from './components/HeimdallPanel'
import { TyrPanel } from './components/TyrPanel'
import { NornsPanel } from './components/NornsPanel'
import { ThorPanel } from './components/ThorPanel'
import { AuditLogPanel } from './components/AuditLogPanel'
import { LoadingSpinner } from './components/Shared'
import { LayoutDashboard, Award, Share2, ShieldAlert, Radio, Scale, Clock, Terminal, BookOpen, MessageSquare } from 'lucide-react'

export default function App() {
  const store = useStore()
  const { analysis, loading, error, activeTab, setActiveTab } = store

  useEffect(() => {
    store.loadCheckpoints()
    store.loadAnalysis(1) // default to Checkpoint 2 (June 1, 2027)
  }, [])

  const TABS = [
    { id: 'overview', label: 'WAR ROOM OVERVIEW', icon: LayoutDashboard },
    { id: 'chat', label: 'COUNCIL CHATBOT', icon: MessageSquare, highlight: true },
    { id: 'benchmark', label: 'PS-2 BENCHMARK Q&A', icon: Award, highlight: true },
    { id: 'graph', label: 'CONTRACT GRAPH', icon: Share2 },
    { id: 'loki', label: 'LOKI ATTACKS', icon: ShieldAlert, count: analysis?.loki_output?.attacks?.length },
    { id: 'heimdall', label: 'HEIMDALL EVENTS', icon: Radio, count: analysis?.heimdall_output?.active_alerts?.length },
    { id: 'tyr', label: 'TYR ACTIONS', icon: Scale, count: analysis?.tyr_output?.actions?.length },
    { id: 'norns', label: 'NORNS TIMELINE', icon: Clock },
    { id: 'thor', label: 'THOR EXTRACTIONS', icon: BookOpen },
    { id: 'audit', label: 'AGENT LOGS', icon: Terminal },
  ]

  return (
    <div className="min-h-screen bg-war-bg text-war-text flex flex-col font-mono">
      <Header
        store={store}
        analysis={analysis}
        onRun={(idx) => store.runAnalysis(idx)}
        loading={loading}
      />

      {/* Main navigation tabs */}
      <div className="border-b border-war-border bg-war-surface/60 backdrop-blur sticky top-[61px] z-40">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 text-xs font-mono rounded flex items-center gap-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-war-blue text-white font-bold shadow-md shadow-war-blue/30'
                    : tab.highlight
                    ? 'text-war-gold hover:text-white bg-war-gold/10 hover:bg-war-gold/20'
                    : 'text-war-muted hover:text-war-text hover:bg-war-surface'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.count != null && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-war-border'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main content container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {loading && <LoadingSpinner label="Odin War Room Agents In Council..." />}

        {error && (
          <div className="card p-4 border-red-500/50 bg-red-500/10 text-red-300 text-xs mb-4">
            Error: {error}
          </div>
        )}

        {!loading && analysis && (
          <>
            {activeTab === 'overview' && <OverviewPanel analysis={analysis} />}
            {activeTab === 'chat' && <ChatPanel store={store} />}
            {activeTab === 'benchmark' && <BenchmarkPanel store={store} />}
            {activeTab === 'graph' && <ContractGraph />}
            {activeTab === 'loki' && <LokiPanel analysis={analysis} />}
            {activeTab === 'heimdall' && <HeimdallPanel analysis={analysis} />}
            {activeTab === 'tyr' && <TyrPanel analysis={analysis} />}
            {activeTab === 'norns' && <NornsPanel analysis={analysis} />}
            {activeTab === 'thor' && <ThorPanel analysis={analysis} />}
            {activeTab === 'audit' && <AuditLogPanel analysis={analysis} />}
          </>
        )}
      </main>

      {/* Footer status bar */}
      <footer className="border-t border-war-border bg-war-surface px-4 py-2 text-[11px] text-war-muted flex flex-col md:flex-row justify-between items-center gap-2 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Odin Orchestrator Status: OPERATIONAL
          </span>
          <span>•</span>
          <span>Session: {analysis?.session_id || 'IDLE'}</span>
          <span>•</span>
          <span>Simulated Clock: {analysis?.current_checkpoint || '2027-06-01'}</span>
        </div>
        <div>
          <span>Common Paper Standard Terms Grounded • NFR2 Zero Hallucination Mode</span>
        </div>
      </footer>
    </div>
  )
}

import React from 'react'
import { 
  LayoutDashboard, 
  Clock, 
  FileText, 
  MessageSquare, 
  Sliders, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  Award
} from 'lucide-react'

export function Navigation({ store, loading }) {
  const { activePage, setActivePage, analysis, checkpoints, currentCheckpoint, setCheckpoint, runAnalysis, systemHealth } = store

  const NAV_ITEMS = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      badge: analysis?.loki_output?.attacks?.filter(a => a.severity === 'critical').length || null,
      badgeType: 'critical'
    },
    { 
      id: 'timeline', 
      label: 'Timeline', 
      icon: Clock,
      badge: analysis?.norns_output?.timeline?.length || null,
      badgeType: 'neutral'
    },
    { 
      id: 'contracts', 
      label: 'Contracts & Topology', 
      icon: FileText,
      badge: Object.keys(analysis?.extractions || {}).length || null,
      badgeType: 'neutral'
    },
    { 
      id: 'council', 
      label: 'Council & Benchmarks', 
      icon: Award,
      highlight: true
    },
    { 
      id: 'settings', 
      label: 'Settings & Health', 
      icon: Sliders 
    },
  ]

  const healthColor = systemHealth?.status === 'operational' 
    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    : 'text-amber-500 bg-amber-500/10 border-amber-500/20'

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 font-serif font-bold text-base shadow-sm">
              ⚔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">
                  Odin
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Multi-Agent Contract Intelligence
              </p>
            </div>
          </div>

          {/* Primary Navigation Tabs */}
          <nav className="flex items-center space-x-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all relative ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : item.highlight
                      ? 'text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white' 
                        : item.badgeType === 'critical'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Temporal Checkpoint Selector & Run Button */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              {checkpoints.map((cp, idx) => {
                const isSelected = currentCheckpoint === idx
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCheckpoint(idx)
                      store.loadAnalysis(idx)
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${
                      isSelected
                        ? 'bg-white text-slate-900 font-semibold shadow-xs border border-slate-200'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={cp.label}
                  >
                    {cp.date.slice(5)}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => runAnalysis(currentCheckpoint)}
              disabled={loading}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Reasoning...</span>
                </>
              ) : (
                <>
                  <Play size={13} className="fill-current" />
                  <span>Run Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

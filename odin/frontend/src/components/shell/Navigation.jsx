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
      badge: 8,
      badgeType: 'neutral'
    },
    { 
      id: 'council', 
      label: 'Council Chatbot', 
      icon: MessageSquare,
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
    <header className="sticky top-0 z-50 liquid-glass-header transition-all">
      {/* Specular fluid light sheen */}
      <div className="absolute inset-0 liquid-glass-sheen pointer-events-none opacity-80" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Product Identity with Liquid Obsidian Glass */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-white/20 flex items-center justify-center text-amber-400 font-serif font-bold text-base shadow-[0_4px_12px_rgba(15,23,42,0.18),inset_0_1px_1px_rgba(255,255,255,0.3)]">
              ⚔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm tracking-tight">
                  Odin
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/70 backdrop-blur-md text-slate-700 border border-white/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_3px_rgba(0,0,0,0.04)]">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Multi-Agent Contract Intelligence
              </p>
            </div>
          </div>

          {/* Primary Navigation - Liquid Glass Dock */}
          <nav className="flex items-center p-1 rounded-2xl bg-slate-200/40 backdrop-blur-md border border-white/75 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_2px_8px_rgba(15,23,42,0.03)] space-x-1" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activePage === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all relative ${
                    isActive
                      ? 'liquid-glass-active'
                      : item.highlight
                      ? 'text-indigo-600 hover:text-indigo-900 hover:bg-white/70 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/70 hover:shadow-xs'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-400'} />
                  <span>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      isActive 
                        ? 'bg-white/20 text-white border border-white/20' 
                        : item.badgeType === 'critical'
                        ? 'bg-rose-100/90 text-rose-700 border border-rose-200/80 shadow-xs'
                        : 'bg-slate-200/90 text-slate-700 border border-slate-300/80 shadow-xs'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>

          {/* Temporal Checkpoint Selector & Liquid Sapphire Run Button */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1 bg-slate-200/40 backdrop-blur-md p-1 rounded-2xl border border-white/75 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)]">
              {checkpoints.map((cp, idx) => {
                const isSelected = currentCheckpoint === idx
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCheckpoint(idx)
                      store.loadAnalysis(idx)
                    }}
                    className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white/95 text-slate-900 font-semibold shadow-[0_2px_6px_rgba(15,23,42,0.06),inset_0_1px_1px_rgba(255,255,255,1)] border border-white/90'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
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
              className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-[0_4px_14px_rgba(79,70,229,0.35),inset_0_1px_1px_rgba(255,255,255,0.35)] border border-indigo-300/30 transition-all duration-200 disabled:opacity-50 active:scale-95"
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

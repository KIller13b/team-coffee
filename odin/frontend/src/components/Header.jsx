import React from 'react'
import { Clock, Play, RefreshCw, Shield, AlertTriangle } from 'lucide-react'

export function Header({ store, analysis, onRun, loading }) {
  const checkpoints = store.checkpoints || []
  const currentIdx = store.currentCheckpoint

  return (
    <header className="border-b border-war-border bg-war-surface sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Branding */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-gradient-to-br from-war-blue to-war-cyan flex items-center justify-center font-bold text-white shadow-lg shadow-war-blue/20">
            ⚔
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-base text-war-text tracking-wide">
                ODIN : THE CONTRACT WAR ROOM
              </span>
              <span className="badge-critical text-[10px]">LIVE COMBAT</span>
            </div>
            <div className="text-war-muted text-xs font-mono">
              Quillhub Inc. Autonomous Contract Intelligence Engine (Track 2)
            </div>
          </div>
        </div>

        {/* Temporal Time Slider / Checkpoints (FR9.2) */}
        <div className="flex items-center gap-3 bg-war-bg px-3 py-1.5 rounded-lg border border-war-border">
          <Clock size={16} className="text-war-cyan shrink-0" />
          <div className="flex items-center gap-1">
            {checkpoints.map((cp, idx) => {
              const isActive = currentIdx === idx
              return (
                <button
                  key={idx}
                  onClick={() => {
                    store.setCheckpoint(idx)
                    store.loadAnalysis(idx)
                  }}
                  className={`px-3 py-1 text-xs font-mono rounded transition-all flex flex-col items-center ${
                    isActive
                      ? 'bg-war-blue text-white font-bold shadow-md shadow-war-blue/40 border border-war-cyan'
                      : 'text-war-muted hover:text-war-text hover:bg-war-surface'
                  }`}
                >
                  <span className="text-[10px] opacity-75">CP {idx + 1}</span>
                  <span>{cp.date}</span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => onRun(currentIdx)}
            disabled={loading}
            className="ml-2 px-3 py-1.5 bg-war-cyan/20 text-war-cyan border border-war-cyan/40 hover:bg-war-cyan/30 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {loading ? <RefreshCw size={13} className="animate-spin" /> : <Play size={13} />}
            {loading ? 'ANALYZING...' : 'DISPATCH AGENTS'}
          </button>
        </div>
      </div>
    </header>
  )
}

import React, { useState, useEffect, useRef } from 'react'
import { 
  Clock, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle,
  FileText,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react'
import { Citation, MoneyBadge, StatusBadge, AgentBadge } from '../Shared'
import { WhatIfStrategySandbox } from '../dashboard/WhatIfStrategySandbox'

export function InvestigationTimeline({ analysis, store, onSelectContract }) {
  const [timelineMode, setTimelineMode] = useState('audit_trail') // 'audit_trail' | 'what_if'
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  
  // Interactive Slider State
  const [sliderIndex, setSliderIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [filterUpToDate, setFilterUpToDate] = useState(false)
  const playTimerRef = useRef(null)

  if (!analysis?.norns_output) {
    return (
      <div className="workspace-panel p-8 text-center text-slate-500">
        No timeline data available for this checkpoint.
      </div>
    )
  }

  const timeline = analysis.norns_output.timeline || []
  const worstCase = analysis.norns_output.worst_case
  const clock = analysis.current_checkpoint || '2027-06-01'

  // Set default slider index to current checkpoint or nearest milestone
  useEffect(() => {
    if (timeline.length > 0) {
      // Find index closest to clock date
      const idx = timeline.findIndex(t => t.date >= clock)
      setSliderIndex(idx !== -1 ? idx : Math.floor(timeline.length / 2))
    }
  }, [clock, timeline.length])

  // Play / Auto-advance scrubber timer
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setSliderIndex(prev => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 1600)
    } else {
      clearInterval(playTimerRef.current)
    }
    return () => clearInterval(playTimerRef.current)
  }, [isPlaying, timeline.length])

  const activeMilestone = timeline[sliderIndex] || timeline[0]

  // Calculate cumulative exposure up to current slider index
  const cumulativeExposure = timeline
    .slice(0, sliderIndex + 1)
    .reduce((sum, item) => sum + (item.financial_exposure || 0), 0)

  // Filter entries
  const filtered = timeline.filter((entry, idx) => {
    if (filterUpToDate && idx > sliderIndex) return false
    if (activeFilter !== 'all' && entry.status !== activeFilter) return false
    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      return (
        entry.label?.toLowerCase().includes(q) ||
        entry.description?.toLowerCase().includes(q) ||
        entry.contract_id?.toLowerCase().includes(q) ||
        entry.clause_ref?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    all: timeline.length,
    overdue: timeline.filter(t => t.status === 'overdue').length,
    critical: timeline.filter(t => t.status === 'critical').length,
    due: timeline.filter(t => t.status === 'due').length,
    upcoming: timeline.filter(t => t.status === 'upcoming').length,
  }

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="workspace-panel p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                Temporal Reasoning & Milestone Scrubber
              </span>
              <span className="text-xs font-mono text-slate-500">
                Current Checkpoint: <strong className="text-slate-800">{clock}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Investigation Timeline Slider
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Scrub interactively through time to inspect contract milestones, outage dates, SLA claim expirations, and exposure accumulation.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* View Mode Toggle: Scrubber vs What-If Sandbox */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-2xs">
              <button
                onClick={() => setTimelineMode('audit_trail')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  timelineMode === 'audit_trail'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Clock size={13} />
                <span>Investigation Trail</span>
              </button>
              <button
                onClick={() => setTimelineMode('what_if')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  timelineMode === 'what_if'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles size={13} className={timelineMode === 'what_if' ? 'text-amber-300' : 'text-indigo-600'} />
                <span>What-If Strategy Sandbox</span>
              </button>
            </div>

            {/* Worst-Case Summary Pill */}
            {worstCase && timelineMode === 'audit_trail' && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center gap-3">
                <div>
                  <div className="text-[10px] font-semibold text-amber-800 uppercase tracking-wider">
                    Worst-Case Exposure
                  </div>
                  <div className="text-xl font-bold font-mono text-amber-950">
                    <MoneyBadge amount={worstCase.total_exposure_usd} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {timelineMode === 'what_if' ? (
          <div className="mt-5">
            <WhatIfStrategySandbox store={store || { analysis }} />
          </div>
        ) : (
          <div className="space-y-4 mt-5">
            {/* ─── INTERACTIVE TIMELINE SLIDER CONTROLLER ───────────────────────── */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                <Calendar size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Scrubbed Milestone {sliderIndex + 1} of {timeline.length}
                </div>
                <div className="text-base font-bold font-mono text-slate-900 flex items-center gap-2">
                  <span>{activeMilestone?.date}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-sans text-indigo-700 font-semibold">{activeMilestone?.label}</span>
                </div>
              </div>
            </div>

            {/* Slider Play / Step Controls */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <button
                onClick={() => setSliderIndex(Math.max(0, sliderIndex - 1))}
                disabled={sliderIndex === 0}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors shadow-2xs"
                title="Previous Milestone"
              >
                <SkipBack size={14} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs ${
                  isPlaying 
                    ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {isPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>

              <button
                onClick={() => setSliderIndex(Math.min(timeline.length - 1, sliderIndex + 1))}
                disabled={sliderIndex === timeline.length - 1}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 disabled:opacity-40 transition-colors shadow-2xs"
                title="Next Milestone"
              >
                <SkipForward size={14} />
              </button>
            </div>
          </div>

          {/* Range Slider Track */}
          <div className="space-y-2 pt-2">
            <div className="relative flex items-center">
              <input
                type="range"
                min={0}
                max={timeline.length - 1}
                step={1}
                value={sliderIndex}
                onChange={(e) => {
                  setSliderIndex(Number(e.target.value))
                  setIsPlaying(false)
                }}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 transition-all focus:outline-none"
              />
            </div>

            {/* Timeline Tick Labels */}
            <div className="flex justify-between text-[10px] font-mono text-slate-400 px-1 select-none">
              <span>{timeline[0]?.date} (Start)</span>
              {timeline.length > 2 && (
                <span className="hidden sm:inline">
                  {timeline[Math.floor(timeline.length / 2)]?.date}
                </span>
              )}
              <span>{timeline[timeline.length - 1]?.date} (End)</span>
            </div>
          </div>

          {/* Quick Jump Buttons & Cumulative Stats Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs">
            {/* Quick Checkpoint Jump Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium text-slate-400 mr-1">Checkpoints:</span>
              {[
                { label: 'Mar 15 (CP1)', date: '2027-03-15' },
                { label: 'Jun 01 (CP2)', date: '2027-06-01' },
                { label: 'Sep 15 (CP3)', date: '2027-09-15' },
              ].map(cp => {
                const targetIdx = timeline.findIndex(t => t.date >= cp.date)
                const actualIdx = targetIdx !== -1 ? targetIdx : timeline.length - 1
                const isActive = sliderIndex === actualIdx

                return (
                  <button
                    key={cp.label}
                    onClick={() => {
                      setSliderIndex(actualIdx)
                      setIsPlaying(false)
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {cp.label}
                  </button>
                )
              })}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={filterUpToDate}
                  onChange={(e) => setFilterUpToDate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                />
                <span className="text-[11px]">Filter list to milestones ≤ scrubbed date</span>
              </label>

              {cumulativeExposure > 0 && (
                <div className="text-[11px] font-mono text-slate-500 hidden md:block">
                  Exposure to date: <strong className="text-rose-600 font-bold">${cumulativeExposure.toLocaleString()}</strong>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── ACTIVE SPOTLIGHT MILESTONE CARD ─────────────────────────────── */}
        {activeMilestone && (
          <div className="mt-4 p-5 rounded-2xl bg-white border-2 border-indigo-200 shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                    {activeMilestone.date}
                  </span>
                  <StatusBadge status={activeMilestone.status} />
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-semibold">
                    {activeMilestone.contract_id}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {activeMilestone.clause_ref}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 pt-1">
                  {activeMilestone.label}
                </h3>
              </div>

              {activeMilestone.financial_exposure != null && activeMilestone.financial_exposure > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-right">
                  <span className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider block">
                    Direct Financial Exposure
                  </span>
                  <MoneyBadge amount={activeMilestone.financial_exposure} className="text-base font-bold text-rose-800" />
                </div>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-sans mb-3">
              {activeMilestone.description}
            </p>

            {/* Citations for active milestone */}
            {activeMilestone.citations?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Verifiable Contract Citations:
                </span>
                <div className="space-y-1.5">
                  {activeMilestone.citations.map((c, i) => (
                    <Citation key={i} citation={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )}
  </div>

  {timelineMode === 'audit_trail' && (
    <>
        {/* Filter and Search Controls for Chronological Feed */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'overdue', label: 'Overdue' },
            { id: 'critical', label: 'Critical' },
            { id: 'due', label: 'Due' },
            { id: 'upcoming', label: 'Upcoming' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{f.label}</span>
              <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {counts[f.id] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search timeline..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Ordered Timeline Items List */}
      <div className="workspace-panel divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No milestones match the current filter criteria or scrubbed timeline range.
          </div>
        ) : (
          filtered.map((entry, idx) => {
            const originalIndex = timeline.findIndex(t => t.date === entry.date && t.label === entry.label)
            const isSpotlighted = originalIndex === sliderIndex
            const isExpanded = expandedId === idx

            return (
              <div 
                key={idx} 
                className={`transition-colors ${
                  isSpotlighted ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600' : 'hover:bg-slate-50/60'
                }`}
              >
                <div 
                  onClick={() => {
                    setSliderIndex(originalIndex)
                    setExpandedId(isExpanded ? null : idx)
                  }}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1">
                    {/* Status Dot / Date Indicator */}
                    <div className="flex flex-col items-center pt-0.5 shrink-0">
                      <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                        isSpotlighted 
                          ? 'bg-indigo-600 text-white border-indigo-600' 
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}>
                        {entry.date}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 text-xs">
                          {entry.label}
                        </span>
                        <StatusBadge status={entry.status} />
                        <span className="text-[11px] font-mono text-indigo-700 font-medium px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 rounded">
                          {entry.contract_id}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {entry.clause_ref}
                        </span>
                        {isSpotlighted && (
                          <span className="text-[10px] font-mono bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded font-bold">
                            SLIDER ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>
                  </div>

                  {/* Financial & Expand toggle */}
                  <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                    {entry.financial_exposure != null && entry.financial_exposure > 0 && (
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 font-mono">Liability</div>
                        <MoneyBadge amount={entry.financial_exposure} className="text-xs font-bold text-rose-600" />
                      </div>
                    )}
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 bg-slate-50/80 border-t border-slate-100 space-y-4 text-xs">
                    <div>
                      <h5 className="font-semibold text-slate-800 mb-1">Detailed Findings & Strategic Context:</h5>
                      <p className="text-slate-600 leading-relaxed">
                        {entry.description}
                      </p>
                    </div>

                    {/* Citations */}
                    {entry.citations?.length > 0 && (
                      <div>
                        <h5 className="font-semibold text-slate-800 mb-2">Grounded Clause Citations:</h5>
                        <div className="space-y-2">
                          {entry.citations.map((c, cIdx) => (
                            <Citation key={cIdx} citation={c} />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-500 font-mono text-[11px]">
                      <span>Evaluated by: Norns Temporal Agent</span>
                      {onSelectContract && (
                        <button
                          onClick={() => onSelectContract(entry.contract_id)}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                        >
                          <span>Inspect Agreement ({entry.contract_id})</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Worst-Case Narrative Card */}
      {worstCase && (
        <div className="workspace-panel p-6 border-amber-200 bg-amber-50/30">
          <div className="flex items-center gap-2 mb-3 text-amber-900 font-semibold text-sm">
            <AlertTriangle size={16} className="text-amber-600" />
            Worst-Case Counterparty Adjudication Scenario
          </div>
          <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-sans">
            {worstCase.scenario}
          </p>
          {worstCase.notes && (
            <div className="mt-3 text-[11px] text-slate-500 italic border-t border-amber-200/60 pt-2 font-mono">
              Note: {worstCase.notes}
            </div>
          )}
        </div>
      )}
          </>
        )}
    </div>
  )
}

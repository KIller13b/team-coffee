import React, { useState, useEffect } from 'react'
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  Layers, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Calendar, 
  FileText, 
  Scale, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  DollarSign, 
  ChevronRight, 
  Sliders, 
  Info,
  Building2,
  ExternalLink,
  Flame,
  ArrowUpRight
} from 'lucide-react'
import { SeverityBadge, MoneyBadge, AgentBadge, Citation } from '../Shared'

export function WhatIfStrategySandbox({ store }) {
  const { 
    analysis, 
    simulationResult, 
    simulating, 
    runWhatIfSimulation, 
    loadWhatIfPresets, 
    whatIfPresets,
    setActivePage,
    setSelectedContractId
  } = store

  // Simulation controls state
  const [promptText, setPromptText] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('vendor_default_day_45')
  const [scenarioType, setScenarioType] = useState('vendor_default')
  const [dayOffset, setDayOffset] = useState(45)
  const [targetContractId, setTargetContractId] = useState('QH-STRATO-2026-001')
  const [terminationCause, setTerminationCause] = useState('breach')
  const [activeTab, setActiveTab] = useState('immediate') // 'immediate' | 'cascades' | 'severance' | 'portfolio' | 'timeline'
  const [sliderDebounceTimer, setSliderDebounceTimer] = useState(null)

  // Load presets on mount
  useEffect(() => {
    loadWhatIfPresets()
  }, [])

  // Initial simulation on mount
  useEffect(() => {
    executeSimulation(45, 'vendor_default', 'QH-STRATO-2026-001', 'breach')
  }, [])

  const executeSimulation = async (day, type, contractId, cause) => {
    try {
      await runWhatIfSimulation({
        scenario_type: type,
        day_offset: day,
        target_contract_id: contractId,
        termination_cause: cause
      })
    } catch (e) {
      console.error('Error running simulation:', e)
    }
  }

  const handlePredictPrompt = async (overrideText) => {
    const text = overrideText || promptText
    if (!text || !text.trim()) return
    try {
      const result = await runWhatIfSimulation({
        prompt: text.trim()
      })
      if (result?.prompt_interpretation) {
        setDayOffset(result.prompt_interpretation.day_offset)
        setScenarioType(result.prompt_interpretation.scenario_type)
        setTargetContractId(result.prompt_interpretation.target_contract_id)
        setTerminationCause(result.prompt_interpretation.termination_cause)
        setSelectedPresetId('prompt_custom')
      }
    } catch (e) {
      console.error('Error running prompt simulation:', e)
    }
  }

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setScenarioType(preset.scenario_type)
    setDayOffset(preset.day_offset)
    setTargetContractId(preset.target_contract_id)
    executeSimulation(preset.day_offset, preset.scenario_type, preset.target_contract_id, terminationCause)
  }

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10)
    setDayOffset(val)
    setSelectedPresetId('custom')

    // Debounce simulation API call
    if (sliderDebounceTimer) clearTimeout(sliderDebounceTimer)
    const timer = setTimeout(() => {
      executeSimulation(val, scenarioType, targetContractId, terminationCause)
    }, 180)
    setSliderDebounceTimer(timer)
  }

  const handleJumpDay = (day) => {
    setDayOffset(day)
    setSelectedPresetId('custom')
    executeSimulation(day, scenarioType, targetContractId, terminationCause)
  }

  const handleCauseToggle = (cause) => {
    setTerminationCause(cause)
    executeSimulation(dayOffset, scenarioType, targetContractId, cause)
  }

  const res = simulationResult

  // Calculate simulated calendar date
  const baseDate = new Date('2027-03-01T00:00:00Z')
  const simDate = new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)
  const formattedSimDate = simDate.toISOString().slice(0, 10)

  return (
    <div className="workspace-panel overflow-hidden border border-indigo-200/80 shadow-md bg-gradient-to-b from-white via-indigo-50/20 to-white">
      {/* ─── Header & Strategic Overview ─────────────────────────────────── */}
      <div className="p-6 border-b border-indigo-100 bg-white/80 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                <Sparkles size={13} className="text-indigo-600 animate-pulse" />
                Advanced Analytics & Forecasting
              </span>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Agent Norns Timeline Sandbox
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>What-If Strategy Sandbox</span>
              <span className="text-xs font-normal text-slate-500 hidden sm:inline">
                — Dynamic Multi-Tier Contract Risk Simulation
              </span>
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Simulate hypothetical disruptions, vendor defaults, and early contract terminations. 
              The engine recalculates immediate downstream customer penalties, cross-contract cascade liabilities, 
              and total portfolio severance costs in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {simulating && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 animate-pulse">
                <RefreshCw size={13} className="animate-spin" />
                <span>Simulating...</span>
              </span>
            )}
            <button
              onClick={() => executeSimulation(dayOffset, scenarioType, targetContractId, terminationCause)}
              disabled={simulating}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={simulating ? 'animate-spin' : ''} />
              <span>Recalculate</span>
            </button>
          </div>
        </div>

        {/* ─── Natural Language Simulation Prompt Bar ─────────────────────────── */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 border border-indigo-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles size={14} className="text-indigo-600 animate-pulse" />
              <span>Ask What-If Scenario Prompt & Predict Output</span>
            </label>
            <span className="text-[11px] font-mono text-indigo-700 bg-white/80 px-2 py-0.5 rounded-full border border-indigo-200 shadow-2xs">
              Natural Language Predictive Engine
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePredictPrompt()}
                placeholder="Ask any scenario (e.g. 'What happens if Vendor X defaults on Day 45?' or 'What is our total exposure if we terminate Product Y early?')..."
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition-all font-sans"
              />
              {promptText && (
                <button
                  onClick={() => setPromptText('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={() => handlePredictPrompt()}
              disabled={simulating || !promptText.trim()}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 shrink-0 active:scale-95"
            >
              {simulating ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Predicting...</span>
                </>
              ) : (
                <>
                  <Sparkles size={13} className="text-amber-300" />
                  <span>Predict Output</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-slate-500 shrink-0">Try Prompts:</span>
            {[
              "What happens if Vendor X defaults on Day 45?",
              "What is our total exposure if we terminate Product Y early on Day 60?",
              "What if Pixelwright frontend agency defaults on Day 60?",
              "What if Meridian insurance policy lapses on Day 106?"
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptText(p)
                  handlePredictPrompt(p)
                }}
                className="px-2.5 py-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-indigo-900 text-[11px] border border-indigo-200/80 transition-colors whitespace-nowrap shadow-2xs font-sans text-left"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Active Prompt Interpretation Card */}
          {res?.prompt_interpretation && (
            <div className="mt-3 p-3 rounded-xl bg-white/95 border border-indigo-200 text-xs shadow-2xs flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  Prompt Parsed & Predicted
                </span>
                <span className="text-slate-600 font-mono text-[11px]">
                  Target: <strong className="text-slate-900">{res.prompt_interpretation.detected_entity}</strong>
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  Point: <strong className="text-slate-900">Day {res.prompt_interpretation.day_offset}</strong> ({res.simulated_date})
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-mono text-[11px]">
                  Classification: <strong className="text-slate-900">{res.prompt_interpretation.scenario_type.replace('_', ' ').toUpperCase()}</strong>
                </span>
              </div>

              <div className="text-[11px] font-mono text-indigo-700 font-semibold">
                Confidence: {(res.prompt_interpretation.confidence * 100).toFixed(0)}%
              </div>
            </div>
          )}
        </div>

        {/* ─── Scenario Presets Bar ────────────────────────────────────────── */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
            <Sliders size={13} />
            <span>Simulate Scenario Presets:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Preset 1 */}
            <button
              onClick={() => handleSelectPreset({
                id: 'vendor_default_day_45',
                scenario_type: 'vendor_default',
                day_offset: 45,
                target_contract_id: 'QH-STRATO-2026-001'
              })}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedPresetId === 'vendor_default_day_45'
                  ? 'bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700">
                  Day 45
                </span>
                <span className="text-[10px] font-mono text-slate-400">StratoNode A1</span>
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Vendor X Defaults on Day 45
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                Catastrophic cloud hosting outage & downstream SLA cascade.
              </div>
            </button>

            {/* Preset 2 */}
            <button
              onClick={() => handleSelectPreset({
                id: 'terminate_product_y_early',
                scenario_type: 'early_termination',
                day_offset: 60,
                target_contract_id: 'QH-HARBOR-2026-001'
              })}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedPresetId === 'terminate_product_y_early'
                  ? 'bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                  Day 60
                </span>
                <span className="text-[10px] font-mono text-slate-400">Harbor B1</span>
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Terminate Product Y Early
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                Lost $40k/mo ARR vs territory exclusivity relief on Vantage.
              </div>
            </button>

            {/* Preset 3 */}
            <button
              onClick={() => handleSelectPreset({
                id: 'developer_default_day_60',
                scenario_type: 'developer_default',
                day_offset: 60,
                target_contract_id: 'QH-PIXEL-2026-001'
              })}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedPresetId === 'developer_default_day_60'
                  ? 'bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                  Day 60
                </span>
                <span className="text-[10px] font-mono text-slate-400">Pixelwright D1</span>
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Agency Milestone Default
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                Withhold $20k M4/M5; emergency React squad costs.
              </div>
            </button>

            {/* Preset 4 */}
            <button
              onClick={() => handleSelectPreset({
                id: 'insurance_lapse_day_106',
                scenario_type: 'insurance_lapse',
                day_offset: 106,
                target_contract_id: 'QH-HARBOR-2026-001'
              })}
              className={`p-3 rounded-xl text-left transition-all border ${
                selectedPresetId === 'insurance_lapse_day_106'
                  ? 'bg-indigo-50/90 border-indigo-400 ring-1 ring-indigo-400 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                  Day 106 (Jun 30)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Meridian Mutual</span>
              </div>
              <div className="text-xs font-bold text-slate-900 leading-snug">
                Insurance Lapse Trigger
              </div>
              <div className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                B1 §7.2 material breach triggers unilateral contract loss.
              </div>
            </button>
          </div>
        </div>

        {/* ─── Norns Timeline Slider Control ───────────────────────────────── */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-600 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-900">
                Norns Simulation Timeline Scrubber
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-slate-600">
                Simulated Point: <strong className="text-slate-900 text-sm font-bold">Day {dayOffset}</strong> ({formattedSimDate})
              </div>

              {/* Early termination cause toggle */}
              {scenarioType === 'early_termination' && (
                <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-mono shadow-2xs">
                  <button
                    onClick={() => handleCauseToggle('breach')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${terminationCause === 'breach' ? 'bg-rose-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    For Cause
                  </button>
                  <button
                    onClick={() => handleCauseToggle('convenience')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${terminationCause === 'convenience' ? 'bg-amber-600 text-white font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Convenience
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Range Scrubber */}
          <div className="space-y-2">
            <input 
              type="range"
              min={1}
              max={180}
              value={dayOffset}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-0.5 font-medium">
              <span>Day 1 (Mar 01)</span>
              <span>Day 45 (Apr 15)</span>
              <span>Day 92 (Jun 01)</span>
              <span>Day 106 (Jun 30)</span>
              <span>Day 180 (Aug 28)</span>
            </div>
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-mono text-slate-500 shrink-0 font-medium">Quick Jumps:</span>
            {[
              { day: 15, label: 'Day 15 (Mar 15)' },
              { day: 30, label: 'Day 30 (Mar 30)' },
              { day: 45, label: 'Day 45 (Vendor X Default)' },
              { day: 60, label: 'Day 60 (Apr 30)' },
              { day: 92, label: 'Day 92 (Checkpoint 2)' },
              { day: 106, label: 'Day 106 (Insurance Lapse)' },
              { day: 135, label: 'Day 135 (Jul 15)' }
            ].map(item => (
              <button
                key={item.day}
                onClick={() => handleJumpDay(item.day)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all whitespace-nowrap border ${
                  dayOffset === item.day
                    ? 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Recalculated Portfolio Exposure Impact (Analytics Cards) ────────── */}
      {res && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Baseline Exposure */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Baseline Portfolio Exposure
              </span>
              <div className="text-2xl font-bold font-mono text-slate-700">
                ${(res.baseline_exposure_usd).toLocaleString()}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Standard contractual exposure at active checkpoint
              </p>
            </div>

            {/* Simulated Exposure */}
            <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200">
              <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider block mb-1">
                Recalculated Simulated Exposure
              </span>
              <div className="text-2xl font-bold font-mono text-indigo-900">
                ${(res.simulated_exposure_usd).toLocaleString()}
              </div>
              <p className="text-[11px] text-indigo-600 mt-1">
                Total exposure across entire contract portfolio
              </p>
            </div>

            {/* Exposure Delta */}
            <div className={`p-4 rounded-xl border ${
              res.delta_exposure_usd >= 0 
                ? 'bg-rose-50/80 border-rose-200' 
                : 'bg-emerald-50/80 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wider ${
                  res.delta_exposure_usd >= 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  Portfolio Exposure Delta
                </span>
                {res.delta_exposure_usd >= 0 ? (
                  <TrendingUp size={16} className="text-rose-600" />
                ) : (
                  <TrendingDown size={16} className="text-emerald-600" />
                )}
              </div>
              <div className={`text-2xl font-bold font-mono ${
                res.delta_exposure_usd >= 0 ? 'text-rose-900' : 'text-emerald-900'
              }`}>
                {res.delta_exposure_usd >= 0 ? '+' : ''}${(res.delta_exposure_usd).toLocaleString()}
              </div>
              <p className={`text-[11px] mt-1 ${
                res.delta_exposure_usd >= 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                {res.delta_exposure_usd >= 0 
                  ? 'Severe liability escalation triggered by scenario' 
                  : 'Favorable liability mitigation achieved'}
              </p>
            </div>
          </div>

          {/* ─── Executive Summary Callout ─────────────────────────────────── */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="font-semibold block text-amber-950">
                {res.title}
              </strong>
              <p className="leading-relaxed text-amber-800">
                {res.executive_summary}
              </p>
            </div>
          </div>

          {/* ─── 4 Interactive Analytics Tabs ──────────────────────────────── */}
          <div>
            <div className="flex items-center space-x-1 border-b border-slate-200 mb-4 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveTab('immediate')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'immediate'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Flame size={14} className={activeTab === 'immediate' ? 'text-amber-300' : 'text-slate-400'} />
                <span>1. Immediate Downstream Penalties</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'immediate' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {res.immediate_penalties.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('cascades')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'cascades'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Layers size={14} className={activeTab === 'cascades' ? 'text-indigo-200' : 'text-slate-400'} />
                <span>2. Cascade Effects on Dependent Contracts</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'cascades' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {res.cascade_effects.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('severance')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'severance'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <DollarSign size={14} className={activeTab === 'severance' ? 'text-emerald-300' : 'text-slate-400'} />
                <span>3. Severance & Early-Termination Costs</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'severance' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {res.severance_and_termination_costs.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('portfolio')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'portfolio'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 size={14} className={activeTab === 'portfolio' ? 'text-indigo-200' : 'text-slate-400'} />
                <span>Portfolio Impact Status Grid</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'portfolio' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {res.contract_portfolio_impacts.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('timeline')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
                  activeTab === 'timeline'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Clock size={14} className={activeTab === 'timeline' ? 'text-indigo-200' : 'text-slate-400'} />
                <span>Projected Norns Milestones</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === 'timeline' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {res.norns_projected_timeline.length}
                </span>
              </button>
            </div>

            {/* ─── TAB 1: IMMEDIATE DOWNSTREAM PENALTIES ────────────────── */}
            {activeTab === 'immediate' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Direct contractual liquidated damages and credit liabilities triggered by default:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Total Immediate: ${res.immediate_penalties.reduce((sum, p) => sum + p.amount_usd, 0).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {res.immediate_penalties.map((pen, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                            {pen.target_contract}
                          </span>
                          <span className="text-[10px] font-mono text-indigo-600 ml-2 font-semibold">
                            {pen.clause_ref}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 mt-1">
                            {pen.category}
                          </h5>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono text-rose-700">
                            ${pen.amount_usd.toLocaleString()}
                          </span>
                          <SeverityBadge severity={pen.severity} />
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {pen.description}
                      </p>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                        <strong className="text-slate-900">Verbatim Basis:</strong> "{pen.verbatim_basis}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 2: CASCADE EFFECTS ON DEPENDENT CONTRACTS ────────── */}
            {activeTab === 'cascades' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-500">
                  Cross-contract dependency propagation across Quillhub's enterprise ecosystem:
                </div>

                <div className="space-y-3">
                  {res.cascade_effects.map((cas, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-300">
                            {cas.source_contract}
                          </span>
                          <ArrowRight size={14} className="text-slate-400" />
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {cas.impacted_contract} ({cas.impacted_party})
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                            {cas.relationship.replace(/_/g, ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className={`text-sm font-bold font-mono ${
                            cas.projected_damage_usd >= 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            {cas.projected_damage_usd >= 0 ? '+' : ''}${cas.projected_damage_usd.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {cas.projected_damage_usd >= 0 ? 'Cascade Exposure' : 'Exclusivity Benefit'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-700 leading-relaxed font-sans">
                        <strong className="text-slate-900 block mb-0.5">Cascade Chain: Triggered under {cas.trigger_clause}</strong>
                        {cas.description}
                      </div>

                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs text-emerald-900 flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-emerald-950">Recommended Tyr Mitigation:</strong> {cas.mitigation_action}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 3: SEVERANCE & EARLY-TERMINATION COSTS ────────────── */}
            {activeTab === 'severance' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Portfolio-level exit tariffs, write-downs, and transition reserves:</span>
                  <span className="font-mono font-bold text-slate-900">
                    Total Severance: ${res.severance_and_termination_costs.reduce((sum, s) => sum + s.amount_usd, 0).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {res.severance_and_termination_costs.map((sev, idx) => (
                    <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold uppercase">
                            {sev.cost_type.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900">
                            ${sev.amount_usd.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {sev.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                        Basis: {sev.statutory_or_contractual_basis}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 4: CONTRACT PORTFOLIO IMPACT STATUS GRID ─────────── */}
            {activeTab === 'portfolio' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  Comprehensive status across all active agreements in the Quillhub portfolio:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {res.contract_portfolio_impacts.map((cp, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => {
                        setSelectedContractId(cp.contract_id.split('-')[1]?.slice(0, 2) || 'B1')
                        setActivePage('contracts')
                      }}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-md cursor-pointer transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {cp.contract_id}
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          cp.status === 'defaulted' 
                            ? 'bg-rose-100 text-rose-800' 
                            : cp.status === 'terminated'
                            ? 'bg-red-100 text-red-800'
                            : cp.status === 'breached'
                            ? 'bg-amber-100 text-amber-800'
                            : cp.status === 'cascade_risk'
                            ? 'bg-orange-100 text-orange-800'
                            : cp.status === 'benefit'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cp.status.toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <h5 className="text-xs font-bold text-slate-900 line-clamp-1">{cp.party}</h5>
                        <span className="text-[10px] text-slate-500 block">{cp.role}</span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded-lg text-xs font-mono space-y-1">
                        <div className="flex justify-between text-slate-500">
                          <span>Simulated:</span>
                          <strong className="text-slate-900">${cp.simulated_exposure_usd.toLocaleString()}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Delta:</span>
                          <strong className={cp.delta_usd >= 0 ? 'text-rose-700' : 'text-emerald-700'}>
                            {cp.delta_usd >= 0 ? '+' : ''}${cp.delta_usd.toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        {cp.notes}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-indigo-600 font-medium">
                        <span>Inspect Contract</span>
                        <ArrowUpRight size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 5: PROJECTED NORNS MILESTONES ────────────────────── */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500">
                  Hypothetical chronological milestones projected along the Norns timeline:
                </div>

                <div className="space-y-2.5">
                  {res.norns_projected_timeline.map((item, idx) => (
                    <div key={idx} className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-start justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <div className="w-12 text-center shrink-0">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 block">
                            Day {item.day}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                            {item.date.slice(5)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-900">{item.label}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700">
                              {item.clause_ref}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {item.financial_impact_usd != null && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-mono font-bold text-rose-700 block">
                            ${item.financial_impact_usd.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">Impact</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── Bottom Strategic Recommendations (Tyr) ────────────────────── */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-amber-50/80 border border-amber-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-900 font-bold uppercase tracking-wider">
                <Scale size={15} className="text-amber-700" />
                <span>Tyr Recommended Strategic Counter-Measures:</span>
              </div>
              <span className="text-[11px] font-mono text-amber-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-amber-200 shadow-2xs self-start sm:self-auto font-medium">
                Autonomous Legal Remedies & Mitigation Protocols
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
              {res.recommended_mitigations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2.5 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs hover:border-amber-300 hover:shadow-xs transition-all">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed text-slate-800 font-sans">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { contractsService } from '../../services/contractsService';
import { simulationApiService } from '../../services/simulationService';
import { Contract } from '../../types/contract';
import {
  ScenarioType,
  ScenarioTemplate,
  SimulationResult,
} from '../../types/simulation';
import { formatDate, formatINR } from '../../lib/formatters';
import { addDays, differenceInDays } from 'date-fns';
import { ScenarioTimelineView } from './components/ScenarioTimelineView';
import { DependencyCascadeView } from './components/DependencyCascadeView';

export const WhatIfSandboxPage: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [selectedContractId, setSelectedContractId] = useState<string>('');
  const [templates, setTemplates] = useState<ScenarioTemplate[]>([]);
  const [selectedScenarioType, setSelectedScenarioType] = useState<ScenarioType>('vendor_default');
  const [activeTemplateId, setActiveTemplateId] = useState<string>('tpl-vendor-default');

  // Timeline Date scrubbing
  const baselineDate = new Date('2027-01-15');
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date('2027-02-15'));

  // Scenario specific parameters
  const [outageDurationHours, setOutageDurationHours] = useState<number>(48);
  const [curePeriodDays, setCurePeriodDays] = useState<number>(0);
  const [terminationReason, setTerminationReason] = useState<'convenience' | 'cause'>('convenience');
  const [milestoneDelayDays, setMilestoneDelayDays] = useState<number>(30);
  const [isMilestoneCritical, setIsMilestoneCritical] = useState<boolean>(true);
  const [customAssumptionsText, setCustomAssumptionsText] = useState<string>('');

  // Mode & Results
  const [isMockMode, setIsMockMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'comparison' | 'costs' | 'dependencies' | 'timeline' | 'quality'>('comparison');
  const [baselineTimelineEvents, setBaselineTimelineEvents] = useState<any[]>([]);

  // Load initial contracts, templates, and baseline events
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true);
        const [contractsList, scenarioTemplates, events] = await Promise.all([
          contractsService.getContracts(),
          simulationApiService.getScenarioTemplates(),
          contractsService.getTimelineEvents().catch(() => []),
        ]);

        setContracts(contractsList);
        setTemplates(scenarioTemplates);
        setBaselineTimelineEvents(events);

        if (contractsList.length > 0) {
          // Default to A1 or first contract
          const defaultC = contractsList.find((c) => c.id.includes('A1')) || contractsList[0];
          setSelectedContractId(defaultC.id);
        }
      } catch (err) {
        console.error('Failed to load initial sandbox data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  // Selected contract metadata
  const currentContract = contracts.find((c) => c.id === selectedContractId) || contracts[0];

  // Scrub offset in days
  const dayOffset = differenceInDays(simulatedDate, baselineDate);

  // Handle Scrub slider
  const handleSliderChange = (days: number) => {
    const newDate = addDays(baselineDate, days);
    setSimulatedDate(newDate);
  };

  // Switch template
  const handleSelectTemplate = (template: ScenarioTemplate) => {
    setActiveTemplateId(template.id);
    setSelectedScenarioType(template.scenarioType);
    if (template.scenarioType === 'vendor_default') {
      setOutageDurationHours(template.defaultParams.outageDurationHours ?? 24);
      setCurePeriodDays(template.defaultParams.curePeriodDays ?? 0);
    } else if (template.scenarioType === 'early_termination') {
      setTerminationReason(template.defaultParams.reason ?? 'convenience');
    } else if (template.scenarioType === 'milestone_failure') {
      setMilestoneDelayDays(template.defaultParams.delayDays ?? 30);
      setIsMilestoneCritical(template.defaultParams.isCritical ?? true);
    }
  };

  // Run simulation
  const handleRunSimulation = async () => {
    if (!selectedContractId) return;
    try {
      setIsSimulating(true);
      const dateStr = formatDate(simulatedDate, 'yyyy-MM-dd');
      const customAssumptions = customAssumptionsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await simulationApiService.runSimulation({
        contractId: selectedContractId,
        simulationDate: dateStr,
        scenarioType: selectedScenarioType,
        mockMode: isMockMode,
        params: {
          defaultDate: dateStr,
          outageDurationHours,
          curePeriodDays,
          effectiveDate: dateStr,
          noticeDate: formatDate(addDays(simulatedDate, -30), 'yyyy-MM-dd'),
          reason: terminationReason,
          delayDays: milestoneDelayDays,
          isCritical: isMilestoneCritical,
          customAssumptions,
        },
      });

      setSimulationResult(res);
      setActiveTab('comparison');
    } catch (err) {
      console.error('Simulation execution failed:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset scenario controls
  const handleResetScenario = () => {
    setSimulatedDate(new Date('2027-02-15'));
    setSelectedScenarioType('vendor_default');
    setActiveTemplateId('tpl-vendor-default');
    setOutageDurationHours(48);
    setCurePeriodDays(0);
    setTerminationReason('convenience');
    setMilestoneDelayDays(30);
    setIsMilestoneCritical(true);
    setCustomAssumptionsText('');
  };

  // Clear results
  const handleClearResults = () => {
    setSimulationResult(null);
  };

  if (isLoading) {
    return <LoadingState message="Initializing What-If Strategy Sandbox engine..." />;
  }

  const baselineExp = Number(currentContract?.financialExposureINR) || 0;
  const simulatedTotalExp = simulationResult?.simulated.totalExposureINR ?? baselineExp;
  const deltaExp = simulationResult?.simulated.deltaExposureINR ?? 0;
  const directImpact = simulationResult?.simulated.directFinancialImpactINR ?? 0;
  const downstreamImpact = simulationResult?.simulated.downstreamFinancialImpactINR ?? 0;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1D344B]">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <FlaskConical className="w-4 h-4 text-teal-300" />
            </div>
            <h1 className="text-xl font-bold text-[#F1F5F9] tracking-tight">
              What-If Strategy Sandbox
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold uppercase">
              Isolated Modeler
            </span>
            {isMockMode && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold uppercase">
                Mock Mode Active
              </span>
            )}
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Simulate vendor defaults, early contract terminations, and milestone slips. Evaluates explicit contract terms and traces downstream cascading liabilities without mutating baseline state.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#10263B] border border-[#1D344B] text-xs cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isMockMode}
              onChange={(e) => setIsMockMode(e.target.checked)}
              className="accent-teal-400 rounded cursor-pointer"
            />
            <span className="text-[#94A3B8]">Mock Test Mode</span>
          </label>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetScenario}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Reset
          </Button>

          {simulationResult && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearResults}
              icon={<Trash2 className="w-3.5 h-3.5 text-red-400" />}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear Results
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunSimulation}
            disabled={isSimulating || !selectedContractId}
            icon={<Play className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </div>
      </div>

      {/* Control Panel: Contract & Scenario Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Contract & Template Selector (5 cols) */}
        <Card className="lg:col-span-5 p-4 space-y-4 bg-[#0D2033] border-[#1D344B]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1D344B]/60">
            <FileText className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              1. Target Contract & Scenario Model
            </h3>
          </div>

          {/* Contract Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#94A3B8]">
              Target Contract for Simulation
            </label>
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="w-full bg-[#081727] text-xs text-[#F1F5F9] border border-[#1D344B] rounded-lg p-2.5 focus:border-teal-500 focus:outline-none"
            >
              {contracts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title} ({c.counterparty})
                </option>
              ))}
            </select>

            {currentContract && (
              <div className="mt-2 p-2.5 rounded-lg bg-[#081727] border border-[#1D344B] text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Counterparty:</span>
                  <span className="font-semibold text-[#F1F5F9]">{currentContract.counterparty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Baseline Exposure:</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formatINR(Number(currentContract.financialExposureINR) || 0, true)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#94A3B8]">Contract Risk Level:</span>
                  <Badge risk={currentContract.riskLevel} size="xs">
                    {currentContract.riskLevel}
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Hypothetical Scenario Templates */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-medium text-[#94A3B8]">
              Hypothetical Scenario Template
            </label>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeTemplateId === tpl.id
                      ? 'bg-blue-600/20 border-teal-500/40 text-[#F1F5F9]'
                      : 'bg-[#10263B]/60 border-[#1D344B] text-[#94A3B8] hover:border-[#1D344B]/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#F1F5F9]">{tpl.name}</span>
                    <span className="text-[10px] font-mono uppercase text-teal-300 px-1.5 py-0.2 rounded bg-[#081727] border border-teal-500/30">
                      {tpl.scenarioType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#94A3B8] mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Right Column: Timeline Scrub Slider & Parameter Controls (7 cols) */}
        <Card className="lg:col-span-7 p-4 space-y-4 bg-[#0D2033] border-[#1D344B]">
          <div className="flex items-center gap-2 pb-2 border-b border-[#1D344B]/60">
            <Calendar className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              2. Timeline Scrubber & Scenario Parameters
            </h3>
          </div>

          {/* Norns-style timeline slider */}
          <div className="p-3.5 rounded-xl bg-[#081727] border border-teal-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#94A3B8]">Hypothetical Event Date:</span>
              <span className="text-sm font-bold text-teal-300 font-mono px-2 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                {formatDate(simulatedDate, 'dd MMMM yyyy')}
              </span>
              <span className="text-[11px] text-[#64748B]">
                ({dayOffset >= 0 ? `+${dayOffset}d from baseline` : `${dayOffset}d`})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-[#64748B]">15 Jan 2027</span>
              <input
                type="range"
                min="0"
                max="240"
                value={Math.max(0, dayOffset)}
                onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
                className="flex-1 h-2 bg-[#10263B] rounded-lg appearance-none cursor-pointer accent-teal-400 border border-[#1D344B]"
              />
              <span className="text-[10px] font-mono text-[#64748B]">+240 Days</span>
            </div>
          </div>

          {/* Conditional Scenario Parameters Form */}
          <div className="space-y-3 pt-1">
            {selectedScenarioType === 'vendor_default' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#94A3B8]">
                      Outage Duration (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={outageDurationHours}
                      onChange={(e) => setOutageDurationHours(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#081727] text-xs text-[#F1F5F9] border border-[#1D344B] rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#94A3B8]">
                      Cure Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={curePeriodDays}
                      onChange={(e) => setCurePeriodDays(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-[#081727] text-xs text-[#F1F5F9] border border-[#1D344B] rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#10263B]/60 border border-[#1D344B] text-[11px] text-[#94A3B8] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Simulates total infrastructure downtime. Outages &gt;24h automatically trigger SLA service credits and propagate to downstream enterprise clients (e.g. Harbor Retail 99.9% uptime commitment).
                  </span>
                </div>
              </div>
            )}

            {selectedScenarioType === 'early_termination' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-[#94A3B8]">
                    Termination Legal Basis
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTerminationReason('convenience')}
                      className={`flex-1 p-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        terminationReason === 'convenience'
                          ? 'bg-blue-600/20 text-teal-300 border-teal-500/40'
                          : 'bg-[#081727] text-[#94A3B8] border-[#1D344B]'
                      }`}
                    >
                      For Convenience (Notice Required)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTerminationReason('cause')}
                      className={`flex-1 p-2 rounded-lg text-xs font-medium border cursor-pointer ${
                        terminationReason === 'cause'
                          ? 'bg-blue-600/20 text-teal-300 border-teal-500/40'
                          : 'bg-[#081727] text-[#94A3B8] border-[#1D344B]'
                      }`}
                    >
                      For Material Cause (Immediate)
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#10263B]/60 border border-[#1D344B] text-[11px] text-[#94A3B8] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Convenience termination assesses unexpired notice fees (e.g. 90-day non-renewal window in A1). Cause termination calculates post-termination migration assistance and urgent replacement costs.
                  </span>
                </div>
              </div>
            )}

            {selectedScenarioType === 'milestone_failure' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-[#94A3B8]">
                      Milestone Slippage (Days)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={milestoneDelayDays}
                      onChange={(e) => setMilestoneDelayDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full bg-[#081727] text-xs text-[#F1F5F9] border border-[#1D344B] rounded-lg p-2 font-mono"
                    />
                  </div>

                  <div className="space-y-1 flex flex-col justify-end">
                    <label className="flex items-center gap-2 p-2 rounded bg-[#081727] border border-[#1D344B] text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMilestoneCritical}
                        onChange={(e) => setIsMilestoneCritical(e.target.checked)}
                        className="accent-teal-400 rounded"
                      />
                      <span className="text-[#F1F5F9]">Critical Milestone Trap</span>
                    </label>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#10263B]/60 border border-[#1D344B] text-[11px] text-[#94A3B8] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <span>
                    Delays exceeding the 14-day notice threshold trigger the deemed acceptance rule (e.g. Pixelwright D1 §3.2) where deliverable fees become payable immediately.
                  </span>
                </div>
              </div>
            )}

            {/* Custom Assumptions Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#94A3B8]">
                Custom Simulation Assumptions (One per line)
              </label>
              <textarea
                rows={2}
                value={customAssumptionsText}
                onChange={(e) => setCustomAssumptionsText(e.target.value)}
                placeholder="e.g. Assume expedited replacement server deployment within 48 hours..."
                className="w-full bg-[#081727] text-xs text-[#F1F5F9] border border-[#1D344B] rounded-lg p-2 resize-none placeholder:text-[#64748B]"
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Insufficient Data Warning Banner (If applicable) */}
      {simulationResult && !simulationResult.dataQuality.hasSufficientData && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-amber-300">
              Contract Data Incompleteness Detected
            </h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              The target contract lacks explicit liquidated damages or penalty clauses for this scenario type. The simulation engine has flagged missing fields ({simulationResult.dataQuality.missingFields.join(', ')}) and generated estimates based on documented fallback rules.
            </p>
          </div>
        </div>
      )}

      {/* KPI Comparison Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Baseline vs Simulated Total Exposure */}
        <Card className="p-4 bg-[#0D2033] border-[#1D344B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Total Estimated Exposure</span>
            <TrendingUp className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-[#F1F5F9] font-mono mt-1">
            {formatINR(simulatedTotalExp, true)}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`text-[11px] font-mono font-bold ${deltaExp > 0 ? 'text-red-400' : 'text-teal-300'}`}>
              {deltaExp > 0 ? `+${formatINR(deltaExp, true)}` : formatINR(deltaExp, true)}
            </span>
            <span className="text-[10px] text-[#64748B]">vs Baseline</span>
          </div>
        </Card>

        {/* Direct Financial Impact */}
        <Card className="p-4 bg-[#0D2033] border-[#1D344B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Direct Financial Impact</span>
            <span className="text-xs font-mono px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
              Primary Contract
            </span>
          </div>
          <h3 className="text-xl font-bold text-teal-300 font-mono mt-1">
            {formatINR(directImpact, true)}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            Penalties and liabilities isolated to {selectedContractId}
          </p>
        </Card>

        {/* Downstream Cascading Exposure */}
        <Card className="p-4 bg-[#0D2033] border-red-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Downstream Cascades</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-red-400 font-mono mt-1">
            {formatINR(downstreamImpact, true)}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            {simulationResult?.simulated.cascadingEffects.length ?? 0} dependent client contracts affected
          </p>
        </Card>

        {/* Confidence & Source Quality */}
        <Card className="p-4 bg-[#0D2033] border-[#1D344B]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Data Confidence</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-[#F1F5F9] font-mono mt-1">
            {simulationResult ? `${Math.round(simulationResult.dataQuality.confidenceScore * 100)}%` : '100%'}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-[10px] text-[#94A3B8]">
              {simulationResult?.dataQuality.hasSufficientData ? 'Verified Terms' : 'Partial Data / Assumptions'}
            </span>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-[#1D344B] flex items-center gap-2 overflow-x-auto text-xs">
        {[
          { id: 'comparison', label: '📊 Baseline vs. Simulated Outcome' },
          { id: 'costs', label: `💰 Cost & Penalty Breakdown (${simulationResult?.simulated.costBreakdown.length ?? 0})` },
          { id: 'dependencies', label: `🕸️ Cascading Dependency Blast Radius (${simulationResult?.simulated.cascadingEffects.length ?? 0})` },
          { id: 'timeline', label: '⏳ Simulated Timeline Projection' },
          { id: 'quality', label: '🛡️ Assumptions & Data Quality' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 px-3 font-medium transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-teal-400 text-teal-300 font-bold'
                : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Comparison View */}
      {activeTab === 'comparison' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Baseline Card */}
            <Card className="p-5 bg-[#0D2033] border-[#1D344B]">
              <div className="flex items-center justify-between pb-3 border-b border-[#1D344B]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-400" />
                  <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                    Baseline Snapshot (Unmodified)
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30">
                  Read-Only State
                </span>
              </div>

              <div className="space-y-3 pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Target Contract:</span>
                  <span className="font-semibold text-[#F1F5F9]">{currentContract?.title}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Baseline Financial Exposure:</span>
                  <span className="font-mono text-teal-300 font-bold">
                    {formatINR(baselineExp, true)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Baseline Risk Rating:</span>
                  <Badge risk={currentContract?.riskLevel || 'medium'} size="xs">
                    {currentContract?.riskLevel || 'medium'}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Active Milestones Count:</span>
                  <span className="font-mono text-[#F1F5F9]">
                    {currentContract?.obligations?.length ?? 0}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Overdue Milestones:</span>
                  <span className="font-mono text-[#F1F5F9]">
                    {currentContract?.obligations?.filter((o) => o.status === 'overdue').length ?? 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Simulated Outcome Card */}
            <Card className="p-5 bg-[#0D2033] border-purple-500/30">
              <div className="flex items-center justify-between pb-3 border-b border-[#1D344B]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                  <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
                    Simulated Outcome Projection
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                  Hypothetical Scenario
                </span>
              </div>

              <div className="space-y-3 pt-4 text-xs">
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Simulated Total Exposure:</span>
                  <span className="font-mono text-red-400 font-bold text-sm">
                    {formatINR(simulatedTotalExp, true)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Projected Exposure Delta:</span>
                  <span className={`font-mono font-bold ${deltaExp > 0 ? 'text-red-400' : 'text-teal-300'}`}>
                    {deltaExp > 0 ? `+${formatINR(deltaExp, true)}` : formatINR(deltaExp, true)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Projected Risk Rating:</span>
                  <Badge
                    risk={simulationResult?.comparison.riskLevelAfter as any || 'critical'}
                    size="xs"
                  >
                    {simulationResult?.comparison.riskLevelAfter || 'critical'}
                  </Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-[#1D344B]/40">
                  <span className="text-[#94A3B8]">Direct Primary Liability:</span>
                  <span className="font-mono text-teal-300">
                    {formatINR(directImpact, true)}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#94A3B8]">Cascading Downstream Liability:</span>
                  <span className="font-mono text-red-400">
                    {formatINR(downstreamImpact, true)}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Cost Breakdown Table */}
      {activeTab === 'costs' && (
        <Card className="border-[#1D344B] overflow-hidden">
          <CardHeader className="flex items-center justify-between border-b border-[#1D344B]/60 pb-3">
            <CardTitle className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              Breakdown of Penalties, Termination Costs, and Supported Liabilities
            </CardTitle>
            <span className="text-[11px] text-[#64748B] italic">
              * Strictly verified against explicit contractual terms to prevent double-counting
            </span>
          </CardHeader>

          <CardContent className="p-0">
            {(!simulationResult || simulationResult.simulated.costBreakdown.length === 0) ? (
              <div className="p-8 text-center text-xs text-[#94A3B8]">
                <Layers className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
                <p>Run simulation to view itemized cost liabilities.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#081727] text-[#94A3B8] border-b border-[#1D344B] text-[11px]">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Description</th>
                      <th className="p-3">Contract</th>
                      <th className="p-3">Citation</th>
                      <th className="p-3">Source</th>
                      <th className="p-3 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1D344B]/40">
                    {simulationResult.simulated.costBreakdown.map((item) => (
                      <tr key={item.id} className="hover:bg-[#10263B]/40 transition-colors">
                        <td className="p-3">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#081727] border border-[#1D344B] text-teal-300">
                            {item.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-[#F1F5F9] font-medium max-w-sm">
                          {item.description}
                          {item.isEstimated && (
                            <span className="ml-2 text-[9.5px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Estimated
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[#94A3B8]">
                          {item.contractId}
                        </td>
                        <td className="p-3 font-mono text-teal-300">
                          {item.clauseCitation || 'N/A'}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-[#94A3B8]">
                            {item.source === 'contract_term' ? '📜 Contract Term' : '⚙️ Assumption'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-red-400">
                          {formatINR(item.amountINR, true)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#081727] border-t border-[#1D344B] font-bold">
                    <tr>
                      <td colSpan={5} className="p-3 text-[#F1F5F9]">
                        Total Distinct Estimated Exposure (Deduplicated)
                      </td>
                      <td className="p-3 text-right font-mono text-red-400 text-sm">
                        {formatINR(simulatedTotalExp, true)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Cascading Dependency View */}
      {activeTab === 'dependencies' && (
        <DependencyCascadeView
          primaryContractId={selectedContractId}
          primaryContractTitle={currentContract?.title || selectedContractId}
          scenarioType={selectedScenarioType}
          cascadingEffects={simulationResult?.simulated.cascadingEffects || []}
        />
      )}

      {/* Tab 4: Simulated Timeline View */}
      {activeTab === 'timeline' && (
        <ScenarioTimelineView
          simulatedEvents={simulationResult?.simulated.simulatedTimelineEvents || []}
          baselineEvents={baselineTimelineEvents}
          simulationDate={formatDate(simulatedDate, 'yyyy-MM-dd')}
        />
      )}

      {/* Tab 5: Data Quality & Assumptions */}
      {activeTab === 'quality' && (
        <Card className="p-5 border-[#1D344B] space-y-4">
          <CardHeader className="p-0 pb-3 border-b border-[#1D344B]/60 flex items-center justify-between">
            <CardTitle className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
              Assumptions, Data Quality & Source Indicators
            </CardTitle>
            <Badge risk={simulationResult?.dataQuality.hasSufficientData ? 'low' : 'high'}>
              {simulationResult?.dataQuality.hasSufficientData ? 'Sufficient Data' : 'Incomplete Data'}
            </Badge>
          </CardHeader>

          <CardContent className="p-0 space-y-4 pt-2">
            {/* Missing Fields List */}
            {simulationResult && simulationResult.dataQuality.missingFields.length > 0 && (
              <div className="p-3 rounded-lg bg-red-950/20 border border-red-500/40 space-y-1">
                <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                  Missing Contractual Terms
                </span>
                <ul className="list-disc list-inside text-xs text-[#94A3B8] space-y-0.5">
                  {simulationResult.dataQuality.missingFields.map((field, i) => (
                    <li key={i} className="font-mono">
                      {field}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Documented Assumptions */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#F1F5F9] block">
                Simulation Engine Documented Assumptions:
              </span>
              <div className="space-y-1.5">
                {(simulationResult?.dataQuality.assumptions || [
                  'Baseline contract snapshots and timeline records remain completely immutable during simulation.',
                  'USD to INR commercial obligations converted at benchmark rate 83.0 INR/USD.',
                  'Downstream enterprise SLA uptime breaches (Harbor Retail §4.1) triggered when vendor default exceeds 24 hours.',
                  'No double-counting: mutually exclusive early-termination damages and ongoing monthly fees are partitioned.',
                ]).map((asm, i) => (
                  <div key={i} className="p-2.5 rounded bg-[#081727] border border-[#1D344B] text-xs text-[#94A3B8] flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>{asm}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {simulationResult && simulationResult.dataQuality.warnings.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-amber-300 block">
                  Active Simulation Warnings:
                </span>
                <div className="space-y-1">
                  {simulationResult.dataQuality.warnings.map((w, i) => (
                    <div key={i} className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

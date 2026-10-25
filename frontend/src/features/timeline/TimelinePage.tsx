import React, { useState, useEffect } from 'react'
import {
  CalendarClock,
  RotateCcw,
  FastForward,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { LoadingState } from '../../components/ui/LoadingState'
import { contractsService } from '../../services/contractsService'
import { TimelineEvent } from '../../types/timeline'
import { BASE_SIMULATION_DATE } from '../../data/mockTimeline'
import { formatDate, formatINR } from '../../lib/formatters'
import { addDays, addMonths, parseISO, differenceInDays } from 'date-fns'

export const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [simulatedDate, setSimulatedDate] = useState<Date>(new Date(BASE_SIMULATION_DATE))
  const [selectedEventType, setSelectedEventType] = useState<string>('all')

  const baseDate = new Date(BASE_SIMULATION_DATE)

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setIsLoading(true)
        const data = await contractsService.getTimelineEvents()
        setEvents(data)
      } finally {
        setIsLoading(false)
      }
    }
    fetchTimeline()
  }, [])

  // Offset calculations in days from baseline
  const dayOffset = differenceInDays(simulatedDate, baseDate)

  // Simulation controls
  const handleReset = () => setSimulatedDate(new Date(BASE_SIMULATION_DATE))
  const handleSimulateMonths = (months: number) => {
    setSimulatedDate(addMonths(baseDate, months))
  }

  // Handle slider scrub (0 to 180 days ahead)
  const handleSliderChange = (days: number) => {
    setSimulatedDate(addDays(baseDate, days))
  }

  if (isLoading) {
    return <LoadingState message="Initializing Norns timeline projection engine..." />
  }

  // Deterministically recompute event states based on simulatedDate
  const computedEvents = events.map((evt) => {
    const evtDate = parseISO(evt.date)
    const diffDays = differenceInDays(evtDate, simulatedDate)

    let computedStatus: 'completed' | 'overdue' | 'due' | 'upcoming' = 'upcoming'

    if (diffDays < 0) {
      computedStatus = 'overdue'
    } else if (diffDays <= 14) {
      computedStatus = 'due'
    } else {
      computedStatus = 'upcoming'
    }

    return {
      ...evt,
      computedStatus,
      diffDays,
    }
  })

  // Filter by event type
  const filteredEvents = computedEvents.filter((e) => {
    if (selectedEventType === 'all') return true
    return e.type === selectedEventType
  })

  // Sort events chronologically
  const sortedEvents = [...filteredEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Calculate worst-case metrics under current simulated clock
  const overdueEvents = computedEvents.filter((e) => e.computedStatus === 'overdue')
  const dueEvents = computedEvents.filter((e) => e.computedStatus === 'due')
  const upcomingEvents = computedEvents.filter((e) => e.computedStatus === 'upcoming')

  // Total penalty exposure under current simulated state
  const totalProjectedPenaltyINR = computedEvents
    .filter((e) => e.computedStatus === 'overdue' || (e.computedStatus === 'due' && e.severity === 'critical'))
    .reduce((sum, e) => sum + (e.penaltyAmountINR || 0), 0)

  return (
    <div className="space-y-6">
      {/* Simulation Master Controller Card */}
      <Card className="p-5 bg-gradient-to-r from-[#081727] via-[#0D2033] to-[#10263B] border-teal-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#1D344B]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏳</span>
              <h2 className="text-base font-bold text-[#F1F5F9] tracking-tight">
                Norns Deterministic Timeline Scrub Engine
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold uppercase">
                Active Simulation
              </span>
            </div>
            <p className="text-xs text-[#94A3B8] mt-1">
              Adjust the simulated clock to scrub through future quarters. Obligation statuses and penalty cascades recompute in real-time.
            </p>
          </div>

          {/* Quick Step Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Reset to Today
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSimulateMonths(1)}
              icon={<FastForward className="w-3.5 h-3.5 text-teal-400" />}
              className="text-xs"
            >
              +1 Month
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSimulateMonths(3)}
              icon={<FastForward className="w-3.5 h-3.5 text-blue-400" />}
              className="text-xs"
            >
              +3 Months
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleSimulateMonths(6)}
              icon={<FastForward className="w-3.5 h-3.5 text-purple-400" />}
              className="text-xs"
            >
              +6 Months
            </Button>
          </div>
        </div>

        {/* Scrub Slider & Current Simulated Date */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#94A3B8]">Simulated Calendar Date:</span>
              <span className="text-base font-bold text-teal-300 font-mono px-2.5 py-0.5 rounded bg-teal-500/10 border border-teal-500/30">
                {formatDate(simulatedDate, 'dd MMMM yyyy')}
              </span>
              <span className="text-xs text-[#94A3B8]">
                ({dayOffset >= 0 ? `+${dayOffset} days from baseline` : `${dayOffset} days`})
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[#94A3B8] text-xs">Baseline Date:</span>
              <span className="font-mono text-[#F1F5F9]">25 Oct 2026</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[11px] font-mono text-[#64748B]">Today</span>
            <input
              type="range"
              min="0"
              max="180"
              value={Math.max(0, dayOffset)}
              onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
              className="flex-1 h-2 bg-[#10263B] rounded-lg appearance-none cursor-pointer accent-teal-400 border border-[#1D344B]"
            />
            <span className="text-[11px] font-mono text-[#64748B]">+180 Days (Q2 2027)</span>
          </div>
        </div>
      </Card>

      {/* Worst-Case Projection Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-[#0D2033] border-red-500/30">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Projected Penalty Cascade</span>
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-red-400 font-mono mt-1">
            {formatINR(totalProjectedPenaltyINR, true)}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            Cumulative worst-case penalties triggered by date
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Overdue / Breached</span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-[#F1F5F9] font-mono mt-1">
            {overdueEvents.length}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            Past deadline under simulated clock
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Imminent (Due ≤ 14d)</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-amber-400 font-mono mt-1">
            {dueEvents.length}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            Requires immediate legal notice or payment
          </p>
        </Card>

        <Card className="p-4 bg-[#0D2033]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Upcoming Obligations</span>
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
          </div>
          <h3 className="text-xl font-bold text-teal-300 font-mono mt-1">
            {upcomingEvents.length}
          </h3>
          <p className="text-[10.5px] text-[#94A3B8] mt-1">
            Scheduled milestones ahead in horizon
          </p>
        </Card>
      </div>

      {/* Filter and Event Category Selector */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'renewal_window', label: 'Auto-Renewal Windows' },
            { id: 'penalty_trigger', label: 'Penalty Triggers' },
            { id: 'payment_deadline', label: 'Payment Remittances' },
            { id: 'termination_notice', label: 'Notice Deadlines' },
            { id: 'audit_milestone', label: 'Compliance Audits' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedEventType(cat.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                selectedEventType === cat.id
                  ? 'bg-blue-600/20 text-teal-300 border-teal-500/40'
                  : 'bg-[#10263B] text-[#94A3B8] border-[#1D344B] hover:text-[#F1F5F9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-[11px] text-[#64748B] italic">
          * Penalties anchored to verified contract clauses only
        </span>
      </div>

      {/* Interactive Horizontal Timeline Visualization */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>
            <CalendarClock className="w-4 h-4 text-teal-400" />
            Projected Obligation Chronology
          </CardTitle>
          <span className="text-xs text-[#94A3B8] font-mono">
            {sortedEvents.length} Events in Scope
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-3">
          {sortedEvents.map((evt) => {
            const isOverdue = evt.computedStatus === 'overdue'
            const isDue = evt.computedStatus === 'due'

            return (
              <div
                key={evt.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isOverdue
                    ? 'bg-red-500/10 border-red-500/40'
                    : isDue
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-[#10263B]/60 border-[#1D344B] hover:border-teal-500/40'
                }`}
              >
                {/* Left: Date pill & Title */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl border text-center shrink-0 w-20 font-mono ${
                      isOverdue
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isDue
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#081727] text-teal-300 border-teal-500/30'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold block">
                      {formatDate(evt.date, 'MMM')}
                    </span>
                    <span className="text-lg font-bold block leading-none my-0.5">
                      {formatDate(evt.date, 'dd')}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] block">
                      {formatDate(evt.date, 'yyyy')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#F1F5F9]">
                        {evt.title}
                      </h4>
                      <Badge risk={evt.severity} size="xs" dot>
                        {evt.severity}
                      </Badge>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#081727] text-[#94A3B8] border border-[#1D344B]">
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                      <span className="text-[#94A3B8]">
                        Contract: <strong>{evt.contractName}</strong> ({evt.counterparty})
                      </span>
                      <span>•</span>
                      <span>Citation: <strong className="text-teal-300 font-mono">{evt.clauseCitation}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Status badge & Penalty Amount */}
                <div className="flex items-center md:flex-col items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-[#1D344B]/40 shrink-0 min-w-[140px]">
                  <div>
                    {isOverdue ? (
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                        <AlertCircle className="w-3.5 h-3.5" />
                        OVERDUE ({Math.abs(evt.diffDays)}d ago)
                      </span>
                    ) : isDue ? (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        DUE IN {evt.diffDays} DAYS
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        Scheduled (in {evt.diffDays}d)
                      </span>
                    )}
                  </div>

                  {evt.penaltyAmountINR && (
                    <div className="mt-1 text-right">
                      <span className="text-[10px] text-[#94A3B8] block">Penalty / Exposure</span>
                      <span className={`text-xs font-bold font-mono ${isOverdue ? 'text-red-400' : 'text-[#F1F5F9]'}`}>
                        {formatINR(evt.penaltyAmountINR, true)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

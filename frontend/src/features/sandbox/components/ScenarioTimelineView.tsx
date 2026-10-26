import React, { useState } from 'react';
import { CalendarClock, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { SimulatedTimelineEvent } from '../../../types/simulation';
import { formatDate, formatINR } from '../../../lib/formatters';

interface ScenarioTimelineViewProps {
  simulatedEvents: SimulatedTimelineEvent[];
  baselineEvents?: any[];
  simulationDate: string;
}

export const ScenarioTimelineView: React.FC<ScenarioTimelineViewProps> = ({
  simulatedEvents,
  baselineEvents = [],
  simulationDate,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  // Combine and sort events
  const combined = [
    ...simulatedEvents.map((e) => ({ ...e, isSimulated: true })),
    ...baselineEvents.map((e) => ({
      id: e.id,
      contractId: e.contractId,
      contractName: e.contractName || 'Contract',
      counterparty: e.counterparty || 'Counterparty',
      title: e.title,
      date: e.date,
      type: e.type,
      severity: e.severity,
      status: e.status || 'upcoming',
      penaltyAmountINR: e.penaltyAmountINR,
      description: e.description,
      clauseCitation: e.clauseCitation,
      isSimulated: false,
    })),
  ];

  const filtered = combined.filter((e) => {
    if (filterType === 'all') return true;
    if (filterType === 'simulated_only') return e.isSimulated;
    if (filterType === 'critical_only') return e.severity === 'critical';
    return e.type === filterType;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card className="overflow-hidden border-[#1D344B]">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1D344B]/60 pb-3">
        <div className="flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-teal-400" />
          <CardTitle className="text-sm font-bold text-[#F1F5F9]">
            Simulated Obligation & Breach Chronology
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
            {sorted.length} Events
          </span>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'all', label: 'All Milestones' },
            { id: 'simulated_only', label: '⚡ Simulated Triggers' },
            { id: 'critical_only', label: '🚨 Critical' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterType(cat.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                filterType === cat.id
                  ? 'bg-blue-600/25 text-teal-300 border-teal-500/40 font-bold'
                  : 'bg-[#10263B] text-[#94A3B8] border-[#1D344B] hover:text-[#F1F5F9]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {sorted.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#94A3B8]">
            <CalendarClock className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-40" />
            <p className="font-semibold text-[#F1F5F9]">No Timeline Events in Range</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              No milestones match the selected filter for simulated date {simulationDate}.
            </p>
          </div>
        ) : (
          sorted.map((evt) => {
            const isSimulated = evt.isSimulated;
            const isOverdue = evt.status === 'overdue' || evt.severity === 'critical';

            return (
              <div
                key={evt.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSimulated
                    ? 'bg-red-950/20 border-red-500/50 shadow-xs'
                    : isOverdue
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#10263B]/60 border-[#1D344B]'
                }`}
              >
                {/* Left Date pill & Event Details */}
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl border text-center shrink-0 w-18 font-mono ${
                      isSimulated
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : isOverdue
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-[#081727] text-teal-300 border-teal-500/30'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-bold block">
                      {formatDate(evt.date, 'MMM')}
                    </span>
                    <span className="text-base font-bold block leading-none my-0.5">
                      {formatDate(evt.date, 'dd')}
                    </span>
                    <span className="text-[9px] text-[#94A3B8] block">
                      {formatDate(evt.date, 'yyyy')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-[#F1F5F9]">
                        {evt.title}
                      </h4>
                      {isSimulated && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1 font-semibold">
                          <Sparkles className="w-2.5 h-2.5" />
                          Simulated Trigger
                        </span>
                      )}
                      <Badge risk={evt.severity} size="xs" dot>
                        {evt.severity}
                      </Badge>
                      <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-[#081727] text-[#94A3B8] border border-[#1D344B]">
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="flex items-center gap-2.5 text-[10.5px] text-[#64748B]">
                      <span className="text-[#94A3B8]">
                        Contract: <strong>{evt.contractName}</strong> ({evt.counterparty})
                      </span>
                      {evt.clauseCitation && (
                        <>
                          <span>•</span>
                          <span>
                            Citation: <strong className="text-teal-300 font-mono">{evt.clauseCitation}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Exposure & Status */}
                <div className="flex items-center md:flex-col items-end justify-between border-t md:border-t-0 pt-2 md:pt-0 border-[#1D344B]/40 shrink-0 min-w-[130px]">
                  <div>
                    {isSimulated ? (
                      <span className="text-xs font-bold text-red-400 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                        <AlertCircle className="w-3.5 h-3.5" />
                        TRIGGERED
                      </span>
                    ) : isOverdue ? (
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        <Clock className="w-3.5 h-3.5" />
                        OVERDUE
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                        Scheduled
                      </span>
                    )}
                  </div>

                  {evt.penaltyAmountINR ? (
                    <div className="mt-1 text-right">
                      <span className="text-[9.5px] text-[#94A3B8] block">Projected Exposure</span>
                      <span className="text-xs font-bold font-mono text-red-400">
                        {formatINR(evt.penaltyAmountINR, true)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

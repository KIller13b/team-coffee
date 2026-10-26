import React from 'react';
import { GitBranch, AlertTriangle, ArrowRight, ShieldAlert, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { CascadingEffectItem } from '../../../types/simulation';
import { formatINR } from '../../../lib/formatters';

interface DependencyCascadeViewProps {
  primaryContractId: string;
  primaryContractTitle: string;
  scenarioType: string;
  cascadingEffects: CascadingEffectItem[];
}

export const DependencyCascadeView: React.FC<DependencyCascadeViewProps> = ({
  primaryContractId,
  primaryContractTitle,
  scenarioType,
  cascadingEffects,
}) => {
  const totalDownstreamExposure = cascadingEffects.reduce(
    (sum, c) => sum + (c.exposureINR || 0),
    0
  );

  return (
    <Card className="border-[#1D344B] overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1D344B]/60 pb-3">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          <CardTitle className="text-sm font-bold text-[#F1F5F9]">
            Cascading Dependency Blast Radius
          </CardTitle>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 font-semibold">
            {cascadingEffects.length} Dependent Contracts
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#94A3B8]">Downstream Exposure:</span>
          <span className="font-mono font-bold text-red-400">
            {formatINR(totalDownstreamExposure, true)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Source Trigger Origin Card */}
        <div className="p-3.5 rounded-xl bg-[#081727] border border-teal-500/30 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center shrink-0">
              <span className="text-sm">🎯</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-teal-300 font-mono">
                  Primary Trigger Origin
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#10263B] text-[#94A3B8] border border-[#1D344B]">
                  {primaryContractId}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#F1F5F9] mt-0.5">
                {primaryContractTitle}
              </h4>
              <p className="text-[11px] text-[#94A3B8]">
                Scenario Event: <strong className="text-teal-300">{scenarioType.replace('_', ' ')}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#94A3B8] font-mono">
            <span>Propagating Downstream</span>
            <ArrowRight className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Downstream Impact List */}
        {cascadingEffects.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#94A3B8] border border-dashed border-[#1D344B] rounded-xl">
            <LinkIcon className="w-6 h-6 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#F1F5F9]">No Cascading Contracts Detected</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              This contract has no registered downstream client agreements or vendor dependencies in scope.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {cascadingEffects.map((item, index) => (
              <div
                key={item.affectedContractId || index}
                className="p-3.5 rounded-xl bg-[#0D2033] border border-[#1D344B] hover:border-purple-500/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#081727] text-purple-300 border border-purple-500/30 uppercase font-semibold">
                        {item.relationshipType}
                      </span>
                      <h5 className="text-xs font-bold text-[#F1F5F9]">
                        {item.affectedContractTitle}
                      </h5>
                      <span className="text-[10px] font-mono text-[#64748B]">
                        ({item.affectedContractId})
                      </span>
                      <Badge risk={item.severity} size="xs" dot>
                        {item.severity}
                      </Badge>
                      {item.isDirectBreach && (
                        <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-semibold">
                          Direct Breach
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#94A3B8] leading-relaxed">
                      {item.impactDescription}
                    </p>

                    <div className="flex items-center gap-3 text-[10.5px] text-[#64748B]">
                      <span>
                        Counterparty: <strong className="text-[#94A3B8]">{item.counterparty}</strong>
                      </span>
                      {item.clauseCitation && (
                        <>
                          <span>•</span>
                          <span>
                            Triggered Term: <strong className="text-teal-300 font-mono">{item.clauseCitation}</strong>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Cascading Exposure */}
                <div className="border-t md:border-t-0 pt-2 md:pt-0 border-[#1D344B]/40 shrink-0 text-right min-w-[130px]">
                  <span className="text-[10px] text-[#94A3B8] block">Downstream Liability</span>
                  <span className="text-xs font-bold font-mono text-red-400">
                    {formatINR(item.exposureINR, true)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

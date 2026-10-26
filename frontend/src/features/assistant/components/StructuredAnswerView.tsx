import React from 'react';
import {
  Calculator,
  ExternalLink,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import {
  StructuredAnswer,
  CitationSource,
  ClaimWithEvidence,
} from '../../../types/assistant';
import { formatINR } from '../../../lib/formatters';
import { Link } from 'react-router-dom';

interface StructuredAnswerViewProps {
  answer: StructuredAnswer;
  onSelectCitation: (citation: CitationSource) => void;
  onSelectFollowUp: (prompt: string) => void;
}

export const StructuredAnswerView: React.FC<StructuredAnswerViewProps> = ({
  answer,
  onSelectCitation,
  onSelectFollowUp,
}) => {
  const { calculation, claims, contradictions, citations, deepLinks, suggestedFollowUps } = answer;

  return (
    <div className="space-y-5">
      {/* 1. Direct Executive Synthesis Card */}
      <Card className="p-5 bg-gradient-to-r from-[#081727] via-[#0D2033] to-[#10263B] border-teal-500/40 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#1D344B]">
          <div className="flex items-center gap-2">
            <span className="text-lg">👑</span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300 font-mono">
              Odin Executive Determination
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 font-semibold">
              Evidence-Backed
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
            <span>Intent:</span>
            <span className="font-mono text-teal-300 px-1.5 py-0.2 rounded bg-[#081727] border border-[#1D344B]">
              {answer.queryIntent.category.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="pt-3 text-xs leading-relaxed text-[#F1F5F9] whitespace-pre-wrap select-text space-y-2">
          {answer.directAnswer}
        </div>

        {/* Deep Action Links */}
        {deepLinks && deepLinks.length > 0 && (
          <div className="flex items-center gap-2 pt-4 mt-3 border-t border-[#1D344B]/60 flex-wrap">
            <span className="text-[11px] text-[#94A3B8] font-mono">Action Links:</span>
            {deepLinks.map((link, idx) => (
              <Link
                key={idx}
                to={link.url}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10263B] text-teal-300 border border-teal-500/30 hover:bg-teal-500/10 transition-colors text-xs font-medium cursor-pointer"
              >
                <span>{link.label}</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            ))}
          </div>
        )}
      </Card>

      {/* 2. Deterministic Calculation Breakdown (If applicable) */}
      {calculation && (
        <Card className="border-teal-500/30 overflow-hidden">
          <CardHeader className="bg-[#081727] border-b border-[#1D344B] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-teal-400" />
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#F1F5F9]">
                Deterministic SLA & Financial Recovery Audit
              </CardTitle>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              {calculation.periodLabel}
            </span>
          </CardHeader>

          <CardContent className="p-4 space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#081727] border border-amber-500/30">
                <span className="text-[10.5px] text-[#94A3B8] block">Customer Credits Owed (Harbor)</span>
                <h4 className="text-lg font-bold font-mono text-amber-400 mt-0.5">
                  ${calculation.customerCreditsOwedUSD.toLocaleString()}
                </h4>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {formatINR(calculation.customerCreditsOwedINR, true)} (15% B1 §3.3)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081727] border border-teal-500/30">
                <span className="text-[10.5px] text-[#94A3B8] block">Vendor Recovery (StratoNode)</span>
                <h4 className="text-lg font-bold font-mono text-teal-300 mt-0.5">
                  ${calculation.vendorCreditsRecoverableUSD.toLocaleString()}
                </h4>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {formatINR(calculation.vendorCreditsRecoverableINR, true)} (A2 §2.1 Met)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#081727] border border-red-500/40">
                <span className="text-[10.5px] text-[#94A3B8] block">Unrecovered Financial Gap</span>
                <h4 className="text-lg font-bold font-mono text-red-400 mt-0.5">
                  ${calculation.unrecoveredExposureUSD.toLocaleString()}
                </h4>
                <span className="text-[10px] font-mono text-[#64748B]">
                  {formatINR(calculation.unrecoveredExposureINR, true)} (Quillhub Loss)
                </span>
              </div>
            </div>

            {/* Step-by-Step Mathematical Audit */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                Step-by-Step Calculation Audit:
              </span>
              <div className="divide-y divide-[#1D344B]/40 rounded-xl bg-[#081727] border border-[#1D344B] overflow-hidden">
                {calculation.steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                    <span className="text-[#94A3B8]">{step.description}</span>
                    <span className="font-mono font-bold text-teal-300 shrink-0">{step.result}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10.5px] text-[#64748B] flex items-center justify-between">
              <span>Governing Citation: <strong className="text-teal-300">{calculation.governingSlaCitation}</strong></span>
              <span>1 USD = 83.0 INR</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Contradictions & Unmet Dependencies Callout */}
      {contradictions && contradictions.length > 0 && (
        <Card className="p-4 bg-red-950/20 border-red-500/40 space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider">
              Identified Contradictions & Unmet Dependencies ({contradictions.length})
            </h4>
          </div>

          <div className="space-y-2.5">
            {contradictions.map((c, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#081727] border border-red-500/30 text-xs space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="text-[10.5px] text-teal-300 font-mono font-semibold">
                    📜 Commitment: {c.contractualTerm}
                  </span>
                  <span className="text-[10px] font-mono text-red-400 px-1.5 py-0.2 rounded bg-red-500/10 border border-red-500/30 uppercase font-bold">
                    {c.severity} Severity
                  </span>
                </div>
                <div className="text-[10.5px] text-amber-300 font-mono">
                  ⚠️ Conflicting Record: {c.conflictingRecord}
                </div>
                <p className="text-xs text-[#94A3B8] leading-relaxed mt-1">
                  {c.conflictExplanation}
                </p>
                <div className="text-[10px] text-[#64748B] pt-1">
                  Citation: <strong className="text-teal-300 font-mono">{c.citation}</strong>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Claims With Evidence Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#F1F5F9] uppercase tracking-wider">
            Evidence-Grounded Claims ({claims.length})
          </h4>
          <span className="text-[10.5px] text-[#64748B]">Click any citation tag to view verbatim clause</span>
        </div>

        <div className="space-y-3">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="p-4 rounded-xl bg-[#0D2033] border border-[#1D344B] hover:border-teal-500/40 transition-colors space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#081727] text-teal-300 border border-[#1D344B] uppercase font-semibold">
                    {claim.category}
                  </span>
                  <Badge
                    risk={
                      claim.materiality === 'material_breach' || claim.materiality === 'critical'
                        ? 'critical'
                        : claim.materiality === 'potential_default'
                        ? 'high'
                        : 'low'
                    }
                    size="xs"
                    dot
                  >
                    {claim.materiality.replace('_', ' ')}
                  </Badge>
                  <span className="text-[10px] font-mono text-teal-400">
                    Status: {claim.status}
                  </span>
                </div>
              </div>

              <h5 className="text-xs font-bold text-[#F1F5F9] leading-snug">
                {claim.conclusion}
              </h5>

              <p className="text-xs text-[#94A3B8] leading-relaxed">
                {claim.reasoning}
              </p>

              {claim.contractProvision && (
                <div className="text-[11px] text-[#64748B]">
                  Contract Provision: <strong className="text-teal-300 font-mono">{claim.contractProvision}</strong>
                </div>
              )}

              {/* Citations badges */}
              {claim.supportingEvidence && claim.supportingEvidence.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-[#1D344B]/40">
                  <span className="text-[10px] font-mono text-[#94A3B8]">Citations:</span>
                  {claim.supportingEvidence.map((cit) => (
                    <button
                      key={cit.id}
                      onClick={() => onSelectCitation(cit)}
                      className="px-2 py-0.5 rounded bg-[#081727] text-teal-300 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-500/10 transition-colors text-[10px] font-mono cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-2.5 h-2.5" />
                      {cit.sectionOrClause || cit.eventOrRecordId || cit.id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 5. Suggested Follow-Ups */}
      {suggestedFollowUps && suggestedFollowUps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-[#081727] border border-[#1D344B] space-y-2">
          <span className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider block">
            Suggested Investigation Follow-Ups:
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestedFollowUps.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectFollowUp(prompt)}
                className="px-3 py-1.5 rounded-lg bg-[#10263B] text-teal-300 border border-teal-500/30 hover:border-teal-400 hover:bg-teal-500/10 transition-colors text-xs cursor-pointer text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

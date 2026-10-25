import React from 'react'
import { Drawer } from '../../components/ui/Drawer'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Risk } from '../../types/risk'
import { formatINR } from '../../lib/formatters'
import {
  Scale,
  GitCommit,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from 'lucide-react'
import { Link } from 'react-router-dom'

interface RiskDetailDrawerProps {
  risk: Risk | null
  onClose: () => void
}

export const RiskDetailDrawer: React.FC<RiskDetailDrawerProps> = ({ risk, onClose }) => {
  if (!risk) return null

  return (
    <Drawer
      isOpen={Boolean(risk)}
      onClose={onClose}
      title={risk.title}
      subtitle={`Identified by Agent ${risk.identifiedBy.toUpperCase()} • ${risk.contractName}`}
      width="lg"
    >
      <div className="space-y-6">
        {/* Severity & Metrics Banner */}
        <div className="p-4 rounded-xl bg-[#10263B] border border-[#1D344B] space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <Badge risk={risk.severity} size="sm" dot>
              {risk.severity.toUpperCase()} RISK
            </Badge>

            <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              Status: {risk.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1D344B]/70 text-xs">
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Likelihood</span>
              <span className="font-semibold text-[#F1F5F9] capitalize">{risk.likelihood}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Business Impact</span>
              <span className="font-semibold text-[#F1F5F9] capitalize">{risk.impact}</span>
            </div>
            <div>
              <span className="text-[#94A3B8] block text-[10.5px]">Exposure At Stake</span>
              <span className="font-semibold text-amber-400 font-mono">
                {formatINR(risk.financialExposureINR, true)}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Explanation */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Risk Mechanism & Factual Narrative
          </h4>
          <p className="text-xs text-[#F1F5F9] leading-relaxed p-3.5 rounded-xl bg-[#0D2033] border border-[#1D344B]">
            {risk.explanation}
          </p>
        </div>

        {/* Supporting Evidence Excerpt */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            Supporting Clause Citation & Verbatim Excerpt
          </h4>
          <div className="p-3.5 rounded-xl bg-[#081727] border border-teal-500/30 font-mono text-xs text-[#F1F5F9] leading-relaxed">
            "{risk.verbatimExcerpt}"
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1.5">
            Citation reference: <strong className="text-[#94A3B8]">{risk.evidenceClause}</strong>
          </span>
        </div>

        {/* Cross-Contract Conflict Section if any */}
        {risk.crossContractConflict && (
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-1.5 text-red-400 text-xs font-semibold uppercase">
              <GitCommit className="w-4 h-4" />
              Cross-Contract Clause Collision
            </div>
            <p className="text-xs text-[#F1F5F9] leading-relaxed">
              {risk.crossContractConflict.conflictSummary}
            </p>
            <div className="text-[11px] text-[#94A3B8] pt-1">
              Colliding Agreement:{' '}
              <strong className="text-[#F1F5F9]">
                {risk.crossContractConflict.conflictingContractName}
              </strong>{' '}
              ({risk.crossContractConflict.conflictingClauseCitation})
            </div>
          </div>
        )}

        {/* Tyr Binding Arbitration Verdict */}
        {risk.arbitratedBy && risk.arbitrationVerdict && (
          <div className="p-4 rounded-xl bg-[#10263B] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold uppercase">
                <Scale className="w-4 h-4 text-amber-400" />
                Tyr Arbiter Directive
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                Official Ruling
              </span>
            </div>
            <p className="text-xs text-[#F1F5F9] leading-relaxed">
              {risk.arbitrationVerdict}
            </p>
          </div>
        )}

        {/* Recommended Action */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-300 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
            Recommended Operational Next Step
          </h4>
          <div className="p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 text-xs text-[#F1F5F9] leading-relaxed">
            {risk.recommendedNextStep}
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-3">
          <Link to={`/contracts/${risk.contractId}`} className="flex-1" onClick={onClose}>
            <Button variant="secondary" className="w-full text-xs">
              Inspect Contract Dossier
            </Button>
          </Link>
          <Link to="/agents" className="flex-1" onClick={onClose}>
            <Button variant="teal" className="w-full text-xs">
              View Agent Debate
            </Button>
          </Link>
        </div>
      </div>
    </Drawer>
  )
}

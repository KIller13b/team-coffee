import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRight, ShieldAlert, GitCommit } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatRelativeTime } from '../../lib/formatters'
import { Risk } from '../../types/risk'

interface RecentAlertsFeedProps {
  risks: Risk[]
}

export const RecentAlertsFeed: React.FC<RecentAlertsFeedProps> = ({ risks }) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Recent Risk & Conflict Alerts
        </CardTitle>
        <Link
          to="/risks"
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
        >
          All Risks ({risks.length})
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 p-4 flex-1 flex flex-col justify-center">
        {risks.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#94A3B8]">
            <ShieldAlert className="w-8 h-8 text-[#64748B] mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-[#F1F5F9]">No Active Risk Alerts</p>
            <p className="text-[11px] text-[#64748B] mt-1">
              All indexed contracts are compliant with zero cross-contract collisions detected.
            </p>
          </div>
        ) : (
          risks.slice(0, 4).map((risk) => {
            const isCrossConflict = Boolean(risk.crossContractConflict)

            return (
              <Link
                key={risk.id}
                to={`/risks?id=${risk.id}`}
                className="block p-3 rounded-lg bg-[#10263B]/60 hover:bg-[#10263B] border border-[#1D344B] hover:border-teal-500/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {isCrossConflict ? (
                      <GitCommit className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-semibold text-[#F1F5F9] group-hover:text-teal-300 transition-colors truncate">
                      {risk.title}
                    </h4>
                  </div>

                  <Badge risk={risk.severity} size="xs">
                    {risk.severity}
                  </Badge>
                </div>

                <p className="text-[11px] text-[#94A3B8] line-clamp-2 mt-1 leading-relaxed">
                  {risk.explanation || (risk as any).summary || 'Contractual liability analyzed by Loki.'}
                </p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1D344B]/40 text-[10.5px]">
                  <span className="text-[#64748B] truncate max-w-[200px]">
                    {risk.contractName || risk.contractId}
                  </span>
                  <span className="text-[#94A3B8] font-mono shrink-0">
                    {formatRelativeTime(risk.createdAt)}
                  </span>
                </div>
              </Link>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}

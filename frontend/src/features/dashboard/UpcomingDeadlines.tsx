import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatDate, formatRelativeTime } from '../../lib/formatters'
import { Obligation, RiskLevel } from '../../types/contract'

interface UpcomingDeadlinesProps {
  obligations: (Obligation & { contractName?: string })[]
}

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ obligations }) => {
  // Sort by date ascending
  const sorted = [...obligations].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  ).slice(0, 5)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>
          <Clock className="w-4 h-4 text-teal-400" />
          Critical & Upcoming Deadlines
        </CardTitle>
        <Link
          to="/timeline"
          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors"
        >
          Simulation View
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </CardHeader>

      <CardContent className="space-y-3 p-4">
        {sorted.map((item) => {
          const isOverdue = item.status === 'overdue' || new Date(item.dueDate) < new Date('2026-10-25')
          const isCritical = item.severity === 'critical'

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border transition-all ${
                isOverdue
                  ? 'bg-red-500/10 border-red-500/30'
                  : isCritical
                  ? 'bg-orange-500/5 border-orange-500/30'
                  : 'bg-[#10263B]/60 border-[#1D344B] hover:border-teal-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-semibold text-[#F1F5F9] truncate">
                      {item.title}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] uppercase font-bold text-red-400 bg-red-500/20 px-1 rounded flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Overdue
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                    {item.contractName || item.clauseReference}
                  </p>
                </div>

                <Badge risk={item.severity as RiskLevel} size="xs" dot>
                  {item.severity}
                </Badge>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#1D344B]/40 text-[11px] text-[#94A3B8]">
                <span>Due: <span className="text-[#F1F5F9] font-mono">{formatDate(item.dueDate)}</span></span>
                <span className={isOverdue ? 'text-red-400 font-semibold' : 'text-teal-300'}>
                  {formatRelativeTime(item.dueDate)}
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

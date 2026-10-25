import React from 'react'
import { FileText, CheckCircle, AlertTriangle, IndianRupee } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { formatINR } from '../../lib/formatters'

interface SummaryCardsProps {
  totalContracts: number
  activeObligations: number
  highRiskCount: number
  criticalRiskCount: number
  totalExposureINR: number
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalContracts,
  activeObligations,
  highRiskCount,
  criticalRiskCount,
  totalExposureINR,
}) => {
  const cards = [
    {
      title: 'Total Active Contracts',
      value: totalContracts.toString(),
      context: '100% indexed by Thor',
      badge: '+2 this month',
      badgeColor: 'text-teal-300 bg-teal-500/10',
      icon: FileText,
      iconColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    },
    {
      title: 'Active Obligations',
      value: activeObligations.toString(),
      context: '4 due within 30 days',
      badge: '98.2% on track',
      badgeColor: 'text-blue-300 bg-blue-500/10',
      icon: CheckCircle,
      iconColor: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
    },
    {
      title: 'High & Critical Risks',
      value: (highRiskCount + criticalRiskCount).toString(),
      context: `${criticalRiskCount} critical collisions flagged by Loki`,
      badge: `${criticalRiskCount} Urgent`,
      badgeColor: 'text-red-400 bg-red-500/10',
      icon: AlertTriangle,
      iconColor: 'text-red-400 bg-red-500/15 border-red-500/30',
    },
    {
      title: 'Total Financial Exposure',
      value: formatINR(totalExposureINR, true),
      context: 'Potential penalties & locked rollovers',
      badge: 'Audited by Tyr',
      badgeColor: 'text-amber-300 bg-amber-500/10',
      icon: IndianRupee,
      iconColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <Card key={idx} className="p-4 relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#94A3B8]">{card.title}</p>
                <h3 className="text-2xl font-bold text-[#F1F5F9] mt-1 tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 ${card.iconColor}`}
              >
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1D344B]/60 text-xs">
              <span className="text-[11px] text-[#94A3B8] truncate">{card.context}</span>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border border-transparent ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

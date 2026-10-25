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
  const totalRisks = highRiskCount + criticalRiskCount

  const cards = [
    {
      title: 'Total Active Contracts',
      value: totalContracts.toString(),
      context: totalContracts > 0 ? '100% indexed by Thor' : 'Awaiting contract upload',
      badge: totalContracts > 0 ? `+${totalContracts} Active` : '0 Active',
      badgeColor: totalContracts > 0 ? 'text-teal-300 bg-teal-500/10' : 'text-slate-400 bg-slate-500/10',
      icon: FileText,
      iconColor: 'text-teal-300 bg-teal-500/15 border-teal-500/30',
    },
    {
      title: 'Active Obligations',
      value: activeObligations.toString(),
      context: activeObligations > 0 ? `${activeObligations} commitments tracked` : 'No pending obligations',
      badge: activeObligations > 0 ? 'On Track' : 'Clear',
      badgeColor: activeObligations > 0 ? 'text-blue-300 bg-blue-500/10' : 'text-slate-400 bg-slate-500/10',
      icon: CheckCircle,
      iconColor: 'text-blue-300 bg-blue-500/15 border-blue-500/30',
    },
    {
      title: 'High & Critical Risks',
      value: totalRisks.toString(),
      context: totalRisks > 0 ? `${criticalRiskCount} critical collisions flagged by Loki` : 'Zero active risk collisions',
      badge: totalRisks > 0 ? `${criticalRiskCount} Urgent` : 'Protected',
      badgeColor: totalRisks > 0 ? 'text-red-400 bg-red-500/10' : 'text-emerald-400 bg-emerald-500/10',
      icon: AlertTriangle,
      iconColor: totalRisks > 0 ? 'text-red-400 bg-red-500/15 border-red-500/30' : 'text-slate-400 bg-slate-500/15 border-slate-500/30',
    },
    {
      title: 'Total Financial Exposure',
      value: formatINR(totalExposureINR, true),
      context: totalExposureINR > 0 ? 'Potential penalties & locked rollovers' : 'Zero financial exposure detected',
      badge: totalExposureINR > 0 ? 'Audited by Tyr' : '₹0 Exposure',
      badgeColor: totalExposureINR > 0 ? 'text-amber-300 bg-amber-500/10' : 'text-slate-400 bg-slate-500/10',
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

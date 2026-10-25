import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { RISK_LEVEL_COLORS } from '../../lib/constants'
import { formatINR } from '../../lib/formatters'
import { Contract } from '../../types/contract'

interface RiskDonutChartProps {
  contracts: Contract[]
}

const CustomTooltip = ({ active, payload, totalContracts }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-[#081727] border border-[#1D344B] p-2.5 rounded-lg shadow-xl text-xs space-y-1">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="font-semibold text-[#F1F5F9]">{data.name}</span>
        </div>
        <p className="text-[#94A3B8]">
          Contracts: <span className="text-[#F1F5F9] font-medium">{data.value}</span> ({Math.round((data.value / totalContracts) * 100)}%)
        </p>
        <p className="text-[#94A3B8]">
          Exposure: <span className="text-[#F1F5F9] font-medium">{formatINR(data.exposure, true)}</span>
        </p>
      </div>
    )
  }
  return null
}

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({ contracts }) => {
  const counts = {
    low: contracts.filter((c) => c.riskLevel === 'low').length,
    medium: contracts.filter((c) => c.riskLevel === 'medium').length,
    high: contracts.filter((c) => c.riskLevel === 'high').length,
    critical: contracts.filter((c) => c.riskLevel === 'critical').length,
  }

  const exposures = {
    low: contracts.filter((c) => c.riskLevel === 'low').reduce((s, c) => s + c.financialExposureINR, 0),
    medium: contracts.filter((c) => c.riskLevel === 'medium').reduce((s, c) => s + c.financialExposureINR, 0),
    high: contracts.filter((c) => c.riskLevel === 'high').reduce((s, c) => s + c.financialExposureINR, 0),
    critical: contracts.filter((c) => c.riskLevel === 'critical').reduce((s, c) => s + c.financialExposureINR, 0),
  }

  const totalContracts = contracts.length

  const chartData = [
    { name: 'Low Risk', value: counts.low, color: RISK_LEVEL_COLORS.low.hex, key: 'low', exposure: exposures.low },
    { name: 'Medium Risk', value: counts.medium, color: RISK_LEVEL_COLORS.medium.hex, key: 'medium', exposure: exposures.medium },
    { name: 'High Risk', value: counts.high, color: RISK_LEVEL_COLORS.high.hex, key: 'high', exposure: exposures.high },
    { name: 'Critical Risk', value: counts.critical, color: RISK_LEVEL_COLORS.critical.hex, key: 'critical', exposure: exposures.critical },
  ].filter((item) => item.value > 0)

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Portfolio Risk Distribution</CardTitle>
        <span className="text-xs text-[#94A3B8] font-mono">10 Evaluated</span>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center pt-2">
        {/* Donut Chart with Centered Total */}
        <div className="relative w-full h-48 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<CustomTooltip totalContracts={totalContracts} />} />
              <Pie
                data={chartData}
                innerRadius={54}
                outerRadius={78}
                paddingAngle={4}
                dataKey="value"
                stroke="#0D2033"
                strokeWidth={3}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Centered Total Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-[#F1F5F9] tracking-tight">
              {totalContracts}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-[#94A3B8] font-medium">
              Contracts
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full pt-3 border-t border-[#1D344B]/60 text-xs mt-1">
          {chartData.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[#94A3B8] truncate">{item.name}</span>
              </div>
              <span className="font-semibold text-[#F1F5F9] font-mono pl-2">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

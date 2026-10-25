import React from 'react'
import { cn } from '../../lib/utils'

export interface ProgressBarProps {
  value: number // 0 to 100
  color?: 'teal' | 'blue' | 'amber' | 'red' | 'purple'
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  label?: string
  className?: string
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'teal',
  size = 'sm',
  showLabel = false,
  label,
  className,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value))

  const heightClasses = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2.5',
  }

  const fillColors = {
    teal: 'bg-teal-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    purple: 'bg-purple-400',
  }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs">
          <span className="text-[#94A3B8]">{label}</span>
          <span className="text-[#F1F5F9] font-medium">{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-[#10263B] rounded-full overflow-hidden border border-[#1D344B]/60', heightClasses[size])}>
        <div
          className={cn('h-full transition-all duration-300 rounded-full', fillColors[color])}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

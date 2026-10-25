import React from 'react'
import { cn } from '../../lib/utils'
import { RiskLevel } from '../../types/contract'
import { AgentId, AGENT_ROLES } from '../../lib/constants'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'teal' | 'blue' | 'purple' | 'amber' | 'red' | 'gray'
  risk?: RiskLevel
  agent?: AgentId
  size?: 'xs' | 'sm' | 'md'
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  risk,
  agent,
  size = 'sm',
  dot = false,
  ...props
}) => {
  // If risk is provided, style accordingly
  let colorStyle = 'bg-[#10263B] text-[#94A3B8] border border-[#1D344B]'
  let dotColor = 'bg-slate-400'

  if (risk) {
    switch (risk) {
      case 'critical':
        colorStyle = 'bg-red-500/10 text-red-400 border border-red-500/30'
        dotColor = 'bg-red-400'
        break
      case 'high':
        colorStyle = 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
        dotColor = 'bg-orange-400'
        break
      case 'medium':
        colorStyle = 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
        dotColor = 'bg-amber-400'
        break
      case 'low':
        colorStyle = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
        dotColor = 'bg-emerald-400'
        break
    }
  } else if (agent && AGENT_ROLES[agent]) {
    colorStyle = AGENT_ROLES[agent].badgeBg
    dotColor = `bg-[${AGENT_ROLES[agent].color}]`
  } else {
    switch (variant) {
      case 'teal':
        colorStyle = 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
        dotColor = 'bg-teal-400'
        break
      case 'blue':
        colorStyle = 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
        dotColor = 'bg-blue-400'
        break
      case 'purple':
        colorStyle = 'bg-purple-500/10 text-purple-300 border border-purple-500/30'
        dotColor = 'bg-purple-400'
        break
      case 'amber':
        colorStyle = 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
        dotColor = 'bg-amber-400'
        break
      case 'red':
        colorStyle = 'bg-red-500/10 text-red-400 border border-red-500/30'
        dotColor = 'bg-red-400'
        break
      case 'outline':
        colorStyle = 'bg-transparent text-[#94A3B8] border border-[#1D344B]'
        dotColor = 'bg-slate-400'
        break
      default:
        colorStyle = 'bg-[#10263B] text-[#94A3B8] border border-[#1D344B]'
        dotColor = 'bg-slate-400'
        break
    }
  }

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md whitespace-nowrap leading-none',
        sizes[size],
        colorStyle,
        className
      )}
      {...props}
    >
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColor)} />}
      {children}
    </span>
  )
}

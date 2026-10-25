import React from 'react'
import { cn } from '../../lib/utils'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean
  interactive?: boolean
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  elevated = false,
  interactive = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#1D344B] transition-all duration-200',
        elevated ? 'bg-[#10263B]' : 'bg-[#0D2033]',
        interactive &&
          'hover:border-teal-500/40 hover:shadow-lg hover:shadow-cyan-950/20 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('px-5 py-4 border-b border-[#1D344B]/70 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <h3
      className={cn('text-sm font-semibold text-[#F1F5F9] tracking-tight flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <p className={cn('text-xs text-[#94A3B8] mt-0.5', className)} {...props}>
      {children}
    </p>
  )
}

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn('p-5', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('px-5 py-3 border-t border-[#1D344B]/70 bg-[#081727]/40 flex items-center justify-between text-xs text-[#94A3B8]', className)}
      {...props}
    >
      {children}
    </div>
  )
}

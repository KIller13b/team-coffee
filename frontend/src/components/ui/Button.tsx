import React from 'react'
import { cn } from '../../lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'teal'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#06111F] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer'

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-900/30 focus:ring-blue-500 active:scale-[0.98]',
    secondary:
      'bg-[#10263B] hover:bg-[#16334F] text-[#F1F5F9] border border-[#1D344B] focus:ring-blue-400 active:scale-[0.98]',
    outline:
      'bg-transparent hover:bg-[#10263B]/60 text-[#94A3B8] hover:text-[#F1F5F9] border border-[#1D344B] focus:ring-teal-400',
    ghost:
      'bg-transparent hover:bg-[#10263B]/80 text-[#94A3B8] hover:text-[#F1F5F9] focus:ring-teal-400',
    danger:
      'bg-red-600/90 hover:bg-red-500 text-white border border-red-500/30 shadow-sm shadow-red-950/40 focus:ring-red-400 active:scale-[0.98]',
    teal:
      'bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 focus:ring-teal-400 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-3.5 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  )
}

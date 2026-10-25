import React from 'react'
import { FolderSearch } from 'lucide-react'
import { Button } from './Button'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FolderSearch className="w-10 h-10 text-[#64748B]" />,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-[#1D344B] bg-[#081727]/40">
      <div className="p-3 bg-[#10263B] rounded-2xl mb-4 border border-[#1D344B]/80">{icon}</div>
      <h4 className="text-base font-semibold text-[#F1F5F9]">{title}</h4>
      <p className="text-sm text-[#94A3B8] max-w-sm mt-1 mb-5">{description}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

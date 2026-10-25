import React from 'react'

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Consulting multi-agent intelligence...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-2 border-teal-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-blue-400/30 border-b-transparent animate-spin [animation-direction:reverse]" />
      </div>
      <p className="text-sm font-medium text-[#94A3B8] animate-pulse">{message}</p>
    </div>
  )
}

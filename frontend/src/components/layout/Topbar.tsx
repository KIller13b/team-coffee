import React from 'react'
import {
  Menu,
  Bell,
  Search,
  Calendar,
  FileUp,
} from 'lucide-react'
import { Button } from '../ui/Button'

interface TopbarProps {
  onOpenMobileMenu: () => void
  onOpenUploadModal?: () => void
  pageTitle?: string
  pageSubtitle?: string
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenMobileMenu,
  onOpenUploadModal,
  pageTitle = 'Executive Foresight Dashboard',
  pageSubtitle = 'Real-time multi-agent contractual risk & obligation synthesis',
}) => {
  return (
    <header className="h-16 px-4 lg:px-6 bg-[#081727]/90 backdrop-blur-md border-b border-[#1D344B] flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#10263B] border border-[#1D344B]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-sm lg:text-base font-semibold text-[#F1F5F9] tracking-tight">
            {pageTitle}
          </h1>
          <p className="hidden md:block text-[11px] text-[#94A3B8] truncate">
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Date Indicator, Notifications & Profile */}
      <div className="flex items-center gap-2.5">
        {/* System Simulation Baseline Date */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0D2033] border border-[#1D344B] text-xs text-[#94A3B8]">
          <Calendar className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-mono text-[11px] text-[#F1F5F9]">25 Oct 2026</span>
          <span className="text-[10px] text-teal-400 font-semibold bg-teal-500/10 px-1 rounded">LIVE</span>
        </div>

        {/* Upload Contract Button */}
        {onOpenUploadModal && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenUploadModal}
            icon={<FileUp className="w-3.5 h-3.5 text-teal-300" />}
            className="text-xs"
          >
            <span className="hidden sm:inline">Upload Contract</span>
            <span className="sm:hidden">Upload</span>
          </Button>
        )}

        {/* Global Search trigger indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D2033] border border-[#1D344B] text-xs text-[#94A3B8] w-52">
          <Search className="w-3.5 h-3.5 text-[#64748B]" />
          <span className="truncate">Search clauses, vendors...</span>
          <kbd className="ml-auto text-[10px] font-mono bg-[#10263B] px-1.5 py-0.5 rounded border border-[#1D344B] text-[#64748B]">
            ⌘K
          </kbd>
        </div>

        {/* Notifications Icon with active badge */}
        <button
          className="relative p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#10263B] border border-[#1D344B] transition-colors"
          aria-label="View risk notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-[#081727]" />
        </button>

        {/* User Profile Avatar */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 sm:border-l sm:border-[#1D344B]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-teal-400 border border-teal-300/40 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            GC
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-medium text-[#F1F5F9] leading-tight">General Counsel</span>
            <span className="text-[10px] text-[#94A3B8] leading-tight">Legal Operations</span>
          </div>
        </div>
      </div>
    </header>
  )
}

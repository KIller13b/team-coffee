import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  AlertTriangle,
  Bot,
  BarChart3,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { contractsService } from '../../services/contractsService'

interface SidebarProps {
  className?: string
  onCloseMobile?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onCloseMobile }) => {
  const [contractsCount, setContractsCount] = useState<number>(0)
  const [risksCount, setRisksCount] = useState<number>(0)

  const loadCounts = async () => {
    try {
      const [contracts, risks] = await Promise.all([
        contractsService.getContracts(),
        contractsService.getRisks(),
      ])
      setContractsCount(contracts.length)
      setRisksCount(risks.length)
    } catch {
      setContractsCount(0)
      setRisksCount(0)
    }
  }

  useEffect(() => {
    loadCounts()
    const handleUpload = () => loadCounts()
    window.addEventListener('odin:contract-uploaded', handleUpload)
    return () => window.removeEventListener('odin:contract-uploaded', handleUpload)
  }, [])

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
    {
      name: 'Contracts',
      path: '/contracts',
      icon: FileText,
      badge: contractsCount > 0 ? `${contractsCount}` : null,
    },
    { name: 'Timeline', path: '/timeline', icon: CalendarClock, badge: contractsCount > 0 ? 'Sim' : null },
    {
      name: 'Risks & Alerts',
      path: '/risks',
      icon: AlertTriangle,
      badge: risksCount > 0 ? `${risksCount}` : null,
    },
    { name: 'Agents', path: '/agents', icon: Bot, badge: '6 Live' },
    { name: 'Reports', path: '/reports', icon: BarChart3, badge: null },
    { name: 'Settings', path: '/settings', icon: Settings, badge: null },
  ]

  return (
    <aside
      className={cn(
        'w-64 bg-[#081727] border-r border-[#1D344B] flex flex-col shrink-0 select-none h-screen sticky top-0',
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#1D344B] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-600/30 border border-teal-500/40 flex items-center justify-center shrink-0 shadow-sm shadow-teal-900/30">
          <ShieldCheck className="w-5 h-5 text-teal-300" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-base font-bold text-[#F1F5F9] tracking-wider uppercase font-mono">
              ODIN
            </span>
            <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/30 tracking-tight">
              v2.4
            </span>
          </div>
          <span className="text-[10.5px] text-[#94A3B8] truncate leading-tight">
            Contract Intelligence
          </span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2">
          <span className="text-[10px] font-semibold tracking-wider uppercase text-[#64748B]">
            Navigation
          </span>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-blue-600/15 text-teal-300 border border-teal-500/30 shadow-xs'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#10263B]/60'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-teal-300' : 'text-[#64748B] group-hover:text-[#94A3B8]'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold',
                          isActive
                            ? 'bg-teal-500/20 text-teal-200'
                            : 'bg-[#10263B] text-[#94A3B8] border border-[#1D344B]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-400" />}
                  </div>
                </>
              )}
            </NavLink>
          )
        })}
      </div>

      {/* Multi-Agent Liveness Footer */}
      <div className="p-3 border-t border-[#1D344B] bg-[#06111F]/50">
        <div className="p-2.5 rounded-lg bg-[#0D2033] border border-[#1D344B]/70">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#F1F5F9] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              Agent Mesh Active
            </span>
            <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-1 rounded border border-teal-500/20">
              6 Online
            </span>
          </div>
          <p className="text-[10px] text-[#94A3B8] leading-relaxed">
            {contractsCount > 0
              ? `${contractsCount} active agreement${contractsCount > 1 ? 's' : ''} monitored across 6 agents.`
              : 'Standby mode. Ingest contracts to start analysis.'}
          </p>
        </div>
      </div>
    </aside>
  )
}

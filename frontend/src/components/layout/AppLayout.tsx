import React, { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { MobileNav } from './MobileNav'
import { ContractUploadModal } from '../contracts/ContractUploadModal'

export const AppLayout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const location = useLocation()

  // Route-aware metadata
  const getPageMeta = (pathname: string) => {
    if (pathname === '/') {
      return {
        title: 'Executive Foresight Dashboard',
        subtitle: 'Real-time multi-agent contractual risk & obligation synthesis',
      }
    }
    if (pathname.startsWith('/contracts')) {
      return {
        title: 'Contract Repository & Clause Extraction',
        subtitle: 'Verbatim clause anchoring, confidence scoring, and counterparty tracking',
      }
    }
    if (pathname.startsWith('/timeline')) {
      return {
        title: 'Obligation Timeline & Scrub Simulator',
        subtitle: 'Dynamic worst-case penalty simulation and recursive renewal projections',
      }
    }
    if (pathname.startsWith('/risks')) {
      return {
        title: 'Contractual Risks & Collision Sentinel',
        subtitle: 'Cross-contract collision auditing, dispute management, and arbitration',
      }
    }
    if (pathname.startsWith('/agents')) {
      return {
        title: 'Multi-Agent Mesh & Adjudication Arena',
        subtitle: 'Live debate timeline: Thor, Norns, Loki, Heimdall, and Tyr rulings',
      }
    }
    if (pathname.startsWith('/reports')) {
      return {
        title: 'Audit Dossiers & Executive Briefings',
        subtitle: 'Verified legal evidence summaries and prioritized mitigation directives',
      }
    }
    if (pathname.startsWith('/settings')) {
      return {
        title: 'System Preferences & Governance',
        subtitle: 'Agent timeout controls, company jurisdiction, and API configuration',
      }
    }
    return {
      title: 'Odin Contract Intelligence',
      subtitle: 'Multi-agent legal oversight',
    }
  }

  const meta = getPageMeta(location.pathname)

  return (
    <div className="min-h-screen flex bg-[#06111F] text-[#F1F5F9]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onOpenUploadModal={() => setIsUploadModalOpen(true)}
          pageTitle={meta.title}
          pageSubtitle={meta.subtitle}
        />

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Contract Upload Modal */}
      <ContractUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          // Trigger route refresh / state reload
          window.dispatchEvent(new CustomEvent('odin:contract-uploaded'))
        }}
      />
    </div>
  )
}

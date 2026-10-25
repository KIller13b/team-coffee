import React, { useState } from 'react'
import {
  Settings,
  Building,
  Cpu,
  Server,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

export const SettingsPage: React.FC = () => {
  // Load initial settings from localStorage or fallback
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('odin:company') || 'Vanguard Dynamics India Pvt. Ltd.')
  const [jurisdiction, setJurisdiction] = useState(() => localStorage.getItem('odin:jurisdiction') || 'India (Arbitration & Conciliation Act 1996)')
  const [currency, setCurrency] = useState(() => localStorage.getItem('odin:currency') || 'INR (₹)')
  const [maxDebateRounds, setMaxDebateRounds] = useState(() => localStorage.getItem('odin:max_rounds') || '3')
  const [agentTimeout, setAgentTimeout] = useState(() => localStorage.getItem('odin:timeout') || '45')
  const [alertThreshold, setAlertThreshold] = useState(() => localStorage.getItem('odin:alert_thresh') || 'high')
  const [apiEndpoint, setApiEndpoint] = useState(() => localStorage.getItem('odin:api_url') || (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'))
  const [useMockData, setUseMockData] = useState(() => localStorage.getItem('odin:use_mock') !== 'false')

  const [saveStatus, setSaveStatus] = useState<string | null>(null)
  const [apiTestStatus, setApiTestStatus] = useState<'idle' | 'testing' | 'success' | 'fallback'>('idle')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    localStorage.setItem('odin:company', companyName)
    localStorage.setItem('odin:jurisdiction', jurisdiction)
    localStorage.setItem('odin:currency', currency)
    localStorage.setItem('odin:max_rounds', maxDebateRounds)
    localStorage.setItem('odin:timeout', agentTimeout)
    localStorage.setItem('odin:alert_thresh', alertThreshold)
    localStorage.setItem('odin:api_url', apiEndpoint)
    localStorage.setItem('odin:use_mock', useMockData ? 'true' : 'false')

    setSaveStatus('Preferences saved successfully.')
    setTimeout(() => setSaveStatus(null), 3000)
  }

  const handleTestApi = () => {
    setApiTestStatus('testing')
    setTimeout(() => {
      setApiTestStatus('fallback')
    }, 1000)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-4 rounded-xl bg-[#081727] border border-[#1D344B] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-400" />
            <h2 className="text-base font-bold text-[#F1F5F9] tracking-tight">
              System Settings & Governance Rules
            </h2>
          </div>
          <p className="text-xs text-[#94A3B8] mt-0.5">
            Configure enterprise parameters, multi-agent arbitration thresholds, and API connectivity.
          </p>
        </div>

        {saveStatus && (
          <div className="flex items-center gap-1.5 text-xs text-teal-300 bg-teal-500/10 px-3 py-1.5 rounded-lg border border-teal-500/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Organization Context */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Building className="w-4 h-4 text-teal-400" />
              Company Legal Entity & Jurisdiction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Primary Enterprise Entity
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Governing Legal Jurisdiction
                </label>
                <input
                  type="text"
                  value={jurisdiction}
                  onChange={(e) => setJurisdiction(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Primary Commercial Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                >
                  <option value="INR (₹)">INR (₹ - Indian Rupee)</option>
                  <option value="USD ($)">USD ($ - US Dollar)</option>
                  <option value="EUR (€)">EUR (€ - Euro)</option>
                  <option value="GBP (£)">GBP (£ - British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Risk Alert Severity Threshold
                </label>
                <select
                  value={alertThreshold}
                  onChange={(e) => setAlertThreshold(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                >
                  <option value="critical">Critical Only</option>
                  <option value="high">High & Critical</option>
                  <option value="medium">Medium and Above</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Agent Governance & Consensus Limits */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Cpu className="w-4 h-4 text-purple-400" />
              Multi-Agent Governance & Debate Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Maximum Adversarial Debate Rounds Before Tyr Arbitration
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={maxDebateRounds}
                  onChange={(e) => setMaxDebateRounds(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                />
                <span className="text-[10.5px] text-[#64748B] mt-1 block">
                  Number of rounds Loki and Thor can argue before Tyr renders a binding directive.
                </span>
              </div>

              <div>
                <label className="block font-medium text-[#94A3B8] mb-1">
                  Agent Pipeline Timeout (Seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={agentTimeout}
                  onChange={(e) => setAgentTimeout(e.target.value)}
                  className="w-full bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] focus:outline-none focus:border-teal-400"
                />
                <span className="text-[10.5px] text-[#64748B] mt-1 block">
                  Failsafe execution window per subagent before Odin triggers graceful fallback.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: API Integration & Backend Connection Readiness */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Server className="w-4 h-4 text-blue-400" />
              Backend API Gateway & Telemetry Stream
            </CardTitle>
            <span className="text-xs font-mono text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              Mock Engine Active
            </span>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-[#94A3B8] mb-1">
                Backend API Base Endpoint (VITE_API_BASE_URL)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="http://localhost:5000/api"
                  className="flex-1 bg-[#10263B] border border-[#1D344B] rounded-lg px-3 py-2 text-[#F1F5F9] font-mono focus:outline-none focus:border-teal-400"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleTestApi}
                  isLoading={apiTestStatus === 'testing'}
                >
                  Test Connection
                </Button>
              </div>
              <p className="text-[10.5px] text-[#64748B] mt-1">
                Configurable via <code>.env</code> file. Falls back automatically to rich mock dataset when backend is offline.
              </p>
            </div>

            {/* Test result status */}
            {apiTestStatus === 'fallback' && (
              <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>
                    Mock data engine active and responding normally (10 contracts, 7 risks, 6 agents).
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-teal-300 bg-teal-500/20 px-2 py-0.5 rounded">
                  200 OK (DEMO)
                </span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useMockData}
                  onChange={(e) => setUseMockData(e.target.checked)}
                  className="rounded border-[#1D344B] bg-[#10263B] text-teal-400 focus:ring-teal-400"
                />
                <span className="text-xs text-[#F1F5F9] font-medium">
                  Prioritize Local Multi-Agent Mock Engine (Recommended for Standalone Demos)
                </span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save All Preferences
          </Button>
        </div>
      </form>
    </div>
  )
}

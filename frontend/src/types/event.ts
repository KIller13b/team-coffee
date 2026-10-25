export interface ExternalEvent {
  id: string
  source: string // e.g. "ERP SAP Connector", "Ministry of Corporate Affairs", "Vendor Notice Feed"
  title: string
  timestamp: string
  contractId?: string
  contractName?: string
  verified: boolean
  impactSummary: string
  severity: 'info' | 'warning' | 'critical'
}

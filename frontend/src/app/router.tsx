import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { ContractsListPage } from '../features/contracts/ContractsListPage'
import { ContractDetailsPage } from '../features/contracts/ContractDetailsPage'
import { TimelinePage } from '../features/timeline/TimelinePage'
import { RisksPage } from '../features/risks/RisksPage'
import { AgentsPage } from '../features/agents/AgentsPage'
import { ReportsPage } from '../features/reports/ReportsPage'
import { SettingsPage } from '../features/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'contracts',
        element: <ContractsListPage />,
      },
      {
        path: 'contracts/:id',
        element: <ContractDetailsPage />,
      },
      {
        path: 'timeline',
        element: <TimelinePage />,
      },
      {
        path: 'risks',
        element: <RisksPage />,
      },
      {
        path: 'agents',
        element: <AgentsPage />,
      },
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])

import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'risk-ledger',
    path: '/risk-ledger',
    component: async () => (await import('@/views/risk-ledger')).RiskLedger
  },
  {
    name: 'risk-details',
    path: '/risk-details',
    component: async () => (await import('@/views/risk-ledger/details')).RiskLedgerDetails
  },
  {
    name: 'risk-add',
    path: '/risk-add',
    component: async () => (await import('@/views/risk-ledger/add')).RiskLedgerAdd
  },
  {
    name: 'risk-message',
    path: '/risk-message',
    component: async () => (await import('@/views/message')).Message
  },
  {
    name: 'risk-type',
    path: '/risk-type',
    component: async () => (await import('@/views/risk-type')).RiskType
  },
]

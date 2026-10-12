import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'electric-vehicle-ledger',
    path: '/electric-vehicle-ledger',
    component: async () => (await import('@/views/electric-vehicle-ledger/electric-vehicle-ledger')).Ledger
  },
  {
    name: 'ledger-details',
    path: '/ledger-details',
    component: async () => (await import('@/views/electric-vehicle-ledger/ledger-details')).LedgerDetails,
    meta: {
      title: '电动车台账详情'
    }
  },
  {
    name: 'ledger-operate',
    path: '/ledger-operate',
    component: async () => (await import('@/views/electric-vehicle-ledger/ledger-operate')).LedgerOperate
  },
  {
    name: '/violation-statistics',
    path: '/violation-statistics',
    component: async () => (await import('@/views/violation-statistics/violation-statistics')).ViolationStatistics
  },
  {
    name: 'violation-statistics-details',
    path: '/violation-statistics-details',
    component: async () => (await import('@/views/violation-statistics/violation-statistics-details')).Details,
    meta: {
      title: '违规统计详情'
    }
  },
]

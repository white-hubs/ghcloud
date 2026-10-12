import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'enterprise-records',
    path: '/enterprise-records',
    component: async () => (await import('@/views/enterprise-records/enterprise-records')).EnterpriseRecord
  },
  {
    name: 'revenue-expenditure-records',
    path: '/revenue-expenditure-records',
    component: async () => (await import('@/views/revenue-expenditure-records/revenue-expenditure-records')).RevenueExpenditureRecords
  }
]

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'gas-usage-details',
    path: '/gas-usage-details',
    component: async () => (await import('@/views/gas-usage-details')).GasUsageDetails,
    meta: {
      title: '气体用量明细'
    }
  },
]

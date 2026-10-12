import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/work-order-statistics',
    name: 'work-order-statistics',
    component: async () => (await import('@/views/work-order-statistics/work-order-statistics')).WorkOrderStatistics
  },
  {
    path: '/work-order-list',
    name: 'work-order-list',
    component: async () => (await import('@/views/work-order-list/work-order-list')).WorkOrderStatisticsList
  },
]

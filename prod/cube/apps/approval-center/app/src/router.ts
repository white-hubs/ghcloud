import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/work-order-library',
    name: 'work-order-library',
    component: async () => (await import('@/views/work-order-library/work-order-library')).WorkOrderLibrary
  },
  {
    path: '/work-order-approval',
    name: 'work-order-approval',
    component: async () => (await import('@/views/work-order-approval/work-order-approval')).WorkOrderApproval
  },
  {
    path: '/work-order-statistics',
    name: 'work-order-statistics',
    component: async () => (await import('@/views/work-order-statistics/work-order-statistics')).WorkOrderStatistics
  },
  {
    path: '/work-order-record',
    name: 'work-order-record',
    component: async () => (await import('@/views/work-order-record/work-order-record')).WorkOrderRecord
  },
  {
    path: '/work-order-config',
    name: 'work-order-config',
    component: async () => (await import('@/views/work-order-config/work-order-config')).WorkOrderConfig
  },
]

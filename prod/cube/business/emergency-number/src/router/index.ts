import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'business-monitoring',
    path: '/business-monitoring',
    component: async () => (await import('@/views/business-monitoring/business-monitoring')).BusinessMonitoring
  }
]

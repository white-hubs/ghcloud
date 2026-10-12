import type { RouteRecordRaw } from 'vue-router'

export const deviceStatistic: RouteRecordRaw[] = [
  {
    path: '/working-statistic',
    name: 'WorkingStatistic',
    component: async () => (await import('@/views/working-statistic/working-statistic')).WorkingStatistic
  },
  {
    path: '/maintenance-statistic',
    name: 'MaintenanceStatistic',
    component: async () => (await import('@/views/maintenance-statistic/maintenance-statistic')).MaintenanceStatistic
  },
]

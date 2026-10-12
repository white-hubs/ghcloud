import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'entry',
    path: '/entry',
    component: async () => (await import('@/views/energy-overview/energy-overview')).EnergyOverview,
  },
  {
    name: 'metering-device-list',
    path: '/metering-device-list',
    component: async () => (await import('@/views/metering-device/list/list')).ListPage,
  },
  {
    name: 'metering-device-detail',
    path: '/metering-device-detail',
    component: async () => (await import('@/views/metering-device/detail/detail')).Detail,
  },
  {
    name: 'energy-analysis',
    path: '/energy-analysis',
    component: async () => (await import('@/views/energy-analysis/energy-analysis')).EnergyAnalysis,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

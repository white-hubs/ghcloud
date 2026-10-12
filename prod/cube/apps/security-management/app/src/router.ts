import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/monitoring-group',
    name: 'MonitoringGroup',
    component: async () => (await import('@/views/monitoring-group/monitoring-group')).MonitoringGroup
  },
  {
    path: '/associated-devices',
    name: 'AssociatedDevices',
    component: async () => (await import('@/views/associated-devices/associated-devices')).AssociatedDevices
  },
]

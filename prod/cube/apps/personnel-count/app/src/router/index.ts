import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'task-record',
    path: '/task-record',
    component: async () => (await import('@/views/monitoring/task-record')).TaskRecord
  },
  {
    name: 'call-the-roll',
    path: '/call-the-roll',
    component: async () => (await import('@/views/monitoring/call-the-roll')).CallTheRoll
  }
]

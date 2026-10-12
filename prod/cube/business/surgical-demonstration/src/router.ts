import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'demonstration-record',
    path: '/demonstration-record',
    component: async () => (await import('@/views/demonstration-record')).DemonstrationRecord,
    meta: {
      title: '示教记录'
    }
  },
]

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'water-purification-records',
    path: '/water-purification-records',
    component: async () => (await import('@/views/water-purification-records')).waterDetails,
    meta: {
      title: '净水记录'
    }
  },
]

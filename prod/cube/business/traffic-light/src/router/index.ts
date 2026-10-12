import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'detail-list',
    path: '/detail-list',
    component: async () => (await import('@/views/detail-list/detail-list')).DetailList
  }
]

import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: async () => (await import('@/views/index/index')).Index
  },
  {
    name: 'sub-area',
    path: '/sub-area',
    component: async () => (await import('@/views/index/sub-area')).SubArea
  },
]

export const routes: RouteRecordRaw[] = [...routers]

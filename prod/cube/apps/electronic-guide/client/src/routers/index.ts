import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    path: '',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'index',
    component: async () => ((await import('@/views/index'))).Index
  }
]

export const routes: RouteRecordRaw[] = [...routers]

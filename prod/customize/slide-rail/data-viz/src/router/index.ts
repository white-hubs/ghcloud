import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    name: 'entry',
    path: '/',
    component: async () => (await import('@/views/entry')).Entry
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: async () => (await import('@/views/entry')).Entry
  }
]

export const routes: RouteRecordRaw[] = [...routers]

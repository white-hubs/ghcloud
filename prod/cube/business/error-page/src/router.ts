import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '404'
  },
  {
    name: '404',
    path: '/404',
    component: async () => (await import('@/views/404')).NotFound,
  },
  {
    name: 'error',
    path: '/error',
    component: async () => (await import('@/views/error')).Error,
  },
  {
    name: 'building',
    path: '/building',
    component: async () => (await import('@/views/building')).Building,
  },
]

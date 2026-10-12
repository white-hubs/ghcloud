import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    redirect: '/device-info'
  },
  {
    name: 'device-info',
    path: '/device-info',
    component: async () => (await import('@/views/device-info/device-info')).DeviceInfo,
  },
  {
    name: 'history',
    path: '/history',
    component: async () => (await import('@/views/history/index')).History,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

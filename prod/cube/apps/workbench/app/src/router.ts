import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: '工作台',
    component: async () => (await import('./views/index/index')).default,
  },
  {
    path: '/index',
    name: '工作台-index',
    component: async () => (await import('./views/index/index')).default,
  },
  {
    path: '/workbench',
    name: '工作台设置',
    component: async () => (await import('./views/work-bench/work-bench')).default,
  },
]

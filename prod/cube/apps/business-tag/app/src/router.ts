import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'tag-list'
  },
  {
    path: '/tag-list',
    name: 'tag-list',
    component: async () => (await import('@/views/tag-list/tag-list')).TagList
  },
  {
    path: '/tag-details',
    name: 'tag-details',
    component: async () => (await import('@/views/tag-details/tag-details')).TagDetails
  }
]

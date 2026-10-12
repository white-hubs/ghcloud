import type { RouteRecordRaw } from 'vue-router'

export const tagManage: RouteRecordRaw[] = [
  {
    path: '/tag-list',
    name: 'TagList',
    component: async () => (await import('@/views/tag-list/tag-list')).TagList
  },

]

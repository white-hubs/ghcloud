import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/tag-list',
    name: 'TagList',
    meta: {
      title: '标签管理'
    },
    component: async () => (await import('@/views/tag-list/tag-list')).TagList
  },
  {
    path: '/status-list',
    name: 'StatusList',
    meta: {
      title: '状态管理'
    },
    component: async () => (await import('@/views/status-list/status-list')).StatusList
  },
  {
    path: '/feature-list',
    name: 'FeatureList',
    meta: {
      title: '特征管理'
    },
    component: async () => (await import('@/views/feature-list/feature-list')).FeatureList
  },
  {
    path: '/space-list',
    name: 'SpaceList',
    meta: {
      title: '空间管理'
    },
    component: async () => (await import('@/views/space-list/space-list')).SpaceList
  },

]

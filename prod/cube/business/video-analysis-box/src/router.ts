import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: '/list',
    path: '/list',
    component: async () => (await import('@/views/video-analysis')).VideoAnalysis,
    meta: {
      title: '智能分析'
    }
  },
  {
    name: '/video-view',
    path: '/video-view',
    component: async () => (await import('@/views/video-analysis/iframe-view')).VideoView,
  },
]

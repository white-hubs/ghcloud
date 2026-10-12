import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    redirect: '/editor-config',
    path: '/',
  },
  {
    name: 'editor-config',
    path: '/editor-config',
    component: async () => (await import('@/views/editor-config/editor-config')).EditorConfig
  },
  {
    name: 'render',
    path: '/render',
    component: async () => (await import('@/views/render/index')).RenderIndex
  }
]

import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: async () => (await import('@/views/index/index')).Index
  },
  {
    name: 'entry',
    path: '/entry',
    component: async () => (await import('@/views/entry')).Entry
  },
  {
    name: 'webview',
    path: '/webview',
    component: async () => (await import('@/views/web-view/web-view')).WebView
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: async () => (await import('@/views/index/index')).Index
  }
]

export const routes: RouteRecordRaw[] = [...routers]

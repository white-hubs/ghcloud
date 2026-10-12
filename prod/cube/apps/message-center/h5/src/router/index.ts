import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'message-list',
    path: '/',
    component: async () => (await import('@/views/message-list/message-list')).MessageList,
  },
  {
    name: 'message-item-list',
    path: '/message-item-list',
    component: async () => (await import('@/views/message-item-list/message-item-list')).MessageItemList,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

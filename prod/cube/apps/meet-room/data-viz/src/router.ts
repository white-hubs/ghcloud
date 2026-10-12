import { createRouter, type RouteRecordRaw, createWebHashHistory } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/entry'
  },
  {
    path: '/entry',
    name: 'entry',
    component: async () => (await import('@/views/entry/entry')).Entry
  },
]

export const router = createRouter({
  history: createWebHashHistory('/apps/@ghcloud/cube-meet-room-data-viz'),
  routes
})

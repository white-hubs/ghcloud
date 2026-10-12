import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    redirect: '/gear-detail'
  },
  {
    name: 'gear-detail',
    path: '/gear-detail',
    meta: {
      title: '档位详情'
    },
    component: async () => (await import('@/views/gear/detail')).Detail
  },
]

export const routes: RouteRecordRaw[] = [...routers]

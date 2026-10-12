import { Index } from '@/views'
import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: Index
  },
]

export const routes: RouteRecordRaw[] = [...routers]

import type { RouteRecordRaw } from 'vue-router'
import { AlarmModal } from '@/views/alarm-modal'
const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: AlarmModal
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: AlarmModal
  }
]

export const routes: RouteRecordRaw[] = [...routers]

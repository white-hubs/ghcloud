import type { RouteRecordRaw } from 'vue-router'
import { task } from './router/task'
import { config } from './router/config'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'task-plan'
  },
  ...task,
  ...config,
]

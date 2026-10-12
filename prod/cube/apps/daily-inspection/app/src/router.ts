import type { RouteRecordRaw } from 'vue-router'
import { inspect } from './router/inspect'
import { inspectConfig } from './router/inspect-config'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'inspect-plan'
  },
  ...inspect,
  ...inspectConfig,
]

import type { RouteRecordRaw } from 'vue-router'
import BusinessSet from '@/router/business-set'
import NormMonitor from '@/router/norm-monitor'

export const routes: RouteRecordRaw[] = [
  ...BusinessSet,
  ...NormMonitor
]

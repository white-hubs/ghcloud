import type { RouteRecordRaw } from 'vue-router'
import conditionalLinkage from '@/routes/conditionalLinkage'
import config from '@/routes/config'
import reservePlanConfig from '@/routes/reservePlanConfig'
import sceneLinkage from '@/routes/sceneLinkage'
import timeLinkage from '@/routes/timeLinkage'

export const routes: RouteRecordRaw[] = [
  ...conditionalLinkage,
  ...config,
  ...reservePlanConfig,
  ...sceneLinkage,
  ...timeLinkage,
]
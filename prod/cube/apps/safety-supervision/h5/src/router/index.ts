import type { RouteRecordRaw } from 'vue-router'
import { safety } from './safety'
import { market } from './market'

export const routes: RouteRecordRaw[] = [
  ...safety,
  ...market
]

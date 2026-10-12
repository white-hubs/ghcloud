import type { RouteRecordRaw } from 'vue-router'
import { operationRoutes } from './operation'
import { factoryRoutes } from './factory-routes'

export const routes: RouteRecordRaw[] = [
  ...factoryRoutes,
  ...operationRoutes,
]

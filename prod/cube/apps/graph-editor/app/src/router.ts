import type { RouteRecordRaw } from 'vue-router'
import { graphEditorRoutes } from './router/graph-editor'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/editor',
  },
  ...graphEditorRoutes,
]

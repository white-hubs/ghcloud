import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'record-number',
    path: '/record-number',
    component: async () => (await import('@/views/record-number/record-number')).RecordNumber
  }
]

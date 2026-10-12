import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'call-records',
    path: '/call-records',
    component: async () => (await import('@/views/call-records/call-records')).CallRecords
  },
  {
    name: 'bed-file',
    path: '/bed-file',
    component: async () => (await import('@/views/bed-file/bed-file')).BedFile
  }
]

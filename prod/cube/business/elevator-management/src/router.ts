import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'operation-records',
    path: '/operation-records',
    component: async () => (await import('@/views/operation-records')).GasUsageDetails,
    meta: {
      title: '运行记录'
    }
  },
  {
    name: 'call-log',
    path: '/call-log',
    component: async () => (await import('@/views/call-log')).CallLog,
    meta: {
      title: '通话记录'
    }
  },
]

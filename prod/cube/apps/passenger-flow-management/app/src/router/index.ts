import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'passenger-flow-records',
    path: '/passenger-flow-records',
    component: async () => (await import('@/views/passenger-flow-records/passenger-flow-records')).PassengerFlowRecords
  }
]

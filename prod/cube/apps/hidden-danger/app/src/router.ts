import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/problemsList',
    name: 'problemsList',
    component: async () => (await import('@/views/problem-list/problem-list')).ProblemList
  },
  {
    path: '/problemsRecord',
    name: 'problemsRecord',
    component: async () => (await import('@/views/problem-record/problem-record')).ProblemRecord
  },
  {
    path: '/problemsDegree',
    name: 'problemsDegree',
    component: async () => (await import('@/views/problem-degree/problem-degree')).ProblemDegree
  },
  {
    path: '/problemsType',
    name: 'problemsType',
    component: async () => (await import('@/views/problem-type/problem-type')).ProblemType
  },
  {
    path: '/personnel-statistics',
    name: 'personnel-statistics',
    component: async () => (await import('@/views/statistics/personnel-order/personnel-order')).PersonnelOrder
  },
  {
    path: '/work-order-statistics',
    name: 'work-order-statistics',
    component: async () => (await import('@/views/statistics/work-order/work-order')).WorkOrder
  },
]

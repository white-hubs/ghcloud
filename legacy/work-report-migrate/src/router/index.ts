import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'flow-config',
    path: '/flow-config',
    component: import('@/views/flow.vue')
  },
  {
    name: 'report-flow',
    path: '/report-flow',
    component: async () => import('@/views/flow.vue')
  },
  {
    name: 'report-type',
    path: '/report-type',
    component: async () => import('@/views/report-type.vue')
  },
  {
    name: 'record-type',
    path: '/record-type',
    component: async () => import('@/views/configuration/record-type.vue')
  },
  {
    name: 'arrange-list',
    path: '/arrange-list',
    component: async () => import('@/views/arrange/index.vue')
  },
  {
    name: 'arrange-detail',
    path: '/arrange-detail',
    component: async () => import('@/views/arrange/detail.vue')
  },
  {
    name: 'notice-type',
    path: '/notice-type',
    component: async () => import('@/views/configuration/notice-type.vue')
  },
  {
    name: 'report-center',
    path: '/report-center',
    component: async () => (await import('@/views/report-center/index')).ReportCenter
  },
  {
    name: 'record-index',
    path: '/record-index',
    component: async () => (await import('@/views/report-center/record-index')).RecordIndex
  },
  {
    name: 'report-list',
    path: '/report-list',
    component: async () => import('@/views/report-list.vue')
  },
  {
    name: 'report-statistics',
    path: '/report-statistics',
    component: async () => (await import('@/views/report-statistics/index')).ReportStatistics
  }
]

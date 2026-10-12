import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    redirect: '/report-analysis'
  },
  {
    name: 'report-analysis',
    path: '/report-analysis',
    component: async () => (await import('@/views/report-analysis/report-analysis')).ReportAnalysis,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

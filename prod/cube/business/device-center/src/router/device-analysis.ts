import type { RouteRecordRaw } from 'vue-router'

/** 设备通知路由 */
export const deviceAnalysis: RouteRecordRaw[] = [
  {
    path: '/health-analysis',
    name: 'HealthAnalysis',
    component: async () => (await import('@/views/device-analysis/health-analysis')).HealthAnalysis
  },
  {
    path: '/health-detail',
    name: 'HealthDetail',
    component: async () => (await import('@/views/device-analysis/health-detail')).HealthDetail
  },
  {
    path: '/state-detail',
    name: 'StateDetail',
    component: async () => (await import('@/views/device-analysis/state/state-detail')).StateDetail
  },
  {
    path: '/reliability-analysis',
    name: 'reliabilityAnalysis',
    component: async () => (await import('@/views/device-analysis/reliability')).ReliabilityAnalysis
  },
  {
    path: '/state-analysis',
    name: 'stateAnalysis',
    component: async () => (await import('@/views/device-analysis/state')).StateAnalysis
  },

]

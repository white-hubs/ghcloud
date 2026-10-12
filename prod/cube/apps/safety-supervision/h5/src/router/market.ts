import type { RouteRecordRaw } from 'vue-router'

// 安全管理（市场）-安全分析路由
export const market: RouteRecordRaw[] = [
  {
    name: 'market-entry',
    path: '/market-entry',
    component: async () => (await import('@/views-market/entry/index')).MarketWorkbench,
  },
  {
    name: 'market-index',
    path: '/market-index',
    component: async () => (await import('@/views-market/safety-analysis/index')).SafetyAnalysis,
  },
  {
    name: 'market-risk-detail',
    path: '/market-risk-detail',
    component: async () => (await import('@/views-market/risk-detail/risk-detail')).RiskDetail,
  },
  {
    name: 'market-safe-manage',
    path: '/market-safe-manage',
    component: async () => (await import('@/views-market/safety-manage/index')).SafetyManage,
  },
  {
    name: 'market-security-monitoring',
    path: '/market-security-monitoring',
    component: async () => (await import('@/views-market/security-monitoring/index')).SecurityMonitoring,
  },
  {
    name: 'market-electrical-safety',
    path: '/market-electrical-safety',
    component: async () => (await import('@/views-market/electrical-safety/index')).ElectricalSafety
  },
  {
    name: 'market-fire-safety',
    path: '/market-fire-safety',
    component: async () => (await import('@/views-market/fire-safety/index')).FireSafety,
  },
  {
    name: 'market-use-gas-safety',
    path: '/market-use-gas-safety',
    component: async () => (await import('@/views-market/use-gas-safety/index')).UseGasSafety,
  },
  {
    name: 'market-rotating',
    path: '/market-rotating',
    component: async () => (await import('@/views-market/rotating/index')).Rotating
  },
]

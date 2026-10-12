import type { RouteRecordRaw } from 'vue-router'

// 安全监管-安全分析路由
export const safety: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: async () => (await import('@/views/safety-analysis/safety-analysis')).SafetyAnalysis,
  },
  {
    name: 'risk-tip',
    path: '/risk-tip',
    component: async () => (await import('@/views/risk-tip/risk-tip')).RiskTip,
  },
  {
    name: 'risk-detail',
    path: '/risk-detail',
    component: async () => (await import('@/views/risk-detail/risk-detail')).RiskDetail,
  },
  {
    name: 'security-monitoring',
    path: '/security-monitoring',
    component: async () => (await import('@/views/security-monitoring/security-monitoring')).SecurityMonitoring,
  },
  {
    name: 'electrical-safety',
    path: '/electrical-safety',
    component: async () => (await import('@/views/electrical-safety/electrical-safety')).ElectricalSafety,
  },
  {
    name: 'safe-manage',
    path: '/safe-manage',
    component: async () => (await import('@/views/safety-manage/index')).SafetyManage,
  },
  {
    name: 'fire-safety',
    path: '/fire-safety',
    component: async () => (await import('@/views/fire-safety/fire-safety')).FireSafety,
  },
  {
    name: 'use-gas-safety',
    path: '/use-gas-safety',
    component: async () => (await import('@/views/use-gas-safety/index')).UseGasSafety,
  },
]

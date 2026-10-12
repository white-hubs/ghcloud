import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    redirect: '/transfer'
  },
  {
    name: 'transfer',
    path: '/transfer',
    component: async () => (await import('@/views/transfer/transfer')).Transfer,
  },
  {
    name: 'login',
    path: '/login',
    component: async () => (await import('@/views/login/login')).Login,
  },
  {
    name: 'risk-resource',
    path: '/risk-resource',
    component: async () => (await import('@/views/risk-resource/risk-resource')).RiskSource,
  },
  {
    name: 'stall-detail',
    path: '/stall-detail',
    component: async () => (await import('@/views/stall-detail/stall-detail')).StallDetail,
  },
  {
    name: 'platform-auth',
    path: '/platform-auth',
    component: async () => (await import('@/views/platform-auth/platform-auth')).PlatformAuth,
  },
  {
    name: 'platform-wxofficial-callback',
    path: '/platform-wxofficial-callback',
    component: async () => (await import('@/views/platform-wxofficial-callback/platform-wxofficial-callback')).PlatformWXOfficialCallback,
  }
]
export const routes: RouteRecordRaw[] = [...routers]

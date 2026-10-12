import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'transfer-login',
    component: async () => (await import('@/views/transfer')).TransferLoginPage
  },
  // {
  //   path: '/transfer-login',
  //   name: 'transfer-login',
  //   component: async () => (await import('@/views/transfer')).TransferLoginPage
  // },
]

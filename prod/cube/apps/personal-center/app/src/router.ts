import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    path: '/info',
    name: '个人管理',
    component: async () => (await import('@/views/personal-info/personal-info')).PersonalInfo,
  },
  {
    path: '/modify-password',
    name: '修改密码',
    component: async () => (await import('@/views/modify-password/modify-password')).ModifyPassword,
  },
  {
    path: '/my-tenant',
    name: '我的企业',
    component: async () => (await import('@/views/my-tenant/my-tenant')).MyTenant,
  },
  {
    path: '/not-disturb',
    name: '消息免打扰',
    component: async () => (await import('@/views/not-disturb/not-disturb')).NotDisturb,
  },
]

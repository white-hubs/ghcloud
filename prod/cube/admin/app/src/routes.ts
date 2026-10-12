import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login',
    meta: {
      title: '登录'
    },
    component: async () => (await import('@/views/login/index')).Login
  },
  {
    path: '/',
    component: async () => (await import('@/views/layout')).LayoutView,
    redirect: '/tenant/list',
    children: [
      {
        name: 'tenant-list',
        path: '/tenant/list',
        meta: {
          title: '租户列表'
        },
        component: async () => (await import('@/views/tenant/list')).TenantList
      },
      {
        name: 'tenant-users',
        path: '/tenant/users',
        meta: {
          title: '用户管理'
        },
        component: async () => (await import('@/views/tenant/users')).TenantUsers
      }
    ]
  }
]

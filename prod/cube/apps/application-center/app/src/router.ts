import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: async () => (await import('@/views/business/app-center/app-center')).AppCenter,
  },
  {
    path: '/app-center',
    name: 'app-center',
    component: async () => (await import('@/views/business/app-center/app-center')).AppCenter,
  },
  {
    path: '/app-details',
    name: 'app-details',
    component: async () => (await import('@/views/business/app-details/app-details')).AppDetails,
  },
  {
    path: '/app-own',
    name: 'app-own',
    component: async () => (await import('@/views/business/app-own/app-own')).AppOwn
  },
  {
    path: '/admin-app-list',
    name: 'admin-app-list',
    component: async () => (await import('@/views/admin/app-list/app-list')).AppList
  },
  {
    path: '/admin-app-edit',
    name: 'admin-app-edit',
    component: async () => (await import('@/views/admin/app-list/app-edit/app-edit')).AppEdit
  },
  {
    path: '/admin-app-type',
    name: 'admin-app-type',
    component: async () => (await import('@/views/admin/app-type/app-type')).AppType
  },
  {
    path: '/admin-iteration-record',
    name: 'admin-iteration-record',
    component: async () => (await import('@/views/admin/iteration-record/iteration-record')).IterationRecord
  },
  {
    path: '/admin-iteration-edit',
    name: 'admin-iteration-edit',
    component: async () => (await import('@/views/admin/iteration-record/iteration-edit/iteration-edit')).IterationEdit
  },
  {
    path: '/admin-use-client',
    name: 'admin-use-client',
    component: async () => (await import('@/views/admin/use-client/use-client')).UseClient
  },
]
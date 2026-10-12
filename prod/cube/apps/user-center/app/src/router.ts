import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/reader-list',
    name: 'reader-list',
    component: async () => (await import('@/views/reader-list/reader-list')).ReaderList
  },
  {
    path: '/handle-record',
    name: 'handle-record',
    component: async () => (await import('@/views/handle-record/handle-record')).HandleRecord
  },
  {
    path: '/group-list',
    component: async () => (await import('@/views/group-list/group-list')).GroupList
  },
  {
    path: '/user-list',
    component: async () => (await import('@/views/user-list/user-list')).UserList
  },
  {
    path: '/user-role',
    component: async () => (await import('@/views/user-role/user-role')).UserRole
  }
]

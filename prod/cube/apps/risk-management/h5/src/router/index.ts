import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/risk-list'
  },
  {
    name: 'risk-detail',
    path: '/risk-detail',
    meta: {
      title: '风险源详情'
    },
    component: async () => (await import('@/views/risk-detail/detail')).RiskDetail
  },
  {
    name: 'risk-list',
    path: '/risk-list',
    meta: {
      title: '风险源列表'
    },
    component: async () => (await import('@/views/risk-list/list')).RiskList
  },
  {
    name: 'risk-edit',
    path: '/risk-edit',
    meta: {
      title: '风险源编辑'
    },
    component: async () => (await import('@/views/risk-edit/edit')).RiskEdit
  },
  {
    name: 'risk-add',
    path: '/risk-add',
    meta: {
      title: '风险源新增'
    },
    component: async () => (await import('@/views/risk-add/add')).RiskAdd
  },
  {
    name: 'test',
    path: '/test',
    meta: {
      title: 'test'
    },
    component: async () => (await import('@/views/test')).test
  }
]

export const routes: RouteRecordRaw[] = [...routers]

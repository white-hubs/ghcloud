import type { RouteRecordRaw } from 'vue-router'

// 运营监管
export const operationRoutes: RouteRecordRaw[] = [
  {
    name: 'investment-plan',
    path: '/investment-plan',
    meta: {
      title: '招商计划'
    },
    component: async () => (await import('@/views/operation-supervision/investment-plan/index')).InvestmentPlan
  },
  {
    name: 'project-manage',
    path: '/project-manage',
    meta: {
      title: '项目管理'
    },
    component: async () => (await import('@/views/operation-supervision/project-manage/index')).ProjectManage
  },
  {
    name: 'estate-manage',
    path: '/estate-manage',
    meta: {
      title: '物业管理'
    },
    component: async () => (await import('@/views/operation-supervision/estate-manage/index')).EstateManage
  },
  {
    name: 'enterprise-complaint',
    path: '/enterprise-complaint',
    meta: {
      title: '企业投诉'
    },
    component: async () => (await import('@/views/operation-supervision/enterprise-complaint/index')).EnterpriseComplaint
  },
  {
    name: 'rent-control-record',
    path: '/rent-control-record',
    meta: {
      title: '租控记录'
    },
    component: async () => (await import('@/views/operation-supervision/rent-control-record/index')).RentControlRecord
  }
]

import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
import type { RouteRecordRaw } from 'vue-router'

const routers: AppRoutes = [
  {
    redirect: '/index',
    path: '/'
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '故障报修'
    },
    component: async () => (await import('@/views/index/index')).Entry
  },
  {
    name: 'fault-list',
    path: '/fault-list',
    meta: {
      title: '故障报修',
      isFilter: true
    },
    component: async () => (await import('@/views/fault-list/fault-list')).FaultList
  },
  {
    name: 'case-list',
    path: '/case-list',
    meta: {
      title: '故障案例',
      isFilter: true
    },
    component: async () => (await import('@/views/case-list/case-list')).CaseList,
  },
  {
    name: 'add-case',
    path: '/add-case',
    meta: {
      title: '新增故障案例',
      isFilter: true
    },
    component: async () => (await import('@/views/case-list/add-case')).AddCase,
  },
  {
    name: 'fault-report-list',
    path: '/faultReportTable',
    meta: {
      title: '故障报告'
    },
    component: async () => (await import('@/views/fault-report-list/fault-report-list')).FaultReportList
  },
  {
    name: 'add-report',
    path: '/add-report',
    meta: {
      title: '生成故障报告',
    },
    component: async () => (await import('@/views/fault-report-list/add-report')).AddReport,
  },
  {
    name: 'report-detail',
    path: '/report-detail',
    meta: {
      title: '故障分析报告',
      isFilter: true
    },
    component: async () => (await import('@/views/fault-report-list/report-detail')).CaseDetail,
  },

  {
    name: 'maintenanceFlowProcessApply',
    path: '/maintenanceFlowProcessApply?businessType=FAULT',
    meta: {
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    redirect: '',
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        processType: 'ADD',
        businessType: 'FAULT'
      }
    }
  },
  {
    name: 'baseFlowProcessRecordAll',
    path: '/baseFlowProcessRecordAll?applicationCode=FAULT',
    meta: {
      title: '隐患排查',
      isOuter: true,
      outerPath: '/streamengineH5/personal-order-list'
    },
    redirect: '',
    getQuery: async (): Promise<Record<string, string>>=> {
      return {
        businessType: 'FAULT'
      }
    }
  }
]

export const routes: RouteRecordRaw[] = [...routers]

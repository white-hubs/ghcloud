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
      title: '隐患排查'
    },
    component: async () => (await import('@/views/index/index')).Entry
  },
  {
    name: 'hidden-danger-list',
    path: '/hidden-danger-list',
    meta: {
      title: '隐患排查'
    },
    component: async () => (await import('@/views/hidden-danger-list/hidden-danger-list')).HiddenDangerList
  },
  {
    name: 'maintenanceFlowProcessApply',
    path: '/maintenanceFlowProcessApply?businessType=HIDDENDANGER',
    meta: {
      title: '隐患排查',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    redirect: '',
    getQuery: async (): Promise<{ processType: "ADD"; businessType: "HIDDENDANGER"; }> => {
      return {
        processType: 'ADD',
        businessType: 'HIDDENDANGER'
      }
    }
  },
  {
    name: 'baseFlowProcessRecordAll',
    path: '/baseFlowProcessRecordAll?applicationCode=HIDDENDANGER',
    meta: {
      title: '隐患排查',
      isOuter: true,
      outerPath: '/streamengineH5/personal-order-list'
    },
    redirect: '',
    getQuery: async (): Promise<{ businessType: "HIDDENDANGER"; }> => {
      return {
        businessType: 'HIDDENDANGER'
      }
    }
  }
]
export const routes: RouteRecordRaw[] = [...routers]

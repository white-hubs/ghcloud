import type { RouteRecordRaw } from 'vue-router'
import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
const routers: AppRoutes = [
  {
    path: '/work-list',
    name: 'WorkList',
    meta: {
      title: '工作中心',
    },
   component: async () => (await import('@/views/work-list/work-list')).WorkList
  },
  {
    path: '/work-handover',
    name: 'WorkHandover',
    meta: {
      title: '工作交接'
    },
    component: async () => (await import('@/views/work-handover/work-handover')).WorkHandover
  },
  {
    path: '/history-list',
    name: 'HistoryList',
    meta: {
      title: '工作记录'
    },
    component: async () => (await import('@/views/history-list/history-list')).HistoryList
  },
  {
    path: '/takeover-form',
    name: 'TakeoverForm',
    meta: {
      title: '接班'
    },
    component: async () => (await import('@/views/takeover-form/takeover-form')).TakeoverForm
  },
  {
    path: '/handover-form',
    name: 'HandoverForm',
    meta: {
      title: '交班'
    },
    component: async () => (await import('@/views/handover-form/handover-form')).HandoverForm
  },
  {
    name: 'person-page',
    path: '/person-page',
    meta: {
      title: '选择人员'
    },
    component: async () => (await import('@/views/person-page/index')).PersonPage
  },
  {
    name: 'handover-items',
    path: '/handover-items',
    meta: {
      title: '选择交接事项'
    },
    component: async () => (await import('@/views/handover-items/index')).HandoverItems
  },
  {
    path: '/work-result',
    name: 'WorkResult',
    meta: {
      title: '工作结果',
    },
    component: async () => (await import('@/views/work-result/work-result')).WorkResult
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '工作中心',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/index')).Entry
  },
  {
    name: 'Entry',
    path: '/',
    redirect: '/index'
  },
]

export const routes: RouteRecordRaw[] = [...routers]

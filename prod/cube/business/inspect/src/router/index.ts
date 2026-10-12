import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: '巡检分析',
    path: '/analyse',
    component: async () => import('@/views/statistical-analysis/inspection-analyse.vue')
  },
  {
    name: '部门巡检统计',
    path: '/department',
    component: async () => import('@/views/statistical-analysis/inspection-department.vue')
  },
  {
    name: '人员巡检统计',
    path: '/personnel',
    component: async () => import('@/views/statistical-analysis/inspection-personnel.vue')
  },
  {
    name: '巡检统计结果',
    path: '/result',
    component: async () => import('@/views/statistical-analysis/inspection-result.vue')
  },
  {
    name: '巡检对象统计',
    path: '/target',
    component: async () => import('@/views/statistical-analysis/inspection-target.vue')
  },
  {
    name: '页面下钻',
    path: '/drillingInPage',
    component: async () => import('@/views/statistical-analysis/drilling-page.vue')
  },
  {
    name: '消息通知',
    path: '/messageConfig',
    component: async () => import('@/views/statistical-analysis/message-config.vue')
  },
  {
    name: '现场点管理',
    path: '/configuration',
    component: async () => import('@/views/statistical-analysis/site-configuration.vue')
  },
  {
    name: '巡检提交设置',
    path: '/inspectionSubmitSetting',
    component: async () => import('@/views/statistical-analysis/inspection-submit-setting.vue')
  },
]

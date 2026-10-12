import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: '巡更计划',
    path: '/plan',
    component: async () => import('@/views/patrol-plan/index.vue')
  },
  {
    name: '巡更任务',
    path: '/task',
    component: async () => import('@/views/patrol-task/index.vue')
  },
  {
    name: '巡更计划详情',
    path: '/plan/detiles',
    component: async () => import('@/views/patrol-plan/detiles.vue')
  },
  {
    name: '巡更任务详情',
    path: '/task/detiles',
    component: async () => import('@/views/patrol-task/detiles.vue')
  },
  {
    name: '巡更记录',
    path: '/record',
    component: async () => import('@/views/patrol-record/index.vue')
  },
  {
    name: '巡更记录详情',
    path: '/record/detiles',
    component: async () => import('@/views/patrol-record/detiles.vue')
  },
  {
    name: '巡更点',
    path: '/point',
    component: async () => import('@/views/patrol-config/point.vue')
  },
  {
    name: 'NFC',
    path: '/nfc',
    component: async () => import('@/views/patrol-config/nfc.vue')
  },
  {
    name: '巡更路线',
    path: '/path',
    component: async () => import('@/views/patrol-config/path.vue')
  },
  {
    name: '巡更路线详情',
    path: '/path/detiles',
    component: async () => import('@/views/patrol-config/path-detiles.vue')
  },
  {
    name: '巡更消息配置',
    path: '/message',
    component: async () => import('@/views/patrol-config/message.vue')
  },
  {
    name: '巡更提交配置',
    path: '/submit-setting',
    component: async () => import('@/views/patrol-config/submit-setting.vue')
  },
  {
    name: '巡更人员统计',
    path: '/linestatistics',
    component: async () => import('@/views/patrol-statistics/line.vue')
  },
  {
    name: '巡更点统计',
    path: '/pointstatistics',
    component: async () => import('@/views/patrol-statistics/point.vue')
  },
  {
    name: '巡更路线统计',
    path: '/route-statistics',
    component: async () => import('@/views/patrol-statistics/route.vue')
  },
]

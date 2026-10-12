import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  // 工作中心
  {
    path: '/work-center',
    name: 'WorkCenter',
    meta: {
      title: '工作中心'
    },
    component: async () => (await import('@/views/work-center/work-center')).WorkCenter
  },
  // 工作交接记录
  {
    path: '/work-handover',
    name: 'WorkHandover',
    meta: {
      title: '工作交接记录'
    },
    component: async () => (await import('@/views/work-handover/work-handover')).WorkHandover
  },
  {
    path: '/work-handover-detail',
    name: 'WorkHandoverDetail',
    meta: {
      title: '工作交接记录详情'
    },
    component: async () => (await import('@/views/work-handover-detail/work-handover-detail')).WorkHandoverDetail
  },
  // 消息配置
  {
    path: '/message-config',
    name: 'MessageConfig',
    meta: {
      title: '消息配置'
    },
    component: async () => (await import('@/views/message-config/message-config')).MessageConfig
  }
]

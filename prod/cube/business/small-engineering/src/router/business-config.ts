import type { RouteRecordRaw } from 'vue-router'

export const businessConfig: RouteRecordRaw[] = [
  {
    path: '/patrol-type',
    name: 'PatrolType',
    meta: {
      title: '巡检类型'
    },
    component: async () => (await import('@/views/business-config/patrol-type/patrol-type')).PatrolType
  },
  {
    path: '/inspect-cycle',
    name: 'InspectCycle',
    meta: {
      title: '巡检周期'
    },
    component: async () => (await import('@/views/business-config/inspect-cycle/inspect-cycle')).InspectCycle
  },
  {
    path: '/inspect-result',
    name: 'InspectResult',
    meta: {
      title: '巡检结果'
    },
    component: async () => (await import('@/views/business-config/inspect-result/inspect-result')).InspectResult
  },
  {
    path: '/inspect-items',
    name: 'InspectItems',
    meta: {
      title: '巡检项'
    },
    component: async () => (await import('@/views/business-config/inspect-items/inspect-items')).InspectItems
  },
  {
    path: '/inspect-items-form',
    name: 'InspectItemsForm',
    meta: {
      title: '巡检项'
    },
    component: async () => (await import('@/views/business-config/inspect-items-form/inspect-items-form')).InspectItemsForm
  },
  {
    path: '/inspect-standard',
    name: 'InspectStandard',
    meta: {
      title: '巡检标准'
    },
    component: async () => (await import('@/views/business-config/inspect-standard/inspect-standard')).InspectStandard
  },
  {
    path: '/inspect-standard-form',
    name: 'InspectStandardForm',
    meta: {
      title: '巡检标准'
    },
    component: async () => (await import('@/views/business-config/inspect-standard-form/inspect-standard-form')).InspectStandardForm
  },
  {
    path: '/message-config',
    name: 'MessageConfig',
    meta: {
      title: '消息配置'
    },
    component: async () => (await import('@/views/business-config/message-config/message-config')).MessageConfig
  },
]

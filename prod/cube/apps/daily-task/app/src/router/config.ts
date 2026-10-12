import type { RouteRecordRaw } from 'vue-router'

export const config: RouteRecordRaw[] = [
  {
    path: '/task-type',
    name: 'task-type',
    meta: {
      title: '任务类型'
    },
    component: async () => (await import('@/views/task-config/task-type/task-type')).TaskType
  },
  {
    path: '/task-cycle',
    name: 'task-cycle',
    meta: {
      title: '任务周期'
    },
    component: async () => (await import('@/views/task-config/task-cycle/task-cycle')).TaskCycle
  },
  {
    path: '/urgency-level',
    name: 'urgency-level',
    meta: {
      title: '紧急等级'
    },
    component: async () => (await import('@/views/task-config/urgency-level/urgency-level')).UrgencyLevel
  },
  {
    path: '/task-result',
    name: 'task-result',
    meta: {
      title: '任务结果'
    },
    component: async () => (await import('@/views/task-config/task-result/task-result')).TaskResult
  },
  {
    path: '/standard-item',
    name: 'standard-item',
    meta: {
      title: '标准项',
    },
    component: async () => (await import('@/views/task-config/standard-item/standard-item')).StandardItem
  },
  {
    path: '/standard-item-form',
    name: 'standard-item-form',
    meta: {
      title: '标准项'
    },
    component: async () => (await import('@/views/task-config/standard-item-form/standard-item-form')).StandardItemForm
  },
  {
    path: '/task-standard',
    name: 'task-standard',
    meta: {
      title: '任务标准',
    },
    component: async () => (await import('@/views/task-config/task-standard/task-standard')).TaskStandard
  },
  {
    path: '/task-standard-form',
    name: 'task-standard-form',
    meta: {
      title: '任务标准'
    },
    component: async () => (await import('@/views/task-config/task-standard-form/task-standard-form')).TaskStandardForm
  },
  {
    path: '/message-config',
    name: 'message-config',
    meta: {
      title: '消息配置'
    },
    component: async () => (await import('@/views/task-config/message-config/message-config')).MessageConfig
  },

]

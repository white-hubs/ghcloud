import type { RouteRecordRaw } from 'vue-router'

export const task: RouteRecordRaw[] = [
  {
    path: '/task-plan',
    name: 'task-plan',
    meta: {
      title: '任务计划',
    },
    component: async () => (await import('@/views/task-plan/task-plan')).TaskPlan
  },
  {
    path: '/task-plan-edit',
    name: 'task-plan-edit',
    meta: {
      title: '任务计划'
    },
    component: async () => (await import('@/views/task-plan/task-plan-edit/task-plan-edit')).TaskPlanEdit
  },
  {
    path: '/task-list',
    name: 'task-list',
    meta: {
      title: '日常任务',
    },
    component: async () => (await import('@/views/task-list/task-list')).TaskList
  },
  {
    path: '/task-edit',
    name: 'task-edit',
    meta: {
      title: '日常任务'
    },
    component: async () => (await import('@/views/task-list/task-edit/task-edit')).TaskEdit
  },
  {
    path: '/task-record',
    name: 'task-record',
    meta: {
      title: '任务记录',
    },
    component: async () => (await import('@/views/task-record/task-record')).TaskRecord
  },
  {
    path: '/task-record-info',
    name: 'task-record-info',
    meta: {
      title: '任务记录详情'
    },
    component: async () => (await import('@/views/task-record/record-info/record-info')).TaskRecordInfo
  },
  {
    path: '/task-target-info',
    name: 'task-target-info',
    meta: {
      title: '任务对象详情'
    },
    component: async () => (await import('@/views/task-record/task-target-info/task-target-info')).TaskTargetInfo
  },
  {
    path: '/task-drafts',
    name: 'task-drafts',
    meta: {
      title: '草稿箱',
    },
    component: async () => (await import('@/views/task-drafts/task-drafts')).TaskDrafts
  }
]

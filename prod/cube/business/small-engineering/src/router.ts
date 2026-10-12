import type { RouteRecordRaw } from 'vue-router'
import { businessConfig } from './router/business-config'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'manage'
  },
  {
    name: 'manage',
    path: '/manage',
    component: async () => (await import('@/views/manage/manage')).Manage
  },
  {
    name: 'manage-detail',
    path: '/manage-detail',
    component: async () => (await import('@/views/manage/mange-detail')).ManageDetail
  },
  {
    name: 'request',
    path: '/request',
    component: async () => (await import('@/views/request/index')).Request
  },
  {
    name: 'examineApprove',
    path: '/examineApprove',
    component: async () => (await import('@/views/examine-approve')).ExamineApprove
  },
  {
    name: 'supervise',
    path: '/supervise',
    component: async () => (await import('@/views/supervise')).Supervise
  },
  {
    name: 'supervise-detail',
    path: '/supervise-detail',
    component: async () => (await import('@/views/supervise/detail')).Detail
  },
  {
    name: 'edit-supervise',
    path: '/edit-supervise',
    component: async () => (await import('@/views/supervise/edit-supervise/edit-supervise')).EditSupervise
  },
  {
    name: 'engineeringType',
    path: '/engineeringType',
    component: async () => (await import('@/views/engineering-type/engineering-type')).EngineeringType
  },
  {
    name: 'engineering-patrol-plan',
    path: '/engineering-patrol-plan',
    component: async () => (await import('@/views/engineering-patrol/patrol-plan/patrol-plan')).PatrolPlan,
    meta: {
      title: '工程巡检计划'
    }
  },
  {
    name: 'engineering-patrol-plan-edit',
    path: '/engineering-patrol-plan-edit',
    component: async () => (await import('@/views/engineering-patrol/patrol-plan/patrol-plan-edit/patrol-plan-edit')).PatrolPlanEdit
  },
  {
    name: 'engineering-patrol-task-edit',
    path: '/engineering-patrol-task-edit',
    component: async () => (await import('@/views/engineering-patrol/patrol-task/patrol-task-edit/patrol-task-edit')).PatrolTaskEdit
  },
  {
    name: 'engineering-patrol-records',
    path: '/engineering-patrol-records',
    component: async () => (await import('@/views/engineering-patrol/patrol-records/patrol-records')).PatrolRecords
  },
  {
    name: 'engineering-patrol-record-info',
    path: '/engineering-patrol-record-info',
    component: async () => (await import('@/views/engineering-patrol/patrol-records/record-info/record-info')).RecordInfo
  },
  {
    name: 'engineering-correction',
    path: '/engineering-correction',
    component: async () => (await import('@/views/engineering-correction/engineering-correction')).EngineeringCorrection
  },
  {
    name: 'engineering-patrol-task',
    path: '/engineering-patrol-task',
    component: async () => (await import('@/views/engineering-patrol/patrol-task/patrol-task')).PatrolTask
  },
  {
    name: 'engineering-temporary-patrol-record',
    path: '/engineering-temporary-patrol-record',
    component: async () => (await import('@/views/engineering-patrol/temporary-patrol-record/temporary-patrol-record')).TemporaryPatrolRecord
  },
  {
    name: 'engineering-temporary-patrol-details',
    path: '/engineering-temporary-patrol-details',
    component: async () => (await import('@/views/engineering-patrol/temporary-patrol-details/temporary-patrol-details')).TemporaryPatrolDetails
  },
  ...businessConfig,
]

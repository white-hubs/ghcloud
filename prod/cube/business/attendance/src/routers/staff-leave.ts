/** 请假审批 */
import type { Component } from 'vue'

export default [
  {
    path: '/leave-rules',
    name: 'leaveRules',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/leave-rules')).LeaveRules
  },
  {
    path: '/leave-rules-form',
    name: 'leaveRules-form',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/leave-rules-form')).LeaveRulesForm
  },
  {
    path: '/vacation-balance',
    name: 'vacationBalance',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/vacation-balance')).VacationBalance
  },
  {
    path: '/approve-leave',
    name: 'approveLeave',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/approve-leave')).ApproveLeave
  },
  {
    path: '/approve-dispose-leave',
    name: 'approveDisposeLeave',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/approve-dispose-leave')).ApproveDisposeLeave
  },
  // todo: 次数使用相同name 导致vacationBalance页面无法渲染？？
  // {
  //   path: '/leave-balance',
  //   name: 'vacationBalance',
  //   component: async (): Promise<Component> => (await import('@/views/staff-leave/vacation-balance')).VacationBalance
  // },
  {
    path: '/leave-balance-detail',
    name: 'vacationBalanceDetail',
    component: async (): Promise<Component> => (await import('@/views/staff-leave/vacation-balance-detail')).VacationBalanceDetail
  },
]

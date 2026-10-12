/** 班次管理 */
import type { Component } from 'vue'

export default [
  {
    path: '/scheduling-rules',
    name: 'schedulingRules',
    component: async (): Promise<Component> => (await import('@/views/scheduling-manage/scheduling-rules')).SchedulingRules
  },
  {
    path: '/scheduling-rules-form',
    name: 'schedulingRulesForm',
    component: async (): Promise<Component> => (await import('@/views/scheduling-manage/scheduling-rules-form')).SchedulingRulesForm
  },
  {
    path: '/staff-scheduling',
    name: 'StaffScheduling',
    component: async (): Promise<Component> => (await import('@/views/scheduling-manage/staff-scheduling')).StaffScheduling
  },
  {
    path: '/staff-duty',
    name: 'StaffDuty',
    component: async (): Promise<Component> => (await import('@/views/scheduling-manage/staff-duty')).StaffDuty
  }
]

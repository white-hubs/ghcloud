/** 班次管理 */
import type { Component } from 'vue'

export default [
  {
    path: '/attendance-group',
    name: 'attendanceGroup',
    component: async (): Promise<Component> => (await import('@/views/attendance-group/attendance-group')).AttendanceGroup
  },
  {
    path: '/attendance-group-form',
    name: 'attendanceGroupForm',
    component: async (): Promise<Component> => (await import('@/views/attendance-group/attendance-group-form')).AttendanceGroupForm
  }
]

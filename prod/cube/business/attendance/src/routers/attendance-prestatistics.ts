/** 考勤预统计 */
import type { Component } from 'vue'

export default [
  {
    path: '/attendance-pre-statistics',
    name: 'attendancePreStatistics',
    component: async (): Promise<Component> => (await import('@/views/attendance-pre-statistics/index')).Pre
  },

]

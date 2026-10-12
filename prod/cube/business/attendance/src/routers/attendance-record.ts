import type { Component } from 'vue'

/** 考勤汇总统计下钻页 -考勤审批记录 */
export default [
  {
    path: '/attendance-record',
    name: 'attendanceRecord',
    component: async (): Promise<Component> => (await import('@/views/attendance-record/index')).AttendanceRecord
  },
]

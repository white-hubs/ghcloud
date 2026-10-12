import type { Component } from 'vue'

/** 考勤台账 */
export default [
  {
    path: '/attendance-ledger-summary',
    name: 'attendanceLedgeSummary',
    component: async (): Promise<Component> => (await import('@/views/attendance-ledger/summary')).Summary
  },
  {
    path: '/attendance-ledger-day',
    name: 'attendanceLedgeDay',
    component: async (): Promise<Component> => (await import('@/views/attendance-ledger/day')).Day
  }
]

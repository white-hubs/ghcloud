import type { Component } from 'vue'

/** 加班审批 */
export default [
  {
    path: '/overtime-rules',
    name: 'overtimeRules',
    component: async (): Promise<Component> => (await import('@/views/staff-overtime/overtime-rules')).OvertimeRules
  },
  {
    path: '/approve-overtime',
    name: 'approveOvertime',
    component: async (): Promise<Component> => (await import('@/views/staff-overtime/approve-overtime')).ApproveOvertime
  },
  {
    path: '/overtime-rules-form',
    name: 'overtimeRulesForm',
    component: async (): Promise<Component> => (await import('@/views/staff-overtime/overtime-rules-form')).OverTimeRulesForm
  },
  {
    path: '/overtime-ledger-detail',
    name: 'overtimeLedgerDetail',
    component: async (): Promise<Component> => (await import('@/views/staff-overtime/overtime-ledger-detail')).OverTimeLedgerDetail
  },
]

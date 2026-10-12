/** 换班审批 */
import type { Component } from 'vue'

export default [
  {
    path: '/approve-change',
    name: 'approveChange',
    component: async (): Promise<Component> => (await import('@/views/staff-change/approve-change')).ApproveChange
  },
  {
    path: '/change-ledger',
    name: 'ChangeLedger',
    component: async (): Promise<Component> => (await import('@/views/staff-change/change-ledger')).ChangeLedger
  },
]

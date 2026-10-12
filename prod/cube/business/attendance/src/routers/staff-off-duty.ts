/** 离岗审批 */
import type { Component } from 'vue'

export default [
  {
    path: '/approve-off-duty',
    name: 'approveOffDuty',
    component: async (): Promise<Component> => (await import('@/views/staff-off-duty/approve-off-duty')).ApproveOffDuty
  },
  {
    path: '/off-duty-rules',
    name: 'offDutyRules',
    component: async (): Promise<Component> => (await import('@/views/staff-off-duty/off-duty-rules')).OffDutyRules
  },
  {
    path: '/off-duty-rules-form',
    name: 'offDutyRulesForm',
    component: async (): Promise<Component> => (await import('@/views/staff-off-duty/off-duty-rules-form')).OffDutyRulesForm
  }
]

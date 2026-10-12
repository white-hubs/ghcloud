/** 员工出差 */
import type { Component } from 'vue'

export default [
  {
    path: '/business-trip-rules',
    name: 'businessTripRules',
    component: async (): Promise<Component> => (await import('@/views/staff-business-trip/business-trip-rules')).BusinessTripRules
  },
  {
    path: '/business-trip-rules-form',
    name: 'businessTripRulesForm',
    component: async (): Promise<Component> => (await import('@/views/staff-business-trip/business-trip-rules-form')).BusinessTripRulesForm
  },
  {
    path: '/approve-business-trip',
    name: 'approveBusinessTrip',
    component: async (): Promise<Component> => (await import('@/views/staff-business-trip/approve-business-trip')).ApproveBusinessTrip
  },
]

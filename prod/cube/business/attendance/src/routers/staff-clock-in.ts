/** 打卡管理 */
import type { Component } from 'vue'

export default [
  {
    path: '/clock-in-rules',
    name: 'clockInRules',
    component: async (): Promise<Component> => (await import('@/views/staff-clock-in/clock-in-rules')).ClockInRules
  },
  {
    path: '/clock-in-rules-form',
    name: 'clockInRulesForm',
    component: async (): Promise<Component> => (await import('@/views/staff-clock-in/clock-in-rules-form')).ClockInRulesForm
  },
  {
    path: '/clock-in-record',
    name: 'clockInRecord',
    component: async (): Promise<Component> => (await import('@/views/staff-clock-in/clock-in-record')).ClockInRecord
  },
  {
    path: '/clock-in-ledger',
    name: 'clockInLedger',
    component: async (): Promise<Component> => (await import('@/views/staff-clock-in/clock-in-ledger')).ClockInLedger
  },
]

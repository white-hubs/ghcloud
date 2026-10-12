/** 加班审批 */
export default [
  {
    path: '/supplement-rules',
    name: 'supplementRules',
    component: async (): Promise<Component> => (await import('@/views/staff-supplement/supplement-rules')).SupplementRules
  },
  {
    path: '/supplement-rules-form',
    name: 'supplementRulesForm',
    component: async (): Promise<Component> => (await import('@/views/staff-supplement/supplement-rules-form')).SupplementRulesForm
  },
  {
    path: '/approve-supplement',
    name: 'approveSupplement',
    component: async (): Promise<Component> => (await import('@/views/staff-supplement/approve-supplement')).ApproveSupplement
  },
  {
    path: '/supplement-ledger-detail',
    name: 'supplementLedgerDetail',
    component: async (): Promise<Component> => (await import('@/views/staff-supplement/supplement-ledger-detail')).SupplementLedgerDetail
  }
]

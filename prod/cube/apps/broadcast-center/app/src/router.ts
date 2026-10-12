import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/broadcastCenterMoban',
    name: 'BroadcastTemplate',
    component: async () => (await import('@/views/broadcast-template/broadcast-template')).BroadcastTemplate
  },
  {
    path: '/broadcastCenterRecord',
    name: 'broadcastCenterRecord',
    component: async () => (await import('@/views/broadcast-center-record/broadcast-center-record')).BroadcastCenterRecord
  },
  {
    path: '/broadcastCenterRuleList',
    name: 'broadcastCenterRuleList',
    component: async () => (await import('@/views/broadcast-center-rule-list/broadcast-center-rule-list')).BroadcastCenterRuleList
  },
  {
    path: '/broadcastCenterRuleDetails',
    name: 'broadcastCenterRuleDetails',
    component: async () => (await import('@/views/broadcast-center-rule-list/broadcast-center-rule-details')).BroadcastCenterRuleDetails
  },
]

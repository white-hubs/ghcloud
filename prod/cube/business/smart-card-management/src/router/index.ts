import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'card-list',
    path: '/card-list',
    component: async () => (await import('@/views/card-list/card-list')).CardList
  },
  {
    name: 'detail-list',
    path: '/detail-list',
    component: async () => (await import('@/views/card-list/detail-list/detail-list')).DetailList
  },
  {
    name: 'visitor-record',
    path: '/visitor-record',
    component: async () => (await import('@/views/visitor-record/visitor-record')).VisitorRecord
  },
  {
    name: 'access-control-usage-records',
    path: '/access-control-usage-records',
    component: async () => (await import('@/views/access-control-usage-records/access-control-usage-records')).AccessControlUsageRecords
  },
  {
    name: 'ladder-control-usage-record',
    path: '/ladder-control-usage-record',
    component: async () => (await import('@/views/ladder-control-usage-record/ladder-control-usage-record')).LadderControlUsageRecord
  },
  {
    name: 'visual-intercom-usage-records',
    path: '/visual-intercom-usage-records',
    component: async () => (await import('@/views/visual-intercom-usage-records/visual-intercom-usage-records')).VisualIntercomUsageRecords
  },
]

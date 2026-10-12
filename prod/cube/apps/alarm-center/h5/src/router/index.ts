import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    redirect: '/entry',
    path: '/'
  },
  {
    name: 'entry',
    path: '/entry',
    meta: {
      title: '报警中心'
    },
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    name: 'alarmList',
    path: '/alarmList',
    redirect: '/alarm-records'
  },
  {
    name: 'alarm-records',
    path: '/alarm-records',
    component: async () => (await import('@/views/alarm-records/alarm-records')).AlarmRecords,
  },
  {
    name: 'alarm-transfer',
    path: '/alarm-transfer',
    component: async () => (await import('@/views/alarm-records/alarm-transfer/alarm-transfer')).AlarmTransfer,
  },
  {
    name: 'alarm-handle',
    path: '/alarm-handle',
    component: async () => (await import('@/views/alarm-records/alarm-handle/alarm-handle')).AlarmHandle,
  },
  {
    name: 'alarm-details',
    path: '/alarm-details',
    component: async () => (await import('@/views/alarm-records/details/details')).Details,
  },
  {
    name: 'alarm-follow-up',
    path: '/alarm-follow-up',
    component: async () => (await import('@/views/alarm-records/alarm-follow-up/alarm-follow-up')).AlarmFollowUp,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

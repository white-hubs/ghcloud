import type { RouteRecordRaw } from 'vue-router'

export const deviceManage: RouteRecordRaw[] = [
  {
    path: '/device-list',
    name: 'DeviceList',
    component: async () => (await import('@/views/device-list/device-list')).DeviceList
  },
  {
    path: '/device-list-info',
    name: 'deviceListInfo',
    component: async () => (await import('@/views/device-list/device-list-info/device-list-info')).DeviceListInfo
  },
  {
    path: '/device-ledger',
    name: 'DeviceLedger',
    component: async () => (await import('@/views/device-ledger/device-ledger')).DeviceLedger
  },
  {
    path: '/device-ledger-form',
    name: 'DeviceLedgerForm',
    component: async () => (await import('@/views/device-ledger/device-ledger-form')).DeviceLedgerForm
  },
  {
    path: '/device-ledger-info',
    name: 'DeviceLedgerInfo',
    component: async () => (await import('@/views/device-ledger/device-ledger-info/device-ledger-info')).DeviceLedgerInfo
  },
  {
    path: '/handle-record',
    name: 'HandleRecord',
    component: async () => (await import('@/views/handle-record/handle-record')).HandleRecord
  },
]

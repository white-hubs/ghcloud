export default [
  {
    path: '/device-list',
    name: 'deviceList',
    component: async (): Promise<unknown> => (await import('@/views/device-manage/device-list/device-list')).DeviceList
  },
  {
    path: '/device-record',
    name: 'deviceRecord',
    component: async (): Promise<unknown> => (await import('@/views/device-manage/device-record/device-record')).DeviceRecord
  },
  {
    path: '/device-alarm',
    name: 'deviceAlarm',
    component: async (): Promise<unknown> => (await import('@/views/device-manage/device-alarm/device-alarm')).DeviceAlarm
  },
  {
    path: '/device-alarm-detail',
    name: 'deviceAlarmDetail',
    component: async (): Promise<unknown> => (await import('@/views/device-manage/device-alarm/device-alarm-detail')).DeviceAlarmDetail
  }
]

export default [
  {
    path: '/device-daily-record',
    name: 'deviceDailyRecord',
    component: async (): Promise<unknown> => (await import('@/views/device-report/device-daily-report/device-daily-report')).DeviceDailyRecord
  },
  {
    path: '/alarm-daily-record',
    name: 'alarmDailyRecord',
    component: async (): Promise<unknown> => (await import('@/views/device-report/alarm-daily-report/alarm-daily-report')).AlarmDailyRecord
  },
]

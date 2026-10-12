export default [
  {
    path: '/history-monitor-record',
    name: 'history-monitor-record',
    meta: {
      title: '历史监测记录',
    },
    component: async (): Promise<unknown> => (await import('@/views/norm-monitor/history-monitor-record/history-monitor-record')).HistoryMonitorRecord
  },
  {
    path: '/real-time-monitor',
    name: 'real-time-monitor',
    meta: {
      title: '实时监测',
    },
    component: async (): Promise<unknown> => (await import('@/views/norm-monitor/real-time-monitor/real-time-monitor')).RealTimeMonitor
  },
  {
    path: '/special-norm-monitor',
    name: 'special-norm-monitor',
    meta: {
      title: '特殊指标实时监测',
    },
    component: async (): Promise<unknown> => (await import('@/views/norm-monitor/special-norm-monitor/special-norm-monitor')).SpecialNormMonitor
  },
  {
    path: '/over-limit-record',
    name: 'over-limit-record',
    meta: {
      title: '超限提醒记录',
    },
    component: async (): Promise<unknown> => (await import('@/views/norm-monitor/over-limit-record/over-limit-record')).OverLimitRecord
  },
]

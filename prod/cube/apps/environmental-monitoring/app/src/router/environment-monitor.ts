import type { RouteRecordRaw } from 'vue-router'

export const environmentMonitor: RouteRecordRaw[] = [
  {
    path: '/history-record',
    name: 'historyRecord',
    component: async () => (await import('@/views/history-record/history-record')).HistoryRecord
  },
  {
    path: '/real-time-monitor',
    name: 'realTimeMonitor',
    component: async () => (await import('@/views/real-time-monitor/real-time-monitor')).RealTimeMonitor
  },
]

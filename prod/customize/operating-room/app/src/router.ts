import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/monitor-rules',
    name: 'monitorRules',
    component: async () => (await import('@/views/monitor-rules/monitor-rules')).MonitorRules
  },
  {
    path: '/monitor-rules-form',
    name: 'monitorRulesForm',
    component: async () => (await import('@/views/monitor-rules/monitor-rules-form')).MonitorRulesForm
  },
  {
    path: '/real-time-monitor',
    name: 'realTimeMonitor',
    component: async () => (await import('@/views/real-time-monitor/real-time-monitor')).RealTimeMonitor
  },
  {
    path: '/monitor-report',
    name: 'monitorReport',
    component: async () => (await import('@/views/monitor-report/monitor-report')).MonitorReport
  },
  {
    path: '/inspection-report',
    name: 'inspectionReport',
    component: async () => (await import('@/views/inspection-report/inspection-report')).InspectionReport
  },
  {
    path: '/service-set',
    name: 'ServiceSet',
    component: async () => (await import('@/views/service-set/service-set')).ServiceSet
  },
  {
    path: '/over-limit-record',
    name: 'over-limit-record',
    meta: {
      title: '超限提醒记录',
    },
    component: async () => (await import('@/views/over-limit-record/over-limit-record')).OverLimitRecord
  },
  {
    path: '/history-monitor-record',
    name: 'history-monitor-record',
    meta: {
      title: '历史监测记录',
    },
    component: async () => (await import('@/views/history-monitor-record/history-monitor-record')).HistoryMonitorRecord
  },
  {
    name: 'on-line-help',
    path: '/on-line-help',
    meta: {
      title: '在线求助',
    },
    component: async () => (await import('@/views/on-line-help/on-line-help')).OnLineHelp,
  },
]

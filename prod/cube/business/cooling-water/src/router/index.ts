import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'data-center',
    path: '/data-center',
    component: async () => (await import('@/views/data-center')).DataCenter
  },
  {
    name: 'operate-record',
    path: '/operate-record',
    component: async () => (await import('@/views/operate-record')).OperateRecord
  },
  {
    name: 'electricity-rate-report',
    path: '/electricity-rate-report',
    component: async () => (await import('@/views/merchant-managent/electricity-rate-report')).ElectricityRateReport
  },
  {
    name: 'report-analysis',
    path: '/report-analysis',
    component: async () => (await import('@/views/merchant-managent/report-analysis/report-analysis')).ReportAnalysis
  },
  {
    name: 'report-detail',
    path: '/report-detail',
    component: async () => (await import('@/views/merchant-managent/report-detail/report-detail')).ReportDetail
  },
  {
    name: 'merchant-details',
    path: '/merchant-details',
    component: async () => (await import('@/views/merchant-managent/merchant-detail/merchant-details')).MerchantDetails
  },
  {
    name: 'merchant-details-info',
    path: '/merchant-details/:id',
    component: async () => (await import('@/views/merchant-managent/merchant-detail/info/index')).MerchantDetailsInfo
  },
  {
    name: 'device-config',
    path: '/device-config',
    component: async () => (await import('@/views/business-config/device-config/device-config')).DeviceConfig
  },
  {
    name: 'merchant-config',
    path: '/merchant-config',
    component: async () => (await import('@/views/business-config/merchant-config/merchant-config')).MerchantConfig
  },
  {
    name: 'device-monitor',
    path: '/device-monitor',
    component: async () => (await import('@/views/device-center/device-monitor/device-monitor')).DeviceMonitor
  },
  {
    name: 'device-detail',
    path: '/device-monitor/:id',
    component: async () => (await import('@/views/device-center/device-monitor/detail/index')).DeviceDetail
  },
  {
    name: 'alarm-statistics',
    path: '/alarm-statistics',
    component: async () => (await import('@/views/statistics-analysis/alarm-statistics/index')).AlarmStatistics
  },
  {
    name: 'alarm-handle-statistics',
    path: '/alarm-handle-statistics',
    component: async () => (await import('@/views/statistics-analysis/alarm-handle-statistics/index')).AlarmHandleStatistics
  },
  {
    name: 'alarm-device-statistics',
    path: '/alarm-device-statistics',
    component: async () => (await import('@/views/statistics-analysis/alarm-device-statistics/index')).AlarmDeviceStatistics
  },
  {
    name: 'alarm-statastics-record',
    path: '/alarm-statastics-record',
    component: async () => (await import('@/views/statistics-analysis/alarm-statastics-record/index')).AlarmStatasticsRecord
  },
  {
    name: 'alarm-record',
    path: '/alarm-record',
    component: async () => (await import('@/views/alarm/alarm-record/index')).AlarmRecordList
  },
  {
    name: 'alarm-detail',
    path: '/alarm-detail',
    component: async () => (await import('@/views/alarm/alarm-record/alarm-detail/index')).AlarmDetail
  },
  {
    name: 'alarm-config',
    path: '/alarm-config',
    component: async () => (await import('@/views/alarm/alarm-config/index')).AlarmConfig
  },
  {
    name: 'alarm-rule-edit',
    path: '/alarm-rule-edit',
    component: async () => (await import('@/views/alarm/alarm-config/alarm-rule-edit')).AlarmRuleEdit
  },
]

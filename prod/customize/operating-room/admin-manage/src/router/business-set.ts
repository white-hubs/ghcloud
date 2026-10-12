export default [
  {
    path: '/special-norm-set',
    name: 'special-norm-set',
    meta: {
      title: '特殊指标设置',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/special-norm-set/special-norm-set')).SpecialNormSet
  },
  {
    path: '/correct-norm',
    name: 'correct-norm',
    meta: {
      title: '修正指标',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/correct-norm/correct-norm')).CorrectNormSet
  },
  {
    path: '/over-limit-remind',
    name: 'over-limit-remind',
    meta: {
      title: '指标超限提醒',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/over-limit-remind/over-limit-remind')).OverLimitRemind
  },
  {
    path: '/test-standard',
    name: 'test-standard',
    meta: {
      title: '检测标准',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/test-standard/test-standard')).TestStandard
  },
  {
    path: '/test-standard-form',
    name: 'test-standard-form',
    component: async (): Promise<unknown> => (await import('@/views/business-set/test-standard/test-standard-form')).TestStandardForm
  },
  {
    path: '/report-set',
    name: 'report-set',
    meta: {
      title: '报告设置',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/report-set/report-set')).ReportSet
  },
  {
    path: '/report-set-info',
    name: 'report-set-info',
    meta: {
      title: '报告模版',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/report-set/report-set-info')).ReportSetInfo
  },
  {
    path: '/inspection-report-record',
    name: 'inspection-report-record',
    meta: {
      title: '报告记录',
    },
    component: async (): Promise<unknown> => (await import('@/views/business-set/inspection-report-record/inspection-report-record')).InspectionReportRecord
  },
]

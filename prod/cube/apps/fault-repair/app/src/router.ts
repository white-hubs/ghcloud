import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/faultList',
    name: '故障单',
    component: async () => (await import('@/views/fault-list/fault-list')).FaultList,
  },
  {
    path: '/faultRecord',
    name: '报修记录',
    component: async () => (await import('@/views/fault-record/fault-record')).FaultRecord,
  },
  {
    path: '/faultReport',
    name: '故障报告',
    component: async () => (await import('@/views/fault-report/fault-report')).FaultReport,
  },
  {
    path: '/faultReportDetail',
    name: '故障报告详情',
    component: async () => (await import('@/views/fault-report/detail')).Detail,
  },
  {
    path: '/faultCase',
    name: '故障案例',
    component: async () => (await import('@/views/fault-case/fault-case')).FaultCase,
  },
  {
    path: '/faultCaseOperate',
    name: '故障案例操作',
    component: async () => (await import('@/views/fault-case/operate')).Operate,
  },
  {
    path: '/faultType',
    name: '故障类型',
    component: async () => (await import('@/views/fault-type/fault-type')).FaultType,
  },
  {
    path: '/work-order-statistics',
    name: '故障报修工单统计',
    component: async () => (await import('@/views/work-order-statistics/work-order-statistics')).WorkOrderStatistics,
  },
  {
    path: '/personnel-statistics',
    name: '故障报修人员统计',
    component: async () => (await import('@/views/personnel-statistics/personnel-statistics')).PersonnelStatistics,
  },
]

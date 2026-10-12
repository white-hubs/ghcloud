import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: 'price-plan'
  },
  {
    path: '/price-plan',
    name: '采价计划',
    component: async () => (await import('@/views/price-plan/index')).PricePlan
  },
  {
    path: '/plan-detail',
    name: '采价计划详情',
    component: async () => (await import('@/views/price-plan/detail')).Detail
  },
  {
    path: '/price-task',
    name: '采价任务',
    component: async () => (await import('@/views/price-task/index')).PriceTask
  },
  {
    path: '/task-detail',
    name: '采价任务详情',
    component: async () => (await import('@/views/price-task/detail')).Detail
  },
  {
    path: '/price-record',
    name: '采价记录',
    component: async () => (await import('@/views/price-record/index')).PriceRecord
  },
  {
    path: '/record-detail',
    name: '采价记录详情',
    component: async () => (await import('@/views/price-record/detail')).Detail
  },
  {
    path: '/average-price',
    name: '商品均价',
    component: async () => (await import('@/views/average-price/index')).AveragePrice
  },
  {
    path: '/average-detail',
    name: '商品均价详情',
    component: async () => (await import('@/views/average-price/detail')).Detail
  },
  {
    path: '/price-trend',
    name: '价格趋势',
    component: async () => (await import('@/views/price-trend/index')).PriceTrend
  },
  {
    path: '/price-alarm-config',
    name: '采价预警配置',
    component: async () => (await import('@/views/price-alarm-config/index')).PriceAlarmConfig
  },
  {
    path: '/alarm-config-detail',
    name: '采价预警配置详情',
    component: async () => (await import('@/views/price-alarm-config/detail')).Detail
  },
  {
    path: '/price-alarm-record',
    name: '采价预警记录',
    component: async () => (await import('@/views/price-alarm-record/index')).PriceAlarmRecord
  },
  {
    path: '/message-config',
    name: '消息配置',
    component: async () => (await import('@/views/message-config/index')).Message
  },
]

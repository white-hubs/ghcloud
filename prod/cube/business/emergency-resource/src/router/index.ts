import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'goods-list',
    path: '/goods-list',
    component: async () => (await import('@/views/goods-list/goods-list')).GoodsList
  },
  {
    name: 'in-outbound-details',
    path: '/in-outbound-details',
    component: async () => (await import('@/views/in-outbound-details/in-outbound-details')).InOutboundDetailsList
  },
  {
    name: 'revenue-expenditure-details',
    path: '/revenue-expenditure-details',
    component: async () => (await import('@/views/revenue-expenditure-details/revenue-expenditure-details')).RevenueExpenditureDetails
  },
  {
    name: 'balance-statistics',
    path: '/balance-statistics',
    component: async () => (await import('@/views/balance-statistics/balance-statistics')).BalanceStatistics
  },
  {
    name: 'personnel-list',
    path: '/personnel-list',
    component: async () => (await import('@/views/personnel-list/personnel-list')).PersonnelList
  },
  {
    name: 'technology-list',
    path: '/technology-list',
    component: async () => (await import('@/views/technology-list/technology-list')).TechnologyList
  },
  {
    name: 'device-list',
    path: '/device-list',
    component: async () => (await import('@/views/device-list/device-list')).DeviceList
  },
  {
    name: 'facilities-list',
    path: '/facilities-list',
    component: async () => (await import('@/views/facilities-list/facilities-list')).FacilitiesList
  }
]

import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'electricity-meter-details',
    path: '/electricity-meter-details',
    component: async () => (await import('@/views/electricity-meter-details/electricity-meter-details')).ElectricityMeterDetails
  },
  {
    name: 'electricity-record-list',
    path: '/electricity-record-list',
    component: async () => (await import('@/views/electricity-meter-details/record-list/record-list')).RecordList
  },
  {
    name: 'electricity-inquiry',
    path: '/electricity-inquiry',
    component: async () => (await import('@/views/electricity-inquiry/electricity-inquiry')).ElectricityInquiry
  },
  {
    name: 'water-meter-details',
    path: '/water-meter-details',
    component: async () => (await import('@/views/water-meter-details/water-meter-details')).WaterMeterDetails
  },
  {
    name: 'water-record-list',
    path: '/water-record-list',
    component: async () => (await import('@/views/water-meter-details/record-list/record-list')).RecordList
  },
  {
    name: 'water-usage-inquiry',
    path: '/water-usage-inquiry',
    component: async () => (await import('@/views/water-usage-inquiry/water-usage-inquiry')).WaterUsageInquiry
  },
]

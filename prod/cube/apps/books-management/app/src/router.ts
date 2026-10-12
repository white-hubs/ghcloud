import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/catalog-work-statistics',
    name: 'catalogWorkStatistics',
    component: async () => (await import('@/views/catalog-work-statistics/catalog-work-statistics')).CatalogWorkStatistics
  },
  {
    path: '/catalog-comprehensive-statistics',
    name: 'catalogComprehensiveStatistics',
    component: async () => (await import('@/views/catalog-comprehensive-statistics/catalog-comprehensive-statistics')).CatalogComprehensiveStatistics
  },
  {
    path: '/borrow-record',
    name: 'borrowRecord',
    component: async () => (await import('@/views/borrow-record/borrow-record')).BorrowRecord
  },
]

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/merchant-data',
    name: 'merchant-data',
    component: async () => (await import('@/views/merchant-data/merchant-data')).MerchantData
  },
  {
    path: '/edit-merchant',
    name: 'edit-merchant',
    component: async () => (await import('@/views/merchant-data/edit-merchant/edit-merchant')).EditMerchant
  },
]

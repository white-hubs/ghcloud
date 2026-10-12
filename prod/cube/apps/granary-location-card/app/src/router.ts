import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/pallet-position-card',
  },
  {
    path: '/pallet-position-card',
    name: 'pallet-position-card',
    component: async () =>
      (await import('@/views/pallet-position-card/pallet-position-card')).PalletPositionCard,
  },
]

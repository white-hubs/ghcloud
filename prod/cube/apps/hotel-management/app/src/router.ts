import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/hotel-approval',
    name: 'hotelApproval',
    component: async () => (await import('@/views/hotel-approval/hotel-approval')).HotelApproval
  }
]

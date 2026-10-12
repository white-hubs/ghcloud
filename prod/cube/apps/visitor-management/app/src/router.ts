import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/through-record',
    name: 'throughRecord',
    component: async () => (await import('@/views/through-record/through-record')).ThroughRecord
  },
  {
    path: '/reservation-record',
    name: 'reservationRecord',
    component: async () => (await import('@/views/reservation-record/reservation-record')).ReservationRecord
  },
  {
    path: '/visitor-permission',
    name: 'visitorPermission',
    component: async () => (await import('@/views/visitor-permission/visitor-permission')).VisitorPermission
  },
  {
    path: '/visitor-area-form',
    name: 'visitorAreaForm',
    component: async () => (await import('@/views/visitor-permission/visitor-area-form')).VisitorAreaForm
  },
  {
    path: '/blacklist',
    name: 'blacklist',
    component: async () => (await import('@/views/blacklist/blacklist')).Blacklist
  },
  {
    path: '/visitor-invite',
    name: 'visitorInvite',
    component: async () => (await import('@/views/visitor-approve/invite')).visitorInvite
  },
]

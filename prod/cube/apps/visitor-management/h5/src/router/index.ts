import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    redirect: '/booking-list',
    path: '/'
  },
  {
    name: 'booking-list',
    path: '/booking-list',
    meta: {
      title: '进馆预约'
    },
    component: async () => (await import('@/views/list/list')).BookingList
  },
  {
    name: 'my-booking',
    path: '/my-booking',
    meta: {
      title: '我的预约'
    },
    component: async () => (await import('@/views/my-booking/my-booking')).MyBooking
  },
  {
    name: 'add-booking',
    path: '/add-booking',
    meta: {
      title: '新增预约'
    },
    component: async () => (await import('@/views/add-booking/add-booking')).AddBooking
  },
  {
    name: 'result',
    path: '/result',
    meta: {
      title: '我的结果'
    },
    component: async () => (await import('@/views/result/result')).Result
  },
  {
    name: 'invite-record',
    path: '/invite-record',
    meta: {
      title: '邀约记录'
    },
    component: async () => (await import('@/views/invite/record/invite-record')).InviteRecord
  },
  {
    name: 'invite-result',
    path: '/invite-result',
    meta: {
      title: '邀约结果'
    },
    component: async () => (await import('@/views/invite/result/invite-result')).InviteResult
  },
]

export const routes: RouteRecordRaw[] = [...routers]

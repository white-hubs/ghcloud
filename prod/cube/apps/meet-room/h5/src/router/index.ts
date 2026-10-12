import type { RouteRecordRaw } from 'vue-router'
import { outerAppRouters } from './outer'

const routers: RouteRecordRaw[] = [
  {
    redirect: '/index',
    path: '/'
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '会议室管理'
    },
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    name: 'conferenceRoomList',
    path: '/conferenceRoomList',
    meta: {
      title: '会议室'
    },
    component: async () => (await import('@/views/list/list')).MeetRoomList
  },
  {
    name: 'detail',
    path: '/detail',
    meta: {
      title: '会议室详情'
    },
    component: async () => (await import('@/views/detail/detail')).Detail
  },
  {
    name: 'reservation',
    path: '/reservation',
    meta: {
      title: '会议室预约',
    },
    component: async () => (await import('@/views/reservation/reservation')).Reservation
  },
  {
    name: 'reservation-detail',
    path: '/reservation-detail',
    meta: {
      title: '预约详情',
    },
    component: async () => (await import('@/views/reservation/reservation-detail')).ReservationDetail
  },
  {
    name: 'myReservationMeeting',
    path: '/myReservationMeeting',
    meta: {
      title: '我的预约',
      barRightType: 'click'
    },
    component: async () => (await import('@/views/my-reservation/my-reservation')).MyReservation
  },
  {
    name: 'reservation-time',
    path: '/reservation-time',
    meta: {
      title: '预约时间',
    },
    component: async () => (await import('@/views/reservation-time/reservation-time')).ReservationTime
  },
  {
    name: 'person-page',
    path: '/person-page',
    meta: {
      title: '选择人员'
    },
    component: async () => (await import('@/views/reservation/person-page/index')).PersonPage
  },
]
export const routes: RouteRecordRaw[] = [
  ...routers,
  ...outerAppRouters
]

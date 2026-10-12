import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/meet-room',
    name: 'MeetRoom',
    meta: {
      title: '会议室',
    },
    component: async () => (await import('@/views/meet-room/index')).MeetRoom
  },
  {
    path: '/reservation',
    name: 'Reservation',
    meta: {
      title: '会议室预约',
    },
    component: async () => (await import('@/views/reservation/index')).Reservation
  },
  {
    path: '/reservation-statistics',
    name: 'reservation-statistics',
    meta: {
      title: '预约分析',
    },
    component: async () => (await import('@/views/reservation-statistics/index')).ReservationStatistics
  },
  {
    path: '/reservation-log',
    name: 'ReservationLog',
    meta: {
      title: '预约记录',
    },
    component: async () => (await import('@/views/reservation-log/index')).ReservationLog
  },
  {
    path: '/meet-goods',
    name: 'MeetGoods',
    meta: {
      title: '会议物品',
    },
    component: async () => (await import('@/views/meet-goods/index')).MeetGoods
  },
  {
    path: '/meet-type',
    name: 'MeetType',
    meta: {
      title: '会议类型',
    },
    component: async () => (await import('@/views/meet-type/index')).MeetType
  },
  {
    path: '/meet-room-type',
    name: 'MeetRoomType',
    meta: {
      title: '会议室类型',
    },
    component: async () => (await import('@/views/meet-room-type/index')).MeetRoomType
  },
  {
    path: '/approve-set',
    name: 'ApproveSet',
    meta: {
      title: '审批设置',
    },
    component: async () => (await import('@/views/approve-set/index')).ApproveSet
  },
  {
    path: '/field-settings',
    name: 'FieldSettings',
    meta: {
      title: '字段设置',
    },
    component: async () => (await import('@/views/field-settings/index')).FieldSettings
  },
  {
    path: '/meet-screen-set',
    name: 'MeetScreenSet',
    meta: {
      title: '会议屏展示设置',
    },
    component: async () => (await import('@/views/meet-screen-set/index')).MeetScreenSet
  },
  {
    path: '/meet-room-approve',
    name: 'MeetRoomApprove',
    meta: {
      title: '会议室审批记录',
    },
    component: async () => (await import('@/views/meet-room-approve/index')).MeetRoomApprove
  },
]

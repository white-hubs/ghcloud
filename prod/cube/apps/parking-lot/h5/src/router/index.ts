import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'carDetail',
    path: '/car-detail',
    component: async () => (await import('@/views/car-detail/car-detail')).CarDetail,
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '停车管理',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/index/index')).Entry
  },
  {
    name: 'Entry',
    path: '/',
    redirect: '/index'
  },
  {
    name: 'violationWorkOrder',
    path: '/violation-work-order',
    meta: {
      title: '违停工单',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/violation-work-order/violation-work-order')).ViolationWorkOrder
  },
  {
    name: 'blacklist',
    path: '/blacklist',
    meta: {
      title: '黑名单',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/black-list/black-list')).BlackList
  },
  {
    name: 'addBlacklist',
    path: '/add-blacklist',
    meta: {
      title: '新增黑名单',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/add-blacklist/add-blacklist')).AddBlacklist
  },
  {
    name: 'blacklistDetail',
    path: '/blacklist-detail',
    meta: {
      title: '黑名单详情',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/blacklist-detail/blacklist-detail')).BlacklistDetail
  },
  {
    name: 'carIdentify',
    path: '/car-identify',
    meta: {
      title: '车辆识别',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/car-identify/car-identify')).CarIdentify
  },
  {
    name: 'carIdentifyDetail',
    path: '/car-identify-detail',
    meta: {
      title: '车辆识别详情',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/car-identify-detail/car-identify-detail')).CarIdentifyDetail
  },
  {
    name: 'accessRecord',
    path: '/access-record',
    meta: {
      title: '出入记录',
      barRightType: 'operate'
    },
    component: async () => (await import('@/views/access-record/access-record')).AccessRecord
  },
]

export const routes: RouteRecordRaw[] = [...routers]

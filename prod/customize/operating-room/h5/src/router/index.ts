import type { RouteRecordRaw } from 'vue-router'

const routers: RouteRecordRaw[] = [
  {
    name: 'index',
    path: '/',
    component: async () => (await import('@/views/real-time/real-time-list')).RealTimeList,
    // component: async () => (await import('@/views/list/list')).ListPage,
  },
  {
    name: 'real-time-list',
    path: '/real-time-list',
    meta: {
      title: '实时监测列表',
    },
    component: async () => (await import('@/views/real-time/real-time-list')).RealTimeList,
  },
  {
    name: 'real-time-detail',
    path: '/real-time-detail',
    meta: {
      title: '实时监测详情',
    },
    component: async () => (await import('@/views/real-time/real-time-detail')).RealTimeDetail,
  },
  {
    name: 'history-statistics',
    path: '/history-statistics',
    meta: {
      title: '历史统计',
    },
    component: async () => (await import('@/views/history-record/history-statistics')).HistoryStatistics,
  },
  {
    name: 'history-list',
    path: '/history-list',
    meta: {
      title: '历史监测记录',
    },
    component: async () => (await import('@/views/history-record/history-list')).HistoryList,
  },
  {
    name: 'over-limit-detail',
    path: '/over-limit-detail',
    meta: {
      title: '超限提醒详情',
    },
    component: async () => (await import('@/views/over-limit-detail/over-limit-detail')).OverLimitDetail,
  },
  {
    name: 'on-line-help',
    path: '/on-line-help',
    meta: {
      title: '在线求助',
    },
    component: async () => (await import('@/views/on-line-help/on-line-help')).OnLineHelp,
  },
  // {
  //   name: 'detail',
  //   path: '/detail',
  //   component: async () => (await import('@/views/detail/detail')).Detail,
  // },
  {
    name: 'resources-list',
    path: '/resources-list',
    meta: {
      title: '物品查询',
    },
    component: async () => (await import('@/views/resources-list/resources-list')).ResourcesList,
  },
  {
    name: 'resources-detail',
    path: '/resources-detail',
    meta: {
      title: '物品详情',
    },
    component: async () => (await import('@/views/resources-detail/resources-detail')).ResourcesDetail,
  },
]

export const routes: RouteRecordRaw[] = [...routers]

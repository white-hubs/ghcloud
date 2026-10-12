import type { RouteRecordRaw } from 'vue-router'
const routers: RouteRecordRaw[] = [
  {
    name: 'entry',
    path: '/entry',
    meta: {
      title: '通知公告'
    },
    component: async () => (await import('@/views/notification/list-page')).NotificationList
  },
  {
    name: 'index',
    path: '/',
    meta: {
      title: '通知公告'
    },
    component: async () => (await import('@/views/notification/list-page')).NotificationList
  },
  {
    name: 'notification-public-list',
    path: '/notification-public-list',
    meta: {
      title: '通知公告'
    },
    component: async () => (await import('@/views/public/list/notification-list')).PublicNotificationList
  },
  {
    name: 'news-public-list',
    path: '/news-public-list',
    meta: {
      title: '资讯列表'
    },
    component: async () => (await import('@/views/public/list/news-list')).PublicNewsList
  },
  {
    name: 'news-detail',
    path: '/news-detail',
    meta: {
      title: '资讯详情'
    },
    component: async () => (await import('@/views/public/detail/news-detail')).NewsDetail
  },
  {
    name: 'notification-details',
    path: '/notification-details',
    meta: {
      title: '公告详情'
    },
    component: async () => (await import('@/views/notification/notification-details')).NotificationDetails
  },
  {
    name: 'public-notification-details',
    path: '/public-notification-details',
    meta: {
      title: '公告详情'
    },
    component: async () => (await import('@/views/public/detail/public-notification-details')).PublicNotificationDetails
  },
]

export const routes: RouteRecordRaw[] = [...routers]

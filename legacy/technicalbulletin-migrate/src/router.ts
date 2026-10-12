import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  //技术通报 technicalBulletin
  {
      path: '/noticeInfo',
      component: () => import('@/views/technicalBulletin/noticeInfo.vue'),
      name: '公告信息',
      meta: {
          title: '公告信息',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/noticeManage',
      component: () => import('@/views/technicalBulletin/noticeManage.vue'),
      name: '公告管理',
      meta: {
          title: '公告管理',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/noticeType',
      component: () => import('@/views/technicalBulletin/noticeType.vue'),
      name: '公告类型',
      meta: {
          title: '公告类型',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/noticeTypeInstitution',
      component: () => import('@/views/technicalBulletin/noticeTypeInstitution.vue'),
      name: '发布机构',
      meta: {
          title: '发布机构',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/noticeTypeLabel',
      component: () => import('@/views/technicalBulletin/noticeTypeLabel.vue'),
      name: '公告标签',
      meta: {
          title: '公告标签',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/bulletinManageAdd',
      component: () => import('@/views/technicalBulletin/add.vue'),
      name: '通报管理新增',
      meta: {
          title: '通报管理新增',
          icon: 'DashboardOutlined'
      }
  },
  {
      path: '/bulletinManageDetails',
      component: () => import('@/views/technicalBulletin/details.vue'),
      name: '通报管理详情',
      meta: {
          title: '通报管理详情',
          icon: 'DashboardOutlined'
      }
  },
]
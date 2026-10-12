import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/noticeInfo',
    name: 'noticeInfo',
    component: async () => (await import('@/views/notice-info/notice-info')).NoticeInfo
  },
  {
    path: '/noticeManage',
    name: 'noticeManage',
    component: async () => (await import('@/views/notice-manage/notice-manage')).NoticeManage
  },
  {
    path: '/noticeType',
    name: 'noticeType',
    component: async () => (await import('@/views/notice-type/notice-type')).NoticeTypePage
  },
  {
    path: '/noticeTypeInstitution',
    name: 'noticeTypeInstitution',
    component: async () => (await import('@/views/notice-type-institution/notice-type-institution')).NoticeTypeInstitution
  },
  {
    path: '/noticeTypeLabel',
    name: 'noticeTypeLabel',
    component: async () => (await import('@/views/notice-type-label/notice-type-label')).NoticeTypeLabel
  },
  {
    path: '/bulletinManageAdd',
    name: 'bulletinManageAdd',
    component: async () => (await import('@/views/bulletin-manage-add/bulletin-manage-add')).BulletinManageAdd
  },
]

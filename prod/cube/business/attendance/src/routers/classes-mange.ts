/** 班次管理 */
import type { Component } from 'vue'

export default [
  {
    path: '/classes-manage',
    name: 'classesManage',
    component: async (): Promise<Component> => (await import('@/views/classes-manage/classes-manage')).ClassesManage
  },
  {
    path: '/classes-manage-form',
    name: 'classesManageForm',
    component: async (): Promise<Component> => (await import('@/views/classes-manage/classes-manage-form')).ClassesManageForm
  }
]

import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/my-message',
    name: 'MyMessage',
    component: async () => (await import('@/views/my-message/my-message')).MyMessage
  },
  {
    path: '/template-manage',
    name: 'TemplateManage',
    component: async () => (await import('@/views/template-manage/template-manage')).TemplateManage
  },
  {
    path: '/message-manage',
    name: 'MessageManage',
    component: async () => (await import('@/views/message-manage/message-manage')).MessageManage
  },
  {
    path: '/channel-manage',
    name: 'ChannelManage',
    component: async () => (await import('@/views/channel-manage/channel-manage')).ChannelManage
  },
]

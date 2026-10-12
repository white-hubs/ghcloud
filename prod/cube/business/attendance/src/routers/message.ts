import type { Component } from 'vue'

/** 消息中心 */
export default [
  {
    path: '/attendance-message',
    name: 'attendanceMessage',
    component: async (): Promise<Component> => (await import('@/views/message/index')).Message
  },
]

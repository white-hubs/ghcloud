/** 操作日志记录 */
import type { Component } from 'vue'

export default [
  {
    path: '/handle-record',
    name: 'handleRecord',
    component: async (): Promise<Component> => (await import('@/views/handle-record/index')).HandleRecord
  },
]

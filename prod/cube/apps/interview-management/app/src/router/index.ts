import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'interview-record',
    path: '/interview-record',
    component: async () => (await import('@/views/monitoring/interview-record')).InterviewRecord
  },
  {
    name: 'interview-request',
    path: '/interview-request',
    component: async () => (await import('@/views/monitoring/interview-request')).InterviewRequest
  }
]

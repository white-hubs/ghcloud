import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'agent-list',
    path: '/agent-list',
    meta: {
      title: '智能体'
    },
    component: async () => (await import('@/views/agent-list/agent-list')).AgentList
  },
  {
    name: 'agent-config',
    path: '/agent-config',
    component: async () => (await import('@/views/agent-config/agent-config')).AgentConfig
  },
]

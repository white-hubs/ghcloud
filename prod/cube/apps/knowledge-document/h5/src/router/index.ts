import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
import type { RouteRecordRaw } from 'vue-router'

const routers: AppRoutes = [
  {
    name: 'index',
    path: '/',
    redirect: '/entry',
  },
  {
    name: 'entry',
    path: '/entry',
    meta: {
      title: '知识库'
    },
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    name: 'knowledge-document-list',
    path: '/knowledge-document-list',
    meta: {
      title: '知识文档'
    },
    component: async () => (await (import('@/views/knowledge-document-list/knowledge-document-list'))).KnowledgeDocumentList
  },
  {
    name: 'knowledge-document-edit',
    path: '/knowledge-document-edit',
    meta: {
      title: '新增文档'
    },
    component: async () => (await (import('@/views/knowledge-document-edit/knowledge-document-edit'))).KnowledgeDocumentEdit
  },
]
export const routes: RouteRecordRaw[] = [...routers]

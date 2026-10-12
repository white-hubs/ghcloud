import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/device-document',
    name: 'device-document',
    component: async () => (await import('@/views/device-document/device-document')).DeviceDocument
  },
  {
    path: '/building-data',
    name: 'building-data',
    component: async () => (await import('@/views/building-data/building-data')).BuildingData
  },
  {
    path: '/data-type',
    name: 'data-type',
    component: async () => (await import('@/views/data-type/data-type')).DataType
  },
  {
    path: '/knowledge-document',
    name: 'knowledge-document',
    component: async () => (await import('@/views/knowledge-document/knowledge-document')).KnowledgeDocument
  },
  {
    path: '/knowledge-document-type',
    name: 'knowledge-document-type',
    component: async () => (await import('@/views/knowledge-document-type/knowledge-document-type')).KnowledgeDocumentType
  },
]

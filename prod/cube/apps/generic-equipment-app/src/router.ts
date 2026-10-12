import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/equipment-association',
    name: 'equipment-association',
    component: async () => (await import('@/views/equipment-association/equipment-association')).EquipmentAssociation
  }
]

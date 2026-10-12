import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: 'layer-manage',
    path: '/layer-manage',
    component: async () => (await import('@/views/layer-manage')).LayerManage,
    meta: {
      title: '图层管理'
    }
  },
  {
    name: 'layer-edit',
    path: '/layer-edit',
    component: async () => (await import('@/views/layer-manage/edit')).EditLayer,
    meta: {
      title: '图层编辑'
    }
  },
  {
    name: 'point-manage',
    path: '/point-manage',
    component: async () => (await import('@/views/point-manage')).PointManage,
    meta: {
      title: '点位管理'
    }
  },
  {
    name: 'point-edit',
    path: '/point-edit',
    component: async () => (await import('@/views/point-manage/edit')).EditPoint,
    meta: {
      title: '编辑点位'
    }
  },
  {
    name: 'region-manage',
    path: '/region-manage',
    component: async () => (await import('@/views/region-manage')).RegionManage,
    meta: {
      title: '区域管理'
    }
  },
  {
    name: 'region-edit',
    path: '/region-edit',
    component: async () => (await import('@/views/region-manage/edit')).EditRegion,
    meta: {
      title: '编辑区域'
    }
  },
]

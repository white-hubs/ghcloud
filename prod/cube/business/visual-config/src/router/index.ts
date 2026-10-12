import type { RouteRecordRaw } from 'vue-router'
export const routes: RouteRecordRaw[] = [
  {
    name: 'business-menu',
    path: '/business-menu',
    component: async () => (await import('@/views/business-menu/business-menu')).BusinessMenu
  },
  {
    name: 'device-relation',
    path: '/device-relation',
    component: async () => (await import('@/views/device-association/device-association')).DeviceAssociation
  },
  {
    name: 'panel-config',
    path: '/panel-config',
    component: async () => (await import('@/views/panel-config/panel-config')).PanelConfig
  },
  {
    name: 'project',
    path: '/project',
    component: async () => (await import('@/views/project/project')).Project
  },
  {
    name: 'publish',
    path: '/publish',
    component: async () => (await import('@/views/publish/publish')).Publish
  },
  {
    name: 'model-menu',
    path: '/model-menu',
    component: async () => (await import('@/views/model-menu/model-menu')).ModelMenu
  },
  {
    name: 'model-edit',
    path: '/model-edit',
    component: async () => (await import('@/views/model-menu/model-edit')).ModelEdit
  },
  {
    name: 'associated-devices',
    path: '/associated-devices',
    component: async () => (await import('@/views/business-menu/associated-devices')).AssociatedDevices
  },
  {
    name: 'model-config',
    path: '/model-config',
    meta: {
      name: '模型管理'
    },
    component: async () => (await import('@/views/model-config/model-config')).ModelConfig
  },
  {
    name: 'render-settings',
    path: '/render-settings',
    meta: {
      name: '渲染设置'
    },
    component: async () => (await import('@/views/model-config/render-settings/render-settings')).RenderSettings
  },
  {
    name: 'introducing-models',
    path: '/introducing-models',
    meta: {
      name: '引入模型'
    },
    component: async () => (await import('@/views/model-config/introducing-models/introducing-models')).IntroducingModels
  },
  {
    name: 'perspective-configuration',
    path: '/perspective-configuration',
    meta: {
      name: '视角配置'
    },
    component: async () => (await import('@/views/model-config/perspective-configuration/perspective-configuration')).PerspectiveConfiguration
  },
  {
    name: 'roaming-route',
    path: '/roaming-route',
    meta: {
      name: '漫游路线'
    },
    component: async () => (await import('@/views/model-config/roaming-route/roaming-route')).RoamingRoute
  },
  {
    name: 'other-settings',
    path: '/other-settings',
    meta: {
      name: '其他设置'
    },
    component: async () => (await import('@/views/model-config/other-settings/other-settings')).OtherSettings
  },
  {
    name: 'add-label',
    path: '/add-label',
    meta: {
      name: '添加标签'
    },
    component: async () => (await import('@/views/model-config/add-labels/add-labels')).AddLabel
  },
  {
    name: 'guide-settings',
    path: '/guide-settings',
    meta: {
      name: '导览列表'
    },
    component: async () => (await import('@/views/model-config/guide-settings/guide-settings')).GuideSettings
  },
  {
    name: 'set-screen',
    path: '/set-screen',
    meta: {
      name: '设置画面'
    },
    component: async () => (await import('@/views/model-config/guide-settings/set-screen')).SetScreen
  },
]

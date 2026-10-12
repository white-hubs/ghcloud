import type { Component } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
export default [
  {
    name: 'access',
    path: '/access',
    meta: { title: '接入管理', icon: 'appstore-outlined', show: true },
    component: async (): Promise<Component> => (await import('@/views/layout/layout')).VLayout,
    redirect: 'gateway',
    children: [
      {
        name: 'gateway',
        path: '/gateway',
        meta: { title: '网关接入', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/access/gateway/gateway')).Gateway,
      },
      {
        name: 'gatewayDetail',
        path: '/gateway-detail',
        meta: { title: '网关接入详情', icon: 'appstore-outlined', show: false },
        component: async (): Promise<Component> => (await import('@/views/access/gateway-detail/gateway-detail')).GatewayDetail,
      },
      {
        name: 'deviceGroup',
        path: '/deviceGroup',
        meta: { title: '设备列表', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/access/device-group/device-group')).DeviceGroup,
      },
      {
        name: 'deviceGroupDetail',
        path: '/device-group-detail',
        meta: { title: '设备详情', icon: 'appstore-outlined', show: false },
        component: async (): Promise<Component> => (await import('@/views/access/device-group-detail/device-group-detail')).DeviceGroupDetail,
      },
      {
        name: 'batch',
        path: '/batch',
        meta: { title: '批量管理', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/access/batch/index')).Batch,
      },
    ]
  },
  {
    name: 'config',
    path: '/config',
    meta: { title: '配置管理', icon: 'appstore-outlined', show: true },
    component: async (): Promise<Component> => (await import('@/views/layout/layout')).VLayout,
    children: [
      {
        name: 'globalConfig',
        path: '/globalConfig',
        meta: { title: '全局配置', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/config/global-config/global-config')).GlobalConfig,
      },
      {
        name: 'form-design',
        path: '/form-design',
        meta: { title: '表单配置', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/form-design/form-design')).FormDesign,
      },
    ]
  },
  {
    name: 'log',
    path: '/log',
    meta: { title: '日志管理', icon: 'appstore-outlined', show: true },
    component: async (): Promise<Component> => (await import('@/views/layout/layout')).VLayout,
    children: [
      {
        name: 'logList',
        path: '/logList',
        meta: { title: '日志列表', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/log/log-list/log-list')).Log,
      },
      {
        name: 'monitorLog',
        path: '/monitorLog',
        meta: { title: '日志调试', icon: 'appstore-outlined', show: true },
        component: async (): Promise<Component> => (await import('@/views/log/monitor-log/monitor-log')).MonitorLog,
      },
    ]
  },

] as RouteRecordRaw[]

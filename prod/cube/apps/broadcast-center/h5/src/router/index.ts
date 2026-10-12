import type { AppRoutes } from '@ghcloud/cube-app-generic-component'

const routers: AppRoutes = [
  {
    name: 'index',
    path: '/',
    redirect: '/entry',
  },
  {
    name: 'entry',
    path: '/entry',
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    name: 'device-list',
    path: '/baseMonitorDevice?applicationCode=BROADCAST_CENTER',
    component: async () => (await import('@ghcloud/cube-iot-center-h5/src/views/device-list/device-list')).DeviceList,
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: __ENV__.applicationCode,
        title: '广播设备'
      }
    }
  },
  {
    name: 'baseMonitorDevice',
    path: '/baseMonitorDevice',
    component: async () => (await import('@ghcloud/cube-iot-center-h5/src/views/device-list/device-list')).DeviceList,
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        title: '广播设备'
      }
    }
  },
  {
    name: 'device-monitor',
    path: '/device-monitor',
    component: async () => (await import('@ghcloud/cube-iot-center-h5/src/views/device-monitor/device-monitor')).DeviceMonitor,
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        applicationCode: __ENV__.applicationCode,
        title: '广播监测'
      }
    }
  },
  {
    name: 'broadcast-record',
    path: '/broadcastRecord',
    component: async () => (await import('@/views/broadcast-record/broadcast-record')).BroadcastRecord
  },
  {
    name: 'broadcast-call',
    path: '/broadcastCall',
    component: async () => (await import('@/views/broadcast-call/broadcast-call')).BroadcastCall
  },
]

export const routes: AppRoutes = [...routers]

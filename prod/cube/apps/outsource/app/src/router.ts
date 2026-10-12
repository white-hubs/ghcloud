import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/repairList',
    name: '委外维修单',
    component: async () => (await import('@/views/repair-list/repair-list')).RepairList,
  },
  {
    path: '/repairMode',
    name: '委外模式',
    component: async () => (await import('@/views/repair-mode/repair-mode')).RepairMode,
  },
  {
    path: '/repairCompany',
    name: '委外公司',
    component: async () => (await import('@/views/repair-company/repair-company')).RepairCompany,
  },
  {
    path: '/repairDevice',
    name: '委外设备',
    component: async () => (await import('@/views/repair-device/repair-device')).RepairDevice,
  },
  {
    path: '/repairTraffic',
    name: "委外业务配置",
    component: async () => (await import('@/views/repair-traffic/repair-traffic')).RepairTraffic,
  },
]

import { type RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    name: '能耗分析',
    path: '/',
    meta: { title: '综合能耗', icon: 'bar-chart-outlined' },
    children: [{
      name: '能耗总览',
      path: '/energyOverview',
      meta: { title: '能耗总览', icon: 'appstore-outlined' },

      component: async () => import('@/views/energy/energyOverview/index.vue')
    },
    {
      name: '碳排统计',
      path: '/energyStatistics',
      meta: { title: '碳排统计', icon: 'fund-projection-screen-outlined' },
      component: async () => import('@/views/energy/energyStatistics/index.vue')
    },
    {
      name: '综合能耗',
      path: '/enerySynthesize',
      meta: { title: '综合能耗', icon: 'bar-chart-outlined' },

      component: async () => import('@/views/energy/enerySynthesize/index.vue')
    },
    {
      name: '用量分析',
      path: '/dosageAnalysis',
      meta: { title: '用量分析', icon: 'project-outlined' },

      component: async () => import('@/views/energy/dosageAnalysis/index.vue')
    },
    {
      name: '负荷预测',
      path: '/loadPrediction',
      meta: { title: '负荷预测', icon: 'folder-view-outlined' },

      component: async () => import('@/views/energy/loadPrediction/index.vue')
    },
    ]
  },
  {
    name: 'feeManagement',
    path: '/feeManagement',
    meta: { title: '费用管理', icon: 'setting-outlined' },
    children: [
      {
        name: 'energyOverview',
        path: '/feeManagement/energyOverview',
        component: async () => import('@/views/feeManagement/feeOverview/index.vue'),
        meta: { title: '费用总览' }
      },
      {
        name: 'fee-report',
        path: '/feeManagement/fee-report',
        component: async () => import('@/views/feeManagement/fee-report/fee-report.vue'),
        meta: { title: '费用报表'},
      },
      {
        name: 'fee-calculation-rules',
        path: '/feeManagement/fee-calculation-rules',
        component: async () => import('@/views/feeManagement/fee-calculation-rules/fee-calculation-rules.vue'),
        meta: { title: '费用计算规则' },
      },
      {
        name: 'districtFee',
        path: '/feeManagement/districtFee',
        component: async () => import('@/views/feeManagement/districtFee/index.vue'),
        meta: { title: '分区费用', icon: 'account-book-outlined' },
      },
      {
        name: 'feeSettings',
        path: '/feeManagement/feeSettings',
        component: async () => import('@/views/feeManagement/feeSettings/index.vue'),
        meta: { title: '费用设置', icon: 'setting-outlined' },
      },
      {
        name: 'electric',
        path: '/feeManagement/feeSettings/electric',
        component: async () => import('@/views/feeManagement/feeSettings/electric.vue'),
        meta: { title: '电费配置', icon: 'dollar-circle-outlined', hide: true }
      },
      {
        name: 'water',
        path: '/feeManagement/feeSettings/water',
        component: async () => import('@/views/feeManagement/feeSettings/water.vue'),
        meta: { title: '水费配置', icon: 'dollar-circle-outlined', hide: true }
      },
      {
        name: 'gas',
        path: '/feeManagement/feeSettings/gas',
        component: async () => import('@/views/feeManagement/feeSettings/gas.vue'),
        meta: { title: '燃气费配置', icon: 'dollar-circle-outlined', hide: true }
      }
    ]
  },
  {
    name: 'energyConsumptionReport',
    path: '/energyConsumptionReport',
    meta: { title: '能耗报表', icon: 'setting-outlined' },
    children: [
      {
        name: 'usage-report',
        path: 'usage-report',
        component: async () => import('@/views/energyConsumptionReport/usage-report/usage-report.vue'),
        meta: { title: '用量报表', icon: 'apartment-outlined' }
      },
      {
        name: 'carbon-emission-report',
        path: 'carbon-emission-report',
        component: async () => import('@/views/energyConsumptionReport/carbon-emission-report/carbon-emission-report.vue'),
        meta: { title: '碳排报表', icon: 'apartment-outlined' }
      },
      {
        name: 'comprehensive-report',
        path: 'comprehensive-report',
        component: async () => import('@/views/energyConsumptionReport/comprehensive-report/comprehensive-report.vue'),
        meta: { title: '综合能耗报表', icon: 'apartment-outlined' }
      },
    ]
  },
  {
    name: 'energyConfig',
    path: '/energyConfig',
    meta: { title: '能耗配置', icon: 'setting-outlined' },
    children: [
      {
        name: 'accessManagementdetail',
        path: '/associated-devices',
        component: async () => import('@/views/components/associated-devices/associated-devices.vue'),
        meta: { title: '关联设备', icon: 'apartment-outlined' }
      },
      {
        name: 'classify-settings',
        path: '/energyConfig/classify-settings',
        component: async () => import('@/views/energyConfig/classify-settings/classify-settings.vue'),
        meta: { title: '分类设置', icon: 'apartment-outlined' }
      },
      {
        name: 'sub-item-settings',
        path: '/energyConfig/sub-item-settings',
        component: async () => import('@/views/energyConfig/sub-item-settings/sub-item-settings.vue'),
        meta: { title: '分项配置', icon: 'apartment-outlined' }
      },
      {
        name: 'areaConfigure',
        path: '/energyConfig/areaConfigure',
        component: async () => import('@/views/energyConfig/areaConfigure/area.vue'),
        meta: { title: '区域配置', icon: 'control-outlined' }
      },
      {
        name: 'peak-valley-periods',
        path: '/energyConfig/peak-valley-periods',
        component: async () => import('@/views/energyConfig/peak-valley-periods/peak-valley-periods.vue'),
        meta: { title: '峰平谷设置'}
      },
      {
        name: 'energy-usage-setting',
        path: '/energyConfig/energy-usage-setting',
        component: async () => import('@/views/energyConfig/energy-usage-setting/energy-usage-setting.vue'),
        meta: { title: '用能设置'}
      },
    ]
  },
  {
    name: 'device',
    path: '/device',
    meta: { title: '计量设备', icon: 'setting-outlined' },
    children: [
      {
        name: 'deviceList',
        path: '/device/list',
        component: async () => import('@/views/device/deviceList/index.vue'),
        meta: { title: '设备列表', icon: 'unordered-list-outlined', target: 'meterManagement' }
      },
      {
        name: 'deviceDetail',
        path: '/device/detail',
        component: async () => import('@/views/device/deviceList/detail.vue'),
        meta: { title: '设备列表详情', icon: 'unordered-list-outlined', target: 'meterManagement' }
      },
      {
        name: 'deviceRecord',
        path: '/device/record',
        component: async () => import('@/views/device/deviceRecord/index.vue'),
        meta: { title: '采集读数记录', icon: 'form-outlined', target: 'meterReadingRecord' }
      },
      {
        name: 'deviceCycle',
        path: '/device/cycle',
        component: async () => import('@/views/device/deviceCycle/index.vue'),
        meta: { title: '采集策略', icon: 'wallet-outlined', target: 'MeterReadingCycle' }
      },
    ]
  },
  {
    path: '/test',
    component: () => import("@/views/test.vue"),
    name: "test",
  },
  ]

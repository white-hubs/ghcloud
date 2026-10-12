import type { AppRoutes } from '@ghcloud/cube-app-generic-component'
import type { RouteRecordRaw } from 'vue-router'

const routers: AppRoutes = [
  {
    redirect: '/index',
    path: '/'
  },
  {
    name: 'index',
    path: '/index',
    meta: {
      title: '资产管理'
    },
    component: async () => (await import('@/views/entry/entry')).Entry
  },
  {
    name: 'assetAnalysis',
    path: '/assetAnalysis',
    meta: {
      title: '资产分析'
    },
    component: async () => (await (import('@/views/analysis/analysis'))).Analysis,
  },
  {
    name: 'assetList',
    path: '/assetList',
    meta: {
      title: '资产清单'
    },
    component: async () => (await (import('@/views/asset-list/asset-list'))).AssetList,
  },
  {
    name: 'assetList-detail',
    path: '/assetList/detail',
    meta: {
      title: '资产详情'
    },
    component: async () => (await (import('@/views/asset-list/asset-detail/asset-detail'))).AssetDetail,
  },
  {
    name: 'asset-edit',
    path: '/assetList/asset-edit',
    meta: {
      title: '资产编辑'
    },
    component: async () => (await (import('@/views/asset-list/asset-edit/edit'))).AssetEdit,
  },
  {
    name: 'consumableList',
    path: '/consumableList',
    meta: {
      title: '库存'
    },
    component: async () => (await (import('@/views/consumable-list/consumable-list'))).ConsumableList,
  },
  {
    name: 'assetInventoryTaskRecord',
    path: '/assetInventoryTaskRecord',
    meta: {
      title: '资产盘点'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        type: 'asset'
      }
    },
    redirect: '/take-stock'
  },
  {
    name: 'consumableInventoryTaskRecord',
    path: '/consumableInventoryTaskRecord',
    meta: {
      title: '耗材盘点'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        type: 'consumable'
      }
    },
    redirect: '/take-stock'
  },
  {
    name: 'take-stock',
    path: '/take-stock',
    component: async () => (await (import('@/views/take-stock/take-stock'))).TakeStockList,
  },
  {
    name: 'stock-detail',
    path: '/take-stock/stock-detail',
    meta: {
      title: '盘点详情'
    },
    component: async () => (await (import('@/views/take-stock/stock-detail/stock-detail'))).StockDetail,
  },
  {
    name: 'consumables-stock',
    path: '/take-stock/consumables-stock',
    meta: {
      title: '耗材盘点'
    },
    component: async () => (await (import('@/views/take-stock/consumables-stock/consumables-stock'))).ConsumablesStock,
  },
  {
    name: 'abnormal',
    path: '/take-stock/abnormal',
    meta: {
      title: '盘点异常'
    },
    component: async () => (await (import('@/views/take-stock/abnormal/abnormal'))).Abnormal,
  },
  {
    name: 'stocktaking',
    path: '/take-stock/stocktaking',
    meta: {
      title: '资产盘点'
    },
    component: async () => (await (import('@/views/take-stock/stocktaking/stocktaking'))).Stocktaking,
  },
  {
    name: 'consumable-staking',
    path: '/take-stock/consumables-taking',
    meta: {
      title: '耗材详情'
    },
    component: async () => (await (import('@/views/take-stock/consumables-taking/consumables-taking'))).ConsumablesTaking,
  },
  {
    name: 'add-win',
    path: '/take-stock/add-win',
    meta: {
      title: '添加盘赢'
    },
    component: async () => (await (import('@/views/take-stock/add-win/add-win'))).AddWin,
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=PROPERTY_DEPOSITORY',
    meta: {
      title: '资产入库',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROPERTY_DEPOSITORY',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=PROPERTY_ALLOT_PERSONAL',
    meta: {
      title: '资产派发',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROPERTY_ALLOT_PERSONAL',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=PROPERTY_ALLOT_UNIT',
    meta: {
      title: '资产调拨',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>>=> {
      return {
        businessType: 'PROPERTY_ALLOT_UNIT',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=PROPERTY_WEED_OUT',
    meta: {
      title: '清理报废',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'PROPERTY_WEED_OUT',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=CONSUMABLE_ADD',
    meta: {
      title: '耗材入库',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'CONSUMABLE_ADD',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
  {
    name: 'assetBaseProcessApply',
    path: '/assetBaseProcessApply?businessType=CONSUMABLE_REDUCE',
    meta: {
      title: '耗材出库',
      isOuter: true,
      outerPath: '/streamengineH5/initiating-work-order'
    },
    getQuery: async (): Promise<Record<string, string>> => {
      return {
        businessType: 'CONSUMABLE_REDUCE',
        processType: 'ADD',
      }
    },
    redirect: ''
  },
]
export const routes: RouteRecordRaw[] = [...routers]

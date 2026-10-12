import assetHistory from '@/views/data-report/assets-report/asset-history.vue'
import depAsset from '@/views/data-report/assets-report/dep-asset.vue'
import deptAssetList from '@/views/data-report/assets-report/dept-asset-list.vue'
import maturityAssets from '@/views/data-report/assets-report/maturity-assets.vue'
import overageAssetStatistics from '@/views/data-report/assets-report/overage-asset-statistics.vue'
import deptUseStatistics from '@/views/data-report/consumables-report/dept-use-statistics.vue'
import inoutstatistics from '@/views/data-report/consumables-report/inout-statistics.vue'

export default [
  {
    path: '/assetHistory',
    name: 'assetHistory',
    component: assetHistory,
  },
  {
    path: '/maturityAssets',
    name: 'maturityAssets',
    component: maturityAssets,
  },
  {
    path: '/overageAssetStatistics',
    name: 'overageAssetStatistics',
    component: overageAssetStatistics,
  },
  {
    path: '/deptAsset',
    name: 'deptAsset',
    component: depAsset,
  },
  {
    path: '/deptAssetList',
    name: 'deptAssetList',
    component: deptAssetList,
  },
  {
    path: '/inoutstatistics',
    name: 'inoutstatistics',
    component: inoutstatistics,
  },
  {
    path: '/deptUseStatistics',
    name: 'deptUseStatistics',
    component: deptUseStatistics,
  },
]

import assetAllocation from '@/views/property-management/asset-allocation.vue'
import assetDistribution from '@/views/property-management/asset-distribution.vue'
import assetInventory from '@/views/property-management/asset-inventory.vue'
import assetWarehousing from '@/views/property-management/asset-warehousing.vue'
import check from '@/views/property-management/check.vue'
import cleaning from '@/views/property-management/cleaning.vue'
import inventoryDetail from '@/views/property-management/inventory-detail.vue'
import checkDetail from '@/views/property-management/check-detail.vue'
import checkAdd from '@/views/property-management/check-add.vue'

export default [
  {
    path: '/assetWarehousing',
    name: 'assetWarehousing',
    component: assetWarehousing,
  },
  {
    path: '/assetInventory',
    name: 'assetInventory',
    component: assetInventory,
  },
  {
    path: '/inventoryDetail',
    name: 'inventoryDetail',
    component: inventoryDetail,
  },
  {
    path: '/assetDistribution',
    name: 'assetDistribution',
    component: assetDistribution,
  },
  {
    path: '/assetAllocation',
    name: 'assetAllocation',
    component: assetAllocation,
  },
  {
    path: '/cleaning',
    name: 'cleaning',
    component: cleaning,
  },
  {
    path: '/asset-check',
    name: 'assetCheck',
    component: check,
  },
  {
    path: '/asset-check-detail',
    name: 'assetCheckDetail',
    component: checkDetail,
  },
  {
    path: '/asset-check-add',
    name: 'checkAdd',
    component: checkAdd,
  }
]

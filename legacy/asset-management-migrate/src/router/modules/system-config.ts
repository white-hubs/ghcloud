import overView from '@/views/over-view/over-view.vue'
import assetAdministrators from '@/views/system-config/asset-administrators.vue'
import assetClass from '@/views/system-config/asset-class.vue'
import abnormalType from '@/views/system-config/abnormal-type.vue'
import assetSource from '@/views/system-config/asset-source.vue'
import consumablesFile from '@/views/system-config/consumables-file.vue'
import messageConfig from '@/views/system-config/message-config.vue'
import scrapReason from '@/views/system-config/scrap-reason.vue'
import warehouseManage from '@/views/system-config/warehouse-manage.vue'
export default [
  {
    path: '/overView',
    name: 'overView',
    component: overView,
  },
  {
    path: '/assetClass',
    name: 'assetClass',
    component: assetClass,
  },
  {
    path: '/abnormalType',
    name: 'abnormalType',
    component: abnormalType,
  },
  {
    path: '/warehouseManage',
    name: 'warehouseManage',
    component: warehouseManage,
  },
  {
    path: '/consumablesFile',
    name: 'consumablesFile',
    component: consumablesFile,
  },
  {
    path: '/assetSource',
    name: 'assetSource',
    component: assetSource,
  },
  {
    path: '/scrapReason',
    name: 'scrapReason',
    component: scrapReason,
  },
  {
    path: '/messageConfig',
    name: 'messageConfig',
    component: messageConfig,
  },
  {
    path: '/assetAdministrators',
    name: 'assetAdministrators',
    component: assetAdministrators,
  }
]

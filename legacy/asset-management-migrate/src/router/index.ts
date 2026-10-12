// 流程配置
import flowConfig from '@/views/flow-config.vue'
// 耗材管理模块的路由
import consumablesManagement from './modules/consumables-management'
// 数据报表模块的路由
import dataReport from './modules/data-report'
// 资产管理模块的路由
import propertyManagement from './modules/property-management'
// 系统管理模块的路由
import systemConfig from './modules/system-config'
import type { AuthRoute } from '@/typings/route'
export const routes: AuthRoute.Route[] = [
  ...systemConfig,
  ...propertyManagement,
  ...consumablesManagement,
  ...dataReport,
  {
    path: '/flow-config',
    name: 'flowConfig',
    component: flowConfig,
  },
]

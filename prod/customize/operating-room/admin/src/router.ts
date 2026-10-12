import type { RouteRecordRaw } from 'vue-router'
import Order from '@/router/order'
import DeviceManage from '@/router/device-manage'
import DeviceReport from '@/router/device-report'
import { resourceManage } from '@/router/resource-manage'

export const routes: RouteRecordRaw[] = [
  ...Order,
  ...DeviceManage,
  ...DeviceReport,
  ...resourceManage
]

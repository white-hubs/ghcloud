import { type BaseAPIResult, service, Get } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'
import { mainStore } from '@/store'
const store = mainStore()

export const beforeStatPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/attendance/att/beforeStat/page', {
    headers: {
      permission: store.permissionId
    },
    params
  })
}
export const beforeStatExport = async (params: unknown): Promise<BaseAPIResult> => {
  return service.get('/attendance/att/beforeStat/export', {
    params
  })
}

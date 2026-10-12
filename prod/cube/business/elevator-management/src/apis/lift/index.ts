import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
/** 电梯记录 */
export const liftRecord = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/lift-record', { params })
}
/** 五方通话记录 */
export const liftFiveCallLogPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/lift-fiveCallLog-page', { params })
}

// 区域管理接口 - 区域列表(区域管理)
export const getAreaList = async (): Promise<BaseAPIResult<any>> => {
  return Get('/mdata/area/list')
}

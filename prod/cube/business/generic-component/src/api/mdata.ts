import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

/** 区域 */
export const getAreaList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get('/mdata/area/list')
}

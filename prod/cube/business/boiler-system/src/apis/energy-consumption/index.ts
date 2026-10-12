import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
/** 锅炉记录 */
export const boilerDataRecord = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/boiler-data-record', { params })
}

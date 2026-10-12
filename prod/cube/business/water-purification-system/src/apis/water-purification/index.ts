import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
/** 净水每小时使用量 */
export const treatedWater = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/treated-water-usage-hour/page', { params })
}

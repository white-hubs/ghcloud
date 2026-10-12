import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
/** 示教分页 */
export const treatedWater = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/surgical-demonstration-page', { params })
}

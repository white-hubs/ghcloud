import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
export interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}
/** 获取气体用量列表 */
export const getGasUsageRecord = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/securitymanagement/gas-usage-page', { params })
}

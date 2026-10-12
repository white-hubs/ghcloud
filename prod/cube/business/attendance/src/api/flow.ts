import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './common-type'

/** 获取审批列表 */
export const getFlowProcessPage = async (params: unknown): Promise<BaseAPIResult<PageResult>> => {
  return Get('/flow/process/instance/historical/page', { params })
}

import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { Organizations } from './common-type'
const baseUrl = '/ouaa'

/** 部门 */
export const getOriganizations = async (params: {
  enabled: boolean; }): Promise<BaseAPIResult<Organizations[]>> => {
  return Get(baseUrl + '/authenticated/organizations/list', { params })
}



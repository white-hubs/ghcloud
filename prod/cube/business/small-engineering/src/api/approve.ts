import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
import type { PageResult } from './manage'

const baseUrl = '/loose-works'
export const getsignContract = async (params: {
  pageNumber: number;
  pageSize: number;
  submitTime?: string;
  type?: string;
  businessType: string;
  status?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/project/signContract/list', { params })
}

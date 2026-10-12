import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'
const baseUrl = '/ouaa'

interface PageResult {
  total: number;
  page: number;
  records: unknown[];
}

/** 员工分页列表 */
export const getUserPage = async (params: {
  pageNumber: number;
  pageSize: number;
  keyword?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/authenticated/user-under-tenant/page', { params })
}

/** 部门 */
export const deptList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get(baseUrl + '/authenticated/organizations/list')
}

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
  roleId?: string;
  positionId?: string;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/authenticated/user-under-tenant/page', { params: { ...params, enabled: true } })
}

/** 部门 */
export const deptList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get(baseUrl + '/authenticated/organizations/list?enabled=true')
}

/** 角色 */
export const getRole = async (params: {
  keyword?: string;
  cascaderIds?: string;
  pageNumber: number;
  pageSize: number;
  enabled?: boolean;
}): Promise<BaseAPIResult<PageResult>> => {
  return Get(baseUrl + '/authenticated/product/role/page', { params })
}

/** 职位 */
export const getPositionList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get(baseUrl + '/authenticated/position/list?enabled=true')
}

/** 岗位 */
export const getAppointmentList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get(baseUrl + '/appointment/page?enabled=true&pageNumber=1&pageSize=1000')
}

/** 角色 */
export const getRoleList = async (): Promise<BaseAPIResult<unknown[]>> => {
  return Get(baseUrl + '/authenticated/role/list-by-product')
}

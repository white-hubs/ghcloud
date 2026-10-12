import { request } from '@/service/index'
const baseUrl = '/ouaa'
/** 部门树 */
export const getDeptList = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/authenticated/organizations')
}
/** 下拉框获取部门 */
export const getDeptOption = async (): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/authenticated/organizations/list')
}
/**
 * 分页获取部门
 * @param params
 * @returns
 */
export const getDeptListPage = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/authenticated/organizations/list', { params })
}
/**
 * 分页获取角色
 * @param params
 * @returns
 */
export const getRoleListPage = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get(baseUrl + '/authenticated/product/role/page', { params })
}
/**
 * 获取用户信息
 * @param params
 * @returns
 */
export const getUserListPage = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  const config = (window.config as unknown as { feature?: { usePersonal?: boolean; }; })
  const userParams = {
    ...params,
    enabled: true
  }
  if (config?.feature?.usePersonal) {
    return request.get('personnel/staff/state/page', { params: userParams })
  }
  return request.get(baseUrl + '/authenticated/user-under-tenant/page', { params: userParams })
}
/**
 * 获取操作记录
 */
export const getOperateLogList = async (params: Record<string, string | null | number | boolean>): Promise<Service.RequestResult> => {
  return request.get('/securitymanagement/operate-logs', { params })
}

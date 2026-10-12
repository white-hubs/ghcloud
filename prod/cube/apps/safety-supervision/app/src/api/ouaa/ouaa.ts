import { Get, type BaseAPIResult } from '@ghcloud/ghcloud-business-request'

// 部门
export const deptList = async (params?: unknown): Promise<BaseAPIResult> => {
  return Get('/ouaa/authenticated/organizations/list', { params })
}

// 区域查询
export const getAreaList = async (): Promise<BaseAPIResult> => {
  return Get('/mdata/area/list')
}

// 员工分页查询
export const getStaffPage = async (params: unknown): Promise<BaseAPIResult> => {
  return Get(
    '/ouaa/authenticated/user-under-tenant/page',
    { params }
  )
}

// 岗位分页查询
export const getPositionList = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('ouaa/authenticated/position/list', { params })
}

// 角色分页查询
export const getRoleList = async (params: unknown): Promise<BaseAPIResult> => {
  return Get('ouaa/authenticated/product/role/page', { params })
}

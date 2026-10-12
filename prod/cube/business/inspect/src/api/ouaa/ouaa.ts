import { request } from '@/service/index'

// 部门
export const deptList = async (params?: unknown): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/organizations/list', { params })
}

// 区域查询
export const getAreaList = async (): Promise<Service.RequestResult> => {
  return request.get('/mdata/area/list')
}

// 员工分页查询
export const getStaffPage = async (params:unknown): Promise<Service.RequestResult> => {
  const payload=params as unknown as Record<string,string|number>
  return request.get(
    '/ouaa/authenticated/user-under-tenant/page',
    { params:{...payload,enable:true}, }
  )
}

// 岗位分页查询
export const getPositionList = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get('ouaa/authenticated/position/list', { params })
}

// 角色分页查询
export const getRoleList = async (params: unknown): Promise<Service.RequestResult> => {
  return request.get('ouaa/authenticated/product/role/page', { params })
}

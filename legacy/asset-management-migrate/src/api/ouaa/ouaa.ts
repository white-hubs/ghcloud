import { request } from '@/service/index'

// 部门
export const deptList = async (params?: Record<string,unknown>): Promise<Service.RequestResult> => {
  return request.get('/ouaa/authenticated/organizations/list', { params:{...params,enabled:true} })
}

// 区域查询
export const getAreaList = async (): Promise<Service.RequestResult> => {
  return request.get('/mdata/area/list')
}

// 员工分页查询
export const getStaffPage = async (params: Record<string,unknown>): Promise<Service.RequestResult> => {
  return request.get(
    '/ouaa/authenticated/user-under-tenant/page',
    { 
      params:{...params,enabled:true}
    }
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


// 查询员工详情
export const getStaffDetail = (params: any) => {
  return request.get(`/ouaa/user-under-tenant/${params?.id ?? params}`)
}
// 获取租户配置信息
export const getTenantInfo = (tenantCode: any) => {
  return request.get(`/ouaa/tenant-under-tenant/${tenantCode}`)
}
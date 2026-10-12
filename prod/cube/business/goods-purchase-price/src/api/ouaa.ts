import { Get } from '@ghcloud/ghcloud-business-request'

export const getUser = async (data: {
  pageSize:
  number;
  pageNumber: number;
  keyword: string;
}): Promise<Service.RequestResult> => {
  return Get('/ouaa/authenticated/user-under-tenant/page', {
    params: {
      ...data
    }
  })
}
export const getDept = async (
): Promise<Service.RequestResult> => {
  return Get('/ouaa/authenticated/organizations/list', {

  })
}
export const tenantInfo = async (code: string | null): Promise<Service.RequestResult> => {
  return Get(`/ouaa/tenant-under-tenant/${code}`, {

  })
}

// 部门
export const deptList = async (params?: unknown): Promise<Service.RequestResult> => {
  return Get('/ouaa/authenticated/organizations/list', { params })
}

// 区域查询
export const getAreaList = async (): Promise<Service.RequestResult> => {
  return Get('/mdata/area/list')
}

// 员工分页查询
export const getStaffPage = async (params: unknown): Promise<Service.RequestResult> => {
  return Get(
    '/ouaa/authenticated/user-under-tenant/page',
    { params }
  )
}

// 岗位分页查询
export const getPositionList = async (params: unknown): Promise<Service.RequestResult> => {
  return Get('ouaa/authenticated/position/list', { params })
}

// 角色分页查询
export const getRoleList = async (params: unknown): Promise<Service.RequestResult> => {
  return Get('ouaa/authenticated/product/role/page', { params })
}

import { request } from '@/service/index'
const baseURL = '/ouaa'

// 部门
export const organizationsList = async (): Promise<Service.RequestResult> => {
  return request.get(baseURL + '/authenticated/organizations/list')
}

// 获取租户配置信息
export const getTenantInfo = async (tenantCode: string | number): Promise<Service.RequestResult<{
  lntAndLat: string | null;
}>> => {
  return request.get(`/ouaa/tenant-under-tenant/${tenantCode}`)
}

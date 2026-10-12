import { type BaseAPIResult, Get } from '@ghcloud/ghcloud-business-request'

export const getTenantInfo = async (tenantCode: string | number): Promise<BaseAPIResult<{
  lntAndLat: string | null;
}>> => {
  return Get(`/ouaa/tenant-under-tenant/${tenantCode}`)
}

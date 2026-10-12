import type { TenantVo } from '@ghcloud/cube-ouaa-service'
import { reactive } from 'vue'
interface ICommonStore {
  tenantsOptions: TenantVo[];
}
const state = reactive<ICommonStore>({
  tenantsOptions: []
})
export function useCommonStore (): {
  tenantsOptions: TenantVo[];
  setTenantsOptions: (data: TenantVo[]) => void;
  getTenantsOptions: () => TenantVo[];
} {
  const setTenantsOptions = (data: TenantVo[]): void => {
    state.tenantsOptions = data
  }
  const getTenantsOptions = (): TenantVo[] => {
    return state.tenantsOptions
  }
  return {
    ...state,
    setTenantsOptions,
    getTenantsOptions
  }
}

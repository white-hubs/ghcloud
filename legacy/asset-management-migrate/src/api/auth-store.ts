import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'

export const authStore: CubeAuth = {
  tenant: JSON.parse(sessionStorage.getItem('GH-NowEnterprise') || '{}').code || '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: JSON.parse(sessionStorage.getItem('GH-Token') || '{}').access_token || ''
}


export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}

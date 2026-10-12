import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: '',
  accessToken: ''
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}

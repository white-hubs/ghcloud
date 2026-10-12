import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'

export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: '',
}

export const initAuthStore = (auth: CubeAuth): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.BUSINESS
}

import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: ''
}

export const initAuthStore = (auth: { tenant: string; token: string; terminal?: CubeTerminalEnum; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  auth.terminal && (authStore.terminal = auth.terminal)
}

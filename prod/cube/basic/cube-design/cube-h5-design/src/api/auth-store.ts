import { CubeTerminalEnum } from '@ghcloud/cube-protocol'

export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.APP,
  token: ''
}

export const initAuthStore = (auth: { tenant: string; token: string;terminal?: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  authStore.terminal = auth.terminal as CubeTerminalEnum
}

import { setCustomHeaders } from '@ghcloud/cube-app-js-sdk'
import { CubeAuth, CubeTerminalEnum } from '@ghcloud/cube-protocol'

export const authStore:CubeAuth = {
  tenant: '',
  terminal: CubeTerminalEnum.APP,
  token: ''
}
export const initAuthStore = (auth: { tenant: string; token: string;terminal?: CubeTerminalEnum; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
  authStore.terminal = auth.terminal ?? CubeTerminalEnum.APP
  setCustomHeaders({
    Authorization: authStore.token.includes('Bearer') ? authStore.token : ('Bearer ' + authStore.token),
    tenant: authStore.tenant,
    terminal: authStore.terminal
  })
}

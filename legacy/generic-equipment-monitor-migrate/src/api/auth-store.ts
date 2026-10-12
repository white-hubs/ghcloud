import type { CubeAuth } from '@ghcloud/cube-iot-center-service'
import { CubeTerminalEnum } from '../../../../prod/cube/protocol/src/cube-terminal.protocol'

export const authStore:CubeAuth = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token:""
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}

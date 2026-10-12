import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
export const authStore = {
  tenant: '',
  terminal: CubeTerminalEnum.APP,
  token: ''
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}

export const LiudengTerminal = 'book-applet-mp'

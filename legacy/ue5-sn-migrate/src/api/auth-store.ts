import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeTerminalEnum, type CubeAuth } from '@ghcloud/cube-protocol'

export const authStore: CubeAuth = {
  tenant: '',
  terminal: CubeTerminalEnum.BUSINESS,
  token: ''
}

export const initAuthStore = (auth: { tenant: string; token: string; }): void => {
  authStore.tenant = auth.tenant
  authStore.token = auth.token
}


/** 跳转到开河的业务平台 */
export const hrefToCubeBusiness =async ():Promise<void>=>{
  const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS,authStore.tenant,authStore.token)
  const secret = await cubeAuthService.getSecretByToken()
  sessionStorage.clear()
  window.location.href = window.location.origin+`?cube-secret=${secret}`
}
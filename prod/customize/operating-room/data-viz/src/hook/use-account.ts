import type { Token } from '@ghcloud/cube-auth-service'

export const storeToken = (token: Token): void => {
  sessionStorage.setItem('GH-Token', JSON.stringify(token))
}

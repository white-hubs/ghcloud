import type { CubeAuth, CubeUser } from './auth.model'

const authStoragePrefix = 'cube-auth-'
enum CubeAuthStorageKeyEnum {
  TENANT = `${authStoragePrefix}-tenant`,
  AUTHORIZATION = `${authStoragePrefix}-authorization`,
  USER = `${authStoragePrefix}-user`
}

export class AuthService {
  private static auth?: CubeAuth

  private static user?: CubeUser

  public static getUser (): CubeUser | undefined {
    return this.user
  }

  public static setUser (user: CubeUser): void {
    this.user = user
  }

  public static getCacheAuth (): CubeAuth | undefined {
    if (this.auth) {
      return this.auth
    }

    const auth = getCacheAuthFromSession()
    if (!auth) {
      return
    }
    this.auth = auth
    return auth

    function getCacheAuthFromSession (): CubeAuth | undefined {
      const authorization = sessionStorage.getItem(CubeAuthStorageKeyEnum.AUTHORIZATION)
      const tenant = sessionStorage.getItem(CubeAuthStorageKeyEnum.TENANT)
      const user = sessionStorage.getItem(CubeAuthStorageKeyEnum.USER)
      if (!authorization || !tenant || !user) {
        return
      }

      return {
        authorization,
        tenant,
        userID: user
      }
    }
  }

  public static cacheAuth (auth: CubeAuth): void {
    sessionStorage.setItem(CubeAuthStorageKeyEnum.AUTHORIZATION, auth.authorization)
    sessionStorage.setItem(CubeAuthStorageKeyEnum.TENANT, auth.tenant)
    sessionStorage.setItem(CubeAuthStorageKeyEnum.USER, auth.userID)
    this.auth = auth
  }

  public static clearCacheAuth (): void {
    sessionStorage.clear()
  }
}

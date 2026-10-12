import { CubeSessionStorageEnum, CubeTerminalEnum } from './constants'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
class CubeAuth {
  private static instance: CubeAuth | null = null
  public static getInstance (): CubeAuth {
    if (!CubeAuth.instance) {
      CubeAuth.instance = new CubeAuth()
    }
    return CubeAuth.instance
  }

  // 设置企业信息
  public static setNowEnterprise (value: string): void {
    const data = JSON.parse(value.replaceAll('%22', '"')) as { code: string; }
    sessionStorage.setItem(CubeSessionStorageEnum.NOW_ENTERPRISE, JSON.stringify(data))
  }

  // 获取企业信息
  public static getNowEnterprise (): Record<string, string> | null {
    const nowEnterprise = sessionStorage.getItem(CubeSessionStorageEnum.NOW_ENTERPRISE)
    if (nowEnterprise) {
      return JSON.parse(nowEnterprise)
    }
    return null
  }

  // 移除企业信息
  public static removeNowEnterprise (): void {
    sessionStorage.removeItem(CubeSessionStorageEnum.NOW_ENTERPRISE)
  }

  //  设置token
  public static setToken (data: string): void {
    sessionStorage.setItem(CubeSessionStorageEnum.TOKEN, data)
  }

  // 获取token
  public static getToken (): Record<string, string> | null {
    const token = sessionStorage.getItem(CubeSessionStorageEnum.TOKEN)
    if (token) {
      return JSON.parse(token)
    }
    return null
  }

  // 鉴权获取
  public static async getAuthBySecret (secret: string): Promise<Record<string, string>> {
    const cubeAuthService = new CubeAuthService(CubeTerminalEnum.BUSINESS)
    const res = await cubeAuthService.getTokenBySecret(secret)
    return {
      access_token: res.accessToken,
      refresh_token: res.refreshToken
    }
  }

  private constructor () {
    // 初始化
  }
}
export const cubeAuth = CubeAuth.getInstance()

import type { Application, ApplicationGroup, Department, DepartmentQuery, GetTokenRequest, RoleList, RoleQuery, Tenant, Token, UserList, UserQuery, Terminals, TerminalsData } from './ouaa.model'
import { getAuthRequester, getPublicRequester } from '../request'
import { PasswordEncoder } from '@ghcloud/cube-utils'
import { URLUtils } from '@ghcloud/epp'
import { AuthService } from '../auth/auth.service'
import type { CubeUser } from '../auth/auth.model'
import { CubeServiceUnauthorizedError, type CubeLegacyErrorResponse } from '../error/error.model'
import { legacyCacheTenant, legacyCacheToken } from './ouaa.legacy'
export class OuaaService {
  private static readonly publicRequester = getPublicRequester()

  private static readonly authRequester = getAuthRequester()

  private static tenants: Tenant[] = []

  public static async autoLogin (): Promise<void> {
    const auth = AuthService.getCacheAuth()
    if (!auth) {
      throw new CubeServiceUnauthorizedError('')
    }
    const user = await this.getUser(auth.userID)
    this.tenants = await this.getUserTenants()
    AuthService.setUser(user)
  }

  public static async login (params: GetTokenRequest): Promise<void> {
    const auth = AuthService.getCacheAuth()
    if (auth) {
      return
    }
    const token = await this.getToken(params)
    AuthService.cacheAuth({
      tenant: token.tenants[0],
      authorization: token.accessToken,
      userID: token.userID
    })
    const user = await this.getUser(token.userID)
    AuthService.setUser(user)
  }

  public static async logout (): Promise<void> {
    AuthService.clearCacheAuth()
  }

  public static async getApplicationGroups (): Promise<ApplicationGroup[]> {
    const url = '/api/ouaa/context/terminal-application-groups'
    const resp = await this.authRequester.get<Record<string, unknown>>({
      url,
    })
    const data = resp.data || resp
    return (data as Record<string, unknown>[])
      .map(toApplicationGroup)

    function toApplicationGroup (group: Record<string, unknown>): ApplicationGroup {
      return {
        id: group.id as string,
        name: group.name as string,
        apps: group.applicationPageVOS as Application[]
      }
    }
  }

  public static async getTenantTerminals (): Promise<TerminalsData[]> {
    const url = '/api/ouaa/tenant/terminals'
    const resp = await this.authRequester.get<Terminals>({
      url,
    })
    return resp.data || resp
  }

  public static async getOrganizations (
    params: DepartmentQuery
  ): Promise<Department[]> {
    const url = '/api/ouaa/authenticated/organizations/list'

    return this.authRequester.get({
      payload: {
        ...params,
      },
      url,
    })
  }

  public static async getRole (params: RoleQuery): Promise<RoleList> {
    const url = '/api/ouaa/authenticated/product/role/page'
    return this.authRequester.get({
      payload: {
        ...params,
      },
      url,
    })
  }

  public static async getSceneReceive (code: string): Promise<{
    data: {
      id: string;
      msgSceneCode: string;
      msgSceneName: string;
      applicationCode: string;
      applicationName: string;
      channelCodes: string[];
    };
  } > {
    const url = `/api/message2/sat-msg-scene-receive/code/${code}`
    return this.authRequester.get({
      url,
    })
  }

  public static async getUserList (
    params: UserQuery
  ): Promise<UserList> {
    const url = '/api/ouaa/authenticated/user-under-tenant/page'

    return this.authRequester.get({
      payload: {
        ...params,
      },
      url,
    })
  }

  public static async getUser (userID: string): Promise<CubeUser> {
    const url = '/api/ouaa/context/user'
    const resp = await this.authRequester.get<CubeLegacyErrorResponse<CubeUser>>({
      url,
      payload: {
        id: userID
      }
    })
    return resp.data
  }

  public static async getUserTenants (): Promise<Tenant[]> {
    const url = '/api/mdata/tenant/mine'
    const resp = await this.authRequester.get<CubeLegacyErrorResponse<Tenant[]>>({
      url,
    })

    legacyCacheTenant(resp.data[0])

    return resp.data
  }

  /**
    * 获取验证码
    * @returns 验证码信息
    */
  public static async getCode (): Promise<{ code: string; key: number; }> {
    const url = '/api/ouaa/public/auth/login/code/generate'
    const resp = await this.publicRequester.get< { code: string; key: number; }>({
      url
    })
    return resp
  }

  public static async productApplications (tenant: string, alisaFlag?: boolean): Promise<Application[]> {
    const url = `/api/ouaa/tenant-under-tenant/${tenant}/product-applications`
    const resp = await this.authRequester.get< Application[]>({ url, payload: { alisaFlag } })
    return resp
  }

  /**
   * 使用登陆信息换取 token
   * [api-doc](https://app.apifox.com/link/project/435727/apis/api-7003645)
   * @throws { AbstractCubeError }
   */
  public static async getToken (params: GetTokenRequest): Promise<Token> {
    const url = '/gw-bff/auth/token'
    const resp = await this.publicRequester.custom<Record<string, string>>({
      url,
      payload: toRequestForm(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST'
    })

    legacyCacheToken(resp)

    return toToken(resp)

    function toToken (respBody: Record<string, unknown>): Token {
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        tenants: respBody.tenants as string[],
        userID: respBody.id as string
      }
    }

    function toRequestForm (params: GetTokenRequest): string {
      const form = {
        grant_type: 'pwd_simple_code',
        key: params.key,
        code: params.code,
        username: params.username,
        password: PasswordEncoder.encode(params.password)
      }

      return URLUtils.parseToQueryParams(form)
    }
  }
}

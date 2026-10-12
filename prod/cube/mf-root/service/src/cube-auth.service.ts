import { CubeGateway } from '@ghcloud/cube-gateway'
import { BASE_API, type CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { PasswordEncoder } from '@ghcloud/cube-utils'
import { URLUtils } from '@ghcloud/epp'

export interface GetTokenRequest {
  // 验证码 key
  key: string;
  // 验证码
  code: string;
  username: string;
  password: string;
}

export interface Token {
  accessToken: string;
  refreshToken: string;
  tenantIDs: string[];
  userID: string;
}

const authBffURL = `/gw-bff/auth`
export class CubeAuthService {
  private readonly gateway: CubeGateway

  public constructor (terminal: CubeTerminalEnum) {
    this.gateway = new CubeGateway({ terminal })
  }

  /**
   * 使用登陆信息换取 token
   * [api-doc](https://app.apifox.com/link/project/435727/apis/api-7003645)
   * @throws { AbstractServiceError }
   */
  public async getToken (params: GetTokenRequest): Promise<Token> {
    const url = `${authBffURL}/token`
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: toRequestForm(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      method: 'POST'
    })

    return toToken(resp)

    function toToken (respBody: Record<string, unknown>): Token {
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        tenantIDs: respBody.tenants as string[],
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

  /**
   * 获取验证码
   * @returns 验证码信息
   */
  public async getCode (): Promise<{ code: string; key: number; }> {
    const url = `${baseURL}/public/auth/login/code/generate`
    const resp = await this.gateway.get<{code: string; key: number}>({
      url
    })
    return resp
  }
}

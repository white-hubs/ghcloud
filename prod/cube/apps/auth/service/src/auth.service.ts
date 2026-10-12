import { CubeGateway } from "@ghcloud/cube-gateway";
import { BASE_API, type CubeTerminalEnum } from "@ghcloud/cube-protocol";
import { PasswordEncoder } from "@ghcloud/cube-utils";
import { URLUtils } from "@ghcloud/epp";

export interface GetTokenRequest {
  // 验证码 key
  key: string;
  // 验证码
  code: string;
  username: string;
  password: string;
}
export interface AuthVo {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  id: string;
  name: string;
  admin: boolean;
  tenants: string[];
  administrated_tenants: string[];
  password_expired: boolean;
  password_forced: boolean;
  password_expiration_reminded: boolean;
  password_expiration_date: number;
  jti: string;
}
export interface Token {
  accessToken: string;
  refreshToken: string;
  tenantIDs: string[];
  userID: string;
  jti: string;
}

export interface imgType {
  data: {
    endpointPath: string;
    path: string;
  };
}

const ouaaBaseURL = `${BASE_API}/ouaa`;
const authBffURL = `/gw-bff/auth`;
export class CubeAuthService {
  private readonly gateway: CubeGateway;
  private readonly terminal: CubeTerminalEnum;

  public constructor(terminal: CubeTerminalEnum, tenant?: string, token?: string) {
    this.terminal = terminal;
    this.gateway = new CubeGateway({ terminal, tenant, token });
  }

  /**
   * 使用登陆信息换取 token
   * [api-doc](https://app.apifox.com/link/project/435727/apis/api-7003645)
   * @throws { AbstractServiceError }
   */
  public async getToken(params: GetTokenRequest): Promise<Token> {
    const url = `${authBffURL}/token`;
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: toRequestForm(params),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    return toToken(resp);

    function toToken(respBody: Record<string, unknown>): Token {
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        tenantIDs: respBody.tenants as string[],
        userID: respBody.id as string,
        jti: respBody.jti as string,
      };
    }

    function toRequestForm(params: GetTokenRequest): string {
      const form = {
        grant_type: "pwd_simple_code",
        key: params.key,
        code: params.code,
        username: params.username,
        password: PasswordEncoder.encode(params.password),
      };

      return URLUtils.parseToQueryParams(form);
    }
  }

  /**
   * 使用用户名和密码换取 token
   */
  public async getTokenWithoutCode(params: { username: string; password: string }): Promise<Token> {
    const url = `${authBffURL}/token`;
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: URLUtils.parseToQueryParams({
        grant_type: "pwd_encrypt",
        username: params.username,
        password: PasswordEncoder.encode(params.password),
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });

    return toToken(resp);

    function toToken(respBody: Record<string, unknown>): Token {
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        tenantIDs: respBody.tenants as string[],
        userID: respBody.id as string,
        jti: respBody.jti as string,
      };
    }
  }

  /**
   * 获取验证码
   * @returns 验证码信息
   */
  public async getCode(): Promise<{ code: string; key: string }> {
    const url = `${ouaaBaseURL}/public/auth/login/code/generate`;
    const resp = await this.gateway.get<{ code: string; key: string }>({
      url,
    });
    return resp;
  }

  /** 获取短期鉴权密钥 */
  public async getSecretByToken(): Promise<string> {
    const url = `${ouaaBaseURL}/oauth2/getSecretByToken`;
    const resp = await this.gateway.get<string>({
      url,
      responseType: "string",
    });
    return resp;
  }

  /** 短期密钥拿鉴权信息 */

  public async getTokenBySecret(
    secret: string,
  ): Promise<{ accessToken: string; refreshToken: string; tenant: string; expires_in: number; terminal?: string }> {
    const url = `${authBffURL}/token`;
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: toRequestForm(secret),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    function toRequestForm(secret: string): string {
      const form = {
        grant_type: "kaihe_authorization_code",
        kaihe_authorization_code: secret,
      };
      return URLUtils.parseToQueryParams(form);
    }
    function toToken(respBody: Record<string, unknown>): {
      accessToken: string;
      refreshToken: string;
      tenant: string;
      expires_in: number;
      terminal?: string;
    } {
      const tenants = respBody.tenants as string[];
      const tenant = tenants.length > 0 ? tenants[0] : "";
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        tenant,
        terminal: respBody.terminal as string,
        expires_in: respBody.expires_in as number,
      };
    }
    return toToken(resp);
  }

  public async getAuthByClientLogin(secret: {
    grant_type: string;
    client_id: string;
    client_secret: string;
  }): Promise<{ accessToken: string; refreshToken: string; expires_in: number }> {
    const url = `${ouaaBaseURL}/oauth2/token`;
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: URLUtils.parseToQueryParams(secret),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    function toToken(respBody: Record<string, unknown>): {
      accessToken: string;
      refreshToken: string;
      expires_in: number;
    } {
      // Const tenants = respBody.tenants as string[]
      // Const tenant = tenants.length > 0 ? tenants[0] : ''
      return {
        accessToken: respBody.access_token as string,
        refreshToken: respBody.refresh_token as string,
        // Tenant,
        // Terminal: respBody.terminal as string,
        expires_in: respBody.expires_in as number,
      };
    }
    return toToken(resp);
  }

  /** 客户端认证 */
  public async clientAuth(
    clientId: string,
    clientSecret: string,
  ): Promise<{ accessToken: string; tenant: string; expires_in: number; terminal: string }> {
    const url = `${ouaaBaseURL}/oauth2/token`;
    const resp = await this.gateway.custom<Record<string, string>>({
      url,
      payload: toRequestForm(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    function toRequestForm(): string {
      const form = {
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret,
      };
      return URLUtils.parseToQueryParams(form);
    }
    function toToken(respBody: Record<string, unknown>): {
      accessToken: string;
      tenant: string;
      expires_in: number;
      terminal: string;
    } {
      const tenants = (respBody.tenants as string[]) ?? [];
      return {
        accessToken: respBody.access_token as string,
        tenant: tenants[0],
        terminal: respBody.terminal as string,
        expires_in: respBody.expires_in as number,
      };
    }
    return toToken(resp);
  }

  /** 通过三方跳转的authCode获取鉴权信息 */
  public async getTokenByAuthCode(payload: {
    grant_type: string;
    client_id?: string;
    code: string;
    client_secret?: string;
    redirectUri?: string;
    redirect_uri?: string;
  }): Promise<AuthVo> {
    const { client_id: _cid, client_secret: _cs, ...bffPayload } = payload;
    const url = `${authBffURL}/token`;
    const resp = await this.gateway.custom<AuthVo>({
      url,
      payload: URLUtils.parseToQueryParams(bffPayload as Record<string, string>),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
    return resp;
  }

  /** CAS平台认证码ticket换取token */
  public async casLogin(key: string): Promise<AuthVo> {
    const url = `/third-auth/getLoginToken`;
    const resp = await this.gateway.get<AuthVo>({
      url,
      payload: { key },
    });
    return resp;
  }

  /** 获取图片 */
  public async getImage(id: string): Promise<imgType> {
    const url = `/api/file/file/${id}`;
    const resp = await this.gateway.get<imgType>({
      url,
    });
    return resp;
  }

  /** 刷新token */
  public async refreshToken(refreshToken: string): Promise<AuthVo> {
    const payload = {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
    const url = `${authBffURL}/token`;
    return this.gateway.custom<AuthVo>({
      url,
      payload: URLUtils.parseToQueryParams(payload),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    });
  }
}

import { type CubeTerminalEnum } from "@ghcloud/cube-protocol";
export interface GetTokenRequest {
  key: string;
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
export declare class CubeAuthService {
  private readonly gateway;
  constructor(terminal: CubeTerminalEnum, tenant?: string, token?: string);
  /**
   * 使用登陆信息换取 token
   * [api-doc](https://app.apifox.com/link/project/435727/apis/api-7003645)
   * @throws { AbstractServiceError }
   */
  getToken(params: GetTokenRequest): Promise<Token>;
  /**
   * 获取验证码
   * @returns 验证码信息
   */
  getCode(): Promise<{
    code: string;
    key: string;
  }>;
  /** 获取短期鉴权密钥 */
  getSecretByToken(): Promise<string>;
  /** 短期密钥拿鉴权信息 */
  getTokenBySecret(secret: string): Promise<{
    accessToken: string;
    refreshToken: string;
    tenant: string;
    expires_in: number;
  }>;
}

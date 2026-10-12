import { type CubeGatewayRequestOptions, withContext } from "@ghcloud/cube-gateway";
import { CubeHeaders, CubeTerminalEnum } from "@ghcloud/cube-protocol";

export interface AuthState {
  tenant: number;
  terminal: CubeTerminalEnum;
  token: string;
}

/**
 * 开发/mock 场景下的占位鉴权上下文。
 *
 * 子应用在 qiankun 生命周期里由主应用通过 `props.auth` 注入真实 AuthState；
 * 独立运行（非 qiankun 模式）时没有主应用，业务调用 `useAuthRequest` 会因
 * `authStore === undefined` 抛出 `Login state is not ready!`。
 * 这时应在 `renderWithDefault()` 里用 `authRequest.updateAuth(DEV_MOCK_AUTH)`
 * 给一份占位值，配合 mock 覆盖请求。
 *
 * 注意：这只是 dev 兜底，不要在 qiankun 或生产链路里覆盖 `props.auth`。
 */
export const DEV_MOCK_AUTH: AuthState = {
  tenant: 0,
  terminal: CubeTerminalEnum.BUSINESS,
  token: "dev-mock-token",
};

export class CubeAuthRequest {
  private authStore: AuthState | undefined;

  public constructor(auth?: AuthState) {
    this.authStore = auth;
  }

  public updateAuth(auth: AuthState): void {
    this.authStore = auth;
  }

  public useAuthRequest = <T>(fn: () => T): T =>
    withContext<T>((options: CubeGatewayRequestOptions): CubeGatewayRequestOptions => {
      const headers = new Headers(options.headers);
      const auth = this.authStore;
      if (!auth) {
        throw new Error("Login state is not ready!");
      }
      headers.set(CubeHeaders.AUTHORIZATION, `Bearer ${auth.token}`);
      headers.set(CubeHeaders.TENANT, `${auth.tenant}`);
      headers.set(CubeHeaders.TERMINAL, auth.terminal);
      options.headers = headers;
      return options;
    }, fn);
}

export const authRequest = new CubeAuthRequest();

export const useAuthRequest = authRequest.useAuthRequest.bind(authRequest);

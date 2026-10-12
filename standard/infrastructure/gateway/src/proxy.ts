import { type CubeAuth, CubeTerminalEnum } from "@ghcloud/cube-protocol";

import type { ServiceError, AbstractServiceError } from "./error";

/**
 * @description: 网关代理,用于拦截请求错误
 */
export class GatewayProxy {
  protected _authInfo: CubeAuth = {
    token: "",
    tenant: "",
    terminal: CubeTerminalEnum.BUSINESS,
  };

  protected readonly proxyHandler = {
    get: <T extends object>(target: T, prop: symbol, receiver: unknown): unknown => {
      const originalMethod = Reflect.get(target, prop, receiver);
      if (typeof originalMethod === "function" && originalMethod.constructor.name === "AsyncFunction") {
        return async (...args: unknown[]) => {
          return this.handleResponse(originalMethod.apply(target, args));
        };
      }
      return originalMethod;
    },
  };

  public errorNotify(error: ServiceError): void {}

  public createProxiedInstance<T extends object>(target: T): T {
    return new Proxy(target, this.proxyHandler) as unknown as T;
  }

  private isServiceError(error: unknown): error is AbstractServiceError {
    return typeof (error as AbstractServiceError | null)?.toJSON === "function";
  }

  private async handleResponse<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      if (this.isServiceError(error)) {
        this.errorNotify(error.toJSON());
      }
      throw error;
    }
  }
}

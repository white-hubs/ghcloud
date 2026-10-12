import { CubeAiApplicationService } from "@ghcloud/cube-ai-application-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { message } from "@ghcloud/cube-ui";

import { CubeKnowledgeDocumentService } from "../../../../knowledge-document/service/src/service";
import { resolveAiCenterApiBase } from "./ai-center-api-base";
import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  public get cubeAiApplicationService(): CubeAiApplicationService {
    return new CubeAiApplicationService(authStore, { baseUrl: resolveAiCenterApiBase() });
  }

  public get cubeAiApplicationServiceProxy(): CubeAiApplicationService {
    return this.createProxiedInstance(this.cubeAiApplicationService);
  }

  public get cubeKnowledgeDocumentService(): CubeKnowledgeDocumentService {
    return new CubeKnowledgeDocumentService(authStore);
  }

  public get cubeKnowledgeDocumentServiceProxy(): CubeKnowledgeDocumentService {
    return this.createProxiedInstance(this.cubeKnowledgeDocumentService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();

/** 每次调用时用当前 authStore 新建实例，避免嵌入宿主应用在 initAuthStore 之前已完成模块加载 */
function createServiceProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = factory();
      const value = Reflect.get(instance as object, prop, instance);
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(instance);
      }
      return value;
    },
  });
}

export const cubeAiApplicationService = createServiceProxy(() =>
  apiProxy.createProxiedInstance(new CubeAiApplicationService(authStore, { baseUrl: resolveAiCenterApiBase() })),
);

export const cubeKnowledgeDocumentService = createServiceProxy(() =>
  apiProxy.createProxiedInstance(new CubeKnowledgeDocumentService(authStore)),
);

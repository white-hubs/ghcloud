import { showNotify } from "vant";

import { CubeAiApplicationService } from "@ghcloud/cube-ai-application-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeKnowledgeDocumentService } from "@ghcloud/cube-knowledge-document-service";

import { resolveAiCenterApiBase } from "./ai-center-api-base";
import { authStore } from "./auth-store";

class AiCenterApiProxy extends GatewayProxy {
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
    showNotify({ type: "danger", message: error.errorMessage });
  }
}

const apiProxy = new AiCenterApiProxy();

export const cubeAiApplicationService = apiProxy.cubeAiApplicationServiceProxy;
export const cubeKnowledgeDocumentService = apiProxy.cubeKnowledgeDocumentServiceProxy;

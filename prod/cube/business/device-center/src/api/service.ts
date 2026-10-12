import { authStore } from "./auth-store";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { type ServiceError, GatewayProxy } from "@ghcloud/cube-gateway";
import { CubeDeviceCenterService, CubeDeviceCenterInternalService, CubeDeviceSuperviseService } from "@ghcloud/cube-iot-center-service";
import { CubeKnowledgeDocumentService } from "@ghcloud/cube-knowledge-document-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeMessageCenterService } from "@ghcloud/cube-message-center-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubeIdentityService } from "@ghcloud/cube-risk-management-service";
import { message } from "@ghcloud/cube-ui";
import { CubeVisualizationService } from "@ghcloud/cube-visualization-service";

class ApiProxy extends GatewayProxy {
  // 文件服务
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  // ouaa服务
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  // 物联心服务
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  // 物联中心内部服务
  public get cubeDeviceCenterInternalService(): CubeDeviceCenterInternalService {
    return new CubeDeviceCenterInternalService(authStore);
  }

  public get cubeDeviceCenterInternalServiceProxy(): CubeDeviceCenterInternalService {
    return this.createProxiedInstance(this.cubeDeviceCenterInternalService);
  }

  // 物联中心扩展服务
  public get cubeDeviceSuperviseService(): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore);
  }

  public get cubeDeviceSuperviseServiceProxy(): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService);
  }

  // mdata服务
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  // identity服务
  public get cubeIdentityService(): CubeIdentityService {
    return new CubeIdentityService(authStore);
  }

  public get cubeIdentityServiceProxy(): CubeIdentityService {
    return this.createProxiedInstance(this.cubeIdentityService);
  }

  // knowledgeDocument服务
  public get cubeKnowledgeDocumentService(): CubeKnowledgeDocumentService {
    return new CubeKnowledgeDocumentService(authStore);
  }

  public get cubeKnowledgeDocumentServiceProxy(): CubeKnowledgeDocumentService {
    return this.createProxiedInstance(this.cubeKnowledgeDocumentService);
  }

  // visualization服务
  public get cubeVisualizationService(): CubeVisualizationService {
    return new CubeVisualizationService(authStore);
  }

  public get cubeVisualizationServiceProxy(): CubeVisualizationService {
    return this.createProxiedInstance(this.cubeVisualizationService);
  }

  public get cubeMessageCenterService(): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore);
  }
  public get cubeMessageCenterServiceProxy(): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService);
  }

  public override errorNotify(error: ServiceError): void {
    if (error && error.errorMessage) {
      message.error(error.errorMessage);
    } else if (error && typeof error === "object") {
      const possibleMessage = (error as any).message || (error as any).errorMsg || "请求失败";
      message.error(possibleMessage);
    }
  }
}
const apiProxy = new ApiProxy();
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalServiceProxy;
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeIdentityService = apiProxy.cubeIdentityServiceProxy;
export const cubeKnowledgeDocumentService = apiProxy.cubeKnowledgeDocumentServiceProxy;
export const cubeVisualizationService = apiProxy.cubeVisualizationServiceProxy;
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy;

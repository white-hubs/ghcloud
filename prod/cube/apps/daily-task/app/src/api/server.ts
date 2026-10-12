import { authStore } from "./auth-store";
import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";
import { CubeBusinessTagService } from "@ghcloud/cube-business-tag-service";
import { CubeDailyTaskService } from "@ghcloud/cube-daily-task-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeMessageCenterService } from "@ghcloud/cube-message-center-service";
import { CubeTypeService } from "@ghcloud/cube-risk-management-service";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { message } from "@ghcloud/cube-ui";

class ApiProxy extends GatewayProxy {
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }
  public get cubeFileServiceServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }
  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  public get cubeDailyTaskService(): CubeDailyTaskService {
    return new CubeDailyTaskService(authStore);
  }
  public get cubeDailyTaskServiceProxy(): CubeDailyTaskService {
    return this.createProxiedInstance(this.cubeDailyTaskService);
  }

  public get cubeMessageCenterService(): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore);
  }
  public get cubeMessageCenterServiceProxy(): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService);
  }

  public get cubeSmallEngineeringService(): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore);
  }
  public get cubeSmallEngineeringServiceProxy(): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService);
  }

  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }
  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  public get cubeAssetManagementService(): CubeAssetManagementService {
    return new CubeAssetManagementService(authStore);
  }
  public get cubeAssetManagementServiceProxy(): CubeAssetManagementService {
    return this.createProxiedInstance(this.cubeAssetManagementService);
  }

  public get cubeRiskTypeService(): CubeTypeService {
    return new CubeTypeService(authStore);
  }
  public get cubeRiskTypeServiceProxy(): CubeTypeService {
    return this.createProxiedInstance(this.cubeRiskTypeService);
  }

  public get cubeMaintainService(): CubeMaintainService {
    return new CubeMaintainService(authStore);
  }
  public get cubeMaintainServiceProxy(): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService);
  }

  public get cubeBusinessTagService(): CubeBusinessTagService {
    return new CubeBusinessTagService(authStore);
  }
  public get cubeBusinessTagServiceProxy(): CubeBusinessTagService {
    return this.createProxiedInstance(this.cubeBusinessTagService);
  }

  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }
  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceServiceProxy;
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy;
export const cubeDailyTaskService = apiProxy.cubeDailyTaskServiceProxy;
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeAssetManagementService = apiProxy.cubeAssetManagementServiceProxy;
export const cubeRiskTypeService = apiProxy.cubeRiskTypeServiceProxy;
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy;
export const cubeBusinessTagService = apiProxy.cubeBusinessTagServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;

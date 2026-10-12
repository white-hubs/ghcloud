import { CubeDailyTaskService } from "@ghcloud/cube-daily-task-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
// import { CubeDailyInspectionService } from '@ghcloud/cube-daily-inspection-service'
import { authStore } from "./auth-store";
import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { type ServiceError, GatewayProxy } from "@ghcloud/cube-gateway";
import { CubeGridManagementService } from "@ghcloud/cube-grid-management-service";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubePropertyService } from "@ghcloud/cube-risk-management-service";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { showNotify } from "vant";

class ApiProxy extends GatewayProxy {
  // 文件服务
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  // Mdata服务
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  // 日常任务服务
  public get cubeDailyTaskService(): CubeDailyTaskService {
    return new CubeDailyTaskService(authStore);
  }

  public get cubeDailyTaskServiceProxy(): CubeDailyTaskService {
    return this.createProxiedInstance(this.cubeDailyTaskService);
  }

  // Ouaa服务
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  // 维保服务
  public get cubeMaintainService(): CubeMaintainService {
    return new CubeMaintainService(authStore);
  }

  public get cubeMaintainServiceProxy(): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService);
  }

  // 字典服务
  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }

  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }

  // 小工程服务
  public get cubeSmallEngineeringService(): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore);
  }

  public get cubeSmallEngineeringServiceProxy(): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService);
  }

  // 风险管理服务(Property)
  public get cubePropertyService(): CubePropertyService {
    return new CubePropertyService(authStore);
  }

  public get cubePropertyServiceProxy(): CubePropertyService {
    return this.createProxiedInstance(this.cubePropertyService);
  }

  // 资产管理服务
  public get cubeAssetManagementService(): CubeAssetManagementService {
    return new CubeAssetManagementService(authStore);
  }

  public get cubeAssetManagementServiceProxy(): CubeAssetManagementService {
    return this.createProxiedInstance(this.cubeAssetManagementService);
  }

  // 设备中心服务
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }
  // 网格服务
  public get cubeGridManagementService(): CubeGridManagementService {
    return new CubeGridManagementService(authStore);
  }
  public get cubeGridManagementServiceProxy(): CubeGridManagementService {
    return this.createProxiedInstance(this.cubeGridManagementService);
  }

  public override errorNotify(error: ServiceError): void {
    showNotify({ type: "danger", message: error.errorMessage });
  }
}

const apiProxy = new ApiProxy();

export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeDailyTaskService = apiProxy.cubeDailyTaskServiceProxy;
// export const cubeDailyInspectionService = apiProxy.cubeDailyInspectionServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy;
export const cubePropertyService = apiProxy.cubePropertyServiceProxy;
export const cubeAssetManagementService = apiProxy.cubeAssetManagementServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeGridManagementService = apiProxy.cubeGridManagementServiceProxy;

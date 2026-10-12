import { authStore } from "./auth-store";
import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";
import { CubeBusinessTagService } from "@ghcloud/cube-business-tag-service";
import { CubeDailyTaskService } from "@ghcloud/cube-daily-task-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeGridManagementService } from "@ghcloud/cube-grid-management-service";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeMessageCenterService } from "@ghcloud/cube-message-center-service";
import { CubeTypeService } from "@ghcloud/cube-risk-management-service";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { message } from "@ghcloud/cube-ui";
import { CubeVisualizationService } from "@ghcloud/cube-visualization-service";
import { CubeWorkCenterService } from "@ghcloud/cube-work-center-service";

class ApiProxy extends GatewayProxy {
  public get cubeGridManagementService(): CubeGridManagementService {
    return new CubeGridManagementService(authStore);
  }
  public get cubeGridManagementServiceProxy(): CubeGridManagementService {
    return this.createProxiedInstance(this.cubeGridManagementService);
  }

  public get cubeVisualizationService(): CubeVisualizationService {
    return new CubeVisualizationService(authStore);
  }
  public get cubeVisualizationServiceProxy(): CubeVisualizationService {
    return this.createProxiedInstance(this.cubeVisualizationService);
  }

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

  public get cubeAlarmCenterService(): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore);
  }
  public get cubeAlarmCenterServiceProxy(): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService);
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

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }

  public get cubeWorkCenterService(): CubeWorkCenterService {
    return new CubeWorkCenterService(authStore);
  }
  public get cubeWorkCenterServiceProxy(): CubeWorkCenterService {
    return this.createProxiedInstance(this.cubeWorkCenterService);
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
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy;
export const cubeGridManagementService = apiProxy.cubeGridManagementServiceProxy;
export const cubeVisualizationService = apiProxy.cubeVisualizationServiceProxy;
export const cubeWorkCenterService = apiProxy.cubeWorkCenterServiceProxy;

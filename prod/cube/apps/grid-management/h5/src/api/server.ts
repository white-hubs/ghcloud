import { authStore } from "./auth-store";
import {
  CubeAlarmCenterService,
  CubeAlarmSafetyAnalysisService,
  CubeAlarmStatService,
  CubeLinkageService,
  GatewayProxy,
  type ServiceError,
} from "@ghcloud/cube-alarm-center-service";
import { CubeAssetManagementService } from "@ghcloud/cube-asset-management-service";
import { CubeAnnouncementService } from "@ghcloud/cube-bulletin-service";
import { CubeDailyTaskService } from "@ghcloud/cube-daily-task-service";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { CubeGridManagementService } from "@ghcloud/cube-grid-management-service";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubePropertyService } from "@ghcloud/cube-risk-management-service";
import { CubeSecurityManagementService } from "@ghcloud/cube-security-management-service";
import { CubeSmallEngineeringService } from "@ghcloud/cube-small-engineering-service";
import { showNotify } from "vant";

class ApiProxy extends GatewayProxy {
  public get cubeGridManagementService(): CubeGridManagementService {
    return new CubeGridManagementService(authStore);
  }
  public get cubeGridManagementServiceProxy(): CubeGridManagementService {
    return this.createProxiedInstance(this.cubeGridManagementService);
  }
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }
  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }
  public get cubeMaintainService(): CubeMaintainService {
    return new CubeMaintainService(authStore);
  }
  public get cubeMaintainServiceProxy(): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService);
  }
  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }
  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }
  public get cubeSmallEngineeringService(): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore);
  }
  public get cubeSmallEngineeringServiceProxy(): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService);
  }
  public get cubePropertyService(): CubePropertyService {
    return new CubePropertyService(authStore);
  }
  public get cubePropertyServiceProxy(): CubePropertyService {
    return this.createProxiedInstance(this.cubePropertyService);
  }
  public get cubeAssetManagementService(): CubeAssetManagementService {
    return new CubeAssetManagementService(authStore);
  }
  public get cubeAssetManagementServiceProxy(): CubeAssetManagementService {
    return this.createProxiedInstance(this.cubeAssetManagementService);
  }
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }
  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }
  public get cubeDailyTaskService(): CubeDailyTaskService {
    return new CubeDailyTaskService(authStore);
  }
  public get cubeDailyTaskServiceProxy(): CubeDailyTaskService {
    return this.createProxiedInstance(this.cubeDailyTaskService);
  }
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }
  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }
  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }
  public get cubeAlarmCenterService(): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore);
  }
  public get cubeAlarmCenterServiceProxy(): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService);
  }
  public get cubeSecurityManagementService(): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore);
  }
  public get cubeSecurityManagementServiceProxy(): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService);
  }
  public get cubeAlarmSafetyAnalysisService(): CubeAlarmSafetyAnalysisService {
    return new CubeAlarmSafetyAnalysisService(authStore);
  }
  public get cubeAlarmSafetyAnalysisServiceProxy(): CubeAlarmSafetyAnalysisService {
    return this.createProxiedInstance(this.cubeAlarmSafetyAnalysisService);
  }
  public get cubeAlarmStatService(): CubeAlarmStatService {
    return new CubeAlarmStatService(authStore);
  }
  public get cubeAlarmStatServiceProxy(): CubeAlarmStatService {
    return this.createProxiedInstance(this.cubeAlarmStatService);
  }
  public get cubeLinkageService(): CubeLinkageService {
    return new CubeLinkageService(authStore);
  }
  public get cubeLinkageServiceProxy(): CubeLinkageService {
    return this.createProxiedInstance(this.cubeLinkageService);
  }
  public get cubeAnnouncementService(): CubeAnnouncementService {
    return new CubeAnnouncementService(authStore);
  }
  public get cubeAnnouncementServiceProxy(): CubeAnnouncementService {
    return this.createProxiedInstance(this.cubeAnnouncementService);
  }
  public override errorNotify(error: ServiceError): void {
    showNotify({
      message: error.errorMessage,
      type: "danger",
    });
  }
}
const apiProxy = new ApiProxy();

export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeGridManagementService = apiProxy.cubeGridManagementServiceProxy;
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy;
export const cubePropertyService = apiProxy.cubePropertyServiceProxy;
export const cubeAssetManagementService = apiProxy.cubeAssetManagementServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy;
export const cubeDailyTaskService = apiProxy.cubeDailyTaskServiceProxy;
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy;
export const cubeAlarmSafetyAnalysisService = apiProxy.cubeAlarmSafetyAnalysisServiceProxy;
export const cubeAlarmStatService = apiProxy.cubeAlarmStatServiceProxy;
export const cubeLinkageService = apiProxy.cubeLinkageServiceProxy;
export const cubeAnnouncementService = apiProxy.cubeAnnouncementServiceProxy;

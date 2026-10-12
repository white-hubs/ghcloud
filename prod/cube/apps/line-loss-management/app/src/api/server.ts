import { authStore } from "./auth-store";
import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeLineLossManagementService } from "@ghcloud/cube-line-loss-management-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeSecurityManagementService } from "@ghcloud/cube-security-management-service";
import { message } from "@ghcloud/cube-ui";

class ApiProxy extends GatewayProxy {
  public get cubeLineLossManagementService(): CubeLineLossManagementService {
    return new CubeLineLossManagementService(authStore);
  }
  public get cubeLineLossManagementServiceProxy(): CubeLineLossManagementService {
    return this.createProxiedInstance(this.cubeLineLossManagementService);
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
  public get cubeSecurityManagementService(): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore);
  }
  public get cubeSecurityManagementServiceProxy(): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService);
  }

  public get cubeMaintainService(): CubeMaintainService {
    return new CubeMaintainService(authStore);
  }
  public get cubeMaintainServiceProxy(): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy;
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy;
export const cubeLineLossManagementService = apiProxy.cubeLineLossManagementServiceProxy;
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy;

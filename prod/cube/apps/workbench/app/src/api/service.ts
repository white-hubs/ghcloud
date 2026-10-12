import { CubeAlarmStatService } from "@ghcloud/cube-alarm-center-service";
import { CubeAnnouncementService } from "@ghcloud/cube-bulletin-service";
import { CubeEnergyStatService } from "@ghcloud/cube-energy-service";
import { CubeDeviceCenterService, CubeDeviceSuperviseService, GatewayProxy, type ServiceError } from "@ghcloud/cube-iot-center-service";
import { CubeAppService } from "@ghcloud/cube-mf-root-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubeSafetyManagementMarketService, CubeSafetyManagementStatService } from "@ghcloud/cube-safety-management-service";
import { CubeTodoTaskStatService } from "@ghcloud/cube-todo-center-service";
import { message } from "@ghcloud/cube-ui";
import { CubeWorkbenchService } from "@ghcloud/cube-workbench-service";

import { authStore } from "./auth-store";
class ApiProxy extends GatewayProxy {
  // 设备中心服务
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  // 监控中心服务
  public get cubeDeviceSuperviseService(): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore);
  }

  public get cubeDeviceSuperviseServiceProxy(): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService);
  }

  // 报警服务
  public get cubeAlarmStatService(): CubeAlarmStatService {
    return new CubeAlarmStatService(authStore);
  }

  public get cubeAlarmStatServiceProxy(): CubeAlarmStatService {
    return this.createProxiedInstance(this.cubeAlarmStatService);
  }

  // 能耗服务
  public get cubeEnergyStatService(): CubeEnergyStatService {
    return new CubeEnergyStatService(authStore);
  }

  public get cubeEnergyStatServiceProxy(): CubeEnergyStatService {
    return this.createProxiedInstance(this.cubeEnergyStatService);
  }

  // 应用服务
  public get cubeAppService(): CubeAppService {
    return new CubeAppService(authStore);
  }

  public get cubeAppServiceProxy(): CubeAppService {
    return this.createProxiedInstance(this.cubeAppService);
  }

  // 用户及菜单服务
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  // 公告服务
  public get cubeAnnouncementService(): CubeAnnouncementService {
    return new CubeAnnouncementService(authStore);
  }

  public get cubeAnnouncementServiceProxy(): CubeAnnouncementService {
    return this.createProxiedInstance(this.cubeAnnouncementService);
  }

  // 安全管理服务
  public get cubeSafetyManagementMarketService(): CubeSafetyManagementMarketService {
    return new CubeSafetyManagementMarketService(authStore);
  }

  public get cubeSafetyManagementMarketServiceProxy(): CubeSafetyManagementMarketService {
    return this.createProxiedInstance(this.cubeSafetyManagementMarketService);
  }

  // 安全管理总部统计服务
  public get cubeSafetyManagementStatService(): CubeSafetyManagementStatService {
    return new CubeSafetyManagementStatService(authStore);
  }

  public get cubeSafetyManagementStatServiceProxy(): CubeSafetyManagementStatService {
    return this.createProxiedInstance(this.cubeSafetyManagementStatService);
  }

  // 待办服务
  public get cubeTodoTaskStatService(): CubeTodoTaskStatService {
    return new CubeTodoTaskStatService(authStore);
  }

  public get cubeTodoTaskStatServiceProxy(): CubeTodoTaskStatService {
    return this.createProxiedInstance(this.cubeTodoTaskStatService);
  }

  // 工作台服务
  public get cubeWorkbenchService(): CubeWorkbenchService {
    return new CubeWorkbenchService(authStore);
  }

  public get cubeWorkbenchServiceProxy(): CubeWorkbenchService {
    return this.createProxiedInstance(this.cubeWorkbenchService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}
const apiProxy = new ApiProxy();
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy;
export const cubeAlarmStatService = apiProxy.cubeAlarmStatServiceProxy;
export const cubeEnergyStatService = apiProxy.cubeEnergyStatServiceProxy;
export const cubeAppService = apiProxy.cubeAppServiceProxy;
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeAnnouncementService = apiProxy.cubeAnnouncementServiceProxy;
export const cubeSafetyManagementMarketService = apiProxy.cubeSafetyManagementMarketServiceProxy;
export const cubeSafetyManagementStatService = apiProxy.cubeSafetyManagementStatServiceProxy;
export const cubeTodoTaskStatService = apiProxy.cubeTodoTaskStatServiceProxy;
export const cubeWorkbenchService = apiProxy.cubeWorkbenchServiceProxy;

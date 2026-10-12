import { message } from "ant-design-vue";

import { CubeDoorControlService } from "@ghcloud/cube-access-control-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { type ServiceError, GatewayProxy } from "@ghcloud/cube-gateway";
import { CubeHotelManagementService } from "@ghcloud/cube-hotel-management-service";
import { CubeDeviceCenterService } from "@ghcloud/cube-iot-center-service";
import { CubeMaintainService } from "@ghcloud/cube-maintain-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubeParkingLotService } from "@ghcloud/cube-parking-lot-service";
import { CubePersonnelManagementService } from "@ghcloud/cube-personnel-management-service";
import { CubeSecurityManagementService } from "@ghcloud/cube-security-management-service";
import { CubeFlowService } from "@ghcloud/cube-stream-engine-service";
import { CubeVisitorManagementService } from "@ghcloud/cube-visitor-management-service";

import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  // 设备中心服务
  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  // ouaa服务
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

  // 人员管理服务
  public get cubePersonnelManagementService(): CubePersonnelManagementService {
    return new CubePersonnelManagementService(authStore);
  }

  public get cubePersonnelManagementServiceProxy(): CubePersonnelManagementService {
    return this.createProxiedInstance(this.cubePersonnelManagementService);
  }

  // 停车场服务
  public get cubeParkingLotService(): CubeParkingLotService {
    return new CubeParkingLotService(authStore);
  }

  public get cubeParkingLotServiceProxy(): CubeParkingLotService {
    return this.createProxiedInstance(this.cubeParkingLotService);
  }

  // 访客管理服务
  public get cubeVisitorManagementService(): CubeVisitorManagementService {
    return new CubeVisitorManagementService(authStore);
  }

  public get cubeVisitorManagementServiceProxy(): CubeVisitorManagementService {
    return this.createProxiedInstance(this.cubeVisitorManagementService);
  }

  // 门禁服务
  public get cubeDoorControlService(): CubeDoorControlService {
    return new CubeDoorControlService(authStore);
  }

  public get cubeDoorControlServiceProxy(): CubeDoorControlService {
    return this.createProxiedInstance(this.cubeDoorControlService);
  }

  // mdata服务
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  // 安防管理服务
  public get cubeSecurityManagementService(): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore);
  }

  public get cubeSecurityManagementServiceProxy(): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService);
  }

  // 文件服务
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  // 酒店管理服务
  public get cubeHotelManagementService(): CubeHotelManagementService {
    return new CubeHotelManagementService(authStore);
  }

  public get cubeHotelManagementServiceProxy(): CubeHotelManagementService {
    return this.createProxiedInstance(this.cubeHotelManagementService);
  }

  // 流程引擎服务
  public get cubeFlowService(): CubeFlowService {
    return new CubeFlowService(authStore);
  }

  public get cubeFlowServiceProxy(): CubeFlowService {
    return this.createProxiedInstance(this.cubeFlowService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();

/**
 * 延迟创建 service，避免模块加载时 authStore 尚未 init 就把空鉴权写进 gateway headers。
 * （嵌入到其他微应用时尤为关键：Index 可能被提前静态 import）
 */
function lazyService<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop, receiver) {
      const service = factory();
      const value = Reflect.get(service as object, prop, receiver);
      return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(service) : value;
    },
  });
}

export const cubeDeviceCenterService = lazyService(() => apiProxy.cubeDeviceCenterServiceProxy);
export const cubeOuaaService = lazyService(() => apiProxy.cubeOuaaServiceProxy);
export const cubeMaintainService = lazyService(() => apiProxy.cubeMaintainServiceProxy);
export const cubePersonnelManagementService = lazyService(() => apiProxy.cubePersonnelManagementServiceProxy);
export const cubeParkingLotService = lazyService(() => apiProxy.cubeParkingLotServiceProxy);
export const cubeVisitorManagementService = lazyService(() => apiProxy.cubeVisitorManagementServiceProxy);
export const cubeDoorControlService = lazyService(() => apiProxy.cubeDoorControlServiceProxy);
export const cubeMdataService = lazyService(() => apiProxy.cubeMdataServiceProxy);
export const cubeSecurityManagementService = lazyService(() => apiProxy.cubeSecurityManagementServiceProxy);
export const cubeFileService = lazyService(() => apiProxy.cubeFileServiceProxy);
export const cubeHotelManagementService = lazyService(() => apiProxy.cubeHotelManagementServiceProxy);
export const cubeFlowService = lazyService(() => apiProxy.cubeFlowServiceProxy);

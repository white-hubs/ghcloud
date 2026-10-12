import { authStore } from "./auth-store";
import {
  CubeDeviceCenterService,
  CubeDeviceSuperviseService,
  CubeDeviceCenterInternalService,
  GatewayProxy,
  type ServiceError,
  CubeDeviceIotCenterService,
} from "@ghcloud/cube-iot-center-service";
import { message } from "@ghcloud/cube-ui";
class ApiProxy extends GatewayProxy {
  // 物联设备中心服务
  public get cubeDeviceIotCenterService(): CubeDeviceIotCenterService {
    return new CubeDeviceIotCenterService(authStore);
  }

  public get cubeDeviceIotCenterServiceProxy(): CubeDeviceIotCenterService {
    return this.createProxiedInstance(this.cubeDeviceIotCenterService);
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

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}
const apiProxy = new ApiProxy();
export const cubeDeviceIotCenterService = apiProxy.cubeDeviceIotCenterServiceProxy;
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy;
export const cubeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalServiceProxy;
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy;

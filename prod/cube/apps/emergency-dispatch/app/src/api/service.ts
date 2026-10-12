import { CubeEmergencyDispatchService } from "@ghcloud/cube-emergency-dispatch-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeDeviceCenterService, CubeDeviceSuperviseService } from "@ghcloud/cube-iot-center-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { message } from "@ghcloud/cube-ui";

import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  public get cubeEmergencyDispatchService(): CubeEmergencyDispatchService {
    return new CubeEmergencyDispatchService(authStore);
  }

  public get cubeEmergencyDispatchServiceProxy(): CubeEmergencyDispatchService {
    return this.createProxiedInstance(this.cubeEmergencyDispatchService);
  }

  public get cubeDeviceCenterService(): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore);
  }

  public get cubeDeviceCenterServiceProxy(): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService);
  }

  public get cubeDeviceSuperviseService(): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore);
  }

  public get cubeDeviceSuperviseServiceProxy(): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService);
  }

  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();

function createServiceProxy<T extends object>(factory: () => T): T {
  return new Proxy({} as T, {
    get(_target, prop) {
      const instance = factory();
      const value = Reflect.get(instance as object, prop, instance);
      if (typeof value === "function") {
        return (value as (...args: unknown[]) => unknown).bind(instance);
      }
      return value;
    },
  });
}

export const cubeEmergencyDispatchService = createServiceProxy(() =>
  apiProxy.createProxiedInstance(new CubeEmergencyDispatchService(authStore)),
);

export const cubeDeviceCenter = apiProxy.cubeDeviceCenterServiceProxy;

export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy;

export const cubeMdataService = apiProxy.cubeMdataServiceProxy;

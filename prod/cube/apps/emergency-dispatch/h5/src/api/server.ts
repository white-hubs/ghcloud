import { showNotify } from "vant";

import { CubeEmergencyDispatchService } from "@ghcloud/cube-emergency-dispatch-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeDeviceSuperviseService } from "@ghcloud/cube-iot-center-service";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";

import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  public get cubeEmergencyDispatchService(): CubeEmergencyDispatchService {
    return new CubeEmergencyDispatchService(authStore);
  }

  public get cubeEmergencyDispatchServiceProxy(): CubeEmergencyDispatchService {
    return this.createProxiedInstance(this.cubeEmergencyDispatchService);
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
    showNotify({ type: "danger", message: error.errorMessage });
  }
}

const apiProxy = new ApiProxy();

export const cubeEmergencyDispatchService = apiProxy.cubeEmergencyDispatchServiceProxy;
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;

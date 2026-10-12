import { showNotify } from "vant";

import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { CubeSafetyCreditService } from "@ghcloud/cube-safety-credit-service";

import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  public get cubeSafetyCreditService(): CubeSafetyCreditService {
    return new CubeSafetyCreditService(authStore);
  }

  public get cubeSafetyCreditServiceProxy(): CubeSafetyCreditService {
    return this.createProxiedInstance(this.cubeSafetyCreditService);
  }

  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  public override errorNotify(error: ServiceError): void {
    showNotify({ type: "danger", message: error.errorMessage });
  }
}

const apiProxy = new ApiProxy();

export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeSafetyCreditService = apiProxy.cubeSafetyCreditServiceProxy;

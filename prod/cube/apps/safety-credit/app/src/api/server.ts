import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeSafetyCreditService } from "@ghcloud/cube-safety-credit-service";
import { message } from "@ghcloud/cube-ui";

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

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();

export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeSafetyCreditService = apiProxy.cubeSafetyCreditServiceProxy;

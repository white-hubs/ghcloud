import { authStore } from "./auth-store";
import { CubeDroneService } from "@ghcloud/cube-drone-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { message } from "@ghcloud/cube-ui";

class ApiProxy extends GatewayProxy {
  public get cubeDroneService(): CubeDroneService {
    return new CubeDroneService(authStore);
  }
  public get cubeDroneServiceProxy(): CubeDroneService {
    return this.createProxiedInstance(this.cubeDroneService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();
export const cubeDroneService = apiProxy.cubeDroneServiceProxy;

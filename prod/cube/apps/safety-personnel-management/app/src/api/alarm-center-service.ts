import { CubeAlarmCenterService } from "@ghcloud/cube-alarm-center-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { message } from "@ghcloud/cube-ui";

import { authStore } from "./auth-store";

class AlarmCenterApiProxy extends GatewayProxy {
  public get cubeAlarmCenterService(): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore);
  }

  public get cubeAlarmCenterServiceProxy(): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new AlarmCenterApiProxy();
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy;

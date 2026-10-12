import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { message } from "@ghcloud/cube-ui";

import { CubeMessageCenterService } from "../../../../message-center/service/src/main";
import { authStore } from "./auth-store";

class MessageCenterProxy extends GatewayProxy {
  public get cubeMessageCenterService(): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore);
  }

  public get cubeMessageCenterServiceProxy(): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const messageCenterProxy = new MessageCenterProxy();

export const cubeMessageCenterService = messageCenterProxy.cubeMessageCenterServiceProxy;

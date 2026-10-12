import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeInspectionCommandScreenService } from "@ghcloud/cube-inspection-command-screen-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { message } from "@ghcloud/cube-ui";

import { authStore } from "./auth-store";

class ApiProxy extends GatewayProxy {
  public get cubeInspectionCommandScreenService(): CubeInspectionCommandScreenService {
    return new CubeInspectionCommandScreenService(authStore);
  }

  public get cubeInspectionCommandScreenServiceProxy(): CubeInspectionCommandScreenService {
    return this.createProxiedInstance(this.cubeInspectionCommandScreenService);
  }

  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }

  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }

  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();

export const cubeInspectionCommandScreenService = apiProxy.cubeInspectionCommandScreenServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceProxy;

import { authStore } from "./auth-store";
import { CubeDictionaryService } from "@ghcloud/cube-dictionary-service";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { type ServiceError, GatewayProxy } from "@ghcloud/cube-gateway";
import { CubeMdataService } from "@ghcloud/cube-mdata-service";
import { CubeOuaaService } from "@ghcloud/cube-ouaa-service";
import { showNotify } from "vant";

class ApiProxy extends GatewayProxy {
  // 文件服务
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  // Mdata服务
  public get cubeMdataService(): CubeMdataService {
    return new CubeMdataService(authStore);
  }

  public get cubeMdataServiceProxy(): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService);
  }

  // Ouaa服务
  public get cubeOuaaService(): CubeOuaaService {
    return new CubeOuaaService(authStore);
  }

  public get cubeOuaaServiceProxy(): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService);
  }

  // 字典服务
  public get cubeDictionaryService(): CubeDictionaryService {
    return new CubeDictionaryService(authStore);
  }

  public get cubeDictionaryServiceProxy(): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService);
  }

  public override errorNotify(error: ServiceError): void {
    showNotify({ type: "danger", message: error.errorMessage });
  }
}

const apiProxy = new ApiProxy();

export const cubeFileService = apiProxy.cubeFileServiceProxy;
export const cubeMdataService = apiProxy.cubeMdataServiceProxy;
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy;
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy;

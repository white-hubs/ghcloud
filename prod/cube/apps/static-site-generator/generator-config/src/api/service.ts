import { authStore } from "./auth-store";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { type ServiceError, GatewayProxy } from "@ghcloud/cube-gateway";
import { CubeStaticSiteGeneratorPublicService } from "@ghcloud/cube-static-site-generator-service";
import { message } from "@ghcloud/cube-ui";
class ApiProxy extends GatewayProxy {
  // 文件服务
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }

  public get cubeFileServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  // 网站管理服务
  public get cubeStaticSiteGeneratorService(): CubeStaticSiteGeneratorPublicService {
    return new CubeStaticSiteGeneratorPublicService(authStore);
  }

  public get cubeStaticSiteGeneratorServiceProxy(): CubeStaticSiteGeneratorPublicService {
    return this.createProxiedInstance(this.cubeStaticSiteGeneratorService);
  }
  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}
const apiProxy = new ApiProxy();
export const cubeSiteGeneratorService = apiProxy.cubeStaticSiteGeneratorServiceProxy;
export const cubeFileService = apiProxy.cubeFileServiceProxy;

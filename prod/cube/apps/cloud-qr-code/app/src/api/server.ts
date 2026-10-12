import { authStore } from "./auth-store";
import { CubeFileService } from "@ghcloud/cube-file-service";
import { GatewayProxy, type ServiceError } from "@ghcloud/cube-gateway";
import { CubeCloudQrCodeService } from "@ghcloud/cube-ghcloud-cloud-qr-code-service";
import { message } from "@ghcloud/cube-ui";

class ApiProxy extends GatewayProxy {
  public get cubeFileService(): CubeFileService {
    return new CubeFileService(authStore);
  }
  public get cubeFileServiceServiceProxy(): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService);
  }

  public get cubeCloudQrCodeService(): CubeCloudQrCodeService {
    return new CubeCloudQrCodeService(authStore);
  }

  public get cubeCloudQrCodeServiceProxy(): CubeCloudQrCodeService {
    return this.createProxiedInstance(this.cubeCloudQrCodeService);
  }

  public override errorNotify(error: ServiceError): void {
    message.error(error.errorMessage);
  }
}

const apiProxy = new ApiProxy();
export const cubeFileService = apiProxy.cubeFileServiceServiceProxy;
export const cubeCloudQrCodeService = apiProxy.cubeCloudQrCodeServiceProxy;

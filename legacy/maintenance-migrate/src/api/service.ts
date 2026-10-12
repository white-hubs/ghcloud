import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'
import { message } from 'ant-design-vue'

class ApiProxy extends GatewayProxy {
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy

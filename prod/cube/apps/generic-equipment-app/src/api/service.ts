import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // 物联中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }


  public override errorNotify (error: ServiceError): void {
    let errorDetail = error.errorDetail === 'null' ? '' : error.errorDetail
    message.error(errorDetail || "未知错误")
  }
}
const apiProxy = new ApiProxy()
export const cubeDeviceCenter = apiProxy.cubeDeviceCenterServiceProxy

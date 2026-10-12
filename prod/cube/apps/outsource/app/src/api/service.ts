import { authStore } from './auth-store'
import { CubeDeviceCenterService, GatewayProxy, type ServiceError } from '@ghcloud/cube-iot-center-service'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOutsourceService } from '@ghcloud/cube-outsource-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {

  // maintain服务
  public get cubeMaintainService (): CubeMaintainService {
    return new CubeMaintainService(authStore)
  }

  public get cubeMaintainServiceProxy (): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService)
  }

  // 委外服务
  public get cubeOutsourceService (): CubeOutsourceService {
    return new CubeOutsourceService(authStore)
  }

  public get cubeOutsourceServiceProxy (): CubeOutsourceService {
    return this.createProxiedInstance(this.cubeOutsourceService)
  }

  // 设备服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  // 消息服务
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
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy
export const cubeOutsourceService = apiProxy.cubeOutsourceServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
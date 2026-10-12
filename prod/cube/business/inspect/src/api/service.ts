import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from './auth-store'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { message } from 'ant-design-vue'

class ApiProxy extends GatewayProxy {

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
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
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy

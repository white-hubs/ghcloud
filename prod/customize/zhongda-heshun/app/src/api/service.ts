import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeZhongdaHeshunService } from '@ghcloud/cube-zhongda-heshun-service'
import { message } from '@ghcloud/cube-ui'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
// TODO Bracing 服务剥离
import { CubeMessageService as CubeBracingService } from '@ghcloud/cube-risk-management-service'

class ApiProxy extends GatewayProxy {

  // 中大和顺服务
  public get cubeZhongdaHeshunService (): CubeZhongdaHeshunService {
    return new CubeZhongdaHeshunService(authStore)
  }

  public get cubeZhongdaHeshunServiceProxy (): CubeZhongdaHeshunService {
    return this.createProxiedInstance(this.cubeZhongdaHeshunService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // 消息中心服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }
  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  // Bracing 服务
  public get CubeBracingService (): CubeBracingService {
    return new CubeBracingService(authStore)
  }
  public get CubeBracingServiceProxy (): CubeBracingService {
    return this.createProxiedInstance(this.CubeBracingService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }
  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeZhongdaHeshunService = apiProxy.cubeZhongdaHeshunServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeBracingService = apiProxy.CubeBracingService
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
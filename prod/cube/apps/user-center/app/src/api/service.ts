import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeUserCenterService } from '@ghcloud/cube-user-center-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeZDUserService } from '@ghcloud/cube-zhongda-heshun-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {

  // 中大和顺用户服务
  public get cubeZDUserService (): CubeZDUserService {
    return new CubeZDUserService(authStore)
  }

  public get cubeZDUserServiceProxy (): CubeZDUserService {
    return this.createProxiedInstance(this.cubeZDUserService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }
  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // 用户服务
  public get cubeUserCenterService (): CubeUserCenterService {
    return new CubeUserCenterService(authStore)
  }
  public get cubeUserCenterServiceProxy (): CubeUserCenterService {
    return this.createProxiedInstance(this.cubeUserCenterService)
  }

  // mdata服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }
  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // file服务
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }
  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeZDUserService = apiProxy.cubeZDUserServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeUserCenterService = apiProxy.cubeUserCenterServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy

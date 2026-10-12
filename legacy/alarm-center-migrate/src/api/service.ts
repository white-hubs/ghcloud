
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeAlarmCenterService } from '@ghcloud/cube-alarm-center-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { message } from 'ant-design-vue'

class ApiProxy extends GatewayProxy {
  // 文件服务
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // 报警服务
  public get cubeAlarmCenterService (): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore)
  }

  public get cubeAlarmCenterServiceProxy (): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService)
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
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy

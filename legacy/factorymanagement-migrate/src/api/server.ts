import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
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

  // mdata服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy



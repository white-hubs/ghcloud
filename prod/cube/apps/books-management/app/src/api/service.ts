import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeBooksManagementService } from '@ghcloud/cube-books-management-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 图书管理服务
  public get cubeBooksManagementService (): CubeBooksManagementService {
    return new CubeBooksManagementService(authStore)
  }

  public get cubeBooksManagementServiceProxy (): CubeBooksManagementService {
    return this.createProxiedInstance(this.cubeBooksManagementService)
  }

  // 文件服务
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
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
export const cubeBooksManagementService = apiProxy.cubeBooksManagementServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy


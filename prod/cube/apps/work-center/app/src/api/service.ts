import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeWorkCenterService } from '@ghcloud/cube-work-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMessageCenterService } from '../../../../message-center/service/src/main'


import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {
  // 工作中心服务
  public get cubeWorkCenterService (): CubeWorkCenterService {
    return new CubeWorkCenterService(authStore)
  }
  public get cubeWorkCenterServiceProxy (): CubeWorkCenterService {
    return this.createProxiedInstance(this.cubeWorkCenterService)
  }
  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }
  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

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

  // 消息中心服务
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
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeWorkCenterService = apiProxy.cubeWorkCenterServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy

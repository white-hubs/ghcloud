import { CubeTypeService, CubePropertyService, CubeIdentityService, CubeMaintainService, CubeMessageService, CubeStallService } from '@ghcloud/cube-risk-management-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { message } from '@ghcloud/cube-ui'

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

  // mdata服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

  // 风险管理服务
  public get cubePropertyService (): CubePropertyService {
    return new CubePropertyService(authStore)
  }

  public get cubePropertyServiceProxy (): CubePropertyService {
    return this.createProxiedInstance(this.cubePropertyService)
  }

  public get cubeMaintainService (): CubeMaintainService {
    return new CubeMaintainService(authStore)
  }

  public get cubeMaintainServiceProxy (): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService)
  }

  public get cubeMessageService (): CubeMessageService {
    return new CubeMessageService(authStore)
  }

  public get cubeMessageServiceProxy (): CubeMessageService {
    return this.createProxiedInstance(this.cubeMessageService)
  }

  public get cubeStallService (): CubeStallService {
    return new CubeStallService(authStore)
  }

  public get cubeStallServiceProxy (): CubeStallService {
    return this.createProxiedInstance(this.cubeStallService)
  }

  public get cubeTypeService (): CubeTypeService {
    return new CubeTypeService(authStore)
  }

  public get cubeTypeServiceProxy (): CubeTypeService {
    return this.createProxiedInstance(this.cubeTypeService)
  }

  public get cubeIdentityService (): CubeIdentityService {
    return new CubeIdentityService(authStore)
  }

  public get cubeIdentityServiceProxy (): CubeIdentityService {
    return this.createProxiedInstance(this.cubeIdentityService)
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
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubePropertyService = apiProxy.cubePropertyServiceProxy
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy
export const cubeMessageService = apiProxy.cubeMessageServiceProxy
export const cubeStallService = apiProxy.cubeStallServiceProxy
export const cubeTypeService = apiProxy.cubeTypeServiceProxy
export const cubeIdentityService = apiProxy.cubeIdentityServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy

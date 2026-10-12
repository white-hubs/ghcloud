import { authStore } from './auth-store'
import { CubeDeviceCenterService, CubeDeviceSuperviseService, GatewayProxy, type ServiceError } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeKnowledgeDocumentService } from '@ghcloud/cube-knowledge-document-service'
import { message } from '@ghcloud/cube-ui'
class ApiProxy extends GatewayProxy {

  // 文档服务
  public get cubeKnowledgeDocumentService (): CubeKnowledgeDocumentService {
    return new CubeKnowledgeDocumentService(authStore)
  }

  public get cubeKnowledgeDocumentServiceProxy (): CubeKnowledgeDocumentService {
    return this.createProxiedInstance(this.cubeKnowledgeDocumentService)
  }

  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  // 监控中心服务
  public get cubeDeviceSuperviseService (): CubeDeviceSuperviseService {
    return new CubeDeviceSuperviseService(authStore)
  }

  public get cubeDeviceSuperviseServiceProxy (): CubeDeviceSuperviseService {
    return this.createProxiedInstance(this.cubeDeviceSuperviseService)
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

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}
const apiProxy = new ApiProxy()
export const cubeKnowledgeDocumentService = apiProxy.cubeKnowledgeDocumentServiceProxy
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeDeviceSuperviseService = apiProxy.cubeDeviceSuperviseServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy

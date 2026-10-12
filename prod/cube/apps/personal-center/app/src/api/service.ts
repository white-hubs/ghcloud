import { CubeOuaaService, GatewayProxy } from '@ghcloud/cube-ouaa-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFlowService } from '@ghcloud/cube-stream-engine-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { authStore } from './auth-store'

/**
 * API代理类，用于创建各种服务的代理实例
 */
class ApiProxy extends GatewayProxy {
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

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // 消息中心服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }

  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  // 流程服务
  public get cubeFlowService (): CubeFlowService {
    return new CubeFlowService(authStore)
  }

  public get cubeFlowServiceProxy (): CubeFlowService {
    return this.createProxiedInstance(this.cubeFlowService)
  }

  // 元数据服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }
}

// 创建API代理实例
export const apiProxy = new ApiProxy()

// 导出各服务实例，使用代理模式
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeFlowService = apiProxy.cubeFlowServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeMessageService = apiProxy.cubeMessageCenterServiceProxy

import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeSmallEngineeringService } from '@ghcloud/cube-small-engineering-service'
import { CubeDailyInspectionService } from '@ghcloud/cube-daily-inspection-service'
import { CubeMaintainService } from '@ghcloud/cube-risk-management-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFlowService } from '@ghcloud/cube-stream-engine-service'
import { authStore } from './auth-store'
import { message } from '@ghcloud/cube-ui'

class ApiProxy extends GatewayProxy {
  // 小散服务
  public get cubeSmallEngineeringService (): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore)
  }

  public get cubeSmallEngineeringServiceProxy (): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService)
  }

  // 巡检服务
  public get cubeDailyInspectionService (): CubeDailyInspectionService {
    return new CubeDailyInspectionService(authStore)
  }

  public get cubeDailyInspectionServiceProxy (): CubeDailyInspectionService {
    return this.createProxiedInstance(this.cubeDailyInspectionService)
  }

  // 运维服务
  public get cubeMaintainService (): CubeMaintainService {
    return new CubeMaintainService(authStore)
  }

  public get cubeMaintainServiceProxy (): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService)
  }

  // 消息服务
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

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy
export const cubeDailyInspectionService = apiProxy.cubeDailyInspectionServiceProxy
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeFlowService = apiProxy.cubeFlowServiceProxy

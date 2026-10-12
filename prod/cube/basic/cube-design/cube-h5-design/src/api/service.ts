import { GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDailyInspectionService } from '@ghcloud/cube-daily-inspection-service'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeIdentityService } from '@ghcloud/cube-identity-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeSmallEngineeringService } from '@ghcloud/cube-small-engineering-service'
import { CubePropertyService } from '@ghcloud/cube-risk-management-service'
import { CubeAssetManagementService } from '@ghcloud/cube-asset-management-service'
import { authStore } from './auth-store'


class ApiProxy extends GatewayProxy {
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

  // maintain服务
  public get cubeMaintainService (): CubeMaintainService {
    return new CubeMaintainService(authStore)
  }

  public get cubeMaintainServiceProxy (): CubeMaintainService {
    return this.createProxiedInstance(this.cubeMaintainService)
  }
  // 小散工程服务
  public get cubeSmallEngineeringService (): CubeSmallEngineeringService {
    return new CubeSmallEngineeringService(authStore)
  }
  public get cubeSmallEngineeringServiceProxy (): CubeSmallEngineeringService {
    return this.createProxiedInstance(this.cubeSmallEngineeringService)
  }
  // 风险源服务
  public get cubePropertyService (): CubePropertyService {
    return new CubePropertyService(authStore)
  }
  public get cubePropertyServiceProxy (): CubePropertyService {
    return this.createProxiedInstance(this.cubePropertyService)
  }
  // 资产服务
  public get cubeAssetManagementService (): CubeAssetManagementService {
    return new CubeAssetManagementService(authStore)
  }
  public get cubeAssetManagementServiceProxy (): CubeAssetManagementService {
    return this.createProxiedInstance(this.cubeAssetManagementService)
  }

  // 巡检服务
  public get cubeDailyInspectionService (): CubeDailyInspectionService {
    return new CubeDailyInspectionService(authStore)
  }

  public get cubeDailyInspectionServiceProxy (): CubeDailyInspectionService {
    return this.createProxiedInstance(this.cubeDailyInspectionService)
  }

  public get cubeIdentityService (): CubeIdentityService {
    return new CubeIdentityService(authStore)
  }

  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }
}
const apiProxy = new ApiProxy()
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeMaintainService = apiProxy.cubeMaintainServiceProxy
export const cubeSmallEngineeringService = apiProxy.cubeSmallEngineeringServiceProxy
export const cubePropertyService = apiProxy.cubePropertyServiceProxy
export const cubeAssetManagementService = apiProxy.cubeAssetManagementServiceProxy
export const cubeDailyInspectionService = apiProxy.cubeDailyInspectionServiceProxy
export const cubeIdentityService = apiProxy.cubeIdentityService
export const cubeDictionaryService = apiProxy.cubeDictionaryService
export const cubeFileService = apiProxy.cubeFileService
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy

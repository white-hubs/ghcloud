import { GatewayProxy } from '@ghcloud/cube-gateway'
import { CubePropertyService } from '@ghcloud/cube-risk-management-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeIdentityService } from '@ghcloud/cube-identity-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeElectricVehicleService } from '@ghcloud/cube-electric-vehicle-service'
import { CubeSafetyManagementStatService } from '@ghcloud/cube-safety-management-service'
import { authStore } from './auth-store'
class ApiProxy extends GatewayProxy {
  public get cubeSafetyManagementStatService (): CubeSafetyManagementStatService {
    return new CubeSafetyManagementStatService(authStore)
  }

  public get cubePropertyService (): CubePropertyService {
    return new CubePropertyService(authStore)
  }

  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeIdentityService (): CubeIdentityService {
    return new CubeIdentityService(authStore)
  }

  public get cubeElectricVehicleService (): CubeElectricVehicleService {
    return new CubeElectricVehicleService(authStore)
  }
}
const apiProxy = new ApiProxy()
export const cubePropertyService = apiProxy.cubePropertyService
export const cubeOuaaService = apiProxy.cubeOuaaService
export const cubeMdataService = apiProxy.cubeMdataService
export const cubeIdentityService = apiProxy.cubeIdentityService
export const cubeElectricVehicleService = apiProxy.cubeElectricVehicleService
export const cubeSafetyManagementStatService = apiProxy.cubeSafetyManagementStatService

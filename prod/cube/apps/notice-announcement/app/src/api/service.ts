import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeBroadcastService } from '@ghcloud/cube-broadcast-center-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeAnnouncementService } from '@ghcloud/cube-bulletin-service'
import { GatewayProxy } from '@ghcloud/cube-iot-center-service'
import { authStore } from './auth-store'

class ApiProxy extends GatewayProxy {
  public get cubeFileService (): CubeFileService {
    return new CubeFileService(authStore)
  }

  public get cubeFileServiceServiceProxy (): CubeFileService {
    return this.createProxiedInstance(this.cubeFileService)
  }

  public get cubeBroadcastService (): CubeBroadcastService {
    return new CubeBroadcastService(authStore)
  }

  public get cubeBroadcastServiceProxy (): CubeBroadcastService {
    return this.createProxiedInstance(this.cubeBroadcastService)
  }

  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }
}
const apiProxy = new ApiProxy()
export const cubeFileService = apiProxy.cubeFileServiceServiceProxy
export const cubeBroadcastService = apiProxy.cubeBroadcastServiceProxy
export const cubeSecurityManagementService = apiProxy.cubeSecurityManagementServiceProxy

export const cubeAnnouncementService = new CubeAnnouncementService(authStore)

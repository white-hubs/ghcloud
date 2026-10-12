import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeAlarmCenterService, CubeAlarmSafetyAnalysisService } from '@ghcloud/cube-alarm-center-service'
import { showNotify } from 'vant'

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

  // 安防服务
  public get cubeSecurityManagementService (): CubeSecurityManagementService {
    return new CubeSecurityManagementService(authStore)
  }

  public get cubeSecurityManagementServiceProxy (): CubeSecurityManagementService {
    return this.createProxiedInstance(this.cubeSecurityManagementService)
  }

  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }

  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  // 告警中心服务
  public get cubeAlarmCenterService (): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore)
  }

  public get cubeAlarmCenterServiceProxy (): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService)
  }

  // 告警安全分析服务
  public get cubeAlarmSafetyAnalysisService (): CubeAlarmSafetyAnalysisService {
    return new CubeAlarmSafetyAnalysisService(authStore)
  }

  public get cubeAlarmSafetyAnalysisServiceProxy (): CubeAlarmSafetyAnalysisService {
    return this.createProxiedInstance(this.cubeAlarmSafetyAnalysisService)
  }

  public override errorNotify (error: ServiceError): void {
    showNotify({ type: 'danger', message: error.errorMessage || '请求失败' })
  }
}

const apiProxy = new ApiProxy()
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeSecurityService = apiProxy.cubeSecurityManagementServiceProxy
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy
export const cubeAlarmSafetyAnalysisService = apiProxy.cubeAlarmSafetyAnalysisServiceProxy

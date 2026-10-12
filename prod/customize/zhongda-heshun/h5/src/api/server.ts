import { authStore } from './auth-store'
import { GatewayProxy, type ServiceError } from '@ghcloud/cube-gateway'
import { CubeZhongdaHeshunService } from '@ghcloud/cube-zhongda-heshun-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeDeviceCenterInternalService, CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeIdentityService } from '@ghcloud/cube-identity-service'
import { showNotify } from 'vant'

class ApiProxy extends GatewayProxy {

  // 中大和顺服务
  public get cubeZhongdaHeshunService (): CubeZhongdaHeshunService {
    return new CubeZhongdaHeshunService(authStore)
  }

  public get cubeZhongdaHeshunServiceProxy (): CubeZhongdaHeshunService {
    return this.createProxiedInstance(this.cubeZhongdaHeshunService)
  }

  // ouaa服务
  public get cubeOuaaService (): CubeOuaaService {
    return new CubeOuaaService(authStore)
  }

  public get cubeOuaaServiceProxy (): CubeOuaaService {
    return this.createProxiedInstance(this.cubeOuaaService)
  }

  // 消息中心服务
  public get cubeMessageCenterService (): CubeMessageCenterService {
    return new CubeMessageCenterService(authStore)
  }
  public get cubeMessageCenterServiceProxy (): CubeMessageCenterService {
    return this.createProxiedInstance(this.cubeMessageCenterService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }
  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }

  // 设备服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }
  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }  
  // 设备服务
  public get cubeDeviceCenterInternalService (): CubeDeviceCenterInternalService {
    return new CubeDeviceCenterInternalService(authStore)
  }
  public get cubeDeviceCenterInternalServiceProxy (): CubeDeviceCenterInternalService {
    return this.createProxiedInstance(this.cubeDeviceCenterInternalService)
  } 

  // 二维码实体服务
  public get cubeIdentityService (): CubeIdentityService {
    return new CubeIdentityService(authStore)
  }
  public get cubeIdentityServiceProxy (): CubeIdentityService {
    return this.createProxiedInstance(this.cubeIdentityService)
  }


  public override errorNotify (error: ServiceError): void {
    showNotify({ type: 'danger', message: error.errorMessage || '请求失败' })
  }
}
const apiProxy = new ApiProxy()
export const cubeZhongdaHeshunService = apiProxy.cubeZhongdaHeshunServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeMessageCenterService = apiProxy.cubeMessageCenterServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeDeviceCenterInternalService = apiProxy.cubeDeviceCenterInternalServiceProxy
export const cubeIdentityService = apiProxy.cubeIdentityServiceProxy

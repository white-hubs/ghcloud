import { CubeFlowService } from '@ghcloud/cube-stream-engine-service'
// export let cubeFlowService = new CubeFlowService(authStore)


import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeMdataService } from "@ghcloud/cube-mdata-service"
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFileService } from "@ghcloud/cube-file-service"
import { CubeAlarmCenterService } from '@ghcloud/cube-alarm-center-service'
import { CubeParkingLotService } from '@ghcloud/cube-parking-lot-service'
import { CubeDictionaryService } from '../../../../prod/cube/apps/dictionary/service/src/dictionary.service'
import { authStore } from './auth-store'
import { type ServiceError, GatewayProxy } from '@ghcloud/cube-gateway'
import { message } from 'ant-design-vue'

class ApiProxy extends GatewayProxy {
  // 设备中心服务
  public get cubeDeviceCenterService (): CubeDeviceCenterService {
    return new CubeDeviceCenterService(authStore)
  }  
  public get cubeDeviceCenterServiceProxy (): CubeDeviceCenterService {
    return this.createProxiedInstance(this.cubeDeviceCenterService)
  }

  // 停车服务
  public get cubeFlowService (): CubeFlowService {
    return new CubeFlowService(authStore)
  }
  public get cubeFlowServiceProxy (): CubeFlowService {
    return this.createProxiedInstance(this.cubeFlowService)
  }
  
  // mdata服务
  public get cubeMdataService (): CubeMdataService {
    return new CubeMdataService(authStore)
  }

  public get cubeMdataServiceProxy (): CubeMdataService {
    return this.createProxiedInstance(this.cubeMdataService)
  }

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

  // 告警中心服务
  public get cubeAlarmCenterService (): CubeAlarmCenterService {
    return new CubeAlarmCenterService(authStore)
  }

  public get cubeAlarmCenterServiceProxy (): CubeAlarmCenterService {
    return this.createProxiedInstance(this.cubeAlarmCenterService)
  }

  // 字典服务
  public get cubeDictionaryService (): CubeDictionaryService {
    return new CubeDictionaryService(authStore)
  }

  public get cubeDictionaryServiceProxy (): CubeDictionaryService {
    return this.createProxiedInstance(this.cubeDictionaryService)
  }
   
  // 停车服务
  public get cubeParkingLotService (): CubeParkingLotService {
    return new CubeParkingLotService(authStore)
  }
   public get cubeParkingLotServiceProxy (): CubeParkingLotService {
    return this.createProxiedInstance(this.cubeParkingLotService)
  }

  public override errorNotify (error: ServiceError): void {
    message.error(error.errorMessage)
  }
}

const apiProxy = new ApiProxy()
export const cubeDeviceCenterService = apiProxy.cubeDeviceCenterServiceProxy
export const cubeMdataService = apiProxy.cubeMdataServiceProxy
export const cubeFileService = apiProxy.cubeFileServiceProxy
export const cubeOuaaService = apiProxy.cubeOuaaServiceProxy
export const cubeAlarmCenterService = apiProxy.cubeAlarmCenterServiceProxy
export const cubeDictionaryService = apiProxy.cubeDictionaryServiceProxy
export const cubeFlowService = apiProxy.cubeFlowServiceProxy
 export const cubeParkingLotService = apiProxy.cubeParkingLotServiceProxy



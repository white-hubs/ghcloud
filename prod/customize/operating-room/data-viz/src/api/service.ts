import { CubeTerminalEnum } from '@ghcloud/cube-protocol'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeOperatingRoomService, CubeOperatingRoomMqttSubscribeService, CubeOperatingRoomPersistentService } from '@ghcloud/cube-operating-room-service'
import { CubeAlarmCenterService } from '@ghcloud/cube-alarm-center-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { authStore } from './auth-store'

interface Service {
  cubeMdataService: CubeMdataService;
  cubeOuaaService: CubeOuaaService;
  cubeAuthService: CubeAuthService;
  cubeOperatingRoomService: CubeOperatingRoomService;
  cubeSecurityManagementService: CubeSecurityManagementService;
  cubeAlarmCenterService: CubeAlarmCenterService;
  cubeDictionaryService: CubeDictionaryService;
  cubeOperatingRoomMqttSubscribeService: CubeOperatingRoomMqttSubscribeService;
  cubeOperatingRoomPersistentService: CubeOperatingRoomPersistentService;
  cubeDeviceCenterService: CubeDeviceCenterService;
}

const loadService = (): Service => {
  return {
    cubeAuthService: new CubeAuthService(CubeTerminalEnum.BUSINESS),
    cubeMdataService: new CubeMdataService(authStore),
    cubeOuaaService: new CubeOuaaService(authStore),
    cubeOperatingRoomService: new CubeOperatingRoomService(authStore),
    cubeSecurityManagementService: new CubeSecurityManagementService(authStore),
    cubeAlarmCenterService: new CubeAlarmCenterService(authStore),
    cubeDictionaryService: new CubeDictionaryService(authStore),
    cubeOperatingRoomMqttSubscribeService: new CubeOperatingRoomMqttSubscribeService(authStore),
    cubeDeviceCenterService: new CubeDeviceCenterService(authStore),
    cubeOperatingRoomPersistentService: new CubeOperatingRoomPersistentService(authStore)

  }
}
export let service: Service = loadService()

export const reloadService = (): void => {
  service = loadService()
}

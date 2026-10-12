import { CubeAlarmCenterService, CubeAlarmSafetyAnalysisService } from '@ghcloud/cube-alarm-center-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { authStore } from './auth-store'

export const cubeAlarmCenterService = new CubeAlarmCenterService(authStore)
export const cubeAlarmSafetyAnalysisService = new CubeAlarmSafetyAnalysisService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
export const cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)

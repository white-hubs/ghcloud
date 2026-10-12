import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeSafetyManagementStatService, CubeSafetyManagementAnalysisService } from '@ghcloud/cube-safety-management-service'
import { CubeAlarmCenterService, CubeAlarmStatService } from '@ghcloud/cube-alarm-center-service'
import { CubeEmergencyService } from '@ghcloud/cube-emergency-service'
import { authStore } from './auth-store'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'

export const cubeFileService = new CubeFileService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeSafetyManagementStatService = new CubeSafetyManagementStatService(authStore)
export const cubeAlarmCenterService = new CubeAlarmCenterService(authStore)
export const cubeAlarmStatService = new CubeAlarmStatService(authStore)
export const cubeEmergencyService = new CubeEmergencyService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeSafetyManagementAnalysisService = new CubeSafetyManagementAnalysisService(authStore)

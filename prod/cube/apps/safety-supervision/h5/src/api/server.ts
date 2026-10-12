import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeSafetySupervisionService, CubeSafetySupervisionAlarmHandleService } from '@ghcloud/cube-safety-supervision-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeAlarmSafetyAnalysisService } from '@ghcloud/cube-alarm-center-service'
import { CubeSafetyManagementAlarmService, CubeSafetyManagementHiddenDangerService, CubeSafetyManagementLooseWorkerService, CubeSafetyManagementQuotaService } from '@ghcloud/cube-safety-management-service'
import { authStore } from './auth-store'

export const cubeFileService = new CubeFileService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeSecurityManagementService = new CubeSecurityManagementService(authStore)
export const cubeSafetySupervisionService = new CubeSafetySupervisionService(authStore)
export const cubeSafetyManagementAlarmService = new CubeSafetyManagementAlarmService(authStore)
export const cubeSafetyManagementHiddenDangerService = new CubeSafetyManagementHiddenDangerService(authStore) // 隐患服务
export const cubeSafetyManagementLooseWorkerService = new CubeSafetyManagementLooseWorkerService(authStore) // 小散服务
export const cubeSafetyManagementQuotaService = new CubeSafetyManagementQuotaService(authStore) // 小散服务
export const cubeSafetySupervisionAlarmHandleService = new CubeSafetySupervisionAlarmHandleService(authStore) // 安全监管-报警处理相关服务
export const cubeAlarmSafetyAnalysisService = new CubeAlarmSafetyAnalysisService(authStore) // 安全监管-报警处理相关服务

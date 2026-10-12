import { CubeMaintainService } from '@ghcloud/cube-risk-management-service'
import { authStore } from './auth-store'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeElectronPatrolService } from '@ghcloud/cube-electronic-patrol-service'
import { CubeDailyInspectionService } from '@ghcloud/cube-daily-inspection-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeDailyTaskService } from '@ghcloud/cube-daily-task-service'

export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeElectronPatrolService = new CubeElectronPatrolService(authStore)
export const cubeDailyInspectionService = new CubeDailyInspectionService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeDailyTaskService = new CubeDailyTaskService(authStore)

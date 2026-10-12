import { CubeSmallEngineeringService } from '@ghcloud/cube-small-engineering-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeAuthService } from '@ghcloud/cube-auth-service'
import { authStore } from './auth-store'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDailyInspectionService } from '@ghcloud/cube-daily-inspection-service'
import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeDailyTaskService } from '@ghcloud/cube-daily-task-service'

export const cubeSmallEngineeringService = new CubeSmallEngineeringService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeAuthService = new CubeAuthService(authStore.terminal, authStore.tenant, authStore.token)
export const cubeFileService = new CubeFileService(authStore)
export const cubeDailyInspectionService = new CubeDailyInspectionService(authStore)
export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeDailyTaskService = new CubeDailyTaskService(authStore)

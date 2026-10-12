import { CubeVisitorManagementService } from '@ghcloud/cube-visitor-management-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeFlowService } from '@ghcloud/cube-stream-engine-service'
import { authStore } from './auth-store'

export const cubeVisitorManagementService = new CubeVisitorManagementService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeFlowService = new CubeFlowService(authStore)

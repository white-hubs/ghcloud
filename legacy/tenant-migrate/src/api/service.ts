import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubePersonnelManagementService } from '@ghcloud/cube-personnel-management-service'
import { authStore } from './auth-store'

export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubePersonnelManagementService = new CubePersonnelManagementService(authStore)


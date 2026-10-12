import { CubeMaintainService } from '@ghcloud/cube-maintain-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { authStore } from './auth-store'
import { CubeAssetManagementService } from '@ghcloud/cube-asset-management-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'

export const cubeMaintainService = new CubeMaintainService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeAssetManagementService = new CubeAssetManagementService(authStore)
export const cubeFileService = new CubeFileService(authStore)
export const cubeDictionaryService = new CubeDictionaryService(authStore)

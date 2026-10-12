import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService, CubeCompaniesService } from '@ghcloud/cube-mdata-service'
import { authStore } from './auth-store'

export const cubeFileService = new CubeFileService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeCompaniesService = new CubeCompaniesService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)

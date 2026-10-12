import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeAnnouncementService } from '@ghcloud/cube-bulletin-service'
import { authStore } from './auth-store'

export const cubeFileService = new CubeFileService(authStore)
export const cubeMdataService = new CubeMdataService(authStore)
export const cubeOuaaService = new CubeOuaaService(authStore)
export const cubeAnnouncementService = new CubeAnnouncementService(authStore)

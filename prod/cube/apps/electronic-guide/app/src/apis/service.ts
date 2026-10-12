import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'
export const cubeFileService = new CubeFileService(authStore)

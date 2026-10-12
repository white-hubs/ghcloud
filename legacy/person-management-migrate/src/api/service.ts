import { CubePersonnelManagementService } from '@ghcloud/cube-personnel-management-service'
import { authStore } from './auth-store'
export const cubePersonnelManagementService = new CubePersonnelManagementService(authStore)


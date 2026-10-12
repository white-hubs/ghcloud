import { authStore } from './auth-store'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
export const cubeSecurityService = new CubeSecurityManagementService(authStore)

import { authStore } from './auth-store'
import { CubeBiDataManagementService } from '@ghcloud/cube-bi-data-management'

export const cubeBiDataManagementService = new CubeBiDataManagementService(authStore)

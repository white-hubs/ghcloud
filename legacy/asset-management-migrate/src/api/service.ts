
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeAssetManagementService } from '@ghcloud/cube-asset-management-service'
import { authStore } from './auth-store.ts'

export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeAssetManagementService = new CubeAssetManagementService(authStore)

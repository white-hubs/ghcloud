import { CubeLinkageService } from '@ghcloud/cube-linkage-service'
import { authStore } from './auth-store'

export const cubeLinkageService = new CubeLinkageService(authStore)

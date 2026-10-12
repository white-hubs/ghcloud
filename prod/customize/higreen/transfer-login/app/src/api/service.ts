import { TransferLoginService } from '@ghcloud/higreen-transfer-login-service'
import { authStore } from './auth-store'

export const transferLoginService = new TransferLoginService(authStore)

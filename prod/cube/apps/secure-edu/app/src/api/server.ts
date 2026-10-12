import { CubeDataIntegrateService } from '@ghcloud/cube-data-integrate-service'
import { CubeSecureEduHeadQuartersService, CubeSecureEduPublicService, CubeSecureEduService } from '@ghcloud/cube-secure-edu-service'
import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { authStore } from './auth-store'
import { message } from '@ghcloud/cube-ui'
import { CubeFileService } from '@ghcloud/cube-file-service'

export const cubeDataIntegrateService = new CubeDataIntegrateService(authStore)
export const cubeSecureEduHeadQuartersService = new CubeSecureEduHeadQuartersService(authStore)
export const cubeSecureEduPublicService = new CubeSecureEduPublicService({ ...authStore, tenant: '', token: '' })
export const cubeSecureEduService = new CubeSecureEduService(authStore)
export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeFileService = new CubeFileService(authStore)

export const errorMsgHandler = (error: unknown): void => {
  try {
    const { errorMessage } = (error as { toJSON: () => { errorMessage: string; }; }).toJSON()
    message.error(errorMessage)
  } catch (err) {
  }
}

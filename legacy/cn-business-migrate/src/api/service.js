import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
const authStore = {
  tenant: JSON.parse((sessionStorage.getItem('GH-NowEnterprise'))).code,
  terminal: 'bimops-manage-web',
  token: JSON.parse((sessionStorage.getItem('GH-Token'))).access_token
}

export const cubeMessageCenterService = new CubeMessageCenterService(authStore)
export const cubeFileService = new CubeFileService(authStore)
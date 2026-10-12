import { CubeFileService } from '@ghcloud/cube-file-service'
const authStore = {
  tenant: JSON.parse((sessionStorage.getItem('GH-NowEnterprise'))).code,
  terminal: 'bimops-manage-web',
  token: JSON.parse((sessionStorage.getItem('GH-Token'))).access_token
}

export const cubeFileService = new CubeFileService(authStore)
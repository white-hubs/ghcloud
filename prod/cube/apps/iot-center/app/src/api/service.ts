import { CubeMessageCenterService } from '@ghcloud/cube-message-center-service'

const tenant = JSON.parse((sessionStorage.getItem('GH-NowEnterprise') ?? '{}')) as { code: string; }
const token = JSON.parse((sessionStorage.getItem('GH-Token') ?? '{}')) as { 'access_token': string; }

const authStore = {
  tenant: tenant.code,
  terminal: 'bimops-manage-web',
  token: token.access_token
}

export const cubeMessageCenterService = new CubeMessageCenterService(authStore)

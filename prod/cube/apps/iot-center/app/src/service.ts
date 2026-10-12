import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'

const auth = {
  /**
   * 租户 id
   */
  // tenant: '58197260',
  tenant: (JSON.parse((sessionStorage.getItem('GH-NowEnterprise') as unknown as string)) as { code: string; }).code,
  /**
    * 端 code
    */
  terminal: 'bimops-manage-web',
  /**
    * 鉴权 token 信息 (`{{access_token}}`)
    */
  token: (JSON.parse((sessionStorage.getItem('GH-Token') as unknown as string)) as {
    access_token: string;
  }).access_token
}
export const cubeDeviceCenterService = new CubeDeviceCenterService(auth)
export const cubeSecurityManagementService = new CubeSecurityManagementService(auth)

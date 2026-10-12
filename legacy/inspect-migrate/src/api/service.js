import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'

const auth = {
  /**
   * 租户 id
   */
  tenant: JSON.parse((sessionStorage.getItem('GH-NowEnterprise'))).code,
  /**
    * 端 code
    */
  terminal: 'bimops-manage-web',
  /**
    * 鉴权 token 信息 (`{{access_token}}`)
    */
  token: JSON.parse((sessionStorage.getItem('GH-Token'))).access_token
}
export const cubeDeviceCenterService = new CubeDeviceCenterService(auth)
export const cubeOuaaService = new CubeOuaaService(auth)

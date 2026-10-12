import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeSecurityManagementService } from '@ghcloud/cube-security-management-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { authStore } from './auth-store'

const auth = authStore.tenant && authStore.token
  ? authStore
  : {
      /**
   * 租户 id
   */
      tenant: JSON.parse((sessionStorage.getItem('GH-NowEnterprise') ?? JSON.stringify({})))?.code ?? '',
      /**
    * 端 code
    */
      terminal: 'bimops-manage-web',
      /**
    * 鉴权 token 信息 (`{{access_token}}`)
    */
      token: JSON.parse((sessionStorage.getItem('GH-Token') ?? JSON.stringify({}))).access_token ?? ''
    }
export const cubeDeviceCenterService = new CubeDeviceCenterService(auth)
export const cubeOuaaService = new CubeOuaaService(auth)
export const cubeMdataService = new CubeMdataService(auth)
export const cubeSecurityManagementService = new CubeSecurityManagementService(auth)
export const cubeFileService = new CubeFileService(auth)

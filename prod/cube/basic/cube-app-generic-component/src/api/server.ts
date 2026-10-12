import { CubeOuaaService } from '@ghcloud/cube-ouaa-service'
import { CubeMdataService } from '@ghcloud/cube-mdata-service'
import { CubeFileService } from '@ghcloud/cube-file-service'
import { CubeDictionaryService } from '@ghcloud/cube-dictionary-service'
import { CubeDeviceCenterService } from '@ghcloud/cube-iot-center-service'
import { authStore } from './auth-store'

export let cubeOuaaService = new CubeOuaaService(authStore)
export let cubeMdataService = new CubeMdataService(authStore)
export let cubeFileService = new CubeFileService(authStore)
export let cubeDictionaryService = new CubeDictionaryService(authStore)
export let cubeDeviceCenterService = new CubeDeviceCenterService(authStore)

export const reloadServer = (): void => {
  cubeOuaaService = new CubeOuaaService(authStore)
  cubeMdataService = new CubeMdataService(authStore)
  cubeFileService = new CubeFileService(authStore)
  cubeDictionaryService = new CubeDictionaryService(authStore)
  cubeDeviceCenterService = new CubeDeviceCenterService(authStore)
}
